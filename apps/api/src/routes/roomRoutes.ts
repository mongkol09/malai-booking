// ============================================
// ROOM STATUS ROUTES
// ============================================

import express from 'express';
import { 
  getRoomStatus,
  updateRoomCleaningStatus
} from '../controllers/roomStatusController';

const router = express.Router();

// Public endpoints (no authentication required for read operations)
router.get('/status/:roomNumber', getRoomStatus);

// Protected endpoints (require authentication for updates)
router.put('/:roomNumber/status', updateRoomCleaningStatus);

export default router;
