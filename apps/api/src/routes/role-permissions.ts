// ============================================
// ROLE PERMISSIONS ENHANCED API
// ============================================

import express from 'express';
import { Request, Response } from 'express';
import { sessionAuth, requireSessionRole, SessionAuthenticatedRequest } from '../middleware/sessionAuth';
import { requirePermission, requireAdmin, requireSuperAdmin } from '../middleware/permissions';
import { prisma } from '../app';

const router = express.Router();

// ============================================
// USER ROLE ENDPOINT (Current User)
// ============================================

// GET /users/me/role - Get current user's role and permissions
router.get('/users/me/role', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not authenticated' }
      });
    }

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

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // เตรียมข้อมูล role และ permissions
    let roleData = null;
    if (user.staffProfile && user.staffProfile.role) {
      roleData = {
        role: {
          id: user.staffProfile.role.id,
          name: user.staffProfile.role.name,
          description: user.staffProfile.role.description
        },
        permissions: user.staffProfile.role.permissions.map(perm => ({
          resourceName: perm.resourceName,
          canRead: perm.canRead,
          canWrite: perm.canWrite,
          canCreate: perm.canCreate,
          canDelete: perm.canDelete
        }))
      };
    }

    res.json({
      success: true,
      data: roleData
    });
  } catch (error) {
    console.error('Get user role error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user role' }
    });
  }
});

// ============================================
// ROLES ENDPOINTS
// ============================================

// GET /roles - Get all roles
router.get('/roles', sessionAuth, requirePermission('roles', 'read'), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: {
            staffs: true,
            permissions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get roles' }
    });
  }
});

// POST /roles - Create new role
router.post('/roles', sessionAuth, requirePermission('roles', 'create'), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role name is required' }
      });
    }

    // ตรวจสอบว่า role name ซ้ำหรือไม่
    const existingRole = await prisma.role.findFirst({
      where: { name }
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role name already exists' }
      });
    }

    // สร้าง role ใหม่
    const newRole = await prisma.role.create({
      data: {
        name,
        description: description || null
      },
      include: {
        permissions: true
      }
    });

    // สร้าง permissions แยกต่างหาก
    if (permissions && permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((perm: any) => ({
          roleId: newRole.id,
          resourceName: perm.resourceName,
          canRead: perm.canRead || false,
          canWrite: perm.canWrite || false,
          canCreate: perm.canCreate || false,
          canDelete: perm.canDelete || false
        }))
      });
    }

    // ดึงข้อมูล role พร้อม permissions ที่สร้างแล้ว
    const roleWithPermissions = await prisma.role.findUnique({
      where: { id: newRole.id },
      include: {
        permissions: true
      }
    });

    res.status(201).json({
      success: true,
      data: roleWithPermissions,
      message: 'Role created successfully'
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create role' }
    });
  }
});

// PUT /roles/:id - Update role
router.put('/roles/:id', sessionAuth, requirePermission('roles', 'write'), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    const { name, description } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role name is required' }
      });
    }

    // ตรวจสอบว่า role อยู่หรือไม่
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // ตรวจสอบว่า role name ซ้ำหรือไม่ (ยกเว้น role ปัจจุบัน)
    const duplicateRole = await prisma.role.findFirst({
      where: { 
        name,
        id: { not: roleId }
      }
    });

    if (duplicateRole) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role name already exists' }
      });
    }

    // อัพเดท role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        description: description || null
      },
      include: {
        permissions: true
      }
    });

    res.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update role' }
    });
  }
});

// DELETE /roles/:id - Delete role
router.delete('/roles/:id', sessionAuth, requirePermission('roles', 'delete'), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const roleId = req.params.id;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    // ตรวจสอบว่า role อยู่หรือไม่
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            staffs: true
          }
        }
      }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // ป้องกันการลบ role ที่มี staff ใช้งานอยู่
    if (existingRole._count.staffs > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete role that has assigned staff members' }
      });
    }

    // ลบ role (permissions จะถูกลบแบบ cascade)
    await prisma.role.delete({
      where: { id: roleId }
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete role' }
    });
  }
});

// PUT /roles/:id/permissions - Update role permissions
router.put('/roles/:id/permissions', sessionAuth, requirePermission('roles', 'write'), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    const { permissions } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Permissions array is required' }
      });
    }

    // ตรวจสอบว่า role อยู่หรือไม่
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // ลบ permissions เดิมทั้งหมดและสร้างใหม่
    await prisma.rolePermission.deleteMany({
      where: { roleId }
    });

    // สร้าง permissions ใหม่
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((perm: any) => ({
          roleId,
          resourceName: perm.resourceName,
          canRead: perm.canRead || false,
          canWrite: perm.canWrite || false,
          canCreate: perm.canCreate || false,
          canDelete: perm.canDelete || false
        }))
      });
    }

    // ดึงข้อมูล role ที่อัพเดทแล้ว
    const updatedRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true
      }
    });

    res.json({
      success: true,
      data: updatedRole,
      message: 'Role permissions updated successfully'
    });
  } catch (error) {
    console.error('Update role permissions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update role permissions' }
    });
  }
});

// ============================================
// ROLE PERMISSIONS ENDPOINTS
// ============================================

// GET /role-permissions - Get all role permissions
router.get('/role-permissions', sessionAuth, requirePermission('roles', 'read'), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const permissions = await prisma.rolePermission.findMany({
      include: {
        role: true
      },
      orderBy: [
        { resourceName: 'asc' },
        { role: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get role permissions' }
    });
  }
});

// GET /roles/:id/permissions - Get specific role permissions
router.get('/roles/:id/permissions', sessionAuth, requirePermission('roles', 'read'), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const roleId = req.params.id;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true
      }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Format permissions for frontend
    const formattedPermissions: any = {};
    role.permissions.forEach(perm => {
      formattedPermissions[perm.resourceName] = {
        canRead: perm.canRead,
        canWrite: perm.canWrite,
        canCreate: perm.canCreate,
        canDelete: perm.canDelete
      };
    });

    res.json({
      success: true,
      data: { 
        role: {
          id: role.id,
          name: role.name,
          description: role.description
        },
        permissions: formattedPermissions
      },
      message: 'Role permissions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch role permissions' }
    });
  }
});

export default router;
