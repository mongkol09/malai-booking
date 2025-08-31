// ============================================
// SIMPLE ROLES & PERMISSIONS ROUTES
// ============================================

import express from 'express';
import { Request, Response } from 'express';
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
        permissions: true
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
        permissions: true
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
    const { name, description } = req.body;

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

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description: description || null
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
    const id = req.params.id;
    const { name, description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: id }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Update role
    const role = await prisma.role.update({
      where: { id: id },
      data: {
        name: name || existingRole.name,
        description: description !== undefined ? description : existingRole.description
      },
      include: {
        permissions: true
      }
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
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role ID is required' }
      });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: id }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    // Delete role (permissions will be deleted automatically due to cascade)
    await prisma.role.delete({
      where: { id: id }
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
// GET PERMISSIONS FOR CURRENT USER
// ============================================

router.get('/permissions/me', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not authenticated' }
      });
    }

    // Basic permissions based on userType
    let permissions: any = {};

    if (user.userType === 'ADMIN') {
      permissions = {
        users: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        bookings: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        rooms: { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        roles: { canRead: true, canWrite: true, canCreate: true, canDelete: true }
      };
    } else if (user.userType === 'STAFF') {
      permissions = {
        users: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        bookings: { canRead: true, canWrite: true, canCreate: true, canDelete: false },
        rooms: { canRead: true, canWrite: true, canCreate: false, canDelete: false },
        roles: { canRead: false, canWrite: false, canCreate: false, canDelete: false }
      };
    } else {
      permissions = {
        users: { canRead: false, canWrite: false, canCreate: false, canDelete: false },
        bookings: { canRead: true, canWrite: false, canCreate: true, canDelete: false },
        rooms: { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        roles: { canRead: false, canWrite: false, canCreate: false, canDelete: false }
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
