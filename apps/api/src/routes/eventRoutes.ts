import express from 'express';
import { body } from 'express-validator';
import {
  getPendingEvents,
  aggregateExternalEvents,
  getEventAnalytics,
  createManualEvent
} from '../controllers/eventManagementController';

const router = express.Router();

// ============================================
// EVENT MANAGEMENT ROUTES
// ============================================

/**
 * GET /api/events/strategic/pending
 * ดึงรายการ events ที่รอการอนุมัติ
 * Query params: page, limit, category, source
 */
router.get('/strategic/pending', getPendingEvents);

/**
 * GET /api/events/strategic/analytics
 * ดูสถิติ event management
 * Query params: period (7d, 30d, 90d)
 */
router.get('/strategic/analytics', getEventAnalytics);

/**
 * POST /api/events/strategic/aggregate
 * รวบรวม events จากแหล่งข้อมูลภายนอก
 * Body: { sources: ['GOOGLE_CALENDAR', 'TICKETMASTER_API'] }
 */
router.post('/strategic/aggregate', [
  body('sources')
    .optional()
    .isArray()
    .withMessage('Sources must be an array'),
  body('sources.*')
    .isIn(['GOOGLE_CALENDAR', 'TICKETMASTER_API', 'MANUAL'])
    .withMessage('Invalid source type')
], aggregateExternalEvents);

/**
 * POST /api/events/strategic/manual
 * สร้าง event ด้วยตนเอง
 */
router.post('/strategic/manual', [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Location must not exceed 255 characters'),
  body('affectsPricing')
    .optional()
    .isBoolean()
    .withMessage('Affects pricing must be a boolean'),
  body('createdBy')
    .optional()
    .isUUID()
    .withMessage('Created by must be a valid UUID')
], createManualEvent);

export default router;
