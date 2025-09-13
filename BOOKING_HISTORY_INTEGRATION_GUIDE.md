# Booking History System Integration Guide

## 🏗️ **Complete Integration Steps**

### 1. Database Setup

```sql
-- Run the booking_history_schema.sql first
-- Then create the archive candidates function:

CREATE OR REPLACE FUNCTION get_archive_candidates(rule_id_filter INT DEFAULT NULL)
RETURNS TABLE (
  booking_id INT,
  booking_reference VARCHAR,
  guest_name VARCHAR,
  room_number VARCHAR,
  check_out_date DATE,
  booking_status VARCHAR,
  suggested_reason VARCHAR,
  days_since_criteria INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id::INT as booking_id,
    b.booking_reference::VARCHAR,
    COALESCE(g.first_name || ' ' || g.last_name, 'Unknown Guest')::VARCHAR as guest_name,
    r.room_number::VARCHAR,
    b.check_out_date::DATE,
    b.booking_status::VARCHAR,
    CASE 
      WHEN b.booking_status = 'CANCELLED' AND b.check_out_date < CURRENT_DATE - INTERVAL '30 days' 
        THEN 'CANCELLED_OLD'
      WHEN b.booking_status = 'COMPLETED' AND b.check_out_date < CURRENT_DATE - INTERVAL '90 days'
        THEN 'COMPLETED_OLD'
      WHEN b.booking_status = 'NO_SHOW' AND b.check_out_date < CURRENT_DATE - INTERVAL '60 days'
        THEN 'NO_SHOW_OLD'
      ELSE 'OTHER'
    END::VARCHAR as suggested_reason,
    EXTRACT(DAY FROM CURRENT_DATE - b.check_out_date)::INT as days_since_criteria
  FROM bookings b
  LEFT JOIN guests g ON b.guest_id = g.id
  LEFT JOIN rooms r ON b.room_id = r.id
  WHERE 
    (b.booking_status IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') 
     AND b.check_out_date < CURRENT_DATE - INTERVAL '30 days')
    OR (rule_id_filter IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM booking_status_rules bsr 
          WHERE bsr.id = rule_id_filter 
          AND b.booking_status = bsr.status
          AND b.check_out_date < CURRENT_DATE - (bsr.days_after_checkout || ' days')::INTERVAL
        ))
  ORDER BY b.check_out_date ASC;
END;
$$ LANGUAGE plpgsql;
```

### 2. Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-at-least-32-chars
JWT_EXPIRES_IN=24h

# Database (if not already configured)
DATABASE_URL=postgresql://username:password@localhost:5432/hotel_db

# Booking History Settings
BOOKING_HISTORY_SESSION_TIMEOUT=86400
BOOKING_HISTORY_MAX_EXPORT_RECORDS=10000
BOOKING_HISTORY_ARCHIVE_BATCH_SIZE=50
```

### 3. Express App Integration

#### Option A: Add to Existing Main App

```typescript
// apps/api/src/app.ts or main server file

import express from 'express';
import cors from 'cors';
import bookingHistoryRoutes from './routes/bookingHistoryRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/booking-history', bookingHistoryRoutes);

// Other existing routes...
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
// etc...

export default app;
```

#### Option B: Separate Microservice

```typescript
// apps/booking-history-service/src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingHistoryRoutes from './routes/bookingHistoryRoutes';

dotenv.config();

const app = express();
const PORT = process.env.BOOKING_HISTORY_PORT || 3003;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/booking-history', bookingHistoryRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} does not exist`
  });
});

app.listen(PORT, () => {
  console.log(`🏨 Booking History Service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/booking-history`);
});

export default app;
```

### 4. Package.json Dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/cors": "^2.8.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.0.0"
  },
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "node test-booking-history-system.js"
  }
}
```

### 5. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test/**/*"]
}
```

### 6. Authentication Integration

#### Option A: Integrate with Existing Auth System

```typescript
// middleware/authIntegration.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/existingAuthService'; // Your existing auth
import { JWTAuthService } from '../services/jwtAuthService';

export async function integrateWithExistingAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from existing auth system
    const existingToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!existingToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify with existing system
    const existingUser = await verifyToken(existingToken);
    
    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Create or get booking history session
    const bookingHistoryToken = await JWTAuthService.createSession(
      existingUser.id,
      existingUser.username,
      existingUser.role,
      ['view_history', 'manage_archive'] // Map permissions
    );

    // Replace token with booking history token
    req.headers.authorization = `Bearer ${bookingHistoryToken}`;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
```

#### Option B: Standalone Authentication

```typescript
// routes/authRoutes.ts

import express from 'express';
import { JWTAuthService } from '../services/jwtAuthService';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate credentials (implement your logic)
    const user = await validateCredentials(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const token = await JWTAuthService.createSession(
      user.id,
      user.username,
      user.role,
      user.permissions
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await JWTAuthService.invalidateSession(token);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
```

### 7. Frontend Integration Example

```typescript
// frontend/services/bookingHistoryApi.ts

class BookingHistoryAPI {
  private baseUrl = process.env.REACT_APP_BOOKING_HISTORY_API || 'http://localhost:3002/api/booking-history';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Get booking history with filters
  async getHistory(filters = {}, pagination = {}) {
    const params = new URLSearchParams({
      ...filters,
      ...pagination
    }).toString();
    
    return this.request(`/?${params}`);
  }

  // Archive single booking
  async archiveBooking(bookingId: number, reason: string, notes?: string) {
    return this.request('/archive/single', {
      method: 'POST',
      body: JSON.stringify({
        booking_id: bookingId,
        archive_reason: reason,
        notes
      })
    });
  }

  // Get statistics
  async getStatistics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.request(`/analytics/statistics?${params}`);
  }

  // Export CSV
  async exportCSV(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseUrl}/export/csv?${params}`, {
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default new BookingHistoryAPI();
```

### 8. Production Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  booking-history-service:
    build: ./apps/booking-history-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - BOOKING_HISTORY_SESSION_TIMEOUT=86400
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: hotel_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./booking_history_schema.sql:/docker-entrypoint-initdb.d/booking_history_schema.sql

volumes:
  postgres_data:
```

### 9. Testing Commands

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma db push

# Run SQL schema
psql -h localhost -U username -d hotel_db -f booking_history_schema.sql

# Start development server
npm run dev

# Run comprehensive tests
node test-booking-history-system.js

# Build for production
npm run build
npm start
```

### 10. API Usage Examples

```bash
# Health check
curl http://localhost:3002/api/booking-history/health

# Login (if using standalone auth)
curl -X POST http://localhost:3002/api/booking-history/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get booking history
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3002/api/booking-history/?page=1&limit=10"

# Archive single booking
curl -X POST http://localhost:3002/api/booking-history/archive/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":123,"archive_reason":"COMPLETED_OLD","notes":"Test archive"}'

# Export CSV
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3002/api/booking-history/export/csv?booking_status=CANCELLED" \
  --output booking_history.csv
```

## 🚀 **Ready to Deploy!**

The Booking History System is now complete with:

✅ **JWT-only Authentication** (no Redis dependency)  
✅ **Comprehensive API** (CRUD, archive, analytics, export)  
✅ **Database Schema** (optimized for performance)  
✅ **Security** (permissions, session tracking)  
✅ **Testing** (comprehensive test suite)  
✅ **Production Ready** (Docker, environment config)

### Next Steps:
1. Choose integration option (existing app vs microservice)
2. Run the database schema
3. Configure environment variables
4. Test with the provided test script
5. Deploy to production

The system is designed to be **scalable**, **secure**, and **maintainable** while keeping the JWT-only approach you requested! 🎉