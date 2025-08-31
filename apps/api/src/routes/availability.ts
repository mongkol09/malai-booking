import express from 'express';
import { 
  getMonthlyAvailability,
  getDateDetail,
  quickSearch,
  createWalkInBooking,
  getRoomTypesForSelection
} from '../controllers/availabilityController';
import { requireRole, validateApiKey } from '../middleware/validateApiKey';
import { validateHttpMethod } from '../middleware/methodValidation';

const router = express.Router();

// Add method validation to all routes
router.use(validateHttpMethod(['GET', 'POST']));

// Apply authentication to all availability routes
router.use(validateApiKey);
router.use(requireRole(['ADMIN', 'STAFF', 'MANAGER', 'DEV']));

// ============================================
// ADMIN AVAILABILITY ROUTES
// ============================================

/**
 * GET /api/admin/availability/monthly
 * Get monthly room availability calendar
 * Query params: roomTypeId?, year, month
 */
router.get('/monthly', getMonthlyAvailability);

/**
 * GET /api/admin/availability/date-detail
 * Get detailed availability for specific date
 * Query params: date, roomTypeId
 */
router.get('/date-detail', getDateDetail);

/**
 * GET /api/admin/availability/quick-search
 * Quick search for available rooms
 * Query params: checkinDate, checkoutDate, numberOfGuests, roomTypeId?
 */
router.get('/quick-search', quickSearch);

/**
 * GET /api/admin/availability/room-types
 * Get all room types for selection
 */
router.get('/room-types', getRoomTypesForSelection);

/**
 * POST /api/admin/availability/walk-in-booking
 * Create walk-in booking directly
 */
router.post('/walk-in-booking', createWalkInBooking);

export default router;
