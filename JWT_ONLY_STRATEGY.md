# 🚀 JWT-Only Authentication Strategy (No Redis Required)

## 🎯 สำหรับระบบที่ยังไม่มี Redis

ระบบปัจจุบัน: **JWT-Only approach** ก่อน แล้วค่อย scale ไป Redis ภายหลังเมื่อจำเป็น

---

## ✅ **JWT-Only Implementation (Recommended Start)**

### 🔧 **Enhanced JWT Strategy**

```javascript
// Enhanced JWT payload with security features
const createEnhancedJWT = (user) => {
  const payload = {
    // Basic claims
    user_id: user.id,
    email: user.email,
    role: user.role,
    
    // Security claims
    session_id: generateUniqueSessionId(), // Track session uniquely
    device_fingerprint: generateDeviceFingerprint(req), // Basic device tracking
    issued_at: Date.now(),
    
    // Permissions cache (to avoid DB lookup every request)
    permissions: user.permissions,
    
    // Session metadata
    login_ip: req.ip,
    user_agent: req.headers['user-agent']
  };
  
  return {
    accessToken: jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '2h', // Longer than 15min for better UX
      issuer: 'hotel-admin-system',
      audience: 'hotel-staff'
    }),
    refreshToken: jwt.sign({ 
      user_id: user.id, 
      session_id: payload.session_id,
      type: 'refresh'
    }, REFRESH_JWT_SECRET, { 
      expiresIn: '7d' 
    })
  };
};
```

### 🛡️ **Database Session Tracking (Without Redis)**

```sql
-- User sessions table (lightweight alternative to Redis)
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  device_fingerprint VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);
```

### 🔄 **Performance-Optimized Middleware**

```javascript
// Lightweight auth middleware (no Redis needed)
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // 1. Verify JWT (fastest - no DB call)
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 2. Basic validation (no external calls)
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // 3. Session check (minimal DB impact - use connection pooling)
    const session = await checkSessionExistsQuick(decoded.session_id);
    if (!session || !session.is_active) {
      return res.status(401).json({ error: 'Session invalid' });
    }
    
    // 4. Attach user data (from JWT payload - no DB lookup)
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions, // Cached in JWT
      sessionId: decoded.session_id
    };
    
    // 5. Update last activity (async - don't block request)
    updateSessionActivityAsync(decoded.session_id);
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Optimized session check (single query)
const checkSessionExistsQuick = async (sessionId) => {
  return await db.queryOne(`
    SELECT is_active, expires_at 
    FROM user_sessions 
    WHERE session_id = $1 AND expires_at > NOW()
  `, [sessionId]);
};

// Non-blocking activity update
const updateSessionActivityAsync = (sessionId) => {
  setImmediate(async () => {
    try {
      await db.query(`
        UPDATE user_sessions 
        SET last_activity = NOW() 
        WHERE session_id = $1
      `, [sessionId]);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  });
};
```

---

## ⚡ **Performance Optimizations (No Redis)**

### 1. **Database Connection Pooling**
```javascript
// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Pool configuration for performance
  max: 20,                    // Maximum connections
  min: 5,                     // Minimum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Connection timeout
  
  // Performance settings
  statement_timeout: 10000,   // 10s query timeout
  query_timeout: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0
});
```

### 2. **In-Memory Caching (Application Level)**
```javascript
// Simple in-memory cache for user permissions
class MemoryCache {
  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) { // 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const userPermissionsCache = new MemoryCache(500, 5 * 60 * 1000);

// Fast permission check
const getUserPermissions = async (userId) => {
  // Check cache first
  const cached = userPermissionsCache.get(`permissions:${userId}`);
  if (cached) return cached;
  
  // Fetch from database
  const permissions = await db.query(`
    SELECT permission_name 
    FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = $1
  `, [userId]);
  
  const permissionList = permissions.map(p => p.permission_name);
  
  // Cache the result
  userPermissionsCache.set(`permissions:${userId}`, permissionList);
  
  return permissionList;
};
```

