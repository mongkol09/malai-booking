import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import JWTAuthService, { JWTPayload } from '../services/jwtAuthService';

// ============================================
// AUTHENTICATION MIDDLEWARE FOR BOOKING HISTORY
// ============================================

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    sessionId: string;
    permissions: string[];
    deviceFingerprint?: string;
  };
}

// JWT Configuration
const JWT_CONFIG = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
  issuer: 'hotel-admin-system',
  audience: 'hotel-staff'
};

// ============================================
// MAIN AUTHENTICATION MIDDLEWARE
// ============================================

export const authenticateJWT = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Verify JWT signature and basic validation
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_CONFIG.accessTokenSecret, {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }) as JWTPayload;
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json({ 
          error: 'Token expired', 
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        res.status(401).json({ 
          error: 'Invalid token', 
          code: 'INVALID_TOKEN'
        });
        return;
      }
      
      throw jwtError;
    }

    // 3. Validate session in database (lightweight check)
    const session = await JWTAuthService.validateSession(decoded.session_id);
    if (!session || !session.isActive) {
      res.status(401).json({ 
        error: 'Session expired or invalid', 
        code: 'INVALID_SESSION'
      });
      return;
    }

    // 4. Validate user is still active (cached from JWT)
    if (!decoded.user_id || !decoded.email) {
      res.status(401).json({ 
        error: 'Invalid user data in token', 
        code: 'INVALID_USER_DATA'
      });
      return;
    }

    // 5. Security checks
    const isSuspicious = await JWTAuthService.detectSuspiciousActivity(
      decoded.user_id, 
      req.ip
    );
    
    if (isSuspicious) {
      await JWTAuthService.logSecurityEvent(
        decoded.user_id,
        'SUSPICIOUS_ACTIVITY_DETECTED',
        { ip: req.ip, userAgent: req.headers['user-agent'] },
        req.ip
      );
      
      res.status(429).json({ 
        error: 'Too many requests from this location', 
        code: 'RATE_LIMITED'
      });
      return;
    }

    // 6. Attach user data to request object
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.session_id,
      permissions: decoded.permissions || [],
      deviceFingerprint: decoded.device_fingerprint
    };

    // 7. Update session activity (async - don't block request)
    JWTAuthService.updateSessionActivity(decoded.session_id);

    // 8. Continue to next middleware
    next();

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      error: 'Internal authentication error', 
      code: 'AUTH_ERROR'
    });
  }
};

// ============================================
// PERMISSION-BASED AUTHORIZATION
// ============================================

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          error: 'Not authenticated', 
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const hasPermission = JWTAuthService.hasPermission(
        req.user.permissions, 
        permission
      );

      if (!hasPermission) {
        res.status(403).json({ 
          error: 'Insufficient permissions', 
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permission,
          userRole: req.user.role
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        error: 'Permission check failed', 
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

// ============================================
// ROLE-BASED AUTHORIZATION
// ============================================

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          error: 'Not authenticated', 
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ 
          error: 'Role not authorized', 
          code: 'ROLE_NOT_AUTHORIZED',
          required: allowedRoles,
          userRole: req.user.role
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        error: 'Role check failed', 
        code: 'ROLE_ERROR'
      });
    }
  };
};

// ============================================
// SPECIFIC BOOKING HISTORY PERMISSIONS
// ============================================

// Read access to booking history
export const canReadBookingHistory = requirePermission('booking_history:read');

// Export booking history data
export const canExportBookingHistory = requirePermission('booking_history:export');

// Archive bookings
export const canArchiveBookings = requirePermission('booking_history:archive');

// Restore bookings from history
export const canRestoreBookings = requirePermission('booking_history:restore');

// Bulk operations on booking history
export const canBulkOperateBookings = requirePermission('booking_history:bulk_operations');

// System operations (dev only)
export const canSystemOperateBookings = requirePermission('booking_history:system_operations');

// Admin and Dev only access
export const requireAdminOrDev = requireRole(['ADMIN', 'DEV']);

// Dev only access
export const requireDev = requireRole(['DEV']);

// ============================================
// AUDIT LOGGING MIDDLEWARE
// ============================================

export const auditBookingHistoryAccess = (action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (req.user) {
        // Log access attempt
        console.log(`[AUDIT] Booking History Access: ${action}`, {
          userId: req.user.id,
          userRole: req.user.role,
          action: action,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method
        });
      }

      next();
    } catch (error) {
      console.error('Audit logging error:', error);
      next(); // Don't block request on audit failure
    }
  };
};

// ============================================
// RATE LIMITING MIDDLEWARE
// ============================================

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export const rateLimitBookingHistory = (
  maxRequests: number = 100, 
  windowMs: number = 60 * 1000 // 1 minute
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        next();
        return;
      }

      const key = `${req.user.id}:${req.ip}`;
      const now = Date.now();
      
      // Clean up expired entries
      if (rateLimitStore[key] && rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }

      // Initialize or increment counter
      if (!rateLimitStore[key]) {
        rateLimitStore[key] = {
          count: 1,
          resetTime: now + windowMs
        };
      } else {
        rateLimitStore[key].count++;
      }

      // Check limit
      if (rateLimitStore[key].count > maxRequests) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMITED',
          limit: maxRequests,
          windowMs: windowMs,
          retryAfter: Math.ceil((rateLimitStore[key].resetTime - now) / 1000)
        });
        return;
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - rateLimitStore[key].count).toString(),
        'X-RateLimit-Reset': new Date(rateLimitStore[key].resetTime).toISOString()
      });

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Don't block request on rate limit failure
    }
  };
};

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

export const handleAuthErrors = (
  error: any, 
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('Authentication error:', error);

  // Log security event for failed authentication
  if (req.user) {
    JWTAuthService.logSecurityEvent(
      req.user.id,
      'AUTHENTICATION_ERROR',
      { error: error.message },
      req.ip
    );
  }

  res.status(500).json({
    error: 'Authentication system error',
    code: 'AUTH_SYSTEM_ERROR'
  });
};

// ============================================
// PERFORMANCE MONITORING
// ============================================

export const monitorPerformance = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) { // > 1 second
      console.warn(`[PERFORMANCE] Slow booking history request: ${req.method} ${req.path} took ${duration}ms`, {
        userId: req.user?.id,
        userRole: req.user?.role,
        duration: duration,
        path: req.path,
        method: req.method
      });
    }

    // Log metrics for booking history endpoints
    if (req.path.includes('/booking-history') || req.path.includes('/archive')) {
      console.log(`[METRICS] Booking History: ${req.method} ${req.path} - ${duration}ms - User: ${req.user?.id || 'anonymous'}`);
    }
  });

  next();
};

// ============================================
// COMPOSITE MIDDLEWARE CHAINS
// ============================================

// Complete authentication chain for booking history
export const bookingHistoryAuth = [
  monitorPerformance,
  authenticateJWT,
  rateLimitBookingHistory(),
  canReadBookingHistory,
  auditBookingHistoryAccess('READ')
];

// Admin operations chain
export const bookingHistoryAdminAuth = [
  monitorPerformance,
  authenticateJWT,
  rateLimitBookingHistory(50, 60 * 1000), // Stricter limits for admin operations
  requireAdminOrDev,
  auditBookingHistoryAccess('ADMIN_OPERATION')
];

// Export operations chain
export const bookingHistoryExportAuth = [
  monitorPerformance,
  authenticateJWT,
  rateLimitBookingHistory(10, 60 * 1000), // Very strict limits for exports
  canExportBookingHistory,
  auditBookingHistoryAccess('EXPORT')
];

export { AuthenticatedRequest };