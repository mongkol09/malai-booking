// ============================================
// API KEY VALIDATION MIDDLEWARE
// ============================================

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

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
        'hotel-booking-api-key-2024', // Legacy compatibility
        'dev-api-key-2024' // Legacy dev key
      ].filter(Boolean); // Remove undefined values
      
      console.log('🔍 Validating API key:', apiKey.substring(0, 20) + '...');
      console.log('🔑 Valid keys count:', validApiKeys.length);
      
      if (validApiKeys.includes(apiKey)) {
        // Create mock user for API key authentication
        req.user = {
          userId: 'api-user-123',
          email: 'api@hotel.com',
          userType: 'ADMIN',
          sessionId: 'api-session-123'
        };
        console.log('🔑 API Key authentication successful');
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

    // Development bypass - if NODE_ENV is development and using dev API key
    if (process.env.NODE_ENV === 'development' && req.headers['x-api-key'] === 'dev-api-key-2024') {
      // Create mock user for development
      req.user = {
        userId: 'dev-admin-123',
        email: 'admin@hotel.dev',
        userType: 'ADMIN',
        sessionId: 'dev-session-123'
      };
      console.log('🔧 Development mode: Using mock authentication');
      next();
      return;
    }

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
      
      console.log('🔍 Token decoded:', {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType,
        sessionId: decoded.sessionId
      });
      
      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType,
        sessionId: decoded.sessionId
      };
      
      console.log(`✅ Direct token authentication successful for ${decoded.email}`);
      next();
      return;
    } catch (tokenError) {
      console.log('❌ Direct token failed, trying session-based verification...');
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
    
    // DEV role has access to everything
    if (userType === 'DEV') {
      console.log(`✅ DEV access granted for ${req.user.email}`);
      next();
      return;
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(userType)) {
      console.log(`❌ Access denied for role: ${userType}, required: ${allowedRoles.join(', ')}`);
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

    console.log(`✅ Access granted for role: ${userType}`);

    next();
  };
};
