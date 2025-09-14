// ============================================
// API KEY VALIDATION MIDDLEWARE
// ============================================

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

// Safe logging function - only logs in development mode
const safeLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: string;
    sessionId: string;
  };
}

export const validateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for X-API-Key header first
    const apiKey = req.headers['x-api-key'] as string;
    
    if (apiKey) {
      // Validate API key with current environment keys
      const validApiKeys = [
        process.env.API_KEY, // Production API key
        process.env.ADMIN_API_KEY, // Admin API key
        process.env.API_KEY_DEV, // Development API key
        process.env.API_KEY_TEST, // Test API key
        process.env.API_KEY_INTERNAL, // Internal API key
        process.env.API_KEY_ANALYTICS, // Analytics API key
        process.env.API_KEY_ADMIN, // Admin API key
        // Legacy key removed - all frontend now uses environment variables
      ].filter(Boolean); // Remove undefined values
      
      safeLog('🔍 Validating API key:', apiKey.substring(0, 20) + '...');
      safeLog('🔑 Valid keys count:', validApiKeys.length);
      
      if (validApiKeys.includes(apiKey)) {
        // Create mock user for API key authentication
        req.user = {
          userId: 'api-user-123',
          email: 'api@hotel.com',
          userType: 'ADMIN',
          sessionId: 'api-session-123'
        };
        safeLog('🔑 API Key authentication successful');
        next();
        return;
      } else {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid API key',
            code: 'INVALID_API_KEY',
          },
        });
        return;
      }
    }

    // Development bypass - removed for production security
    // Old bypass logic disabled for security

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          code: 'MISSING_TOKEN',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Simple JWT verification for direct tokens (without session lookup)
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Only log sensitive data in development
      if (process.env.NODE_ENV === 'development') {
        safeLog('🔍 Token decoded:', {
          userId: decoded.userId,
          email: decoded.email,
          userType: decoded.userType,
          sessionId: decoded.sessionId
        });
      }
      
      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType,
        sessionId: decoded.sessionId
      };
      
      safeLog(`✅ Direct token authentication successful for ${decoded.email}`);
      next();
      return;
    } catch (tokenError) {
      safeLog('❌ Direct token failed, trying session-based verification...');
    }

    // Fallback to original session-based verification
    const decoded = await verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        },
      });
      return;
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'AUTH_FAILED',
      },
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
      });
      return;
    }

    const userType = req.user.userType;
    
    // DEV role access - controlled by environment flag
    if (userType === 'DEV') {
      // Check if DEV bypass is explicitly allowed in environment
      if (process.env.ALLOW_DEV_BYPASS === 'true') {
        safeLog(`✅ DEV access granted for ${req.user.email} (bypass enabled)`);
        next();
        return;
      } else {
        safeLog(`❌ DEV access denied for ${req.user.email} (bypass disabled)`);
        res.status(403).json({
          success: false,
          error: {
            message: 'DEV bypass disabled in production',
            code: 'DEV_BYPASS_DISABLED',
          },
        });
        return;
      }
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(userType)) {
      safeLog(`❌ Access denied for role: ${userType}, required: ${allowedRoles.join(', ')}`);
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          userRole: userType,
          requiredRoles: allowedRoles,
        },
      });
      return;
    }

    safeLog(`✅ Access granted for role: ${userType}`);

    next();
  };
};
