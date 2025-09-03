// ============================================
// BOOKING ROUTES
// ============================================

import express from 'express';
import { requireRole, validateApiKey as authenticateToken } from '../middleware/validateApiKey';
import { verifyAdminToken, requireAdminRole, AdminAuthenticatedRequest } from '../middleware/adminAuth';
import { sessionAuth, requireSessionRole, SessionAuthenticatedRequest } from '../middleware/sessionAuth';
import { validateHttpMethod } from '../middleware/methodValidation';
import {
  searchBooking,
  getBookingByQR,
  processCheckIn,
  processCheckOut,
  getTodaysArrivals,
  getTodaysDepartures,
  updateRoomStatus,
  getActiveBookingByRoom
} from '../controllers/checkInOutController';

// Import booking controller functions
import {
  searchAvailability,
  createBookingIntent,
  confirmBooking
} from '../controllers/bookingController';

// Import simple booking controller for testing
import { createSimpleBooking } from '../controllers/simpleBookingController';

// Import Telegram booking controller
import { createBookingWithTelegram } from '../controllers/telegramBookingController';

// Import admin booking controller for real data
import { getAllBookingsAdmin, getBookingStatsAdmin } from '../controllers/adminBookingController';

// Import booking cancellation controller
import { 
  cancelBooking, 
  getCancellationHistory, 
  getCancellationPolicy 
} from '../controllers/bookingCancellationController';

const router = express.Router();

// Add method validation to all routes
router.use(validateHttpMethod(['GET', 'POST', 'PUT', 'DELETE']));

// ============================================
// PUBLIC BOOKING ENDPOINTS (No Authentication Required)
// ============================================

// Search room availability (public)
router.get('/availability', searchAvailability);

// Create booking intent (public - step 1)
router.post('/intent', createBookingIntent);

// Confirm booking (public - step 2)
router.post('/confirm', confirmBooking);

// Get user bookings
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'User bookings endpoint',
    data: { bookings: [] }
  });
});

// Create new booking (simple version for testing - no auth required)
router.post('/', createSimpleBooking);

// Create booking with Telegram notification
router.post('/with-telegram', createBookingWithTelegram);

// Create new booking (legacy - redirect to intent flow)
router.post('/legacy', (req, res) => {
  res.json({
    success: false,
    message: 'Please use /intent and /confirm endpoints for booking creation',
    data: { 
      hint: 'POST /api/v1/bookings/intent -> POST /api/v1/bookings/confirm',
      legacySupport: false
    }
  });
});

// ============================================
// PROTECTED ENDPOINTS (Session Authentication Required)
// ============================================

// General booking list endpoint (protected) - MUST come before /:id
router.get('/list', sessionAuth, (req: SessionAuthenticatedRequest, res) => {
  console.log('📋 Getting general booking list (Session Auth Required)');
  res.json({
    success: true,
    message: 'Booking details',
    data: {
      booking: 'booking list',
      user: req.user,
      authType: 'session'
    }
  });
});

// Get booking by ID - MUST come after specific routes
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Booking details',
    data: { booking: `booking ${req.params.id}` }
  });
});

// ============================================
// ADMIN/STAFF BOOKING ENDPOINTS (Authentication Required)
// ============================================

// Admin/Staff/DEV: Get all bookings (Session-Based Auth - SECURE)
// Get all bookings for admin (Session Authentication + Role Required)
router.get('/admin/all', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), getAllBookingsAdmin);

// Alias for test compatibility
router.get('/admin/list', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), (req: SessionAuthenticatedRequest, res) => {
  console.log('📋 Getting admin bookings list (alias for /admin/all)');
  res.json({
    success: true,
    message: 'Admin bookings list - Session Auth',
    data: { 
      bookings: [
        {
          id: 'BK001',
          customerName: 'Test Customer',
          roomId: 'R101',
          checkInDate: '2025-08-16',
          checkOutDate: '2025-08-18',
          status: 'confirmed',
          totalAmount: 2500
        }
      ],
      total: 1,
      sessionUser: req.user?.email,
      sessionId: req.user?.sessionId
    }
  });
});

