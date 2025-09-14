// ============================================
// AUTO-ARCHIVE ROUTES
// ============================================

import express from 'express';
import { validateApiKey, requireRole } from '../middleware/validateApiKey';
import {
  getArchiveStats,
  runAutoArchive,
  manualArchiveBooking,
  restoreArchivedBooking,
  startAutoArchiveService,
  stopAutoArchiveService
} from '../controllers/autoArchiveController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(validateApiKey);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN', 'STAFF']));

// Get archive statistics
router.get('/stats', getArchiveStats);

// Manual operations
router.post('/run', runAutoArchive);
router.post('/archive/:bookingId', manualArchiveBooking);
router.post('/restore/:bookingId', restoreArchivedBooking);

// Service control
router.post('/service/start', startAutoArchiveService);
router.post('/service/stop', stopAutoArchiveService);

export default router;