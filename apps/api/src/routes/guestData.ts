import express from 'express';
import { validateApiKey } from '../middleware/validateApiKey';
import { sessionAuth, requireSessionRole } from '../middleware/sessionAuth';
import { updateGuestData, getGuestDataStatus } from '../controllers/guestDataController';

const router = express.Router();

// Apply API key validation to all routes
router.use(validateApiKey);

// Apply session authentication for admin operations
router.use(sessionAuth);
router.use(requireSessionRole(['DEV', 'ADMIN', 'STAFF']));

// Update guest data for a booking
router.put('/bookings/:bookingId/guest-data', updateGuestData);

// Get guest data completion status
router.get('/bookings/:bookingId/guest-data/status', getGuestDataStatus);

export default router;
