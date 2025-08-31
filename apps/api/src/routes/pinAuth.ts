import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for PIN operations
const pinRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: 'Too many PIN attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for PIN setup (more restrictive)
const pinSetupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 PIN setups per hour
  message: { success: false, message: 'Too many PIN setup attempts, please try again later.' },
});

/**
 * Setup PIN for new user
 * POST /api/v1/auth/setup-pin
 */
router.post('/setup-pin', pinSetupRateLimit, async (req, res) => {
  try {
    const { pin, userId } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    if (!pin || !userId) {
      return res.status(400).json({ success: false, message: 'PIN and user ID are required' });
    }

    // Validate PIN format
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 6 digits' });
    }

    // Validate PIN security rules
    if (isSequentialPin(pin)) {
      return res.status(400).json({ success: false, message: 'PIN cannot be sequential numbers' });
    }

    if (isRepeatingPin(pin)) {
      return res.status(400).json({ success: false, message: 'PIN cannot be all the same digit' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (decoded.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to set PIN for this user' });
    }

    // Check if user already has a PIN
    const existingPin = await prisma.userPin.findUnique({
      where: { userId }
    });

    if (existingPin) {
      return res.status(400).json({ success: false, message: 'User already has a PIN set' });
    }

    // Hash the PIN
    const saltRounds = 12;
    const hashedPin = await bcrypt.hash(pin, saltRounds);

    // Save PIN to database
    await prisma.userPin.create({
      data: {
        userId,
        pinHash: hashedPin,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
        failedAttempts: 0
      }
    });

    // Log the PIN setup
    await logActivity(userId, 'PIN_SETUP', {
      timestamp: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ 
      success: true, 
      message: 'PIN setup successful',
      data: {
        pinSetAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('PIN setup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Verify PIN for action authorization
 * POST /api/v1/auth/verify-pin
 */
router.post('/verify-pin', pinRateLimit, async (req, res) => {
  try {
    const { pin, action, bookingData } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    if (!pin) {
      return res.status(400).json({ success: false, message: 'PIN is required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const userId = decoded.userId;

    // Get user PIN record
    const userPin = await prisma.userPin.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!userPin) {
      return res.status(404).json({ success: false, message: 'No PIN found for user' });
    }

    if (!userPin.isActive) {
      return res.status(403).json({ success: false, message: 'PIN is disabled' });
    }

    // Check if PIN is expired
    if (userPin.expiresAt && userPin.expiresAt < new Date()) {
      return res.status(403).json({ success: false, message: 'PIN has expired, please set a new one' });
    }

    // Check if user is locked out
    if (userPin.lockedUntil && userPin.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((userPin.lockedUntil.getTime() - new Date().getTime()) / 1000);
      return res.status(423).json({ 
        success: false, 
        message: `Account is locked. Try again in ${Math.ceil(remainingTime / 60)} minutes`,
        lockoutRemaining: remainingTime
      });
    }

    // Verify PIN
    const isValidPin = await bcrypt.compare(pin, userPin.pinHash);

    if (!isValidPin) {
      // Increment failed attempts
      const newFailedAttempts = userPin.failedAttempts + 1;
      
      // Calculate progressive lockout
      let lockoutUntil = null;
      if (newFailedAttempts >= 3) {
        const lockoutMinutes = calculateLockoutTime(newFailedAttempts);
        lockoutUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      }

      await prisma.userPin.update({
        where: { userId },
        data: {
          failedAttempts: newFailedAttempts,
          lockedUntil: lockoutUntil,
          lastFailedAt: new Date()
        }
      });

      // Log failed attempt
      await logActivity(userId, 'PIN_VERIFICATION_FAILED', {
        action,
        attemptNumber: newFailedAttempts,
        lockoutMinutes: lockoutUntil ? calculateLockoutTime(newFailedAttempts) : 0,
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return res.status(401).json({ 
        success: false, 
        message: 'Invalid PIN',
        failedAttempts: newFailedAttempts,
        lockoutUntil: lockoutUntil?.toISOString()
      });
    }

    // PIN is valid - reset failed attempts
    await prisma.userPin.update({
      where: { userId },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastUsedAt: new Date()
      }
    });

    // Log successful verification
    await logActivity(userId, 'PIN_VERIFICATION_SUCCESS', {
      action,
      bookingId: bookingData?.id,
      timestamp: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ 
      success: true, 
      message: 'PIN verified successfully',
      data: {
        action,
        verifiedAt: new Date().toISOString(),
        user: {
          id: userPin.user.id,
          name: `${userPin.user.firstName} ${userPin.user.lastName}`,
          role: userPin.user.userType
        }
      }
    });

  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Check PIN status for current user
 * GET /api/v1/auth/pin-status
 */
router.get('/pin-status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const userId = decoded.userId;

    // Check if user exists and requires PIN setup
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPin: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const requiresSetup = !user.userPin || !user.userPin.isActive;
    const isExpired = user.userPin && user.userPin.expiresAt && user.userPin.expiresAt < new Date();

    res.json({
      success: true,
      data: {
        requiresSetup: requiresSetup || isExpired,
        hasPin: !!user.userPin,
        isActive: user.userPin?.isActive || false,
        isExpired: isExpired,
        expiresAt: user.userPin?.expiresAt?.toISOString(),
        lastUsedAt: user.userPin?.lastUsedAt?.toISOString()
      }
    });

  } catch (error) {
    console.error('PIN status check error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Change PIN
 * POST /api/v1/auth/change-pin
 */
router.post('/change-pin', pinRateLimit, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    if (!currentPin || !newPin) {
      return res.status(400).json({ success: false, message: 'Current PIN and new PIN are required' });
    }

    // Validate new PIN format
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ success: false, message: 'New PIN must be exactly 6 digits' });
    }

    if (isSequentialPin(newPin) || isRepeatingPin(newPin)) {
      return res.status(400).json({ success: false, message: 'New PIN does not meet security requirements' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const userId = decoded.userId;

    const userPin = await prisma.userPin.findUnique({
      where: { userId }
    });

    if (!userPin) {
      return res.status(404).json({ success: false, message: 'No PIN found for user' });
    }

    // Verify current PIN
    const isValidCurrentPin = await bcrypt.compare(currentPin, userPin.pinHash);
    if (!isValidCurrentPin) {
      return res.status(401).json({ success: false, message: 'Current PIN is incorrect' });
    }

    // Hash new PIN
    const saltRounds = 12;
    const hashedNewPin = await bcrypt.hash(newPin, saltRounds);

    // Update PIN
    await prisma.userPin.update({
      where: { userId },
      data: {
        pinHash: hashedNewPin,
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Reset expiry
        failedAttempts: 0,
        lockedUntil: null
      }
    });

    // Log PIN change
    await logActivity(userId, 'PIN_CHANGED', {
      timestamp: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ 
      success: true, 
      message: 'PIN changed successfully',
      data: {
        changedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('PIN change error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Utility functions
function isSequentialPin(pin: string): boolean {
  const ascending = pin === '123456' || pin === '234567' || pin === '345678' || pin === '456789';
  const descending = pin === '654321' || pin === '765432' || pin === '876543' || pin === '987654';
  return ascending || descending;
}

function isRepeatingPin(pin: string): boolean {
  return /^(.)\1{5}$/.test(pin);
}

function calculateLockoutTime(failedAttempts: number): number {
  // Progressive lockout: 1, 3, 5, 10, 15, 30, 60, 120, 480, 1440 minutes
  const lockoutTimes = [1, 3, 5, 10, 15, 30, 60, 120, 480, 1440];
  const index = Math.min(failedAttempts - 3, lockoutTimes.length - 1);
  return lockoutTimes[index];
}

async function logActivity(userId: string, activityType: string, data: any) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        activityType,
        data: JSON.stringify(data),
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
}

export default router;
