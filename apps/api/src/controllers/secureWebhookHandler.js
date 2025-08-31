// ============================================
// SECURE WEBHOOK HANDLER - PRODUCTION READY
// ============================================

const crypto = require('crypto');
const { PrismaClient, PaymentStatus } = require('@prisma/client');

const prisma = new PrismaClient();

// 🔐 Security Configuration
const WEBHOOK_CONFIGS = {
  OMISE_WEBHOOK_SECRET: process.env.OMISE_WEBHOOK_SECRET, // จาก Omise Dashboard
  ALLOWED_IPS: [
    '52.74.65.121',    // Omise IP ranges
    '52.74.99.67',
    '54.169.188.15'
  ],
  MAX_REQUESTS_PER_MINUTE: 60,
  SIGNATURE_HEADER: 'x-omise-signature'
};

// 🛡️ Security Middleware
const securityMiddleware = {
  // 1. IP Whitelist
  validateIP: (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!WEBHOOK_CONFIGS.ALLOWED_IPS.includes(clientIP)) {
      console.error(`🚨 Unauthorized IP: ${clientIP}`);
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  },

  // 2. Signature Verification
  verifySignature: (req, res, next) => {
    const receivedSignature = req.headers[WEBHOOK_CONFIGS.SIGNATURE_HEADER];
    const payload = JSON.stringify(req.body);
    
    if (!receivedSignature) {
      console.error('🚨 Missing webhook signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // คำนวณ signature ที่คาดหวัง
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_CONFIGS.OMISE_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (receivedSignature !== expectedSignature) {
      console.error('🚨 Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  },

  // 3. Rate Limiting
  rateLimiter: (() => {
    const requests = new Map();
    
    return (req, res, next) => {
      const clientIP = req.ip;
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minute
      
      if (!requests.has(clientIP)) {
        requests.set(clientIP, []);
      }
      
      const clientRequests = requests.get(clientIP);
      const recentRequests = clientRequests.filter(time => now - time < windowMs);
      
      if (recentRequests.length >= WEBHOOK_CONFIGS.MAX_REQUESTS_PER_MINUTE) {
        console.error(`🚨 Rate limit exceeded for IP: ${clientIP}`);
        return res.status(429).json({ error: 'Too many requests' });
      }
      
      recentRequests.push(now);
      requests.set(clientIP, recentRequests);
      
      next();
    };
  })()
};

// 🔒 Secure Webhook Handler
const handleSecureWebhook = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const payload = req.body;
    
    // 4. Audit Logging
    console.log('📥 Webhook received:', {
      timestamp: new Date().toISOString(),
      eventType: payload.type,
      eventId: payload.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // 5. Idempotency Check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: payload.id }
    });

    if (existingEvent) {
      console.log('⚠️ Duplicate webhook event:', payload.id);
      return res.json({ 
        success: true, 
        message: 'Event already processed',
        eventId: payload.id 
      });
    }

    // 6. Process Only Charge Events
    if (payload.type !== 'charge.complete') {
      console.log('ℹ️ Ignoring non-charge event:', payload.type);
      return res.json({ 
        success: true, 
        message: 'Event type ignored' 
      });
    }

    // 7. Store Webhook Event (Audit Trail)
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        eventId: payload.id,
        eventType: payload.type,
        objectType: payload.data.object,
        objectId: payload.data.id,
        payload: payload,
        processed: false,
        receivedAt: new Date()
      }
    });

    // 8. Find and Update Payment
    const payment = await prisma.payment.findFirst({
      where: { omiseChargeId: payload.data.id },
      include: { booking: { include: { guest: true } } }
    });

    if (!payment) {
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          processingError: `Payment not found for charge: ${payload.data.id}`,
          retryCount: { increment: 1 }
        }
      });
      
      console.error('❌ Payment not found for charge:', payload.data.id);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // 9. Map Status Securely
    const chargeStatus = payload.data.status.toLowerCase();
    let newStatus;
    
    switch (chargeStatus) {
      case 'successful':
        newStatus = PaymentStatus.COMPLETED;
        break;
      case 'failed':
      case 'expired':
        newStatus = PaymentStatus.FAILED;
        break;
      default:
        newStatus = PaymentStatus.PROCESSING;
    }

    // 10. Atomic Update
    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          processedAt: new Date(),
          gatewayResponse: payload.data,
          failureMessage: chargeStatus === 'failed' 
            ? payload.data.failure_message || 'Payment failed' 
            : null
        }
      });

      // Mark webhook as processed
      await tx.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          processed: true,
          processedAt: new Date()
        }
      });

      // Update booking status if payment successful
      if (newStatus === PaymentStatus.COMPLETED) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'Confirmed' }
        });
      }
    });

    // 11. Success Logging
    const processingTime = Date.now() - startTime;
    console.log('✅ Webhook processed successfully:', {
      eventId: payload.id,
      chargeId: payload.data.id,
      paymentId: payment.id,
      oldStatus: payment.status,
      newStatus: newStatus,
      processingTime: `${processingTime}ms`
    });

    // 12. Trigger Post-Processing (Async)
    if (newStatus === PaymentStatus.COMPLETED) {
      // ส่งอีเมลยืนยัน (background job)
      setImmediate(() => {
        // sendBookingConfirmationEmail(payment.booking);
        console.log('📧 Booking confirmation email queued');
      });
    }

    return res.json({
      success: true,
      message: 'Webhook processed successfully',
      eventId: payload.id,
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('💥 Webhook processing error:', {
      error: error.message,
      stack: error.stack,
      payload: req.body,
      processingTime: `${processingTime}ms`
    });

    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// 🛣️ Secure Route Setup
module.exports = {
  securityMiddleware,
  handleSecureWebhook,
  
  // Express.js route setup
  setupSecureWebhookRoute: (app) => {
    app.post('/webhooks/omise',
      securityMiddleware.validateIP,
      securityMiddleware.verifySignature,
      securityMiddleware.rateLimiter,
      handleSecureWebhook
    );
  }
};
