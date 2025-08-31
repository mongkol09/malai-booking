import { Router } from 'express';
import { 
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendCheckInReminderEmail,
  getEmailQueueStats,
  getEmailStats,
  getTemplateVariables,
  testEmail
} from '../controllers/emailController';

const router = Router();

// ============================================
// EMAIL SENDING ENDPOINTS
// ============================================

/**
 * POST /api/v1/emails/booking-confirmation
 * Send booking confirmation email
 * Body: { bookingId: string, immediate?: boolean }
 */
router.post('/booking-confirmation', sendBookingConfirmationEmail);

/**
 * POST /api/v1/emails/payment-receipt
 * Send payment receipt email
 * Body: { paymentId: string, immediate?: boolean }
 */
router.post('/payment-receipt', sendPaymentReceiptEmail);

/**
 * POST /api/v1/emails/checkin-reminder
 * Send check-in reminder email
 * Body: { bookingId: string, daysUntilCheckin?: number, immediate?: boolean }
 */
router.post('/checkin-reminder', sendCheckInReminderEmail);

/**
 * POST /api/v1/emails/test
 * Send test email for development/debugging
 * Body: { to: string, emailType: string, testData?: object }
 */
router.post('/test', testEmail);

// ============================================
// ANALYTICS & MONITORING ENDPOINTS
// ============================================

/**
 * GET /api/v1/emails/queue/stats
 * Get email queue statistics
 */
router.get('/queue/stats', getEmailQueueStats);

/**
 * GET /api/v1/emails/stats
 * Get email sending statistics
 * Query: { from?: string, to?: string }
 */
router.get('/stats', getEmailStats);

// ============================================
// TEMPLATE MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/v1/emails/templates/variables/:emailType
 * Get available template variables for specific email type
 * Params: { emailType: 'BOOKING_CONFIRMATION' | 'PAYMENT_RECEIPT' | 'CHECKIN_REMINDER' }
 */
router.get('/templates/variables/:emailType', getTemplateVariables);

export default router;
