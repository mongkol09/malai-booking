// ============================================
// SIMPLE ENTERPRISE ROLE MANAGEMENT
// Frontend-Compatible API
// ============================================

import express from 'express';
import { Request, Response } from 'express';
import { sessionAuth, requireSessionRole, SessionAuthenticatedRequest } from '../middleware/sessionAuth';
import { prisma } from '../app';

const router = express.Router();

// ============================================
// PERMISSION MODULES BASED ON FRONTEND
// ============================================

const FRONTEND_MODULES = {
  'duty_changes': {
    name: 'Duty Changes',
    permissions: ['shift_management', 'shift_list', 'roster_assign', 'roster_list', 'attendance_dashboard']
  },
  'house_keeping': {
    name: 'House Keeping', 
    permissions: ['house_keeping', 'room_cleaning', 'assign_room_cleaning', 'laundry_product_list', 'payment']
  },
  'restaurant': {
    name: 'Restaurant',
    permissions: ['restaurant', 'pos_invoice', 'order_list', 'cancel_order', 'manage_category', 'add_category', 'category_list']
  },
  'payment_setting': {
    name: 'Payment Setting',
    permissions: ['payment_setting', 'payment_method_list', 'add_payment_method', 'payment_setup']
  },
  'bookings': {
    name: 'Bookings',
    permissions: ['view_bookings', 'create_bookings', 'edit_bookings', 'cancel_bookings', 'check_in', 'check_out']
  },
  'rooms': {
    name: 'Rooms',
    permissions: ['view_rooms', 'create_rooms', 'edit_rooms', 'room_status', 'room_maintenance']
  },
  'users': {
    name: 'Users',
    permissions: ['view_users', 'create_users', 'edit_users', 'deactivate_users', 'reset_passwords']
  }
};

// ============================================
// GET PERMISSION MODULES (FOR FRONTEND UI)
// ============================================

router.get('/modules', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: { modules: FRONTEND_MODULES },
      message: 'Permission modules retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch modules' }
    });
  }
});

// ============================================
// GET ALL ROLES WITH FRONTEND FORMAT
// ============================================

router.get('/', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { staffs: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to Frontend format
    const frontendRoles = roles.map(role => {
      const permissionMap: any = {};
      
      // Initialize all modules
      Object.keys(FRONTEND_MODULES).forEach(moduleKey => {
        permissionMap[moduleKey] = {};
        FRONTEND_MODULES[moduleKey as keyof typeof FRONTEND_MODULES].permissions.forEach(permKey => {
          permissionMap[moduleKey][permKey] = {
            canRead: false, canWrite: false, canCreate: false, canDelete: false
          };
        });
      });

    // Apply existing permissions
    role.permissions.forEach(perm => {
      const parts = perm.resourceName.split('.');
      if (parts.length === 2) {
        const [moduleKey, permKey] = parts;
        if (moduleKey && permKey && permissionMap[moduleKey] && permissionMap[moduleKey][permKey]) {
          permissionMap[moduleKey][permKey] = {
            canRead: perm.canRead,
            canWrite: perm.canWrite,
            canCreate: perm.canCreate,
            canDelete: perm.canDelete
          };
        }
      }
    });      return {
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        createdAt: role.createdAt,
        staffCount: role._count.staffs,
        permissions: permissionMap
      };
    });

    res.json({
      success: true,
      data: { roles: frontendRoles },
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
// CREATE ROLE WITH FRONTEND PERMISSIONS
// ============================================

router.post('/', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role name is required' }
      });
    }

    // Check if role exists
    const existingRole = await prisma.role.findFirst({ where: { name } });
    if (existingRole) {
      return res.status(409).json({
        success: false,
        error: { message: 'Role with this name already exists' }
      });
    }

    // Transform Frontend permissions to DB format
    const dbPermissions: any[] = [];
    if (permissions) {
      Object.keys(permissions).forEach(moduleKey => {
        const modulePerms = permissions[moduleKey];
        Object.keys(modulePerms).forEach(permKey => {
          const perm = modulePerms[permKey];
          if (perm.canRead || perm.canWrite || perm.canCreate || perm.canDelete) {
            dbPermissions.push({
              resourceName: `${moduleKey}.${permKey}`,
              canRead: Boolean(perm.canRead),
              canWrite: Boolean(perm.canWrite),
              canCreate: Boolean(perm.canCreate),
              canDelete: Boolean(perm.canDelete)
            });
          }
        });
      });
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description: description || null,
        permissions: { create: dbPermissions }
      },
      include: {
        permissions: true,
        _count: { select: { staffs: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: { role },
      message: 'Role created successfully'
    });
    return;
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create role' }
    });
    return;
  }
});

// ============================================
// GET ROLE BY ID (FOR EDITING)
// ============================================

