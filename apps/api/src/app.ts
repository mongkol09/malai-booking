// ============================================
// HOTEL BOOKING API - MAIN APPLICATION
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import path from 'path';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import sessionAuthRoutes from './routes/sessionAuthRoutes';
import userRoutes from './routes/users';
import bookingRoutes from './routes/bookings';
import publicBookingRoutes from './routes/publicBookings';
import roomRoutes from './routes/rooms';
// Import enterprise role management
import rolesFrontendRoutes from './routes/roles-frontend';
import rolePermissionsRoutes from './routes/role-permissions';
import pricingRoutes from './routes/pricing';
import holidayRoutes from './routes/holidays';
import financialRoutes from './routes/financial';
import paymentVerificationRoutes from './routes/paymentVerification';
import notificationRoutes from './routes/notifications';
import eventRoutes from './routes/eventRoutes';
import manualOverrideRoutes from './routes/manualOverrideRoutes';
import emailRoutes from './routes/emailRoutes';
import analyticsRoutes from './routes/analytics';
import enhancedAnalyticsRoutes from './routes/enhancedAnalytics';
// Import check-in system routes
import checkinRoutes from './routes/checkinRoutes';
import availabilityRoutes from './routes/availability';
import guestDataRoutes from './routes/guestData';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateApiKey } from './middleware/validateApiKey';

// Import security middleware
import { securityHeaders, customSecurityHeaders, corsConfig, securityAuditLog } from './middleware/securityHeaders';
import { generalRateLimit, authRateLimit, paymentRateLimit, bookingRateLimit, adminRateLimit } from './middleware/rateLimiting';
import { sanitizeInput, validateRateLimit } from './middleware/inputValidation';
import { auditLogger, securityLogger, authLogger, paymentLogger, adminLogger } from './middleware/auditLogging';
import { enhancedAuth, requireAdmin, requireStaff, requireManager } from './middleware/enhancedAuth';
import { validatePaymentRequest, fraudDetection, paymentRateLimit as paymentSecurityRateLimit, verifyWebhookSignature } from './middleware/paymentSecurity';
import securityConfig from './config/security';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Create Express app
const app = express();

// ============================================
// ENHANCED SECURITY MIDDLEWARE
// ============================================

// Security headers with enhanced configuration
app.use(securityHeaders);
app.use(customSecurityHeaders);

// CORS with enhanced security
app.use(cors(corsConfig));

// General rate limiting
app.use('/api', generalRateLimit);

// Security audit logging
app.use(securityAuditLog);

// Input sanitization
app.use(sanitizeInput);

// Suspicious activity detection
app.use(validateRateLimit);

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // maximum delay of 20 seconds
});
app.use('/api', speedLimiter);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// ============================================
// LOGGING MIDDLEWARE
// ============================================

app.use(requestLogger);

// ============================================
// HEALTH CHECK ROUTES
// ============================================

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.API_VERSION || 'v1',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

app.get('/api/health', async (req, res) => {
  res.redirect('/health');
});

// ============================================
// API ROUTES
// ============================================

const apiRouter = express.Router();

// Authentication routes (public)
apiRouter.use('/auth', authRoutes);

// Session-based authentication routes (public)
apiRouter.use('/auth', sessionAuthRoutes);

// Public booking routes (no authentication required)
apiRouter.use('/public/bookings', publicBookingRoutes);

// Customer booking routes (no authentication required for booking creation)
apiRouter.use('/bookings', bookingRoutes);

// Public notification test route (for development only)
if (process.env.NODE_ENV === 'development') {
  apiRouter.use('/public/notifications', notificationRoutes);
}

// Manual Override routes (uses own authentication)
apiRouter.use('/override', manualOverrideRoutes);

// Analytics routes (use simple API key)
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/analytics', enhancedAnalyticsRoutes);

// Availability routes (admin only)
apiRouter.use('/admin/availability', availabilityRoutes);

// Public endpoints (no auth required)
apiRouter.use('/rooms', roomRoutes); // Move rooms before API key validation
apiRouter.use('/pricing', pricingRoutes); // Move pricing before API key validation for frontend
apiRouter.use('/holidays', holidayRoutes); // Holiday calendar API for frontend

// API key validation for protected routes
apiRouter.use(validateApiKey);

// Protected routes (admin/staff only)
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', rolesFrontendRoutes);
apiRouter.use('/role-permissions', rolePermissionsRoutes);
apiRouter.use('/financial', financialRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/emails', emailRoutes);

// Check-in system routes (admin/staff only)
apiRouter.use('/checkin', checkinRoutes);

// Room management routes (admin/staff only) - handled by housekeeping routes

// Admin password management routes
apiRouter.post('/admin/reset-user-password/:id', validateApiKey, async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId as string },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate temp password
    const crypto = require('crypto');
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id: targetUserId as string },
      data: { passwordHash }
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        email: targetUser.email,
        tempPassword,
        resetAt: new Date()
      }
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Payment verification routes (includes webhook endpoint)
app.use(`/api/${process.env.API_VERSION || 'v1'}/payments`, paymentVerificationRoutes);

// Guest data management routes
app.use(`/api/${process.env.API_VERSION || 'v1'}/admin`, guestDataRoutes);

// Telegram housekeeping routes
import telegramHousekeepingRoutes from './routes/telegramHousekeeping';
// PIN authentication routes
import pinAuthRoutes from './routes/pinAuth';
import adminPinRoutes from './routes/adminPinRoutes';
import pinAnalyticsRoutes from './routes/pinAnalyticsRoutes';
app.use(`/api/${process.env.API_VERSION || 'v1'}/housekeeping`, telegramHousekeepingRoutes);

// PIN authentication routes
app.use(`/api/${process.env.API_VERSION || 'v1'}/auth`, pinAuthRoutes);

// Admin PIN management routes
app.use(`/api/${process.env.API_VERSION || 'v1'}/admin`, adminPinRoutes);

// PIN analytics routes
app.use(`/api/${process.env.API_VERSION || 'v1'}/admin`, pinAnalyticsRoutes);

// Mount API router
app.use(`/api/${process.env.API_VERSION || 'v1'}`, apiRouter);

// ============================================
// STATIC FILES & PASSWORD RESET PAGES
// ============================================

// Serve static files
app.use(express.static('public'));

// Password reset pages
app.get('/admin/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/reset-password.html'));
});

app.get('/admin/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/forgot-password.html'));
});

// ============================================
// 404 HANDLER
// ============================================

app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestion: 'Check the API documentation for available endpoints',
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use(errorHandler);

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// ============================================
// START SERVER WITH WEBSOCKET SUPPORT
// ============================================

import { createServer } from 'http';
import { initializeWebSocket } from './services/websocketService';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket service
const webSocketService = initializeWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Hotel Booking API Server running on http://${HOST}:${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
  console.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`🔌 WebSocket Server: ws://${HOST}:${PORT}/socket.io/`);
  console.log(`📱 Admin Notifications: ENABLED`);
});

export default app;
