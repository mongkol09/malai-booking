// ============================================
// 🔐 SESSION-BASED AUTHENTICATION MIDDLEWARE
// 🌟 Enterprise-Grade Security & Performance
// ============================================

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// ============================================
// INTERFACES & TYPES
// ============================================

export interface SessionAuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: string;
    role?: string;
    isAdmin?: boolean;
    permissions?: string[];
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  session?: {
    id: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
  };
}

export interface SessionValidationResult {
  isValid: boolean;
  session?: any;
  user?: any;
  needsRefresh?: boolean;
  error?: string;
  errorCode?: string;
}

// ============================================
// SECURITY CONFIGURATION
// ============================================

const SECURITY_CONFIG = {
  // Token expiry times
  ACCESS_TOKEN_EXPIRY: '15m',      // Short-lived access token
  REFRESH_TOKEN_EXPIRY: '7d',      // Longer refresh token
  
  // Security checks
  CHECK_IP_ADDRESS: false,         // Disabled for testing - TODO: Enable in production
  CHECK_USER_AGENT: false,         // Disabled for testing - TODO: Enable in production
  MAX_SESSIONS_PER_USER: 5,        // Limit concurrent sessions
  
  // Rate limiting
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Logging
  LOG_SUCCESSFUL_AUTH: true,
  LOG_FAILED_AUTH: true,
  LOG_SECURITY_VIOLATIONS: true,
};

// ============================================
// CORE SESSION VALIDATION
// ============================================

/**
 * 🔍 Validate session token against database
 * Enterprise-grade validation with security checks
 */
async function validateSessionInDatabase(
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<SessionValidationResult> {
  try {
    console.log('🔍 Starting session validation...');
    
    // 1. Verify JWT token structure
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('✅ JWT signature valid');
    } catch (jwtError) {
      console.log('❌ Invalid JWT signature');
      return {
        isValid: false,
        error: 'Invalid token signature',
        errorCode: 'INVALID_JWT_SIGNATURE'
      };
    }

    // 2. Find session in database
    const session = await prisma.userSession.findFirst({
      where: {
        accessToken: token,
        expiresAt: {
          gt: new Date() // Token not expired
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true,
            firstName: true,
            lastName: true,
            isActive: true,
            emailVerified: true
          }
        }
      }
    });

    if (!session) {
      console.log('❌ Session not found or expired');
      return {
        isValid: false,
        error: 'Session not found or expired',
        errorCode: 'SESSION_NOT_FOUND'
      };
    }

    // 3. Check if user is still active
    if (!session.user.isActive) {
      console.log('❌ User account is deactivated');
      return {
        isValid: false,
        error: 'User account is deactivated',
        errorCode: 'USER_DEACTIVATED'
      };
    }

    // 4. Security checks
    const securityViolations = [];
    
    // Check IP address consistency
    if (SECURITY_CONFIG.CHECK_IP_ADDRESS && session.ipAddress && ipAddress) {
      if (session.ipAddress !== ipAddress) {
        securityViolations.push(`IP mismatch: ${session.ipAddress} vs ${ipAddress}`);
        console.log('⚠️ Security violation: IP address mismatch');
      }
    }

    // Check User-Agent consistency
    if (SECURITY_CONFIG.CHECK_USER_AGENT && session.userAgent && userAgent) {
      if (session.userAgent !== userAgent) {
        securityViolations.push(`User-Agent mismatch`);
        console.log('⚠️ Security violation: User-Agent mismatch');
      }
    }

    // 5. Check if token needs refresh (within 5 minutes of expiry)
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const needsRefresh = session.expiresAt <= fiveMinutesFromNow;

    if (needsRefresh) {
      console.log('🔄 Token approaching expiry, refresh recommended');
    }

    // 6. Log security violations (if any)
    if (securityViolations.length > 0 && SECURITY_CONFIG.LOG_SECURITY_VIOLATIONS) {
      console.log('🚨 Security violations detected:', securityViolations);
      
      // In production, you might want to:
      // - Block the request
      // - Log to security monitoring system
      // - Notify admin
      // - Invalidate the session
      
      // For now, we'll log but allow the request
    }

    console.log('✅ Session validation successful');
    
    return {
      isValid: true,
      session: {
        id: session.id,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt
      },
      user: {
        userId: session.user.id,
        email: session.user.email,
        userType: session.user.userType,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        isActive: session.user.isActive,
        emailVerified: session.user.emailVerified
      },
      needsRefresh
    };

  } catch (error) {
    console.error('💥 Session validation error:', error);
    return {
      isValid: false,
      error: 'Internal session validation error',
      errorCode: 'VALIDATION_ERROR'
    };
  }
}

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * 🛡️ Main Session Authentication Middleware
 * Enterprise-grade session validation with security tracking
 */