router.get('/:id', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    const role = await prisma.role.findUnique({
      where: { id: id },
      include: {
        permissions: true,
        staffs: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true, userType: true }
            }
          }
        },
        _count: { select: { staffs: true } }
      }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Transform to Frontend format
    const permissionMap: any = {};
    Object.keys(FRONTEND_MODULES).forEach(moduleKey => {
      permissionMap[moduleKey] = {};
      FRONTEND_MODULES[moduleKey as keyof typeof FRONTEND_MODULES].permissions.forEach(permKey => {
        permissionMap[moduleKey][permKey] = {
          canRead: false, canWrite: false, canCreate: false, canDelete: false
        };
      });
    });

    role.permissions.forEach(perm => {
      const parts = perm.resourceName.split('.');
      if (parts.length === 2) {
        const [moduleKey, permKey] = parts;
        if (moduleKey && permKey && permissionMap[moduleKey] && permissionMap[moduleKey][permKey]) {
          permissionMap[moduleKey][permKey] = {
            canRead: perm.canRead,
            canWrite: perm.canWrite,
            canCreate: perm.canCreate,
            canDelete: perm.canDelete
          };
        }
      }
    });

    const frontendRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      createdAt: role.createdAt,
      staffCount: role._count.staffs,
      assignedStaff: role.staffs,
      permissions: permissionMap
    };

    res.json({
      success: true,
      data: { role: frontendRole },
      message: 'Role retrieved successfully'
    });
    return;
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch role' }
    });
    return;
  }
});

// ============================================
// UPDATE ROLE
// ============================================

router.put('/:id', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { name, description, permissions } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    const existingRole = await prisma.role.findUnique({ where: { id: id } });
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Transform Frontend permissions
    const dbPermissions: any[] = [];
    if (permissions) {
      Object.keys(permissions).forEach(moduleKey => {
        const modulePerms = permissions[moduleKey];
        Object.keys(modulePerms).forEach(permKey => {
          const perm = modulePerms[permKey];
          if (perm.canRead || perm.canWrite || perm.canCreate || perm.canDelete) {
            dbPermissions.push({
              resourceName: `${moduleKey}.${permKey}`,
              canRead: Boolean(perm.canRead),
              canWrite: Boolean(perm.canWrite),
              canCreate: Boolean(perm.canCreate),
              canDelete: Boolean(perm.canDelete)
            });
          }
        });
      });
    }

    // Update role
    const role = await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      return await tx.role.update({
        where: { id: id },
        data: {
          name: name || existingRole.name,
          description: description !== undefined ? description : existingRole.description,
          permissions: { create: dbPermissions }
        },
        include: { permissions: true, _count: { select: { staffs: true } } }
      });
    });

    res.json({
      success: true,
      data: { role },
      message: 'Role updated successfully'
    });
    return;
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update role' }
    });
    return;
  }
});

// ============================================
// DELETE ROLE
// ============================================

router.delete('/:id', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    const role = await prisma.role.findUnique({
      where: { id: id },
      include: { _count: { select: { staffs: true } } }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    if (role._count.staffs > 0) {
      return res.status(400).json({
        success: false,
        error: { 
          message: `Cannot delete role. It is assigned to ${role._count.staffs} staff member(s)`,
          code: 'ROLE_IN_USE',
          staffCount: role._count.staffs
        }
      });
    }

    await prisma.role.delete({ where: { id: id } });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
    return;
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete role' }
    });
    return;
  }
});

// ============================================
// GET USERS FOR ROLE ASSIGNMENT
// ============================================

router.get('/users/available', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        staffProfile: {
          select: {
            id: true,
            employeeId: true,
            position: true,
            role: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    const availableUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      userType: user.userType,
      currentRole: user.staffProfile?.role || null,
      employeeId: user.staffProfile?.employeeId || null,
      position: user.staffProfile?.position || null
    }));

    res.json({
      success: true,
      data: { users: availableUsers },
      message: 'Available users retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch available users' }
    });
  }
});

// ============================================
// ASSIGN ROLE TO USERS
// ============================================

router.post('/assign', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { roleId, userIds } = req.body;

    if (!roleId || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID and user IDs array are required' }
      });
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    const assignments = [];
    
    for (const userId of userIds) {
      try {
        let staffRecord = await prisma.staff.findFirst({ where: { userId: userId } });

        if (staffRecord) {
          const updated = await prisma.staff.update({
            where: { id: staffRecord.id },
            data: { roleId: roleId },
            include: {
              user: { select: { id: true, email: true, firstName: true, lastName: true, userType: true } },
              role: true
            }
          });
          assignments.push(updated);
        } else {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            const newStaff = await prisma.staff.create({
              data: {
                userId: userId,
                employeeId: `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                roleId: roleId,
                hireDate: new Date(),
                status: 'Active' as any
              },
              include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, userType: true } },
                role: true
              }
            });
            assignments.push(newStaff);
          }
        }
      } catch (error) {
        console.error(`Error assigning role to user ${userId}:`, error);
      }
    }

    res.json({
      success: true,
      data: { 
        assignments,
        assignedCount: assignments.length,
        roleName: role.name
      },
      message: `Role assigned to ${assignments.length} user(s) successfully`
    });
    return;
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to assign role' }
    });
    return;
  }
});

export default router;
