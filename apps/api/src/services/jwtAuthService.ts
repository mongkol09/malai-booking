import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// JWT AUTHENTICATION SERVICE (No Redis)
// ============================================

export interface UserSession {
  id: number;
  userId: number;
  sessionId: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
  loginMethod?: string;
  revokeReason?: string;
}

export interface JWTPayload {
  user_id: number;
  email: string;
  role: string;
  session_id: string;
  device_fingerprint?: string;
  issued_at: number;
  permissions: string[];
  login_ip?: string;
  user_agent?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// Configuration
const JWT_CONFIG = {
  accessTokenExpiry: '2h' as const,
  refreshTokenExpiry: '7d' as const,
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  algorithm: 'HS256' as const,
  issuer: 'hotel-admin-system',
  audience: 'hotel-staff'
};

export class JWTAuthService {
  
  // ============================================
  // DEVICE FINGERPRINTING
  // ============================================
  
  static generateDeviceFingerprint(req: any): string {
    const components = [
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
      req.headers['accept-encoding'] || '',
      req.ip || '',
      req.headers['x-forwarded-for'] || ''
    ];
    
    return crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 32);
  }
  
  static generateSessionId(): string {
    return crypto.randomUUID();
  }
  
  // ============================================
  // SESSION MANAGEMENT
  // ============================================
  
  static async createSession(
    userId: number, 
    deviceInfo: {
      fingerprint?: string;
      ipAddress?: string;
      userAgent?: string;
    },
    loginMethod: string = 'password'
  ): Promise<string> {
    try {
      // Check for existing active sessions (limit concurrent sessions)
      const MAX_CONCURRENT_SESSIONS = 5;
      const existingSessions = await prisma.$queryRaw<any[]>`
        SELECT id FROM user_sessions 
        WHERE user_id = ${userId} AND is_active = true 
        ORDER BY last_activity DESC
      `;
      
      // Deactivate oldest sessions if limit exceeded
      if (existingSessions.length >= MAX_CONCURRENT_SESSIONS) {
        const sessionsToDeactivate = existingSessions.slice(MAX_CONCURRENT_SESSIONS - 1);
        const sessionIdsToDeactivate = sessionsToDeactivate.map(s => s.id);
        
        await prisma.$executeRaw`
          UPDATE user_sessions 
          SET is_active = false, revoke_reason = 'MAX_SESSIONS_EXCEEDED'
          WHERE id = ANY(${sessionIdsToDeactivate})
        `;
      }
      
      // Create new session
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      await prisma.$executeRaw`
        INSERT INTO user_sessions (
          user_id, session_id, device_fingerprint, ip_address, 
          user_agent, login_method, expires_at
        ) VALUES (
          ${userId}, ${sessionId}, ${deviceInfo.fingerprint}, 
          ${deviceInfo.ipAddress}::inet, ${deviceInfo.userAgent}, 
          ${loginMethod}, ${expiresAt}
        )
      `;
      
      return sessionId;
      
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }
  
  static async validateSession(sessionId: string): Promise<UserSession | null> {
    try {
      const session = await prisma.$queryRaw<UserSession[]>`
        SELECT * FROM user_sessions 
        WHERE session_id = ${sessionId} 
          AND is_active = true 
          AND expires_at > NOW()
        LIMIT 1
      `;
      
      if (session.length === 0) {
        return null;
      }
      
      return session[0];
      
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }
  
  static async updateSessionActivity(sessionId: string): Promise<void> {
    // Non-blocking update - don't wait for completion
    setImmediate(async () => {
      try {
        await prisma.$executeRaw`
          UPDATE user_sessions 
          SET last_activity = NOW() 
          WHERE session_id = ${sessionId} AND is_active = true
        `;
      } catch (error) {
        console.error('Failed to update session activity:', error);
      }
    });
  }
  
  static async revokeSession(sessionId: string, reason: string = 'USER_LOGOUT'): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE user_sessions 
        SET is_active = false, revoke_reason = ${reason}
        WHERE session_id = ${sessionId}
      `;
    } catch (error) {
      console.error('Error revoking session:', error);
      throw new Error('Failed to revoke session');
    }
  }
  
  static async revokeAllUserSessions(userId: number, reason: string = 'ADMIN_ACTION'): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE user_sessions 
        SET is_active = false, revoke_reason = ${reason}
        WHERE user_id = ${userId} AND is_active = true
      `;
    } catch (error) {
      console.error('Error revoking user sessions:', error);
      throw new Error('Failed to revoke user sessions');
    }
  }
  
  // ============================================
  // JWT TOKEN MANAGEMENT
  // ============================================
  
