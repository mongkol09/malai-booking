import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

// ============================================
// TYPES & INTERFACES
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// JWT Token Interfaces
export interface JWTPayload {
  userId: string;
  email: string;
  userType: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ============================================
// ASYNC HANDLER WRAPPER
// ============================================

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================
// JWT TOKEN GENERATION
// ============================================

// ============================================
// SESSION-BASED TOKEN GENERATION
// ============================================

export const generateSessionTokenPair = async (
  user: User,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  sessionId: string;
}> => {
  const sessionId = crypto.randomUUID();
  
  // Generate access token (short-lived)
  const accessTokenPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
    sessionId
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

  // Generate refresh token (longer-lived)
  const refreshTokenPayload = {
    userId: user.id,
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
      ipAddress,
      userAgent
    }
  });

  console.log(`✅ Created session ${sessionId} for user ${user.email}`);

  return { accessToken, refreshToken, expiresAt, sessionId };
};

// ============================================
// SESSION TOKEN VALIDATION
// ============================================

export const validateSessionToken = async (
  token: string
): Promise<{
  isValid: boolean;
  session?: any;
  user?: any;
  error?: string;
}> => {
  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
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
        user: true
      }
    });

    if (!session) {
      return {
        isValid: false,
        error: 'Session not found or expired'
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
// REFRESH TOKEN LOGIC
// ============================================

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
    ) as any;

    // Find session with this refresh token
    const session = await prisma.userSession.findFirst({
      where: {
        id: decoded.sessionId,
        refreshToken: refreshToken
      },
      include: {
        user: true
      }
    });

    if (!session) {
      return {
        success: false,
        error: 'Invalid refresh token'
      };
    }

    // Generate new access token
    const newAccessTokenPayload: JWTPayload = {
      userId: session.userId,
      email: session.user.email,
      userType: session.user.userType,
      sessionId: session.id
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
        ipAddress, // Update IP if provided
        userAgent  // Update User-Agent if provided
      }
    });

    console.log(`🔄 Refreshed token for session ${session.id}`);

    return {
      success: true,
      accessToken: newAccessToken,
      expiresAt: newExpiresAt
    };

  } catch (error) {
    return {
      success: false,
      error: 'Failed to refresh token'
    };
  }
};

// ============================================
// SESSION MANAGEMENT
// ============================================

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

export const generateTokenPair = async (
  user: User,
  ipAddress?: string,
  userAgent?: string
): Promise<TokenPair> => {
  const sessionId = crypto.randomUUID();
  
  const jwtPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
    sessionId
  };

  const accessToken = jwt.sign(
    jwtPayload,
    process.env.JWT_SECRET!,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId: user.id, sessionId },
    process.env.JWT_REFRESH_SECRET!,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    } as jwt.SignOptions
  );

  // Calculate expiration time
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Default 24 hours

  // Store session in database
  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent
    }
  });

  return { accessToken, refreshToken, expiresAt };
};

// ============================================
// JWT TOKEN VERIFICATION
// ============================================

export const verifyAccessToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Check if session exists and is valid
    const session = await prisma.userSession.findFirst({
      where: {
        id: decoded.sessionId,
        accessToken: token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!session) {
      return null;
    }

    // Check if user is active (if user has isActive field)
    if (session.user.isActive !== undefined && !session.user.isActive) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export const verifyRefreshToken = async (token: string): Promise<{ userId: string; sessionId: string } | null> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string; sessionId: string };
    
    // Check if session exists
    const session = await prisma.userSession.findFirst({
      where: {
        id: decoded.sessionId,
        refreshToken: token,
        userId: decoded.userId
      }
    });

    if (!session) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
};

// ============================================
// PASSWORD UTILITIES
// ============================================

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // High security salt rounds
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const refreshTokenPair = async (
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<TokenPair | null> => {
  const decoded = await verifyRefreshToken(refreshToken);
  if (!decoded) {
    return null;
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user || !user.isActive) {
    return null;
  }

  // Revoke old session
  await revokeSession(decoded.sessionId);

  // Generate new token pair
  return await generateTokenPair(user, ipAddress, userAgent);
};

// ============================================
// SECURITY UTILITIES
// ============================================

export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const extractBearerToken = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};