### 3. **Optimized Booking History Queries**
```javascript
// Performance-optimized booking history service
class BookingHistoryService {
  
  // Get history with pagination and caching
  static async getHistory(filters, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;
    
    // Build optimized query with indexes
    let query = `
      SELECT 
        bh.id,
        bh.booking_reference,
        bh.guest_name,
        bh.room_type_name,
        bh.check_in_date,
        bh.check_out_date,
        bh.total_amount,
        bh.booking_status,
        bh.archive_reason,
        bh.archived_at
      FROM booking_history bh
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters (use indexed columns)
    if (filters.guest_name) {
      params.push(`%${filters.guest_name}%`);
      query += ` AND bh.guest_name ILIKE $${params.length}`;
    }
    
    if (filters.booking_status) {
      params.push(filters.booking_status);
      query += ` AND bh.booking_status = $${params.length}`;
    }
    
    if (filters.date_from) {
      params.push(filters.date_from);
      query += ` AND bh.check_in_date >= $${params.length}`;
    }
    
    if (filters.date_to) {
      params.push(filters.date_to);
      query += ` AND bh.check_in_date <= $${params.length}`;
    }
    
    // Order by indexed column
    query += ` ORDER BY bh.archived_at DESC`;
    
    // Add pagination
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    // Execute query
    const results = await db.query(query, params);
    
    // Get total count (for pagination)
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM')
                            .replace(/ORDER BY.*$/, '')
                            .replace(/LIMIT.*$/, '');
    const countResult = await db.queryOne(countQuery, params.slice(0, -2));
    
    return {
      data: results,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.total),
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  }
  
  // Batch operations for performance
  static async bulkArchive(bookingIds, archiveReason, userId) {
    // Use transaction for consistency
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Batch insert to history
      const historyInsert = `
        INSERT INTO booking_history (
          original_booking_id, booking_reference, guest_name, 
          room_type_name, check_in_date, check_out_date,
          total_amount, booking_status, archive_reason,
          archived_by, archived_at
        )
        SELECT 
          b.id, b.booking_reference, g.first_name || ' ' || g.last_name,
          rt.name, b.check_in_date, b.check_out_date,
          b.total_amount, b.booking_status, $1,
          $2, NOW()
        FROM bookings b
        LEFT JOIN guests g ON b.guest_id = g.id
        LEFT JOIN room_types rt ON b.room_type_id = rt.id
        WHERE b.id = ANY($3)
      `;
      
      await client.query(historyInsert, [archiveReason, userId, bookingIds]);
      
      // Batch delete from active bookings
      await client.query('DELETE FROM bookings WHERE id = ANY($1)', [bookingIds]);
      
      await client.query('COMMIT');
      
      return { success: true, archivedCount: bookingIds.length };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

---

## 🛡️ **Security Without Redis**

### 1. **JWT Security Best Practices**
```javascript
// Enhanced JWT configuration
const JWT_CONFIG = {
  // Short access token lifetime
  accessTokenExpiry: '2h',
  
  // Longer refresh token lifetime
  refreshTokenExpiry: '7d',
  
  // Strong secrets (different for access and refresh)
  accessTokenSecret: process.env.JWT_ACCESS_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  
  // Additional security options
  algorithm: 'HS256',
  issuer: 'hotel-admin-system',
  audience: 'hotel-staff'
};

// Token refresh mechanism
const refreshToken = async (refreshTokenStr) => {
  try {
    const decoded = jwt.verify(refreshTokenStr, JWT_CONFIG.refreshTokenSecret);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    // Check if session is still valid
    const session = await checkSessionExistsQuick(decoded.session_id);
    if (!session || !session.is_active) {
      throw new Error('Session expired');
    }
    
    // Get fresh user data
    const user = await getUserById(decoded.user_id);
    if (!user || !user.is_active) {
      throw new Error('User inactive');
    }
    
    // Generate new access token
    const newTokens = createEnhancedJWT(user);
    
    return newTokens;
    
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};
```

### 2. **Database Session Management**
```javascript
// Session cleanup job (run daily)
const cleanupExpiredSessions = async () => {
  try {
    const result = await db.query(`
      DELETE FROM user_sessions 
      WHERE expires_at < NOW() OR 
            (last_activity < NOW() - INTERVAL '7 days' AND is_active = false)
    `);
    
    console.log(`🧹 Cleaned up ${result.rowCount} expired sessions`);
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
};

// Run cleanup daily at 2 AM
const schedule = require('node-schedule');
schedule.scheduleJob('0 2 * * *', cleanupExpiredSessions);

// Manual session revocation
const revokeUserSessions = async (userId, reason) => {
  await db.query(`
    UPDATE user_sessions 
    SET is_active = false, 
        updated_at = NOW(),
        revoke_reason = $2
    WHERE user_id = $1 AND is_active = true
  `, [userId, reason]);
  
  console.log(`🚫 Revoked all sessions for user ${userId}: ${reason}`);
};
```

---

## 📊 **Performance Monitoring (No Redis)**

### 1. **Request Performance Tracking**
```javascript
// Simple performance middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) { // > 1 second
      console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Simple metrics (can be enhanced)
    if (req.path.includes('/booking-history')) {
      console.log(`📊 Booking History request: ${duration}ms`);
    }
  });
  
  next();
};
```

### 2. **Database Query Monitoring**
```javascript
// Query performance logging
const monitoredQuery = async (query, params) => {
  const startTime = Date.now();
  
  try {
    const result = await db.query(query, params);
    const duration = Date.now() - startTime;
    
    // Log slow queries
    if (duration > 500) { // > 500ms
      console.warn(`🐌 Slow query (${duration}ms):`, query.substring(0, 100));
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Query failed (${duration}ms):`, error.message);
    throw error;
  }
};
```

---

## 🚀 **Migration Path to Redis (Future)**

```javascript
// Feature flag for Redis migration
const USE_REDIS = process.env.USE_REDIS === 'true';

// Abstracted session service
class SessionService {
  static async get(sessionId) {
    if (USE_REDIS) {
      return await redisSessionService.get(sessionId);
    } else {
      return await databaseSessionService.get(sessionId);
    }
  }
  
  static async set(sessionId, data, ttl) {
    if (USE_REDIS) {
      return await redisSessionService.set(sessionId, data, ttl);
    } else {
      return await databaseSessionService.set(sessionId, data, ttl);
    }
  }
  
  static async delete(sessionId) {
    if (USE_REDIS) {
      return await redisSessionService.delete(sessionId);
    } else {
      return await databaseSessionService.delete(sessionId);
    }
  }
}
```

---

## ✅ **คำแนะนำสำหรับคุณ**

### 🎯 **เริ่มต้นด้วย**:
1. **JWT-Only** กับ database session tracking
2. **In-memory caching** สำหรับข้อมูลที่เข้าถึงบ่อย
3. **Connection pooling** สำหรับ database performance
4. **Query optimization** และ indexing

### 📈 **Scale ขึ้นเมื่อจำเป็น**:
- **User sessions > 100 concurrent**: เพิ่ม Redis
- **Response time > 1 second**: เพิ่ม caching layer
- **Database load สูง**: เพิ่ม read replicas

### 💡 **Performance ที่คาดหวัง**:
- **Auth middleware**: < 50ms
- **Booking history queries**: < 200ms
- **Session validation**: < 30ms

คิดว่าแนวทางนี้เหมาะกับโครงการของคุณไหมครับ? เริ่มต้นแบบ simple แล้วค่อย scale ตามความต้องการ! 🚀