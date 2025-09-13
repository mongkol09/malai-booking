import { Request, Response, NextFunction } from 'express';
import { validateSessionToken } from '../utils/auth';

// ============================================
// BOOKING HISTORY AUTHENTICATION MIDDLEWARE
// ============================================
// ใช้ระบบ Auth ที่มีอยู่แล้วในระบบ

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: string;
    sessionId: string;
  };
}

// ============================================
// MAIN AUTHENTICATION MIDDLEWARE
// ============================================

export async function bookingHistoryAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No access token provided'
      });
    }

    // ใช้ระบบ validation ที่มีอยู่แล้ว
    const validationResult = await validateSessionToken(token);

    if (!validationResult.isValid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: validationResult.error || 'Invalid or expired token'
      });
    }

    // เพิ่มข้อมูล user ลงใน request
    req.user = {
      userId: validationResult.user.id,
      email: validationResult.user.email,
      userType: validationResult.user.userType,
      sessionId: validationResult.session.id
    };

    next();

  } catch (error) {
    console.error('Booking History Auth Error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'Internal authentication error'
    });
  }
}

// ============================================
// PERMISSION MIDDLEWARE FACTORY
// ============================================

export function requirePermission(action: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userType = req.user.userType;
    
    // กำหนด permissions ตาม userType ที่มีอยู่แล้วในระบบ
    const permissions = getBookingHistoryPermissions(userType);
    
    if (!permissions.includes(action)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Action '${action}' requires ${getRequiredRole(action)} role or higher`,
        required_action: action,
        user_type: userType,
        available_permissions: permissions
      });
    }

    next();
  };
}

// ============================================
// PERMISSION MAPPING
// ============================================

export function getBookingHistoryPermissions(userType: string): string[] {
  const permissionMap: { [key: string]: string[] } = {
    'ADMIN': [
      'view_history',
      'manage_archive', 
      'view_analytics',
      'export_data',
      'restore_bookings',
      'bulk_operations',
      'system_settings'
    ],
    'DEV': [
      'view_history',
      'manage_archive',
      'view_analytics', 
      'export_data',
      'restore_bookings',
      'bulk_operations',
      'system_settings',
      'debug_operations'
    ],
    'MANAGER': [
      'view_history',
      'view_analytics',
      'export_data'
    ],
    'STAFF': [
      'view_history'
    ]
  };

  return permissionMap[userType] || [];
}

function getRequiredRole(action: string): string {
  const roleRequirements: { [key: string]: string } = {
    'view_history': 'STAFF',
    'view_analytics': 'MANAGER', 
    'export_data': 'MANAGER',
    'manage_archive': 'ADMIN',
    'restore_bookings': 'ADMIN',
    'bulk_operations': 'ADMIN',
    'system_settings': 'ADMIN',
    'debug_operations': 'DEV'
  };

  return roleRequirements[action] || 'ADMIN';
}

// ============================================
// SPECIALIZED MIDDLEWARE
// ============================================

// ใช้ middleware ที่มีอยู่แล้วในระบบ
export { requireAdmin, requireStaff, requireManager } from './enhancedAuth';

// เพิ่ม middleware เฉพาะสำหรับ Booking History
export function requireBookingHistoryAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const allowedRoles = ['ADMIN', 'DEV', 'MANAGER', 'STAFF'];
  
  if (!allowedRoles.includes(req.user.userType)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Booking History access requires staff role or higher',
      user_type: req.user.userType
    });
  }

  next();
}

export function requireArchivePermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const allowedRoles = ['ADMIN', 'DEV'];
  
  if (!allowedRoles.includes(req.user.userType)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
      message: 'Archive operations require ADMIN or DEV role',
      user_type: req.user.userType,
      required_roles: allowedRoles
    });
  }

  next();
}

export default bookingHistoryAuth;