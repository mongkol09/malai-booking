// ============================================
// 🔐 SESSION AUTHENTICATION ROUTES
// 🚀 Enterprise-Grade Session Management
// ============================================

import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  refreshSessionToken, 
  revokeSession, 
  revokeAllUserSessions,
  getUserSessions,
  cleanupExpiredSessions 
} from '../utils/sessionUtils';
import { sessionAuth, SessionAuthenticatedRequest } from '../middleware/sessionAuth';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// TOKEN REFRESH ENDPOINT
// ============================================

/**
 * 🔄 Refresh Access Token
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Token refresh request received');
    
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Get client info for security tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Refresh the token
    const result = await refreshSessionToken(refreshToken, ipAddress, userAgent);

    if (!result.success) {
      console.log(`❌ Token refresh failed: ${result.error}`);
      
      res.status(401).json({
        success: false,
        error: {
          message: result.error,
          code: 'REFRESH_FAILED',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    console.log('✅ Token refreshed successfully');

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken: result.accessToken,
          refreshToken: refreshToken, // Keep same refresh token
          expiresAt: result.expiresAt,
          tokenType: 'Bearer'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Token refresh error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during token refresh',
        code: 'REFRESH_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// ============================================
// LOGOUT ENDPOINTS
// ============================================

/**
 * 🚪 Logout (Single Session)
 * POST /api/v1/auth/logout
 */
