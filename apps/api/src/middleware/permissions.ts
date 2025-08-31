// Permission-based authorization middleware
// ตรวจสอบสิทธิ์ในการเข้าถึง resource ตาม role permissions

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface สำหรับ permission check
interface PermissionCheck {
  resource: string;
  action: 'read' | 'write' | 'create' | 'delete';
}

// Middleware สำหรับตรวจสอบ permission
export const requirePermission = (resource: string, action: 'read' | 'write' | 'create' | 'delete') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // ถ้าเป็น DEV ให้ผ่านไปเลย (Super Admin)
      if (user.userType === 'DEV') {
        return next();
      }

      // ดึงข้อมูล user พร้อม role และ permissions
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          staffProfile: {
            include: {
              role: {
                include: {
                  permissions: true
                }
              }
            }
          }
        }
      });

      if (!userWithRole || !userWithRole.staffProfile || !userWithRole.staffProfile.role) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned. Access denied.'
        });
      }

      const role = userWithRole.staffProfile.role;
      
      // หา permission ที่ตรงกับ resource
      const permission = role.permissions.find(p => p.resourceName === resource);
      
      if (!permission) {
        return res.status(403).json({
          success: false,
          message: `No permission for resource: ${resource}`
        });
      }

      // ตรวจสอบ action ที่ต้องการ
      let hasPermission = false;
      switch (action) {
        case 'read':
          hasPermission = permission.canRead;
          break;
        case 'write':
          hasPermission = permission.canWrite;
          break;
        case 'create':
          hasPermission = permission.canCreate;
          break;
        case 'delete':
          hasPermission = permission.canDelete;
          break;
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permission. Required: ${resource}:${action}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware สำหรับตรวจสอบหลาย permissions (AND condition)
export const requirePermissions = (checks: PermissionCheck[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // ถ้าเป็น DEV ให้ผ่านไปเลย
      if (user.userType === 'DEV') {
        return next();
      }

      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          staffProfile: {
            include: {
              role: {
                include: {
                  permissions: true
                }
              }
            }
          }
        }
      });

      if (!userWithRole || !userWithRole.staffProfile || !userWithRole.staffProfile.role) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned. Access denied.'
        });
      }

      const role = userWithRole.staffProfile.role;
      
      // ตรวจสอบทุก permission ที่ต้องการ
      for (const check of checks) {
        const permission = role.permissions.find(p => p.resourceName === check.resource);
        
        if (!permission) {
          return res.status(403).json({
            success: false,
            message: `No permission for resource: ${check.resource}`
          });
        }

        let hasPermission = false;
        switch (check.action) {
          case 'read':
            hasPermission = permission.canRead;
            break;
          case 'write':
            hasPermission = permission.canWrite;
            break;
          case 'create':
            hasPermission = permission.canCreate;
            break;
          case 'delete':
            hasPermission = permission.canDelete;
            break;
        }

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: `Insufficient permission. Required: ${check.resource}:${check.action}`
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware สำหรับตรวจสอบ role โดยตรง
export const requireRolePermission = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // ถ้าเป็น DEV ให้ผ่านไปเลย
      if (user.userType === 'DEV') {
        return next();
      }

      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          staffProfile: {
            include: {
              role: true
            }
          }
        }
      });

      if (!userWithRole || !userWithRole.staffProfile || !userWithRole.staffProfile.role) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned. Access denied.'
        });
      }

      const userRole = userWithRole.staffProfile.role.name;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
};

// Middleware สำหรับตรวจสอบว่าเป็น admin หรือไม่
export const requireAdmin = requireRolePermission(['Super Admin', 'Admin']);

// Middleware สำหรับตรวจสอบว่าเป็น super admin หรือไม่
export const requireSuperAdmin = requireRolePermission(['Super Admin']);

// Helper function สำหรับตรวจสอบ permission ใน controller
export const checkPermission = async (userId: string, resource: string, action: 'read' | 'write' | 'create' | 'delete'): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        staffProfile: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });

    if (!user) return false;

    // DEV มีสิทธิ์ทุกอย่าง
    if (user.userType === 'DEV') return true;

    if (!user.staffProfile || !user.staffProfile.role) return false;

    const permission = user.staffProfile.role.permissions.find(p => p.resourceName === resource);
    if (!permission) return false;

    switch (action) {
      case 'read': return permission.canRead;
      case 'write': return permission.canWrite;
      case 'create': return permission.canCreate;
      case 'delete': return permission.canDelete;
      default: return false;
    }
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};
