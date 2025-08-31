// ============================================
// 🔐 SESSION-BASED TOKEN UTILITIES
// 🌟 Enterprise-Grade Session Management
// ============================================

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES & INTERFACES
// ============================================

export interface SessionJWTPayload {
  userId: string;
  email: string;
  userType: string;
  sessionId: string;
  type?: 'access' | 'refresh';
}

export interface SessionTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  sessionId: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  session?: any;
  user?: any;
  error?: string;
}

// ============================================
// SESSION TOKEN GENERATION
// ============================================

/**
 * 🎯 Generate Session Token Pair (Access + Refresh)
 * Enterprise-grade token generation with database persistence
 */
export const generateSessionTokenPair = async (
  user: User,
  ipAddress?: string,
  userAgent?: string
): Promise<SessionTokenPair> => {
  const sessionId = crypto.randomUUID();
  
  // Generate access token (short-lived - 15 minutes)
  const accessTokenPayload: SessionJWTPayload = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
    sessionId,
    type: 'access'
  };

  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.JWT_SECRET!,
    { 
      expiresIn: '15m', // Short-lived for security
      issuer: 'hotel-booking-api',
      audience: 'hotel-booking-client'
    }
  );

  // Generate refresh token (longer-lived - 7 days)
  const refreshTokenPayload: SessionJWTPayload = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
    sessionId,
    type: 'refresh'
  };

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    { 
      expiresIn: '7d', // Longer-lived
      issuer: 'hotel-booking-api',
      audience: 'hotel-booking-client'
    }
  );

  // Calculate access token expiration (15 minutes)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  // Store session in database
  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null
    }
  });

  console.log(`✅ Created session ${sessionId} for user ${user.email}`);

  return { accessToken, refreshToken, expiresAt, sessionId };
};

// ============================================
// SESSION TOKEN VALIDATION
// ============================================

/**
 * 🔍 Validate Session Token
 * Check token validity against database
 */
export const validateSessionToken = async (
  token: string
): Promise<SessionValidationResult> => {
  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SessionJWTPayload;
    
    // Find session in database
    const session = await prisma.userSession.findFirst({
      where: {
        id: decoded.sessionId,
        accessToken: token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true,
            firstName: true,
            lastName: true,
            isActive: true,
            emailVerified: true
          }
        }
      }
    });

    if (!session) {
      return {
        isValid: false,
        error: 'Session not found or expired'
      };
    }

    if (!session.user.isActive) {
      return {
        isValid: false,
        error: 'User account is deactivated'
      };
    }

    return {
      isValid: true,
      session,
      user: session.user
    };

  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid token'
    };
  }
};

// ============================================
// TOKEN REFRESH LOGIC
// ============================================

/**
 * 🔄 Refresh Access Token
 * Generate new access token using refresh token
 */
export const refreshSessionToken = async (
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  success: boolean;
  accessToken?: string;
  expiresAt?: Date;
  error?: string;
}> => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!
    ) as SessionJWTPayload;

    // Find session with this refresh token
    const session = await prisma.userSession.findFirst({
      where: {
        id: decoded.sessionId,
        refreshToken: refreshToken
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true,
            isActive: true
          }
        }
      }
    });

    if (!session) {
      return {
        success: false,
        error: 'Invalid refresh token'
      };
    }

    if (!session.user.isActive) {
      return {
        success: false,
        error: 'User account is deactivated'
      };
    }

    // Generate new access token
    const newAccessTokenPayload: SessionJWTPayload = {
      userId: session.userId,
      email: session.user.email,
      userType: session.user.userType,
      sessionId: session.id,
      type: 'access'
    };

    const newAccessToken = jwt.sign(
      newAccessTokenPayload,
      process.env.JWT_SECRET!,
      { 
        expiresIn: '15m',
        issuer: 'hotel-booking-api',
        audience: 'hotel-booking-client'
      }
    );

    const newExpiresAt = new Date();
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 15);

    // Update session with new access token
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        accessToken: newAccessToken,
        expiresAt: newExpiresAt,
        ipAddress: ipAddress || session.ipAddress,
        userAgent: userAgent || session.userAgent
      }
    });

    console.log(`🔄 Refreshed token for session ${session.id}`);

    return {
      success: true,
      accessToken: newAccessToken,
      expiresAt: newExpiresAt
    };

  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      error: 'Failed to refresh token'
    };
  }
};

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * 🗑️ Revoke Single Session
 */
export const revokeSession = async (sessionId: string): Promise<boolean> => {
  try {
    await prisma.userSession.delete({
      where: { id: sessionId }
    });
    
    console.log(`🗑️ Revoked session ${sessionId}`);
    return true;
  } catch (error) {
    console.error('Failed to revoke session:', error);
    return false;
  }
};

/**
 * 🗑️ Revoke All User Sessions
 */
export const revokeAllUserSessions = async (userId: string): Promise<number> => {
  try {
    const result = await prisma.userSession.deleteMany({
      where: { userId }
    });
    
    console.log(`🗑️ Revoked ${result.count} sessions for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('Failed to revoke user sessions:', error);
    return 0;
  }
};

/**
 * 🧹 Cleanup Expired Sessions
 */
export const cleanupExpiredSessions = async (): Promise<number> => {
  try {
    const result = await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    console.log(`🧹 Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return 0;
  }
};

/**
 * 📊 Get User Sessions
 */
export const getUserSessions = async (userId: string) => {
  try {
    const sessions = await prisma.userSession.findMany({
      where: { 
        userId,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sessions;
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    return [];
  }
};

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * 🔒 Check if user has too many active sessions
 */
export const checkSessionLimit = async (userId: string, maxSessions: number = 5): Promise<boolean> => {
  try {
    const sessionCount = await prisma.userSession.count({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return sessionCount < maxSessions;
  } catch (error) {
    console.error('Failed to check session limit:', error);
    return false;
  }
};

/**
 * 🛡️ Validate IP and User-Agent consistency
 */
export const validateSecurityContext = (
  session: any,
  currentIp?: string,
  currentUserAgent?: string
): {
  isValid: boolean;
  violations: string[];
} => {
  const violations: string[] = [];

  if (session.ipAddress && currentIp && session.ipAddress !== currentIp) {
    violations.push(`IP mismatch: expected ${session.ipAddress}, got ${currentIp}`);
  }

  if (session.userAgent && currentUserAgent && session.userAgent !== currentUserAgent) {
    violations.push('User-Agent mismatch');
  }

  return {
    isValid: violations.length === 0,
    violations
  };
};
