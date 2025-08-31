// ============================================
// FINANCIAL ROUTES - FOLIOS, TRANSACTIONS & INVOICES
// ============================================

import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
// import { authenticateToken, requireRole } from '../utils/auth';
import {
  createFolio,
  getFolios,
  getFolioById,
  createTransaction,
  getTransactions,
  createInvoice,
  getInvoices,
  processPayment,
} from '../controllers/financialController';

const router = Router();

// Apply middleware placeholder (will fix auth imports later)
// router.use(authenticateToken);

// ============================================
// FOLIO ROUTES
// ============================================

// GET /api/v1/financial/folios - Get all folios
router.get('/folios',
  [
    query('bookingId').optional().isUUID().withMessage('Invalid booking ID'),
    query('status').optional().isIn(['OPEN', 'CLOSED', 'SETTLED']).withMessage('Invalid status'),
  ],
  validateRequest,
  getFolios
);

// GET /api/v1/financial/folios/:id - Get folio by ID
router.get('/folios/:id',
  [
    param('id').isUUID().withMessage('Invalid folio ID'),
  ],
  validateRequest,
  getFolioById
);

// POST /api/v1/financial/folios - Create new folio
router.post('/folios',
  [
    body('bookingId').isUUID().withMessage('Valid booking ID is required'),
    body('status').optional().isIn(['OPEN', 'CLOSED', 'SETTLED']).withMessage('Invalid status'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'FRONT_DESK']),
  createFolio
);

// ============================================
// TRANSACTION ROUTES
// ============================================

// GET /api/v1/financial/transactions - Get all transactions
router.get('/transactions',
  [
    query('folioId').optional().isUUID().withMessage('Invalid folio ID'),
    query('transactionType').optional().isIn(['CHARGE', 'PAYMENT', 'CREDIT', 'ADJUSTMENT']).withMessage('Invalid transaction type'),
    query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
    query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validateRequest,
  getTransactions
);

// POST /api/v1/financial/transactions - Create new transaction
router.post('/transactions',
  [
    body('folioId').isUUID().withMessage('Valid folio ID is required'),
    body('transactionType').isIn(['CHARGE', 'PAYMENT', 'CREDIT', 'ADJUSTMENT']).withMessage('Valid transaction type is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('referenceNumber').optional().isString().withMessage('Reference number must be a string'),
    body('paymentMethodId').optional().isUUID().withMessage('Invalid payment method ID'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'FRONT_DESK', 'CASHIER']),
  createTransaction
);

// ============================================
// INVOICE ROUTES
// ============================================

// GET /api/v1/financial/invoices - Get all invoices
router.get('/invoices',
  [
    query('folioId').optional().isUUID().withMessage('Invalid folio ID'),
    query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
    query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validateRequest,
  getInvoices
);

// POST /api/v1/financial/invoices - Create new invoice
router.post('/invoices',
  [
    body('folioId').isUUID().withMessage('Valid folio ID is required'),
    body('dueDate').optional().isISO8601().withMessage('Valid due date format'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'FRONT_DESK', 'ACCOUNTING']),
  createInvoice
);

// ============================================
// PAYMENT ROUTES
// ============================================

// POST /api/v1/financial/payments - Process payment
router.post('/payments',
  [
    body('folioId').isUUID().withMessage('Valid folio ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('paymentMethodId').isUUID().withMessage('Valid payment method ID is required'),
    body('referenceNumber').optional().isString().withMessage('Reference number must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'FRONT_DESK', 'CASHIER']),
  processPayment
);

// ============================================
// ANALYTICS & REPORTING ROUTES
// ============================================

// GET /api/v1/financial/reports/revenue - Get revenue report
router.get('/reports/revenue',
  [
    query('dateFrom').isISO8601().withMessage('Valid start date is required'),
    query('dateTo').isISO8601().withMessage('Valid end date is required'),
    query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Invalid groupBy value'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'MANAGER', 'ACCOUNTING']),
  async (req: Request, res: Response) => {
    // Revenue report implementation
    res.json({
      success: true,
      message: 'Revenue report endpoint - to be implemented',
      data: { reportType: 'revenue' },
    });
  }
);

// GET /api/v1/financial/reports/outstanding - Get outstanding balances
router.get('/reports/outstanding',
  [
    query('daysOverdue').optional().isInt({ min: 0 }).withMessage('Days overdue must be a positive integer'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'MANAGER', 'ACCOUNTING']),
  async (req: Request, res: Response) => {
    // Outstanding balances report implementation
    res.json({
      success: true,
      message: 'Outstanding balances report endpoint - to be implemented',
      data: { reportType: 'outstanding' },
    });
  }
);

// GET /api/v1/financial/reports/payment-methods - Get payment methods analysis
router.get('/reports/payment-methods',
  [
    query('dateFrom').isISO8601().withMessage('Valid start date is required'),
    query('dateTo').isISO8601().withMessage('Valid end date is required'),
  ],
  validateRequest,
  // requireRole(['ADMIN', 'MANAGER', 'ACCOUNTING']),
  async (req: Request, res: Response) => {
    // Payment methods analysis implementation
    res.json({
      success: true,
      message: 'Payment methods analysis endpoint - to be implemented',
      data: { reportType: 'payment-methods' },
    });
  }
);

export default router;
