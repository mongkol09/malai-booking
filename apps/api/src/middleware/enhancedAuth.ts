import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken, validateSessionToken, revokeSession } from '../utils/auth';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

/**
 * Enhanced Authentication Middleware
 * เสริมความแข็งแกร่งระบบ Authentication & Authorization
 */

// Store for tracking failed login attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of failedAttempts.entries()) {
    if (value.lockedUntil && now > value.lockedUntil) {
      failedAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Enhanced authentication middleware
export const enhancedAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      throw new AppError('Access token required', 401, {
        code: 'MISSING_TOKEN',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Validate session token
    const validation = await validateSessionToken(token);
    
    if (!validation.isValid) {
      throw new AppError('Invalid or expired token', 401, {
        code: 'INVALID_TOKEN',
        error: validation.error,
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Check if user is still active
    if (!validation.user?.isActive) {
      throw new AppError('User account is deactivated', 401, {
        code: 'ACCOUNT_DEACTIVATED',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Check for suspicious activity
    await checkSuspiciousActivity(req, validation.user.id);

    // Attach user to request
    (req as any).user = {
      id: validation.user.id,
      email: validation.user.email,
      role: validation.user.userType,
      sessionId: validation.session?.id
    };

    // Update last activity
    await updateLastActivity(validation.session?.id, req.ip, req.get('User-Agent'));

    next();

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Authentication error:', error);
    throw new AppError('Authentication failed', 401, {
      code: 'AUTH_ERROR',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

// Role-based authorization
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      throw new AppError('Authentication required', 401, {
        code: 'AUTH_REQUIRED',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    if (!allowedRoles.includes(user.role)) {
      console.warn(`🚨 Unauthorized access attempt`, {
        userId: user.id,
        userRole: user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      throw new AppError('Insufficient permissions', 403, {
        code: 'INSUFFICIENT_PERMISSIONS',
        userRole: user.role,
        requiredRoles: allowedRoles,
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    next();
  };
};

// Admin-only access
export const requireAdmin = requireRole(['admin']);

// Staff or higher access
export const requireStaff = requireRole(['admin', 'staff', 'manager']);

// Manager or higher access
export const requireManager = requireRole(['admin', 'manager']);

// Multi-factor authentication check
export const requireMFA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  
  if (!user) {
    throw new AppError('Authentication required', 401, {
      code: 'AUTH_REQUIRED',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  // Check if MFA is enabled for this user (mock for now)
  // const userMFA = await prisma.userMFA.findFirst({
  //   where: { userId: user.id, isEnabled: true }
  // });
  const userMFA = null; // Mock - no MFA for now

  if (!userMFA) {
    throw new AppError('Multi-factor authentication required', 403, {
      code: 'MFA_REQUIRED',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  // Check if MFA token is provided
  const mfaToken = req.headers['x-mfa-token'] as string;
  
  if (!mfaToken) {
    throw new AppError('MFA token required', 403, {
      code: 'MFA_TOKEN_REQUIRED',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  // Verify MFA token (implement TOTP verification here)
  const isValidMFA = await verifyMFAToken(user.id, mfaToken);
  
  if (!isValidMFA) {
    throw new AppError('Invalid MFA token', 403, {
      code: 'INVALID_MFA_TOKEN',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  next();
};

// Session validation middleware
export const validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  
  if (!user || !user.sessionId) {
    throw new AppError('Valid session required', 401, {
      code: 'INVALID_SESSION',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  // Check session validity
  const session = await prisma.userSession.findUnique({
    where: { id: user.sessionId },
    include: { user: true }
  });

  if (!session || !session.user.isActive) {
    // Revoke invalid session
    await revokeSession(user.sessionId);
    
    throw new AppError('Session expired or invalid', 401, {
      code: 'SESSION_EXPIRED',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  // Check for session hijacking (IP/User-Agent change)
  const currentIP = req.ip;
  const currentUserAgent = req.get('User-Agent');
  
  if (session.ipAddress && session.ipAddress !== currentIP) {
    console.warn(`🚨 Potential session hijacking detected`, {
      userId: user.id,
      sessionId: user.sessionId,
      originalIP: session.ipAddress,
      currentIP,
      timestamp: new Date().toISOString()
    });
    
    // Revoke session for security
    await revokeSession(user.sessionId);
    
    throw new AppError('Security violation detected', 401, {
      code: 'SECURITY_VIOLATION',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  next();
};

// Account lockout protection
export const checkAccountLockout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const email = req.body.email;
  const ip = req.ip || 'unknown';
  
  if (!email) {
    return next();
  }

  const key = `${email}:${ip}`;
  const attempts = failedAttempts.get(key);
  const now = Date.now();

  // Check if account is locked
  if (attempts?.lockedUntil && now < attempts.lockedUntil) {
    const lockoutTime = Math.ceil((attempts.lockedUntil - now) / 1000 / 60);
    
    throw new AppError('Account temporarily locked due to too many failed attempts', 423, {
      code: 'ACCOUNT_LOCKED',
      lockoutMinutes: lockoutTime,
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  next();
};

// Record failed login attempt
export const recordFailedAttempt = (email: string, ip: string): void => {
  const key = `${email}:${ip}`;
  const attempts = failedAttempts.get(key) || { count: 0, lastAttempt: 0 };
  
  attempts.count++;
  attempts.lastAttempt = Date.now();
  
  // Lock account after 5 failed attempts for 15 minutes
  if (attempts.count >= 5) {
    attempts.lockedUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
    console.warn(`🚨 Account locked due to failed attempts`, {
      email,
      ip,
      attempts: attempts.count,
      lockedUntil: new Date(attempts.lockedUntil).toISOString()
    });
  }
  
  failedAttempts.set(key, attempts);
};

// Clear failed attempts on successful login
export const clearFailedAttempts = (email: string, ip: string): void => {
  const key = `${email}:${ip}`;
  failedAttempts.delete(key);
};

// Helper functions
function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

async function checkSuspiciousActivity(req: Request, userId: string): Promise<void> {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  
  // Check for multiple sessions from different IPs
  const sessions = await prisma.userSession.findMany({
    where: { 
      userId,
      expiresAt: { gt: new Date() }
    }
  });

  const uniqueIPs = new Set(sessions.map(s => s.ipAddress).filter(Boolean));
  
  if (uniqueIPs.size > 3) {
    console.warn(`🚨 Multiple sessions from different IPs detected`, {
      userId,
      uniqueIPs: Array.from(uniqueIPs),
      currentIP: ip,
      timestamp: new Date().toISOString()
    });
  }
}

async function updateLastActivity(sessionId: string | undefined, ip: string | undefined, userAgent: string | undefined): Promise<void> {
  if (!sessionId) return;
  
  try {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        // lastActivity: new Date(), // Field doesn't exist in schema
        ipAddress: ip,
        userAgent
      }
    });
  } catch (error) {
    console.error('Failed to update last activity:', error);
  }
}

async function verifyMFAToken(userId: string, token: string): Promise<boolean> {
  // Implement TOTP verification here
  // For now, return true for demonstration
  return true;
}

// Export all middleware
export default {
  enhancedAuth,
  requireRole,
  requireAdmin,
  requireStaff,
  requireManager,
  requireMFA,
  validateSession,
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts
};
