// ============================================
// ROLES & PERMISSIONS ROUTES
// ============================================

import express from 'express';
import { Request, Response } from 'express';
import { requireRole } from '../middleware/validateApiKey';
import { sessionAuth, requireSessionRole, SessionAuthenticatedRequest } from '../middleware/sessionAuth';
import { prisma } from '../app';

const router = express.Router();

// ============================================
// GET ALL ROLES
// ============================================

router.get('/', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { staffs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { roles },
      message: 'Roles retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch roles' }
    });
  }
});

// ============================================
// GET ROLE BY ID
// ============================================

router.get('/:id', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        staffs: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                userType: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    res.json({
      success: true,
      data: { role },
      message: 'Role retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch role' }
    });
  }
});

// ============================================
// CREATE NEW ROLE
// ============================================

router.post('/', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { name, description, permissions = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role name is required' }
      });
    }

    // Check if role already exists
    const existingRole = await prisma.role.findFirst({
      where: { name }
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        error: { message: 'Role with this name already exists' }
      });
    }

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions.map((perm: any) => ({
            resourceName: perm.resourceName,
            canRead: perm.canRead || false,
            canWrite: perm.canWrite || false,
            canCreate: perm.canCreate || false,
            canDelete: perm.canDelete || false
          }))
        }
      },
      include: {
        permissions: true
      }
    });

    res.status(201).json({
      success: true,
      data: { role },
      message: 'Role created successfully'
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create role' }
    });
  }
});

// ============================================
// UPDATE ROLE
// ============================================

router.put('/:id', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, permissions = [] } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Update role and replace permissions
    const role = await prisma.$transaction(async (tx) => {
      // Delete existing permissions
      await tx.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Update role and create new permissions
      return await tx.role.update({
        where: { id },
        data: {
          name: name || existingRole.name,
          description: description !== undefined ? description : existingRole.description,
          permissions: {
            create: permissions.map((perm: any) => ({
              resourceName: perm.resourceName,
              canRead: perm.canRead || false,
              canWrite: perm.canWrite || false,
              canCreate: perm.canCreate || false,
              canDelete: perm.canDelete || false
            }))
          }
        },
        include: {
          permissions: true
        }
      });
    });

    res.json({
      success: true,
      data: { role },
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update role' }
    });
  }
});

// ============================================
// DELETE ROLE
// ============================================

router.delete('/:id', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { staffs: true }
        }
      }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Check if role is in use
    if (role._count.staffs > 0) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot delete role. It is assigned to ${role._count.staffs} staff member(s)` }
      });
    }

    // Delete role (permissions will be deleted automatically due to cascade)
    await prisma.role.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete role' }
    });
  }
});

// ============================================
// GET AVAILABLE RESOURCES (for permissions)
// ============================================

router.get('/resources/available', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    // Define available resources that can have permissions
    const resources = [
      'users',
      'bookings',
      'rooms',
      'pricing',
      'financial',
      'reports',
      'notifications',
      'settings',
      'analytics',
      'staff',
      'roles',
      'permissions'
    ];

    res.json({
      success: true,
      data: { resources },
      message: 'Available resources retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch resources' }
    });
  }
});

// ============================================
// GET PERMISSIONS FOR CURRENT USER
// ============================================

router.get('/permissions/me', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    // For now, return basic permissions based on userType
    // In the future, this could be expanded to check staff role permissions
    let permissions: any = {};

    if (user.userType === 'ADMIN') {
      permissions = {
        users: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        bookings: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        rooms: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        pricing: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        financial: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        reports: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        notifications: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        settings: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        analytics: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        staff: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        roles: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        permissions: { canRead: true, canWrite: true, canCreate: true, canDelete: true }
      };
    } else if (user.userType === 'STAFF') {
      permissions = {
        users: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        bookings: { canRead: true, canWrite: true, canCreate: true, canDelete: false },
        rooms: { canRead: true, canWrite: true, canCreate: false, canDelete: false },
        pricing: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        financial: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        reports: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        notifications: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        settings: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        analytics: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        staff: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        roles: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        permissions: { canRead: false, canWrite: false, canCreate: false, canDelete: false }
      };
    } else {
      permissions = {
        users: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        bookings: { canRead: true, canWrite: false, canCreate: true, canDelete: false },
        rooms: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        pricing: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        financial: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        reports: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        notifications: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        settings: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        analytics: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        staff: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        roles: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        permissions: { canRead: false, canWrite: false, canCreate: false, canDelete: false }
      };
    }

    res.json({
      success: true,
      data: { 
        permissions,
        userType: user.userType 
      },
      message: 'User permissions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user permissions' }
    });
  }
});

export default router;