router.post('/logout', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🚪 Logout request received');
    
    const sessionId = req.user?.sessionId;
    
    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Session ID not found',
          code: 'NO_SESSION_ID',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Revoke the session
    const revoked = await revokeSession(sessionId);

    if (!revoked) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to revoke session',
          code: 'LOGOUT_FAILED',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    console.log(`✅ Session ${sessionId} logged out successfully`);

    res.json({
      success: true,
      message: 'Logged out successfully',
      data: {
        sessionId: sessionId,
        loggedOutAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Logout error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during logout',
        code: 'LOGOUT_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * 🚪 Logout All Sessions
 * POST /api/v1/auth/logout-all
 */
router.post('/logout-all', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🚪 Logout all sessions request received');
    
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'User ID not found',
          code: 'NO_USER_ID',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Revoke all user sessions
    const revokedCount = await revokeAllUserSessions(userId);

    console.log(`✅ Revoked ${revokedCount} sessions for user ${userId}`);

    res.json({
      success: true,
      message: 'All sessions logged out successfully',
      data: {
        revokedSessions: revokedCount,
        loggedOutAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Logout all error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during logout all',
        code: 'LOGOUT_ALL_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * 🚪 Logout All Sessions (DELETE alias)
 * DELETE /api/v1/auth/logout-all
 */
router.delete('/logout-all', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🚪 Logout all sessions request received (DELETE)');
    
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'User ID not found',
          code: 'NO_USER_ID',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Revoke all user sessions
    const revokedCount = await revokeAllUserSessions(userId);

    console.log(`✅ Revoked ${revokedCount} sessions for user ${userId}`);

    res.json({
      success: true,
      message: 'All sessions logged out successfully',
      data: {
        revokedSessions: revokedCount,
        loggedOutAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Logout all error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during logout all',
        code: 'LOGOUT_ALL_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// ============================================
// SESSION MANAGEMENT ENDPOINTS
// ============================================

/**
 * 📋 Get User Sessions
 * GET /api/v1/auth/sessions
 */
router.get('/sessions', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📋 Get user sessions request received');
    
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'User ID not found',
          code: 'NO_USER_ID',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Check if user is admin - if so, get all sessions
    if (req.user?.isAdmin || req.user?.userType === 'ADMIN') {
      console.log('📋 Admin detected - getting all sessions');
      
      const allSessions = await prisma.userSession.findMany({
        where: {
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
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        message: 'All user sessions retrieved successfully (admin view)',
        data: {
          sessions: allSessions.map(session => ({
            id: session.id,
            user: {
              id: session.user.id,
              email: session.user.email,
              userType: session.user.userType,
              name: `${session.user.firstName} ${session.user.lastName}`
            },
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent?.substring(0, 100) + '...',
            isCurrent: session.id === req.user?.sessionId
          })),
          total: allSessions.length
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Regular user - get only their sessions
    const sessions = await getUserSessions(userId);

    res.json({
      success: true,
      message: 'User sessions retrieved successfully',
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent?.substring(0, 100) + '...', // Truncate for security
          isCurrent: session.id === req.user?.sessionId
        })),
        total: sessions.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Get sessions error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while getting sessions',
        code: 'GET_SESSIONS_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * 🗑️ Revoke Specific Session
 * DELETE /api/v1/auth/sessions/:sessionId
 */
router.delete('/sessions/:sessionId', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🗑️ Revoke specific session request received');
    
    const sessionId = req.params.sessionId;
    const userId = req.user?.userId;
    
    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'MISSING_SESSION_ID',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'User ID not found',
          code: 'NO_USER_ID',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Verify session belongs to user
    const session = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId: userId
      }
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Session not found or does not belong to user',
          code: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Prevent user from revoking their current session
    if (sessionId === req.user?.sessionId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Cannot revoke current session. Use logout instead.',
          code: 'CANNOT_REVOKE_CURRENT_SESSION',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Revoke the session
    const revoked = await revokeSession(sessionId);

    if (!revoked) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to revoke session',
          code: 'REVOKE_FAILED',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    console.log(`✅ Session ${sessionId} revoked successfully`);

    res.json({
      success: true,
      message: 'Session revoked successfully',
      data: {
        sessionId: sessionId,
        revokedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Revoke session error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during session revocation',
        code: 'REVOKE_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * 🧹 Cleanup Expired Sessions (Admin Only)
 * POST /api/v1/auth/cleanup
 */
router.post('/cleanup', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required',
          code: 'ADMIN_REQUIRED',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    console.log('🧹 Cleanup expired sessions request received');
    
    const cleanedCount = await cleanupExpiredSessions();

    console.log(`✅ Cleaned up ${cleanedCount} expired sessions`);

    res.json({
      success: true,
      message: 'Expired sessions cleaned up successfully',
      data: {
        cleanedSessions: cleanedCount,
        cleanedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Cleanup error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during cleanup',
        code: 'CLEANUP_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// ============================================
// ADMIN SESSION MANAGEMENT ENDPOINTS
// ============================================

/**
 * 👑 Admin: Get All User Sessions
 * GET /api/v1/auth/admin/sessions
 */
router.get('/admin/sessions', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('👑 Admin get all sessions request received');
    
    // Check if user is admin
    if (!req.user?.isAdmin && req.user?.userType !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required',
          code: 'ADMIN_REQUIRED',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Get all active sessions
    const sessions = await prisma.userSession.findMany({
      where: {
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
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      message: 'All user sessions retrieved successfully',
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          user: {
            id: session.user.id,
            email: session.user.email,
            userType: session.user.userType,
            name: `${session.user.firstName} ${session.user.lastName}`
          },
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent?.substring(0, 100) + '...',
          isExpired: session.expiresAt < new Date()
        })),
        total: sessions.length,
        activeCount: sessions.filter(s => s.expiresAt > new Date()).length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Admin get sessions error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while getting sessions',
        code: 'ADMIN_GET_SESSIONS_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * 👑 Admin: Logout All User Sessions
 * POST /api/v1/auth/admin/logout-all
 */
router.post('/admin/logout-all', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('👑 Admin logout all sessions request received');
    
    // Check if user is admin
    if (!req.user?.isAdmin && req.user?.userType !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required',
          code: 'ADMIN_REQUIRED',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'User ID is required',
          code: 'MISSING_USER_ID',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Revoke all user sessions
    const revokedCount = await revokeAllUserSessions(userId);

    if (revokedCount === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'No active sessions found for user',
          code: 'NO_SESSIONS_FOUND',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    console.log(`✅ Admin logged out all sessions for user: ${userId}`);

    res.json({
      success: true,
      message: 'All user sessions logged out successfully',
      data: {
        userId: userId,
        revokedSessions: revokedCount,
        loggedOutAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Admin logout all error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during logout all',
        code: 'ADMIN_LOGOUT_ALL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * 🧹 Cleanup Expired Sessions (Admin Only)
 * POST /api/v1/auth/cleanup
 */
router.post('/cleanup', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🧹 Cleanup expired sessions request received');
    
    const isAdmin = req.user?.isAdmin || req.user?.userType === 'ADMIN';
    
    if (!isAdmin) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Admin privileges required',
          code: 'ADMIN_REQUIRED',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Clean up expired sessions
    const deletedCount = await cleanupExpiredSessions();

    console.log(`✅ Cleaned up ${deletedCount} expired sessions`);

    res.json({
      success: true,
      message: 'Expired sessions cleaned up successfully',
      data: {
        deletedCount: deletedCount,
        cleanedSessions: deletedCount, // Alias for test compatibility
        cleanedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Cleanup expired sessions error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during cleanup',
        code: 'CLEANUP_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * 🗑️ Invalidate Session/Token
 * POST /api/v1/auth/invalidate
 */
router.post('/invalidate', sessionAuth, async (req: SessionAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🗑️ Invalidate session/token request received');
    
    const { sessionId, token } = req.body;
    const currentUserId = req.user?.userId;
    const isAdmin = req.user?.isAdmin || req.user?.userType === 'ADMIN';

    if (!currentUserId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'User ID not found',
          code: 'NO_USER_ID',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    let invalidatedCount = 0;

    // If sessionId provided, invalidate specific session
    if (sessionId) {
      console.log(`🗑️ Invalidating specific session: ${sessionId}`);
      
      const sessionToDelete = await prisma.userSession.findUnique({
        where: { id: sessionId },
        include: { user: { select: { id: true } } }
      });

      if (!sessionToDelete) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      // Check if user can invalidate this session
      if (!isAdmin && sessionToDelete.user.id !== currentUserId) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Not authorized to invalidate this session',
            code: 'UNAUTHORIZED_SESSION_ACCESS',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      await prisma.userSession.delete({
        where: { id: sessionId }
      });
      
      invalidatedCount = 1;
    }
    // If token provided, find and invalidate that session
    else if (token) {
      console.log('🗑️ Invalidating session by token');
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const sessionId = decoded.sessionId;
        
        if (sessionId) {
          const sessionToDelete = await prisma.userSession.findUnique({
            where: { id: sessionId },
            include: { user: { select: { id: true } } }
          });

          if (sessionToDelete) {
            // Check if user can invalidate this session
            if (!isAdmin && sessionToDelete.user.id !== currentUserId) {
              res.status(403).json({
                success: false,
                error: {
                  message: 'Not authorized to invalidate this session',
                  code: 'UNAUTHORIZED_SESSION_ACCESS',
                  timestamp: new Date().toISOString()
                }
              });
              return;
            }

            await prisma.userSession.delete({
              where: { id: sessionId }
            });
            
            invalidatedCount = 1;
          }
        }
      } catch (jwtError) {
        console.log('🗑️ Invalid JWT token provided');
        // Token is invalid, which means it's already effectively invalidated
        invalidatedCount = 0;
      }
    }
    // If neither provided, invalidate current session
    else {
      console.log('🗑️ Invalidating current session');
      
      const currentSessionId = req.user?.sessionId;
      if (currentSessionId) {
        await prisma.userSession.delete({
          where: { id: currentSessionId }
        });
        invalidatedCount = 1;
      }
    }

    res.json({
      success: true,
      message: 'Session invalidated successfully',
      data: {
        invalidatedCount,
        invalidatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Invalidate session error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during session invalidation',
        code: 'INVALIDATE_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;