export const sessionAuth = async (
  req: SessionAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  
  try {
    console.log('🔐 sessionAuth middleware CALLED');
    console.log(`📍 Request: ${req.method} ${req.path}`);
    console.log(`📍 Full URL: ${req.originalUrl}`);
    
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    console.log(`🔍 Auth header: ${authHeader?.substring(0, 30)}...`);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid Authorization header');
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          code: 'MISSING_TOKEN',
          timestamp: new Date().toISOString()
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log(`🔍 Validating token: ${token.substring(0, 20)}...`);

    // 2. Get client information for security checks
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    console.log(`🌐 Client Info - IP: ${ipAddress}, UA: ${userAgent?.substring(0, 50)}...`);

    // 3. Validate session
    const validation = await validateSessionInDatabase(token, ipAddress, userAgent);
    
    if (!validation.isValid) {
      console.log(`❌ Session validation failed: ${validation.error}`);
      
      const statusCode = validation.errorCode === 'SESSION_NOT_FOUND' ? 401 : 403;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: validation.error,
          code: validation.errorCode,
          timestamp: new Date().toISOString()
        },
      });
      return;
    }

    // 4. Attach user and session info to request
    req.user = {
      userId: validation.user!.userId,
      email: validation.user!.email,
      userType: validation.user!.userType,
      role: validation.user!.userType,
      isAdmin: ['DEV', 'ADMIN', 'SUPER_ADMIN'].includes(validation.user!.userType),
      permissions: getUserPermissions(validation.user!.userType),
      sessionId: validation.session!.id,
      ipAddress,
      userAgent
    };

    req.session = validation.session;

    // 5. Add refresh token hint in response header (if needed)
    if (validation.needsRefresh) {
      res.setHeader('X-Token-Refresh-Needed', 'true');
      res.setHeader('X-Token-Expires-At', validation.session!.expiresAt.toISOString());
    }

    // 6. Log successful authentication
    if (SECURITY_CONFIG.LOG_SUCCESSFUL_AUTH) {
      const duration = Date.now() - startTime;
      console.log(`✅ Session auth successful for ${req.user.email} (${duration}ms)`);
    }

    // 7. Update last activity (optional - for session tracking)
    // You might want to update lastActivityAt in the session record
    
    next();

  } catch (error) {
    console.error('💥 Session authentication error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal authentication error',
        code: 'AUTH_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
    });
  }
};

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

/**
 * 🎭 Role-based access control middleware
 * Restrict access based on user roles
 */
export const requireSessionRole = (allowedRoles: string[]) => {
  return (req: SessionAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString()
        },
      });
      return;
    }

    const userRole = req.user.userType || req.user.role || '';
    const isAdmin = ['DEV', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);
    
    // Enhanced permission check
    const hasPermission = 
      allowedRoles.includes(userRole) ||           // Direct role match
      (isAdmin && allowedRoles.includes('ADMIN')) || // Admin privilege
      allowedRoles.includes('*');                   // Wildcard permission
    
    if (!hasPermission) {
      console.log(`❌ Access denied for role: ${userRole}, required: ${allowedRoles.join(', ')}`);
      
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: userRole,
          timestamp: new Date().toISOString()
        },
      });
      return;
    }

    console.log(`✅ Role access granted for ${userRole}`);
    next();
  };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * 🔑 Get user permissions based on user type
 */
function getUserPermissions(userType: string): string[] {
  const permissionMap: Record<string, string[]> = {
    'DEV': ['*'], // Full system access - Developer role
    'SUPER_ADMIN': ['*'], // All permissions
    'ADMIN': [
      'bookings:read',
      'bookings:write',
      'bookings:delete',
      'users:read',
      'users:write',
      'reports:read',
      'settings:read',
      'settings:write'
    ],
    'STAFF': [
      'bookings:read',
      'bookings:write',
      'reports:read'
    ],
    'CUSTOMER': [
      'bookings:read:own',
      'profile:read:own',
      'profile:write:own'
    ]
  };

  return permissionMap[userType] || [];
}

/**
 * 🧹 Cleanup expired sessions
 * Call this periodically to remove old sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const result = await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    console.log(`🧹 Cleaned up ${result.count} expired sessions`);
  } catch (error) {
    console.error('❌ Failed to cleanup expired sessions:', error);
  }
}

// ============================================
// EXPORTS
// ============================================

export default sessionAuth;
