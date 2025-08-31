import { Router } from 'express';
import { PaymentVerificationController } from '../controllers/paymentVerificationController';
import { secureWebhookMiddleware } from '../middleware/webhookSecurity';
import { validateApiKey } from '../middleware/validateApiKey';

const router = Router();

// 🏥 Health check for payment system (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'payment-verification',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'POST /webhooks/omise - Process Omise webhooks',
      'GET /:paymentId/verify - Verify payment with Omise',
      'GET /:paymentId/audit-trail - Get payment audit trail',
      'GET /webhooks/stats - Get webhook statistics'
    ]
  });
});

// 🔐 Secure webhook endpoint (public but secured with middleware)
router.post(
  '/webhooks/omise',
  secureWebhookMiddleware, // This includes rate limiting, signature verification, idempotency
  PaymentVerificationController.processOmiseWebhook
);

// 🔍 Payment verification endpoints (require API key)
router.use(validateApiKey); // All routes below require authentication

// Verify specific payment against Omise
router.get(
  '/:paymentId/verify',
  PaymentVerificationController.verifyPaymentWithOmise
);

// Get complete audit trail for payment
router.get(
  '/:paymentId/audit-trail',
  PaymentVerificationController.getPaymentAuditTrail
);

// 📊 Webhook management endpoints
router.get(
  '/webhooks/stats',
  PaymentVerificationController.getWebhookStats
);

export default router;
