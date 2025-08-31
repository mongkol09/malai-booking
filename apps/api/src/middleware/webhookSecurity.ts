import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔗 Extend Express Request type for webhook handling
declare global {
  namespace Express {
    interface Request {
      webhookId?: string;
      webhookEvent?: any;
      processingStartTime?: number;
    }
  }
}

// 🔒 Omise Webhook Security Configuration
const OMISE_WEBHOOK_SECRET = process.env.OMISE_WEBHOOK_SECRET || '';
const OMISE_IP_WHITELIST = [
  '52.74.18.96',
  '52.74.21.72', 
  '52.74.17.70',
  '54.169.170.156',
  '54.179.145.16'
]; // Official Omise webhook IPs

// 🛡️ Rate limiting for webhooks (prevent DDoS)
export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max 100 webhooks per minute per IP
  message: {
    error: 'Too many webhook requests',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔐 Verify Omise webhook signature
export const verifyOmiseWebhook = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['authorization'] as string;
    const body = JSON.stringify(req.body);
    
    // 1. Verify signature exists
    if (!signature) {
      res.status(401).json({
        error: 'Missing webhook signature',
        code: 'MISSING_SIGNATURE'
      });
      return;
    }

    // 2. Verify IP whitelist (if enabled)
    if (process.env.OMISE_VERIFY_IP === 'true') {
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!OMISE_IP_WHITELIST.includes(clientIP as string)) {
        res.status(403).json({
          error: 'Unauthorized IP address',
          code: 'IP_NOT_WHITELISTED',
          ip: clientIP
        });
        return;
      }
    }

    // 3. Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', OMISE_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    const providedSignature = signature.replace('Bearer ', '');

    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )) {
      res.status(401).json({
        error: 'Invalid webhook signature',
        code: 'INVALID_SIGNATURE'
      });
      return;
    }

    // 4. Check for replay attacks (webhook timestamp)
    const webhookTimestamp = req.headers['x-omise-timestamp'] as string;
    if (webhookTimestamp) {
      const timestamp = parseInt(webhookTimestamp);
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);

      if (timestamp < fiveMinutesAgo) {
        res.status(401).json({
          error: 'Webhook timestamp too old',
          code: 'TIMESTAMP_TOO_OLD'
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Webhook verification error:', error);
    res.status(500).json({
      error: 'Webhook verification failed',
      code: 'VERIFICATION_ERROR'
    });
  }
};

// 🔄 Idempotency middleware (prevent duplicate processing)
export const ensureIdempotency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const webhookId = req.body?.id;
    const eventType = req.body?.key;

    if (!webhookId) {
      res.status(400).json({
        error: 'Missing webhook ID',
        code: 'MISSING_WEBHOOK_ID'
      });
      return;
    }

    // Check if we've already processed this webhook
    const existingEvent = await (prisma as any).webhookEvent.findUnique({
      where: { webhookId }
    });

    if (existingEvent) {
      // Return success response for already processed webhook
      res.status(200).json({
        message: 'Webhook already processed',
        code: 'ALREADY_PROCESSED',
        webhookId,
        processedAt: existingEvent.createdAt
      });
      return;
    }

    // Create webhook event record for idempotency
    await (prisma as any).webhookEvent.create({
      data: {
        webhookId,
        eventType,
        payload: req.body,
        status: 'PROCESSING',
        receivedAt: new Date()
      }
    });

    // Store webhook ID in request for later use
    req.webhookId = webhookId;
    next();
  } catch (error) {
    console.error('Idempotency check error:', error);
    res.status(500).json({
      error: 'Idempotency check failed',
      code: 'IDEMPOTENCY_ERROR'
    });
  }
};

// 📝 Webhook audit logger
export const logWebhookEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  
  // Override res.json to capture response
  const originalJson = res.json;
  let responseBody: any;
  
  res.json = function(body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Continue to next middleware
  next();

  // Log after response is sent
  res.on('finish', async () => {
    try {
      const processingTime = Date.now() - startTime;
      const webhookId = req.webhookId;

      if (webhookId) {
        await (prisma as any).webhookEvent.update({
          where: { webhookId },
          data: {
            status: res.statusCode < 400 ? 'SUCCESS' : 'FAILED',
            responseCode: res.statusCode,
            responseBody,
            processingTimeMs: processingTime,
            processedAt: new Date()
          }
        });
      }

      // Also log to console for monitoring
      console.log('🔔 Webhook Event:', {
        webhookId,
        eventType: req.body?.key,
        status: res.statusCode < 400 ? 'SUCCESS' : 'FAILED',
        responseCode: res.statusCode,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log webhook event:', error);
    }
  });
};

// 🔍 Webhook health check middleware
export const webhookHealthCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Simple health check for webhook endpoint
  if (req.method === 'GET' && req.path.includes('/webhooks/health')) {
    res.status(200).json({
      status: 'healthy',
      service: 'omise-webhook-handler',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
    return;
  }
  next();
};

// 📊 Export combined middleware stack
export const secureWebhookMiddleware = [
  webhookHealthCheck,
  webhookRateLimit,
  verifyOmiseWebhook,
  ensureIdempotency,
  logWebhookEvent
];

export default {
  webhookRateLimit,
  verifyOmiseWebhook,
  ensureIdempotency,
  logWebhookEvent,
  webhookHealthCheck,
  secureWebhookMiddleware
};