  static async createTokens(user: any, sessionId: string, deviceInfo: any): Promise<AuthTokens> {
    try {
      // Get user permissions (cache in JWT to avoid DB lookups)
      const permissions = await this.getUserPermissions(user.id);
      
      const payload: JWTPayload = {
        user_id: user.id,
        email: user.email,
        role: user.userType,
        session_id: sessionId,
        device_fingerprint: deviceInfo.fingerprint,
        issued_at: Math.floor(Date.now() / 1000),
        permissions: permissions,
        login_ip: deviceInfo.ipAddress,
        user_agent: deviceInfo.userAgent
      };
      
      const signOptions: SignOptions = {
        expiresIn: JWT_CONFIG.accessTokenExpiry,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        algorithm: JWT_CONFIG.algorithm
      };
      
      const accessToken = jwt.sign(payload, JWT_CONFIG.accessTokenSecret, signOptions);
      
      const refreshSignOptions: SignOptions = {
        expiresIn: JWT_CONFIG.refreshTokenExpiry,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        algorithm: JWT_CONFIG.algorithm
      };
      
      const refreshToken = jwt.sign({
        user_id: user.id,
        session_id: sessionId,
        type: 'refresh'
      }, JWT_CONFIG.refreshTokenSecret, refreshSignOptions);
      
      return {
        accessToken,
        refreshToken,
        expiresIn: 2 * 60 * 60, // 2 hours in seconds
        tokenType: 'Bearer'
      };
      
    } catch (error) {
      console.error('Error creating tokens:', error);
      throw new Error('Failed to create authentication tokens');
    }
  }
  
  static async refreshAccessToken(refreshTokenStr: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshTokenStr, JWT_CONFIG.refreshTokenSecret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      // Validate session is still active
      const session = await this.validateSession(decoded.session_id);
      if (!session) {
        throw new Error('Session expired or invalid');
      }
      
      // Get fresh user data
      const user = await prisma.user.findUnique({
        where: { id: String(decoded.user_id) },
        select: {
          id: true,
          email: true,
          userType: true,
          isActive: true,
          firstName: true,
          lastName: true
        }
      });
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }
      
      // Create new tokens with same session
      const deviceInfo = {
        fingerprint: session.deviceFingerprint,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent
      };
      
      return await this.createTokens(user, session.sessionId, deviceInfo);
      
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Token refresh failed');
    }
  }
  
  // ============================================
  // PERMISSION MANAGEMENT
  // ============================================
  
  static async getUserPermissions(userId: number): Promise<string[]> {
    try {
      // Get user role permissions
      const user = await prisma.user.findUnique({
        where: { id: String(userId) },
        select: { userType: true }
      });
      
      if (!user) {
        return [];
      }
      
      // Define role-based permissions
      const rolePermissions: { [key: string]: string[] } = {
        'ADMIN': [
          'booking_history:read',
          'booking_history:export', 
          'booking_history:archive',
          'booking_history:restore',
          'booking_history:bulk_operations',
          'booking_management:all'
        ],
        'DEV': [
          'booking_history:read',
          'booking_history:export',
          'booking_history:archive', 
          'booking_history:restore',
          'booking_history:bulk_operations',
          'booking_history:system_operations',
          'booking_management:all'
        ],
        'MANAGER': [
          'booking_history:read',
          'booking_history:export',
          'booking_management:read',
          'booking_management:update'
        ],
        'STAFF': [
          'booking_history:read',
          'booking_management:read'
        ]
      };
      
      return rolePermissions[user.userType] || [];
      
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }
  
  static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes(requiredPermission) || 
           userPermissions.includes('booking_management:all');
  }
  
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.$executeRaw`
        DELETE FROM user_sessions 
        WHERE (expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 days')
          AND is_active = false
      `;
      
      // Also mark very old active sessions as inactive
      await prisma.$executeRaw`
        UPDATE user_sessions 
        SET is_active = false, revoke_reason = 'INACTIVE_TIMEOUT'
        WHERE last_activity < NOW() - INTERVAL '30 days' 
          AND is_active = true
      `;
      
      return result as number;
      
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      return 0;
    }
  }
  
  static async getActiveSessions(userId: number): Promise<UserSession[]> {
    try {
      const sessions = await prisma.$queryRaw<UserSession[]>`
        SELECT * FROM user_sessions 
        WHERE user_id = ${userId} AND is_active = true 
        ORDER BY last_activity DESC
      `;
      
      return sessions;
      
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }
  
  // ============================================
  // SECURITY MONITORING
  // ============================================
  
  static async logSecurityEvent(
    userId: number, 
    eventType: string, 
    details: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Log security events for monitoring
      console.log(`[SECURITY] User ${userId}: ${eventType}`, {
        userId,
        eventType,
        details,
        ipAddress,
        timestamp: new Date().toISOString()
      });
      
      // Could extend this to store in a dedicated security_logs table
      
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }
  
  static async detectSuspiciousActivity(userId: number, ipAddress: string): Promise<boolean> {
    try {
      // Check for multiple failed attempts from same IP
      const recentSessions = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as session_count
        FROM user_sessions 
        WHERE user_id = ${userId} 
          AND ip_address = ${ipAddress}::inet
          AND created_at > NOW() - INTERVAL '1 hour'
      `;
      
      const sessionCount = parseInt(recentSessions[0]?.session_count || '0');
      
      // Flag as suspicious if more than 10 sessions from same IP in 1 hour
      return sessionCount > 10;
      
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  }
}

export default JWTAuthService;