// ============================================
// USER ROUTES WITH SESSION AUTH & PERMISSIONS
// ============================================

import express from 'express';
import { sessionAuth, requireSessionRole, SessionAuthenticatedRequest } from '../middleware/sessionAuth';
import { requirePermission, requireAdmin, requireSuperAdmin } from '../middleware/permissions';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  getUserStats,
  promoteToDevBootstrap
} from '../controllers/userController';

const router = express.Router();

// ============================================
// CURRENT USER ROUTES (Authenticated users)
// ============================================

// Get current user profile
router.get('/me', sessionAuth, getCurrentUser);

// Update current user profile  
router.put('/me', sessionAuth, updateCurrentUser);

// Change password (สำหรับ users ที่รู้รหัสผ่านเดิม)
router.put('/me/password', sessionAuth, changePassword);

// ============================================
// USER MANAGEMENT ROUTES (Permission-based)
// ============================================

// Get all users with filtering/pagination
router.get('/', sessionAuth, requirePermission('users', 'read'), getAllUsers);

// Get user statistics
router.get('/stats', sessionAuth, requirePermission('users', 'read'), getUserStats);

// Get specific user by ID
router.get('/:id', sessionAuth, requirePermission('users', 'read'), getUserById);

// Create new user
router.post('/', sessionAuth, requirePermission('users', 'create'), createUser);

// Update user
router.put('/:id', sessionAuth, requirePermission('users', 'write'), updateUser);

// Update user status (activate/deactivate)
router.patch('/:id/status', sessionAuth, requirePermission('users', 'write'), updateUserStatus);

// Reset user password (สำหรับ admin reset โดยไม่ต้องรู้รหัสเดิม)
router.post('/:id/reset-password', sessionAuth, requirePermission('users', 'write'), resetUserPassword);

// Delete user
router.delete('/:id', sessionAuth, requirePermission('users', 'delete'), deleteUser);

// ============================================
// BOOTSTRAP ROUTES (Super Admin Only)
// ============================================

// Bootstrap promote user to DEV role (Special endpoint)
router.post('/:id/promote-to-dev', sessionAuth, requireSuperAdmin, promoteToDevBootstrap);

export default router;