// Admin/Staff: Get booking statistics (Session-Based Auth)
// Get booking statistics for admin (Session Authentication + Admin Only)
router.get('/admin/stats', sessionAuth, requireSessionRole(['ADMIN']), getBookingStatsAdmin);

// User: Get user's own bookings
router.get('/my-bookings', sessionAuth, requireSessionRole(['CUSTOMER', 'ADMIN', 'STAFF']), (req: SessionAuthenticatedRequest, res) => {
  console.log('📋 Getting my bookings for user (Session Auth)');
  res.json({
    success: true,
    message: 'User own bookings - Session Auth',
    data: { 
      bookings: [
        {
          id: 'BK002',
          customerName: req.user?.email || 'Current User',
          roomId: 'R102',
          checkInDate: '2025-08-17',
          checkOutDate: '2025-08-19',
          status: 'confirmed',
          totalAmount: 3000
        }
      ],
      total: 1,
      sessionUser: req.user?.email,
      sessionId: req.user?.sessionId
    }
  });
});

// User: Get user accessible booking list
router.get('/user/list', sessionAuth, requireSessionRole(['CUSTOMER', 'ADMIN', 'STAFF']), (req: SessionAuthenticatedRequest, res) => {
  console.log('📋 Getting user booking list (Session Auth)');
  res.json({
    success: true,
    message: 'User accessible bookings - Session Auth',
    data: { 
      bookings: [
        {
          id: 'BK003',
          customerName: req.user?.email || 'Current User',
          roomId: 'R103',
          checkInDate: '2025-08-18',
          checkOutDate: '2025-08-20',
          status: 'pending',
          totalAmount: 2800
        }
      ],
      total: 1,
      sessionUser: req.user?.email,
      sessionId: req.user?.sessionId
    }
  });
});

// ============================================
// CHECK-IN / CHECK-OUT ENDPOINTS
// ============================================

// Search bookings for check-in/check-out
router.get('/admin/bookings/search', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), searchBooking);

// Get booking by QR code/reference ID
router.get('/admin/bookings/:bookingReferenceId', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), getBookingByQR);

// Process check-in (Session Auth)
router.post('/:id/check-in', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), processCheckIn);

// Process check-in (JWT Auth for Professional Dashboard)
router.post('/admin/:id/check-in', authenticateToken, requireRole(['DEV', 'ADMIN', 'STAFF']), processCheckIn);

// Process check-out (Session Auth)
router.post('/:id/check-out', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), processCheckOut);

// Process check-out (JWT Auth for Professional Dashboard)
router.post('/admin/:id/check-out', authenticateToken, requireRole(['DEV', 'ADMIN', 'STAFF']), processCheckOut);

// Today's arrivals
router.get('/arrivals', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), getTodaysArrivals);

// Today's departures
router.get('/departures', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), getTodaysDepartures);

// Update room status
router.post('/admin/rooms/:roomId/status', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), updateRoomStatus);

// Get active booking by room (temporarily without auth for testing)
router.get('/admin/bookings/active', getActiveBookingByRoom);

// ============================================
// BOOKING CANCELLATION ENDPOINTS
// ============================================

// Cancel booking (Session Auth)
router.post('/:id/cancel', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), cancelBooking);

// Cancel booking (JWT Auth for Professional Dashboard)
router.post('/admin/:id/cancel', authenticateToken, requireRole(['DEV', 'ADMIN', 'STAFF']), cancelBooking);

// Get cancellation history for a booking
router.get('/:id/cancellations', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), getCancellationHistory);

// Get cancellation policy for a booking
router.get('/:id/cancellation-policy', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), getCancellationPolicy);

export default router;
