// 🚀 Session-Based Token Manager (Next Phase Implementation)
// Production-ready session management for hotel booking system

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class SessionBasedTokenManager {
    constructor(prisma) {
        this.prisma = prisma;
        this.jwtSecret = process.env.JWT_SECRET;
        this.accessTokenExpiry = '15m'; // Short-lived
        this.refreshTokenExpiry = '7d'; // Long-lived
        this.maxSessionsPerUser = 3; // Limit devices
    }

    // 🔐 Create new session with device tracking
    async createSession(user, deviceInfo = {}, ipAddress = null) {
        try {
            // Check existing sessions limit
            await this.enforceSessionLimit(user.id);

            // Generate session ID
            const sessionId = uuidv4();
            
            // Create tokens
            const accessToken = this.generateAccessToken({
                userId: user.id,
                email: user.email,
                userType: user.userType,
                sessionId
            });

            const refreshToken = this.generateRefreshToken({
                userId: user.id,
                sessionId
            });

            // Store session in database
            const session = await this.prisma.userSession.create({
                data: {
                    id: sessionId,
                    userId: user.id,
                    accessToken,
                    refreshToken,
                    deviceInfo: JSON.stringify(deviceInfo),
                    ipAddress,
                    userAgent: deviceInfo.userAgent || null,
                    location: deviceInfo.location || null,
                    isActive: true,
                    lastActivity: new Date(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            });

            // Log session creation
            await this.logActivity(sessionId, 'session_created', ipAddress);

            return {
                sessionId,
                accessToken,
                refreshToken,
                expiresIn: this.accessTokenExpiry,
                user: {
                    id: user.id,
                    email: user.email,
                    userType: user.userType
                }
            };

        } catch (error) {
            console.error('Session creation failed:', error);
            throw new Error('Failed to create session');
        }
    }

    // 🔍 Verify session and token
    async verifySession(token) {
        try {
            // 1. Verify JWT signature
            const decoded = jwt.verify(token, this.jwtSecret);
            
            // 2. Check session exists and is active
            const session = await this.prisma.userSession.findFirst({
                where: {
                    id: decoded.sessionId,
                    accessToken: token,
                    isActive: true,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                include: {
                    user: true
                }
            });

            if (!session || !session.user.isActive) {
                return null;
            }

            // 3. Update last activity (async)
            this.updateLastActivity(session.id).catch(console.error);

            // 4. Return user data with real-time permissions
            return {
                userId: session.user.id,
                email: session.user.email,
                userType: session.user.userType,
                sessionId: session.id,
                permissions: session.user.permissions || []
            };

        } catch (error) {
            console.error('Session verification failed:', error);
            return null;
        }
    }

    // 🚫 Revoke specific session
    async revokeSession(sessionId, reason = 'manual_logout') {
        try {
            await this.prisma.userSession.update({
                where: { id: sessionId },
                data: {
                    isActive: false,
                    revokedAt: new Date(),
                    revokeReason: reason
                }
            });

            await this.logActivity(sessionId, 'session_revoked', null, { reason });
            
            return { success: true };
        } catch (error) {
            console.error('Session revocation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // 🚫 Revoke all user sessions (force logout all devices)
    async revokeAllUserSessions(userId, reason = 'admin_action') {
        try {
            const result = await this.prisma.userSession.updateMany({
                where: {
                    userId,
                    isActive: true
                },
                data: {
                    isActive: false,
                    revokedAt: new Date(),
                    revokeReason: reason
                }
            });

            console.log(`Revoked ${result.count} sessions for user ${userId}`);
            return { success: true, sessionsRevoked: result.count };
        } catch (error) {
            console.error('Bulk session revocation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // 📊 Get user's active sessions
    async getUserSessions(userId) {
        try {
            const sessions = await this.prisma.userSession.findMany({
                where: {
                    userId,
                    isActive: true,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                select: {
                    id: true,
                    deviceInfo: true,
                    ipAddress: true,
                    lastActivity: true,
                    createdAt: true
                },
                orderBy: {
                    lastActivity: 'desc'
                }
            });

            return sessions.map(session => ({
                sessionId: session.id,
                device: JSON.parse(session.deviceInfo || '{}'),
                ipAddress: session.ipAddress,
                lastActivity: session.lastActivity,
                createdAt: session.createdAt
            }));
        } catch (error) {
            console.error('Failed to get user sessions:', error);
            return [];
        }
    }

    // 🧹 Cleanup expired sessions
    async cleanupExpiredSessions() {
        try {
            const result = await this.prisma.userSession.updateMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { 
                            lastActivity: { 
                                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days inactive
                            }
                        }
                    ]
                },
                data: {
                    isActive: false,
                    revokeReason: 'expired'
                }
            });

            console.log(`Cleaned up ${result.count} expired sessions`);
            return result.count;
        } catch (error) {
            console.error('Session cleanup failed:', error);
            return 0;
        }
    }

    // Helper methods
    generateAccessToken(payload) {
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.accessTokenExpiry,
            issuer: 'hotel-booking-api',
            audience: 'hotel-booking-client'
        });
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: this.refreshTokenExpiry,
            issuer: 'hotel-booking-api'
        });
    }

    async enforceSessionLimit(userId) {
        const activeSessions = await this.prisma.userSession.count({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() }
            }
        });

        if (activeSessions >= this.maxSessionsPerUser) {
            // Revoke oldest session
            const oldestSession = await this.prisma.userSession.findFirst({
                where: {
                    userId,
                    isActive: true
                },
                orderBy: {
                    lastActivity: 'asc'
                }
            });

            if (oldestSession) {
                await this.revokeSession(oldestSession.id, 'session_limit_exceeded');
            }
        }
    }

    async updateLastActivity(sessionId) {
        await this.prisma.userSession.update({
            where: { id: sessionId },
            data: { lastActivity: new Date() }
        });
    }

    async logActivity(sessionId, activityType, ipAddress, metadata = {}) {
        await this.prisma.sessionActivity.create({
            data: {
                sessionId,
                activityType,
                ipAddress,
                metadata: JSON.stringify(metadata),
                timestamp: new Date()
            }
        });
    }
}

module.exports = SessionBasedTokenManager;
