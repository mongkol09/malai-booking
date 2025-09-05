import express from 'express';
import { validateApiKey } from '../middleware/validateApiKey';
import { sessionAuth, requireSessionRole } from '../middleware/sessionAuth';
import { verifyAdminToken } from '../middleware/adminAuth';
import {
  sendCleaningNotification,
  sendBulkCleaningNotifications,
  getHousekeepingBotStatus,
  testDualBots,
  testBookingNotification
} from '../controllers/telegramHousekeepingController';
import {
  updateRoomCleaningStatus,
  getRoomStatus,
  getRoomsNeedCleaning
} from '../controllers/roomStatusController';

const router = express.Router();

// Apply API key validation to all routes
router.use(validateApiKey);

// Try JWT first, fallback to session auth
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // JWT authentication
    verifyAdminToken(req, res, next);
  } else {
    // Session authentication fallback
    sessionAuth(req, res, next);
  }
});

// Role validation for both auth types
router.use((req, res, next) => {
  if ((req as any).user?.userId) {
    // JWT user format (from verifyAdminToken)
    console.log('🔍 JWT user detected:', (req as any).user);
    // Allow DEV, ADMIN, STAFF roles
    const userRole = (req as any).user.userType || (req as any).user.role;
    if (!['DEV', 'ADMIN', 'STAFF'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' }
      });
    }
    next();
  } else {
    // Session user format
    requireSessionRole(['DEV', 'ADMIN', 'STAFF'])(req, res, next);
  }
});

// Send single room cleaning notification
router.post('/cleaning-notification', sendCleaningNotification);

// Send check-in notification (alias for cleaning notification)
router.post('/checkin-notification', (req, res) => {
  console.log('📥 Check-in notification request:', req.body);
  // Transform check-in data to cleaning notification format
  const cleaningData = {
    roomNumber: req.body.roomNumber,
    roomType: req.body.roomType,
    guestName: req.body.guestName,
    checkOutTime: req.body.checkInTime || new Date().toLocaleTimeString('th-TH'),
    priority: req.body.vip ? 'high' : 'normal',
    specialInstructions: `Check-in completed. ${req.body.specialRequests || 'No special requests'}`
  };
  
  // Reuse cleaning notification logic
  req.body = cleaningData;
  sendCleaningNotification(req, res);
});

// Send bulk room cleaning notifications
router.post('/bulk-cleaning-notifications', sendBulkCleaningNotifications);

// Get dual bot system status
router.get('/bot-status', getHousekeepingBotStatus);

// Test dual bot system
router.post('/test-bots', testDualBots);
router.post('/test-booking-notification', testBookingNotification);

// Room status management
router.put('/room-status', updateRoomCleaningStatus);
router.get('/room-status/:roomNumber', getRoomStatus);
router.get('/rooms-need-cleaning', getRoomsNeedCleaning);

export default router;
