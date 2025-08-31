// 🔐 ADMIN PASSWORD RESET ENDPOINTS
import express from 'express';
import { requireRole, validateApiKey } from '../middleware/validateApiKey';
import { ADMIN_ROLES } from '../constants/roles';
import { PasswordResetService } from '../services/passwordResetService';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../app';

const router = express.Router();
const resetService = new PasswordResetService();

// ============================================
// ADMIN PASSWORD MANAGEMENT ENDPOINTS
// ============================================

/**
 * @route   POST /api/v1/admin/reset-user-password/:id
 * @desc    Admin reset user password (generates temp password)
 * @access  Admin only
 */
router.post('/reset-user-password/:id', 
  validateApiKey, 
  requireRole(ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    const { id: targetUserId } = req.params;
    const adminUserId = (req as any).user?.id;

    if (!targetUserId) {
      throw new AppError('User ID is required', 400);
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true
      }
    });

    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    console.log(`🔐 Admin ${adminUserId} resetting password for user ${targetUser.email}`);

    // Use the password reset service
    const result = await resetService.adminResetUserPassword(targetUserId, adminUserId);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: 'User password reset successfully',
      data: {
        user: {
          id: targetUser.id,
          email: targetUser.email,
          name: `${targetUser.firstName} ${targetUser.lastName}`
        },
        tempPassword: result.data?.tempPassword,
        resetAt: result.data?.resetAt
      }
    });
  })
);

/**
 * @route   POST /api/v1/admin/send-reset-link
 * @desc    Admin send password reset link to user
 * @access  Admin only
 */
router.post('/send-reset-link',
  validateApiKey,
  requireRole(ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const result = await resetService.requestPasswordReset(email);

    res.json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  })
);

/**
 * @route   GET /api/v1/admin/reset-tokens
 * @desc    Get all active password reset tokens (Admin only)
 * @access  Admin only
 */
router.get('/reset-tokens',
  validateApiKey,
  requireRole(ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        expiresAt: { gte: new Date() },
        usedAt: null
      },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'Active reset tokens retrieved',
      data: {
        tokens: tokens.map(token => ({
          id: token.id,
          token: token.token.substring(0, 10) + '...', // Mask token for security
          user: token.user,
          createdAt: token.createdAt,
          expiresAt: token.expiresAt
        })),
        total: tokens.length
      }
    });
  })
);

/**
 * @route   DELETE /api/v1/admin/reset-tokens/:id
 * @desc    Revoke/delete a password reset token
 * @access  Admin only
 */
router.delete('/reset-tokens/:id',
  validateApiKey,
  requireRole(ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const token = await prisma.passwordResetToken.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    if (!token) {
      throw new AppError('Reset token not found', 404);
    }

    await prisma.passwordResetToken.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Reset token revoked successfully',
      data: {
        tokenId: id,
        userEmail: token.user.email
      }
    });
  })
);

/**
 * @route   POST /api/v1/admin/cleanup-expired-tokens
 * @desc    Cleanup expired password reset tokens
 * @access  Admin only
 */
router.post('/cleanup-expired-tokens',
  validateApiKey,
  requireRole(ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    const cleanupCount = await resetService.cleanupExpiredTokens();

    res.json({
      success: true,
      message: 'Expired tokens cleaned up successfully',
      data: {
        deletedCount: cleanupCount
      }
    });
  })
);

export default router;
