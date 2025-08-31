import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyAdminToken, requireAdminRole } from '../middleware/adminAuth';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for admin operations
const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 admin requests per window
  message: { success: false, message: 'Too many admin requests, please try again later.' }
});

/**
 * Get all users with their PIN status
 * GET /api/v1/admin/users-pin-status
 */
router.get('/users-pin-status', adminRateLimit, verifyAdminToken, requireAdminRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isActive: true,
        userPin: {
          select: {
            isActive: true,
            failedAttempts: true,
            lockedUntil: true,
            lastUsedAt: true,
            lastFailedAt: true,
            expiresAt: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    const usersWithPinStatus = users.map(user => ({
      ...user,
      pinStatus: user.userPin ? {
        ...user.userPin,
        isExpired: user.userPin.expiresAt ? user.userPin.expiresAt < new Date() : false
      } : null
    }));

    res.json({
      success: true,
      data: usersWithPinStatus,
      total: users.length
    });

  } catch (error) {
    console.error('Error fetching users PIN status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Reset user PIN (forces them to set new PIN on next login)
 * POST /api/v1/admin/users/:userId/pin/reset
 */
router.post('/users/:userId/pin/reset', adminRateLimit, verifyAdminToken, requireAdminRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = (req as any).user.userId;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPin: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete existing PIN if any
    if (user.userPin) {
      await prisma.userPin.delete({
        where: { userId: userId }
      });
    }

    // Set user to require PIN setup
    await prisma.user.update({
      where: { id: userId },
      data: { requiresPinSetup: true }
    });

    // Log admin action
    await logAdminActivity(adminUserId, 'PIN_RESET', {
      targetUserId: userId,
      targetUserEmail: user.email,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: `PIN reset for user ${user.email}. They will be required to set a new PIN on next login.`,
      data: {
        userId: userId,
        resetAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('PIN reset error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Disable user PIN
 * POST /api/v1/admin/users/:userId/pin/disable
 */
router.post('/users/:userId/pin/disable', adminRateLimit, verifyAdminToken, requireAdminRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPin: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.userPin) {
      return res.status(400).json({ success: false, message: 'User does not have a PIN' });
    }

    // Disable PIN
    await prisma.userPin.update({
      where: { userId: userId },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Log admin action
    await logAdminActivity(adminUserId, 'PIN_DISABLED', {
      targetUserId: userId,
      targetUserEmail: user.email,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: `PIN disabled for user ${user.email}`,
      data: {
        userId: userId,
        disabledAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('PIN disable error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Enable user PIN
 * POST /api/v1/admin/users/:userId/pin/enable
 */
router.post('/users/:userId/pin/enable', adminRateLimit, verifyAdminToken, requireAdminRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPin: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.userPin) {
      return res.status(400).json({ success: false, message: 'User does not have a PIN to enable' });
    }

    // Enable PIN and clear lockout
    await prisma.userPin.update({
      where: { userId: userId },
      data: { 
        isActive: true,
        lockedUntil: null,
        failedAttempts: 0,
        updatedAt: new Date()
      }
    });

    // Log admin action
    await logAdminActivity(adminUserId, 'PIN_ENABLED', {
      targetUserId: userId,
      targetUserEmail: user.email,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: `PIN enabled for user ${user.email}`,
      data: {
        userId: userId,
        enabledAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('PIN enable error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Get user's PIN activity logs
 * GET /api/v1/admin/users/:userId/pin/activity-logs
 */
router.get('/users/:userId/pin/activity-logs', adminRateLimit, verifyAdminToken, requireAdminRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await prisma.activityLog.findMany({
      where: {
        userId: userId,
        activityType: {
          in: [
            'PIN_SETUP',
            'PIN_VERIFICATION_SUCCESS',
            'PIN_VERIFICATION_FAILED',
            'PIN_LOCKOUT',
            'PIN_CHANGED'
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        limit,
        offset,
        total: logs.length
      }
    });

  } catch (error) {
    console.error('Error fetching PIN activity logs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Generate PIN security report (PDF)
 * GET /api/v1/admin/pin-security-report
 */
router.get('/pin-security-report', adminRateLimit, verifyAdminToken, requireAdminRole(['ADMIN']), async (req, res) => {
  try {
    const adminUserId = (req as any).user.userId;

    // Fetch statistics
    const stats = await getPinStatistics();
    
    // Return JSON report instead of PDF for now
    res.json({
      success: true,
      data: {
        reportDate: new Date().toISOString(),
        statistics: stats,
        message: 'PIN Security Report generated successfully'
      }
    });

    // Log admin action
    await logAdminActivity(adminUserId, 'PIN_REPORT_GENERATED', {
      reportDate: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

  } catch (error) {
    console.error('Error generating PIN security report:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Get PIN system statistics
 */
async function getPinStatistics() {
  const [
    totalUsers,
    usersWithPin,
    activePins,
    expiredPins,
    lockedPins,
    recentActivity
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { userPin: { isNot: null } } }),
    prisma.userPin.count({ where: { isActive: true } }),
    prisma.userPin.count({ 
      where: { 
        expiresAt: { lt: new Date() },
        isActive: true 
      } 
    }),
    prisma.userPin.count({ 
      where: { 
        lockedUntil: { gt: new Date() },
        isActive: true 
      } 
    }),
    prisma.activityLog.count({
      where: {
        activityType: { startsWith: 'PIN_' },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })
  ]);

  return {
    totalUsers,
    usersWithPin,
    activePins,
    expiredPins,
    lockedPins,
    recentActivity,
    pinAdoptionRate: totalUsers > 0 ? (usersWithPin / totalUsers * 100).toFixed(1) : 0
  };
}



/**
 * Log admin activity
 */
async function logAdminActivity(adminUserId: string, activityType: string, data: any) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        activityType: `ADMIN_${activityType}`,
        data: JSON.stringify(data),
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Admin activity logging error:', error);
  }
}

export default router;
