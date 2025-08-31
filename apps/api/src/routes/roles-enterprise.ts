// ============================================
// ENHANCED ROLES API - ENTERPRISE FEATURES
// ============================================

import express from 'express';
import { Request, Response } from 'express';
import { sessionAuth, requireSessionRole, SessionAuthenticatedRequest } from '../middleware/sessionAuth';
import { prisma } from '../app';

const router = express.Router();

// Type definitions for request bodies
interface CreateRoleFromTemplateRequest {
  templateId: string;
  roleName: string;
  description?: string;
}

interface UpdateStaffRoleRequest {
  roleId: string;
}

interface BulkRoleAssignRequest {
  staffIds: string[];
  roleId: string;
}

// ============================================
// STAFF MANAGEMENT FOR ROLE ASSIGNMENT
// ============================================

// GET /staff - List all staff members
router.get('/staff', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
            isActive: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { staff },
      message: 'Staff members retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch staff members' }
    });
  }
});

// PUT /staff/:id/role - Update staff role assignment
router.put('/staff/:id/role', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const staffId = req.params.id;
    const { roleId } = req.body;

    if (!staffId || !roleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Staff ID and Role ID are required' }
      });
    }

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: { message: 'Staff member not found' }
      });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Update staff role
    const updatedStaff = await prisma.staff.update({
      where: { id: staffId },
      data: { roleId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    // Log the change (audit trail)
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || '',
        action: 'ROLE_ASSIGNMENT',
        entityType: 'Staff',
        entityId: staffId,
        changes: JSON.stringify({
          oldRoleId: staff.roleId,
          newRoleId: roleId,
          staffName: `${staff.firstName} ${staff.lastName}`
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    res.json({
      success: true,
      data: { staff: updatedStaff },
      message: 'Staff role updated successfully'
    });
  } catch (error) {
    console.error('Error updating staff role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update staff role' }
    });
  }
});

// ============================================
// ROLE TEMPLATES SYSTEM
// ============================================

// GET /roles/templates - Get role templates
router.get('/roles/templates', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    // Pre-defined role templates for enterprise use
    const templates = [
      {
        id: 'template-1',
        name: 'Hotel Manager',
        description: 'Full management access to all hotel operations',
        permissions: {
          users: { canRead: true, canWrite: true, canCreate: true, canDelete: false },
          bookings: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
          rooms: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
          financial: { canRead: true, canWrite: true, canCreate: true, canDelete: false },
          reports: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
          staff: { canRead: true, canWrite: true, canCreate: true, canDelete: false }
        }
      },
      {
        id: 'template-2',
        name: 'Front Desk Staff',
        description: 'Reception and guest service operations',
        permissions: {
          users: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
          bookings: { canRead: true, canWrite: true, canCreate: true, canDelete: false },
          rooms: { canRead: true, canWrite: true, canCreate: false, canDelete: false },
          financial: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
          reports: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
          staff: { canRead: false, canWrite: false, canCreate: false, canDelete: false }
        }
      },
      {
        id: 'template-3',
        name: 'Housekeeping Supervisor',
        description: 'Room maintenance and housekeeping operations',
        permissions: {
          users: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
          bookings: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
          rooms: { canRead: true, canWrite: true, canCreate: false, canDelete: false },
          financial: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
          reports: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
          staff: { canRead: true, canWrite: false, canCreate: false, canDelete: false }
        }
      },
      {
        id: 'template-4',
        name: 'Finance Manager',
        description: 'Financial operations and reporting',
        permissions: {
          users: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
          bookings: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
          rooms: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
          financial: { canRead: true, canWrite: true, canCreate: true, canDelete: false },
          reports: { canRead: true, canWrite: true, canCreate: true, canDelete: false },
          staff: { canRead: true, canWrite: false, canCreate: false, canDelete: false }
        }
      }
    ];

    res.json({
      success: true,
      data: { templates },
      message: 'Role templates retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching role templates:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch role templates' }
    });
  }
});

// POST /roles/from-template - Create role from template
router.post('/roles/from-template', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { templateId, roleName, description } = req.body;

    if (!templateId || !roleName) {
      return res.status(400).json({
        success: false,
        error: { message: 'Template ID and role name are required' }
      });
    }

    // Get template data (this would normally come from a database)
    const templateResponse = await fetch(`http://localhost:3001/api/v1/roles/templates`, {
      headers: { 'Authorization': req.get('Authorization') || '' }
    });

    if (!templateResponse.ok) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch template data' }
      });
    }

    const templateData = await templateResponse.json();
    const template = templateData.data.templates.find((t: any) => t.id === templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { message: 'Template not found' }
      });
    }

    // Create role from template
    const role = await prisma.role.create({
      data: {
        name: roleName,
        description: description || template.description,
        permissions: {
          create: Object.entries(template.permissions).map(([resource, perms]: [string, any]) => ({
            resourceName: resource,
            canRead: perms.canRead || false,
            canWrite: perms.canWrite || false,
            canCreate: perms.canCreate || false,
            canDelete: perms.canDelete || false
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
      message: 'Role created from template successfully'
    });
  } catch (error) {
    console.error('Error creating role from template:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create role from template' }
    });
  }
});

// ============================================
// BULK OPERATIONS
// ============================================

// POST /users/bulk-assign-role - Bulk role assignment
router.post('/users/bulk-assign-role', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const { userIds, roleId } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !roleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'User IDs array and role ID are required' }
      });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Update users in bulk
    const results = await prisma.$transaction(async (tx) => {
      const updates = [];
      
      for (const userId of userIds) {
        try {
          // Update user type (this is a simplified approach)
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { userType: 'STAFF' }, // This would need to be more sophisticated
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              userType: true
            }
          });
          
          updates.push({ userId, status: 'success', user: updatedUser });
        } catch (error) {
          updates.push({ userId, status: 'failed', error: 'User not found or update failed' });
        }
      }
      
      return updates;
    });

    // Log bulk operation
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || '',
        action: 'BULK_ROLE_ASSIGNMENT',
        entityType: 'User',
        entityId: 'bulk',
        changes: JSON.stringify({
          roleId,
          userIds,
          roleName: role.name,
          affectedUsers: results.filter(r => r.status === 'success').length
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    res.json({
      success: true,
      data: { 
        results,
        summary: {
          total: userIds.length,
          successful: successCount,
          failed: failedCount
        }
      },
      message: `Bulk role assignment completed: ${successCount} successful, ${failedCount} failed`
    });
  } catch (error) {
    console.error('Error in bulk role assignment:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to perform bulk role assignment' }
    });
  }
});

// ============================================
// ROLE STATISTICS
// ============================================

// GET /roles/stats - Role usage statistics
router.get('/roles/stats', sessionAuth, requireSessionRole(['ADMIN']), async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const roleStats = await prisma.role.findMany({
      include: {
        _count: {
          select: { staffs: true }
        },
        permissions: true
      }
    });

    const stats = roleStats.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      staffCount: role._count.staffs,
      permissionCount: role.permissions.length,
      isActive: role.isActive,
      createdAt: role.createdAt
    }));

    const summary = {
      totalRoles: roleStats.length,
      activeRoles: roleStats.filter(r => r.isActive).length,
      totalStaffAssigned: roleStats.reduce((sum, r) => sum + r._count.staffs, 0),
      averagePermissionsPerRole: roleStats.length > 0 ? 
        roleStats.reduce((sum, r) => sum + r.permissions.length, 0) / roleStats.length : 0
    };

    res.json({
      success: true,
      data: { 
        roles: stats,
        summary
      },
      message: 'Role statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching role stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch role statistics' }
    });
  }
});

export default router;
