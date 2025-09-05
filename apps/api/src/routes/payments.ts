/**
 * Payment Routes
 * ==============
 * 
 * Routes สำหรับจัดการการชำระเงินผ่าน Omise
 * มีความปลอดภัยสูง พร้อม Rate Limiting และ Validation
 */

import express from 'express';
import { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { 
  createCharge, 
  handleOmiseWebhook, 
  getPayment, 
  getWebhookEvents, 
  verifyPayment 
} from '../controllers/paymentController';

const router = express.Router();

// ============================================
// RATE LIMITING
// ============================================

// Rate limit สำหรับ payment creation
const paymentCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    message: 'Too many payment attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit สำหรับ webhook
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 webhooks per minute
  message: {
    success: false,
    message: 'Too many webhook requests.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

const validatePaymentRequest = [
  body('bookingId').isUUID().withMessage('Invalid booking ID format'),
  body('omiseToken').isString().isLength({ min: 1 }).withMessage('Omise token is required'),
  body('customerEmail').optional().isEmail().withMessage('Invalid email format'),
  validateRequest
];

const validateWebhook = [
  body('id').isString().isLength({ min: 1 }).withMessage('Webhook ID is required'),
  body('type').isString().isLength({ min: 1 }).withMessage('Webhook type is required'),
  body('data').isObject().withMessage('Webhook data is required'),
  validateRequest
];

const validatePaymentId = [
  param('id').isUUID().withMessage('Invalid payment ID format'),
  validateRequest
];

const validateRefundRequest = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('reason').isString().isLength({ min: 1, max: 500 }).withMessage('Reason is required and must be less than 500 characters'),
  body('method').isIn(['original_payment', 'credit_note', 'bank_transfer', 'cash']).withMessage('Invalid refund method'),
  validateRequest
];

// ============================================
// PAYMENT ROUTES
// ============================================

/**
 * POST /api/v1/payments/charge
 * สร้าง payment charge ใหม่
 * Rate limited และต้องมี authentication
 */
router.post('/charge', 
  paymentCreationLimiter,
  authenticateToken,
  validatePaymentRequest,
  createCharge
);

/**
 * POST /api/v1/payments/refund
 * สร้าง refund สำหรับ payment
 * Admin only
 */
router.post('/refund',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  validateRefundRequest,
  async (req: Request, res: Response) => {
    // TODO: Implement refund logic
    res.status(501).json({
      success: false,
      message: 'Refund functionality not yet implemented'
    });
  }
);

/**
 * GET /api/v1/payments/:id
 * ดึงข้อมูล payment ตาม ID
 * Admin หรือ owner ของ payment เท่านั้น
 */
router.get('/:id',
  authenticateToken,
  validatePaymentId,
  getPayment
);

/**
 * GET /api/v1/payments
 * ดึงรายการ payments (Admin only)
 */
router.get('/',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED', 'REVERSED', 'CANCELLED']).withMessage('Invalid status'),
    validateRequest
  ],
  async (req: Request, res: Response) => {
    // TODO: Implement payment listing with pagination and filtering
    res.status(501).json({
      success: false,
      message: 'Payment listing not yet implemented'
    });
  }
);

/**
 * POST /api/v1/payments/:id/verify
 * ตรวจสอบ payment status กับ Omise
 * Admin only
 */
router.post('/:id/verify',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  validatePaymentId,
  verifyPayment
);

// ============================================
// WEBHOOK ROUTES
// ============================================

/**
 * POST /api/v1/webhooks/omise
 * รับ webhook จาก Omise
 * ไม่ต้องมี authentication แต่ต้องมี signature verification
 */
router.post('/webhooks/omise',
  webhookLimiter,
  validateWebhook,
  handleOmiseWebhook
);

/**
 * GET /api/v1/webhooks/events
 * ดึงรายการ webhook events (Admin only)
 */
router.get('/webhooks/events',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('processed').optional().isBoolean().withMessage('Processed must be boolean'),
    validateRequest
  ],
  getWebhookEvents
);

// ============================================
// PAYMENT STATUS ROUTES
// ============================================

/**
 * GET /api/v1/payments/status/:bookingId
 * ดึง payment status สำหรับ booking
 * Guest หรือ Admin เท่านั้น
 */
router.get('/status/:bookingId',
  authenticateToken,
  [
    param('bookingId').isUUID().withMessage('Invalid booking ID format'),
    validateRequest
  ],
  async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;
      
      // TODO: Implement payment status retrieval
      res.status(501).json({
        success: false,
        message: 'Payment status retrieval not yet implemented'
      });
    } catch (error) {
      console.error('Payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment status'
      });
    }
  }
);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler สำหรับ payment routes
router.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Payment route not found'
  });
});

export default router;
