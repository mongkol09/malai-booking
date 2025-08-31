import express from 'express';
import { body, param } from 'express-validator';
import { validateSimpleApiKey } from '../middleware/simpleApiKey';
import {
  createEmergencyOverride,
  createQuickEventOverride,
  getActiveOverrides,
  updateOverrideRule,
  removeOverride,
  getOverrideTemplates
} from '../controllers/manualOverrideController';

const router = express.Router();

// ============================================
// MANUAL OVERRIDE ROUTES
// ============================================

/**
 * GET /api/v1/override/templates
 * ดูเทมเพลต Override ที่ใช้บ่อย
 */
router.get('/templates', validateSimpleApiKey, getOverrideTemplates);

/**
 * GET /api/v1/override/active
 * ดู Override Rules ที่กำลังทำงาน
 */
router.get('/active', validateSimpleApiKey, getActiveOverrides);

/**
 * POST /api/v1/override/emergency
 * สร้าง Emergency Override Rule ทันที
 */
router.post('/emergency', [
  validateSimpleApiKey,
  body('eventTitle')
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Event title must be between 3 and 255 characters'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('category')
    .isIn(['EMERGENCY_HOLIDAY', 'SURPRISE_EVENT', 'CRISIS_MANAGEMENT', 'LAST_MINUTE_OPPORTUNITY'])
    .withMessage('Invalid category'),
  
  body('pricingStrategy')
    .isIn(['INCREASE', 'DECREASE', 'BLOCK_BOOKINGS', 'CUSTOM'])
    .withMessage('Invalid pricing strategy'),
  
  body('pricingValue')
    .optional()
    .isNumeric()
    .withMessage('Pricing value must be a number')
    .custom((value) => {
      if (value < 0 || value > 100) {
        throw new Error('Pricing value must be between 0 and 100');
      }
      return true;
    }),
  
  body('targetRoomTypes')
    .optional()
    .isArray()
    .withMessage('Target room types must be an array'),
  
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  body('urgencyLevel')
    .isIn(['HIGH', 'CRITICAL'])
    .withMessage('Urgency level must be HIGH or CRITICAL'),
  
  body('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Staff ID must be a valid UUID')
    
], createEmergencyOverride);

/**
 * POST /api/v1/override/quick-event
 * สร้าง Event + Override Rule ในขั้นตอนเดียว (ใช้ validation เดียวกับ emergency)
 */
router.post('/quick-event', [
  validateSimpleApiKey,
  body('eventTitle').notEmpty().withMessage('Event title is required'),
  body('startDate').notEmpty().isISO8601().withMessage('Start date is required and must be valid'),
  body('endDate').notEmpty().isISO8601().withMessage('End date is required and must be valid'),
  body('category').isIn(['EMERGENCY_HOLIDAY', 'SURPRISE_EVENT', 'CRISIS_MANAGEMENT', 'LAST_MINUTE_OPPORTUNITY']),
  body('pricingStrategy').isIn(['INCREASE', 'DECREASE', 'BLOCK_BOOKINGS', 'CUSTOM']),
  body('reason').notEmpty().isLength({ min: 10, max: 500 }),
  body('urgencyLevel').isIn(['HIGH', 'CRITICAL']),
  body('staffId').notEmpty().isUUID()
], createQuickEventOverride);

/**
 * PUT /api/v1/override/:ruleId
 * แก้ไข Override Rule
 */
router.put('/:ruleId', [
  validateSimpleApiKey,
  param('ruleId')
    .isUUID()
    .withMessage('Rule ID must be a valid UUID'),
  
  body('eventTitle')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Event title must be between 3 and 255 characters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  body('pricingStrategy')
    .optional()
    .isIn(['INCREASE', 'DECREASE', 'BLOCK_BOOKINGS', 'CUSTOM'])
    .withMessage('Invalid pricing strategy'),
  
  body('pricingValue')
    .optional()
    .isNumeric()
    .withMessage('Pricing value must be a number'),
  
  body('reason')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
    
], updateOverrideRule);

/**
 * DELETE /api/v1/override/:ruleId
 * ยกเลิก Override Rule
 */
router.delete('/:ruleId', [
  validateSimpleApiKey,
  param('ruleId')
    .isUUID()
    .withMessage('Rule ID must be a valid UUID'),
  
  body('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),
  
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
    
], removeOverride);

export default router;
