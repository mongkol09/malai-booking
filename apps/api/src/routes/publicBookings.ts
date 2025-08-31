// ============================================
// PUBLIC BOOKING ROUTES (No Authentication Required)
// ============================================

import express from 'express';
import { 
  searchAvailability, 
  createBookingIntent, 
  confirmBooking 
} from '../controllers/bookingController';

const router = express.Router();

// Public room availability search
router.get('/search', searchAvailability);

// Public booking intent creation (price lock)
router.post('/intent', createBookingIntent);

// Public booking completion
router.post('/complete', confirmBooking);

export default router;
