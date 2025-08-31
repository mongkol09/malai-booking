// 🔧 FIXED: Admin-Only Token Verification
// ✅ Solution: Create special auth middleware for admin tokens that don't require database session

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminAuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: string;
    role?: string;
    isAdmin?: boolean;
    permissions?: string[];
  };
}

// ✅ NEW: Admin token verification (standalone tokens)
export const verifyAdminToken = async (
  req: AdminAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🔐 Admin Token Verification Started');
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing Authorization header');
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
    console.log(`🔍 Verifying token: ${token.substring(0, 50)}...`);

    // Verify token with JWT secret (no database lookup required)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('✅ Token verified successfully');
    console.log('📋 Decoded payload:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isAdmin: decoded.isAdmin,
      permissions: decoded.permissions
    });

    // Check if user has appropriate role
    const allowedRoles = ['DEV', 'ADMIN', 'STAFF', 'admin'];
    const userRole = decoded.userType || decoded.role;
    if (!decoded.isAdmin && !allowedRoles.includes(userRole)) {
      console.log(`❌ Insufficient role: ${userRole}`);
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions for this resource',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
      });
      return;
    }

    // Create user object for request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      userType: decoded.userType || decoded.role, // Use actual user type
      role: decoded.role,
      isAdmin: decoded.isAdmin,
      permissions: decoded.permissions
    };

    console.log('✅ Admin authentication successful');
    next();
  } catch (error: any) {
    console.error('❌ Admin token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        },
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token format',
          code: 'INVALID_TOKEN_FORMAT',
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token verification failed',
          code: 'TOKEN_VERIFICATION_FAILED',
        },
      });
    }
  }
};

// ✅ NEW: Admin role requirement (works with admin tokens)
export const requireAdminRole = (allowedRoles: string[] = ['ADMIN']) => {
  return (req: AdminAuthenticatedRequest, res: Response, next: NextFunction): void => {
    console.log('🔍 Checking admin role requirements');
    
    if (!req.user) {
      console.log('❌ No user found in request');
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
      });
      return;
    }

    console.log(`👤 User type: ${req.user.userType}, Role: ${req.user.role}, IsAdmin: ${req.user.isAdmin}`);
    console.log(`🎯 Required roles: ${allowedRoles.join(', ')}`);

    // Check if user has required role
    const hasPermission = allowedRoles.includes(req.user.userType) || 
                         (req.user.role && allowedRoles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())) ||
                         req.user.isAdmin;

    if (!hasPermission) {
      console.log('❌ Insufficient permissions');
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
      });
      return;
    }

    console.log('✅ Role check passed');
    next();
  };
};

export default {
  verifyAdminToken,
  requireAdminRole
};
