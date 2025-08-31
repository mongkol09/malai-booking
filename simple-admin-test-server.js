// 🚀 QUICK FIX: Direct Admin Token Test
// Test admin endpoint with simple Express server

const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Load environment variables
require('dotenv').config({ path: './apps/api/.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Simple admin token verification middleware
const verifyAdminToken = (req, res, next) => {
  try {
    console.log('🔐 Admin Token Verification Started');
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing Authorization header');
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          code: 'MISSING_TOKEN',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log(`🔍 Verifying token: ${token.substring(0, 50)}...`);

    // Verify token with JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully');
    console.log('📋 Decoded payload:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isAdmin: decoded.isAdmin,
      permissions: decoded.permissions
    });

    // Check if it's an admin token
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      console.log('❌ Not an admin token');
      return res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required',
          code: 'ADMIN_REQUIRED',
        },
      });
    }

    // Attach user to request
    req.user = decoded;
    console.log('✅ Admin authentication successful');
    next();
  } catch (error) {
    console.error('❌ Admin token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        },
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token format',
          code: 'INVALID_TOKEN_FORMAT',
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token verification failed',
          code: 'TOKEN_VERIFICATION_FAILED',
        },
      });
    }
  }
};

// Test admin endpoints
app.get('/api/v1/bookings/admin/all', verifyAdminToken, (req, res) => {
  console.log('📋 Getting all bookings for admin');
  res.json({
    success: true,
    message: 'All bookings (admin/staff only)',
    data: { 
      bookings: [
        {
          id: 'BK001',
          customerName: 'Test Customer from Simple Booking API',
          roomId: 'R101',
          checkInDate: '2025-08-16',
          checkOutDate: '2025-08-18',
          status: 'confirmed',
          totalAmount: 2500
        },
        {
          id: 'BK002',
          customerName: 'John Doe',
          roomId: 'R102',
          checkInDate: '2025-08-17',
          checkOutDate: '2025-08-19',
          status: 'pending',
          totalAmount: 3500
        }
      ],
      total: 2,
      adminUser: req.user?.email,
      serverType: 'Simple Test Server'
    }
  });
});

app.get('/api/v1/bookings/admin/stats', verifyAdminToken, (req, res) => {
  console.log('📊 Getting booking statistics for admin');
  res.json({
    success: true,
    message: 'Booking statistics (admin only)',
    data: {
      totalBookings: 2,
      confirmedBookings: 1,
      pendingBookings: 1,
      cancelledBookings: 0,
      totalRevenue: 6000,
      occupancyRate: 50,
      adminUser: req.user?.email,
      serverType: 'Simple Test Server'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Simple Admin Test Server is running',
    timestamp: new Date().toISOString(),
    jwt_secret_loaded: !!process.env.JWT_SECRET
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log('🚀 SIMPLE ADMIN TEST SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Admin bookings: http://localhost:${PORT}/api/v1/bookings/admin/all`);
  console.log(`📊 Admin stats: http://localhost:${PORT}/api/v1/bookings/admin/stats`);
  console.log(`🔑 JWT Secret loaded: ${!!process.env.JWT_SECRET}`);
  console.log('');
  console.log('🧪 READY FOR TESTING!');
  console.log('Use the admin token with these endpoints to verify authentication works');
});
