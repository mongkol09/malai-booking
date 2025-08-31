// ============================================
// DYNAMIC PRICING ROUTES
// ============================================

import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createPricingRule,
  getPricingRules,
  calculateDynamicPrice,
  updatePricingRule,
  deletePricingRule,
} from '../controllers/pricingController';
import {
  calculateAdvancedPricing,
  bulkCreatePricingRules,
  getPricingAnalytics
} from '../controllers/advancedPricingController';
import {
  seedPricingRules,
  previewPricingRulesApplication
} from '../controllers/pricingRulesSeeder';
import { validateRequest } from '../middleware/validateRequest';
import { requireRole } from '../middleware/validateApiKey';

const router = express.Router();

// ============================================
// VALIDATION RULES
// ============================================

const createRuleValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Rule name must be between 3 and 100 characters'),
  body('priority')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Priority must be between 1 and 1000'),
  body('conditions')
    .isObject()
    .withMessage('Conditions must be a valid JSON object'),
  body('action')
    .isObject()
    .withMessage('Action must be a valid JSON object'),
  body('roomTypes')
    .optional()
    .isArray()
    .withMessage('Room types must be an array'),
];

const calculatePriceValidation = [
  body('roomTypeId')
    .isUUID()
    .withMessage('Room type ID must be a valid UUID'),
  body('checkInDate')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  body('checkOutDate')
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
  body('leadTimeDays')
    .isInt({ min: 0 })
    .withMessage('Lead time days must be a positive number'),
];

// ============================================
// ROUTES
// ============================================

/**
 * @route   POST /api/v1/pricing/rules
 * @desc    Create a new pricing rule
 * @access  Admin only
 */
router.post('/rules', 
  // requireRole(['ADMIN']), // Temporarily disabled for frontend development
  createRuleValidation, 
  validateRequest, 
  createPricingRule
);

/**
 * @route   GET /api/v1/pricing/rules
 * @desc    Get all pricing rules
 * @access  Public (for viewing active rules)
 */
router.get('/rules', 
  getPricingRules
);

/**
 * @route   POST /api/v1/pricing/calculate
 * @desc    Calculate dynamic price for room booking
 * @access  Public (for customer booking flow)
 */
router.post('/calculate', 
  calculatePriceValidation, 
  validateRequest, 
  calculateDynamicPrice
);

/**
 * @route   PUT /api/v1/pricing/rules/:id
 * @desc    Update a pricing rule
 * @access  Admin only
 */
router.put('/rules/:id', 
  // requireRole(['ADMIN']), // Temporarily disabled for frontend development
  param('id').isUUID().withMessage('Rule ID must be a valid UUID'),
  validateRequest,
  updatePricingRule
);

/**
 * @route   DELETE /api/v1/pricing/rules/:id
 * @desc    Delete a pricing rule
 * @access  Admin only
 */
router.delete('/rules/:id', 
  // requireRole(['ADMIN']), // Temporarily disabled for frontend development
  param('id').isUUID().withMessage('Rule ID must be a valid UUID'),
  validateRequest,
  deletePricingRule
);

// ============================================
// ADVANCED PRICING ENDPOINTS
// ============================================

// POST /api/v1/pricing/calculate-advanced - Advanced pricing calculation with rules engine
router.post('/calculate-advanced',
  [
    body('roomTypeId').isUUID().withMessage('Valid room type ID is required'),
    body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
    body('checkOutDate').isISO8601().withMessage('Valid check-out date is required'),
    body('numberOfGuests').optional().isInt({ min: 1 }).withMessage('Number of guests must be positive'),
    body('leadTimeDays').optional().isInt({ min: 0 }).withMessage('Lead time must be non-negative'),
  ],
  validateRequest,
  calculateAdvancedPricing
);

// POST /api/v1/pricing/rules/bulk - Bulk create pricing rules
router.post('/rules/bulk',
  [
    body('rules').isArray().withMessage('Rules must be an array'),
    body('rules.*.name').notEmpty().withMessage('Rule name is required'),
    body('rules.*.priority').isInt({ min: 1 }).withMessage('Priority must be positive integer'),
    body('rules.*.conditions').isObject().withMessage('Conditions must be an object'),
    body('rules.*.action').isObject().withMessage('Action must be an object'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'MANAGER']),
  bulkCreatePricingRules
);

// GET /api/v1/pricing/analytics - Pricing analytics and insights
router.get('/analytics',
  [
    query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
    query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
    query('roomTypeId').optional().isUUID().withMessage('Invalid room type ID'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'MANAGER', 'REVENUE_MANAGER']),
  getPricingAnalytics
);

// ============================================
// PRICING RULES MANAGEMENT
// ============================================

// POST /api/v1/pricing/seed-rules - Seed default pricing rules
router.post('/seed-rules',
  [
    body('resetRules').optional().isBoolean().withMessage('Reset rules must be boolean'),
  ],
  validateRequest,
  // requireRole(['ADMIN']),
  seedPricingRules
);

// POST /api/v1/pricing/preview-rules - Preview pricing rules application
router.post('/preview-rules',
  [
    body('roomTypeId').isUUID().withMessage('Valid room type ID is required'),
    body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
    body('checkOutDate').isISO8601().withMessage('Valid check-out date is required'),
    body('simulateOccupancy').optional().isFloat({ min: 0, max: 100 }).withMessage('Occupancy must be 0-100'),
    body('simulateLeadTime').optional().isInt({ min: 0 }).withMessage('Lead time must be non-negative'),
  ],
  validateRequest,
  previewPricingRulesApplication
);

export default router;
