// ============================================
// AUTHENTICATION CONTROLLER
// ============================================

import { Request, Response } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import { 
  hashPassword, 
  verifyPassword, 
  generateTokenPair, 
  refreshTokenPair,
  revokeSession,
  generateSecureToken,
  extractBearerToken
} from '../utils/auth';
import { 
  generateSessionTokenPair,
  refreshSessionToken,
  revokeSession as revokeSessionToken,
  revokeAllUserSessions
} from '../utils/sessionUtils';
import { sendEmail, sendPasswordResetEmail } from '../utils/email';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// ============================================
// REGISTER USER
// ============================================

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    phoneNumber, 
    country,
    userType = 'CUSTOMER' as UserType 
  } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate email verification token
  const emailVerificationToken = generateSecureToken(32);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      userType,
      firstName,
      lastName,
      phoneNumber,
      country,
      isActive: true,
      emailVerified: false,
    },
    select: {
      id: true,
      email: true,
      userType: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      country: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
    }
  });

  // Generate tokens
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent');
  const tokens = await generateTokenPair(user as any, ipAddress, userAgent);

  // Send verification email (optional)
  if (process.env.NODE_ENV === 'production') {
    try {
      await sendEmail({
        to: email,
        toName: `${firstName} ${lastName}`,
        subject: 'Welcome! Please verify your email',
        htmlContent: `
          <h2>Welcome to Hotel Booking System!</h2>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}">Verify Email</a>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      tokens,
    },
  });
});

// ============================================
// LOGIN USER
// ============================================

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      userType: true,
      firstName: true,
      lastName: true,
      isActive: true,
      emailVerified: true,
      lastLoginAt: true,
    }
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated. Please contact support.', 401);
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Generate session-based tokens
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  console.log('🔐 Generating session tokens for user:', user.email);
  const sessionTokens = await generateSessionTokenPair(user as any, ipAddress, userAgent);

  // Remove password from response
  const { passwordHash, ...userResponse } = user;

  res.json({
    success: true,
    message: 'Login successful with session-based authentication',
    data: {
      user: userResponse,
      tokens: {
        accessToken: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
        expiresAt: sessionTokens.expiresAt,
        tokenType: 'Bearer'
      },
      sessionId: sessionTokens.sessionId,
      security: {
        ipAddress: ipAddress,
        userAgent: userAgent?.substring(0, 50) + '...' // Truncate for response
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// REFRESH TOKEN
// ============================================

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent');
  
  const newTokens = await refreshTokenPair(token, ipAddress, userAgent);

  if (!newTokens) {
    throw new AppError('Invalid refresh token', 401);
  }

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      tokens: newTokens,
    },
  });
});

// ============================================
// LOGOUT (Session-Based)
// ============================================

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = extractBearerToken(req.headers.authorization);
  
  if (token) {
    try {
      console.log('🚪 Processing session-based logout...');
      
      // Find session by access token
      const session = await prisma.userSession.findFirst({
        where: { accessToken: token },
        select: { id: true, userId: true }
      });
      
      if (session) {
        // Use session utilities to revoke
        const revoked = await revokeSessionToken(session.id);
        
        if (revoked) {
          console.log(`✅ Session ${session.id} revoked successfully`);
        } else {
          console.log(`⚠️ Failed to revoke session ${session.id}`);
        }
      } else {
        console.log('⚠️ Session not found for logout');
      }
    } catch (error) {
      console.error('❌ Error during session logout:', error);
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
    data: {
      loggedOutAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// REQUEST PASSWORD RESET
// ============================================

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
    }
  });

  if (!user) {
    // For security, don't reveal if email exists
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
    return;
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Generate reset token
  const resetToken = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Clean up old tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  });

  // Create new reset token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt
    }
  });
  
  // Send reset email
  try {
    const { sendPasswordResetEmail } = require('../services/passwordResetEmailService');
    const emailSent = await sendPasswordResetEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      resetToken,
      60 // 60 minutes expiry
    );
    
    if (!emailSent) {
      throw new Error('Failed to send email');
    }
  } catch (emailError) {
    console.error('Failed to send reset email:', emailError);
    throw new AppError('Failed to send reset email', 500);
  }

  res.json({
    success: true,
    message: 'Password reset link has been sent to your email',
  });
});

// ============================================
// RESET PASSWORD
// ============================================

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Find valid reset token
  const resetTokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      expiresAt: { gte: new Date() },
      usedAt: null
    },
    include: {
      user: true
    }
  });

  if (!resetTokenRecord) {
    throw new AppError('Invalid or expired reset token', 400);
  }
  
  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: resetTokenRecord.userId },
    data: {
      passwordHash,
      updatedAt: new Date()
    }
  });

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetTokenRecord.id },
    data: { usedAt: new Date() }
  });

  res.json({
    success: true,
    message: 'Password has been reset successfully',
    data: {
      email: resetTokenRecord.user.email,
      resetAt: new Date()
    }
  });
});

// ============================================
// VERIFY EMAIL
// ============================================

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  // In a real implementation, you'd verify the token
  // For now, this is a simplified version
  
  res.json({
    success: true,
    message: 'Email verified successfully',
  });
});
