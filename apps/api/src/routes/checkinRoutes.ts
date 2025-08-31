import { Router } from 'express';
import { 
  getBookingsForCheckin,
  getAvailableRooms,
  performCheckin,
  assignRoom,
  getCheckinDashboard
} from '../controllers/simpleCheckinController';
import { validateApiKey } from '../middleware/validateApiKey';

const router = Router();

// Apply authentication middleware to all routes
router.use(validateApiKey);

// ============================================
// CHECK-IN SYSTEM ROUTES
// ============================================

/**
 * @route GET /api/checkin/dashboard
 * @desc Get check-in dashboard overview
 * @access Private (Admin)
 */
router.get('/dashboard', getCheckinDashboard);

/**
 * @route GET /api/checkin/bookings
 * @desc Get bookings ready for check-in
 * @query date - Date to check (optional, defaults to today)
 * @access Private (Admin)
 */
router.get('/bookings', getBookingsForCheckin);

/**
 * @route GET /api/checkin/rooms/available
 * @desc Get available rooms for assignment
 * @query roomTypeId - Filter by room type (optional)
 * @query checkinDate - Check-in date (optional)
 * @query checkoutDate - Check-out date (optional)
 * @access Private (Admin)
 */
router.get('/rooms/available', getAvailableRooms);

/**
 * @route POST /api/checkin/:bookingId
 * @desc Perform check-in for a booking
 * @param bookingId - The ID of the booking to check in
 * @body roomId - Room ID (optional, uses booked room if not provided)
 * @body checkinNotes - Notes for check-in (optional)
 * @body paymentAmount - Payment amount (optional)
 * @body paymentMethod - Payment method (optional, defaults to Cash)
 * @body assignedBy - Staff member performing check-in (optional)
 * @access Private (Admin)
 */
router.post('/:bookingId', performCheckin);

/**
 * @route PUT /api/checkin/:bookingId/assign-room
 * @desc Assign or change room for a booking
 * @param bookingId - The ID of the booking
 * @body roomId - New room ID
 * @body reason - Reason for room change (optional)
 * @access Private (Admin)
 */
router.put('/:bookingId/assign-room', assignRoom);

export default router;
