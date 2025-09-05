import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

/**
 * Payment Security Middleware
 * เสริมความปลอดภัยระบบ Payment และป้องกัน Fraud
 */

// Store for tracking payment attempts
const paymentAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of paymentAttempts.entries()) {
    if (value.blockedUntil && now > value.blockedUntil) {
      paymentAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Payment validation middleware
export const validatePaymentRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { amount, currency, paymentMethod, bookingId } = req.body;

    // Validate required fields
    if (!amount || !currency || !paymentMethod || !bookingId) {
      throw new AppError('Missing required payment fields', 400, {
        code: 'MISSING_PAYMENT_FIELDS',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0 || amount > 1000000) {
      throw new AppError('Invalid payment amount', 400, {
        code: 'INVALID_AMOUNT',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Validate currency
    const allowedCurrencies = ['THB', 'USD', 'EUR'];
    if (!allowedCurrencies.includes(currency)) {
      throw new AppError('Unsupported currency', 400, {
        code: 'UNSUPPORTED_CURRENCY',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Validate payment method
    const allowedMethods = ['credit_card', 'debit_card', 'bank_transfer', 'cash'];
    if (!allowedMethods.includes(paymentMethod)) {
      throw new AppError('Unsupported payment method', 400, {
        code: 'UNSUPPORTED_PAYMENT_METHOD',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Validate booking ID format
    if (!isValidUUID(bookingId)) {
      throw new AppError('Invalid booking ID format', 400, {
        code: 'INVALID_BOOKING_ID',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    next();

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Payment validation error:', error);
    throw new AppError('Payment validation failed', 400, {
      code: 'PAYMENT_VALIDATION_ERROR',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

// Fraud detection middleware
export const fraudDetection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, bookingId } = req.body;
    const userId = (req as any).user?.id;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');

    // Check for suspicious patterns
    const fraudScore = await calculateFraudScore({
      userId,
      amount,
      bookingId,
      ip,
      userAgent,
      timestamp: new Date()
    });

    if (fraudScore > 0.8) {
      console.warn(`🚨 High fraud score detected: ${fraudScore}`, {
        userId,
        amount,
        bookingId,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      });

      throw new AppError('Payment flagged for review', 400, {
        code: 'FRAUD_DETECTED',
        fraudScore,
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    if (fraudScore > 0.5) {
      console.warn(`⚠️ Medium fraud score detected: ${fraudScore}`, {
        userId,
        amount,
        bookingId,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      });
    }

    // Attach fraud score to request for logging
    (req as any).fraudScore = fraudScore;

    next();

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Fraud detection error:', error);
    throw new AppError('Fraud detection failed', 500, {
      code: 'FRAUD_DETECTION_ERROR',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

// Payment rate limiting
export const paymentRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const userId = (req as any).user?.id;
  const ip = req.ip;
  const key = userId ? `user_${userId}` : `ip_${ip}`;
  
  const attempts = paymentAttempts.get(key) || { count: 0, lastAttempt: 0 };
  const now = Date.now();

  // Check if blocked
  if (attempts.blockedUntil && now < attempts.blockedUntil) {
    const blockTime = Math.ceil((attempts.blockedUntil - now) / 1000 / 60);
    
    throw new AppError('Payment attempts temporarily blocked', 429, {
      code: 'PAYMENT_BLOCKED',
      blockMinutes: blockTime,
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;

  // Block after 5 attempts in 1 hour
  if (attempts.count >= 5) {
    attempts.blockedUntil = now + (60 * 60 * 1000); // 1 hour
    console.warn(`🚨 Payment blocked due to too many attempts`, {
      key,
      attempts: attempts.count,
      blockedUntil: new Date(attempts.blockedUntil).toISOString()
    });
  }

  paymentAttempts.set(key, attempts);

  next();
};

// Webhook signature verification
export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const signature = req.headers['x-omise-signature'] as string;
    const body = JSON.stringify(req.body);
    const secret = process.env.OMISE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      throw new AppError('Missing webhook signature or secret', 400, {
        code: 'MISSING_WEBHOOK_SIGNATURE',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn(`🚨 Invalid webhook signature`, {
        received: signature,
        expected: expectedSignature,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      throw new AppError('Invalid webhook signature', 400, {
        code: 'INVALID_WEBHOOK_SIGNATURE',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    next();

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Webhook signature verification error:', error);
    throw new AppError('Webhook verification failed', 400, {
      code: 'WEBHOOK_VERIFICATION_ERROR',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

// Payment amount validation
export const validatePaymentAmount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, bookingId } = req.body;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { roomType: true }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, {
        code: 'BOOKING_NOT_FOUND',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Check if booking is already paid (mock for now)
    // if (booking.status === 'Confirmed' && booking.paymentStatus === 'COMPLETED') {
    //   throw new AppError('Booking already paid', 400, {
    //     code: 'ALREADY_PAID',
    //     requestId: req.headers['x-request-id'] || 'unknown'
    //   });
    // }

    // Validate amount matches booking total
    const expectedAmount = parseFloat(booking.totalPrice.toString());
    const tolerance = 0.01; // 1 cent tolerance for floating point

    if (Math.abs(amount - expectedAmount) > tolerance) {
      console.warn(`🚨 Payment amount mismatch`, {
        bookingId,
        expected: expectedAmount,
        received: amount,
        difference: Math.abs(amount - expectedAmount),
        timestamp: new Date().toISOString()
      });

      throw new AppError('Payment amount does not match booking total', 400, {
        code: 'AMOUNT_MISMATCH',
        expected: expectedAmount,
        received: amount,
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    next();

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Payment amount validation error:', error);
    throw new AppError('Payment amount validation failed', 500, {
      code: 'AMOUNT_VALIDATION_ERROR',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

// Card token validation
export const validateCardToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { omiseToken } = req.body;

    if (!omiseToken) {
      throw new AppError('Payment token required', 400, {
        code: 'MISSING_PAYMENT_TOKEN',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    // Validate token format (Omise tokens start with 'tokn_')
    if (!omiseToken.startsWith('tokn_') || omiseToken.length < 20) {
      throw new AppError('Invalid payment token format', 400, {
        code: 'INVALID_TOKEN_FORMAT',
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    next();

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Card token validation error:', error);
    throw new AppError('Card token validation failed', 400, {
      code: 'TOKEN_VALIDATION_ERROR',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

// Payment encryption for sensitive data
export const encryptPaymentData = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { cardNumber, cvv, expiryMonth, expiryYear } = req.body;

    // Encrypt sensitive card data if present
    if (cardNumber || cvv) {
      const encryptionKey = process.env.PAYMENT_ENCRYPTION_KEY;
      
      if (!encryptionKey) {
        throw new AppError('Payment encryption key not configured', 500, {
          code: 'ENCRYPTION_KEY_MISSING',
          requestId: req.headers['x-request-id'] || 'unknown'
        });
      }

      // Encrypt sensitive fields
      if (cardNumber) {
        req.body.encryptedCardNumber = encryptData(cardNumber, encryptionKey);
        delete req.body.cardNumber;
      }

      if (cvv) {
        req.body.encryptedCvv = encryptData(cvv, encryptionKey);
        delete req.body.cvv;
      }

      if (expiryMonth) {
        req.body.encryptedExpiryMonth = encryptData(expiryMonth, encryptionKey);
        delete req.body.expiryMonth;
      }

      if (expiryYear) {
        req.body.encryptedExpiryYear = encryptData(expiryYear, encryptionKey);
        delete req.body.expiryYear;
      }
    }

    next();

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Payment encryption error:', error);
    throw new AppError('Payment encryption failed', 500, {
      code: 'ENCRYPTION_ERROR',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

// Helper functions
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

async function calculateFraudScore(data: {
  userId?: string;
  amount: number;
  bookingId: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}): Promise<number> {
  let score = 0;

  try {
    // Check for multiple payments from same IP (mock for now)
    if (data.ip) {
      // const recentPayments = await prisma.payment.count({
      //   where: {
      //     ipAddress: data.ip,
      //     createdAt: {
      //       gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      //     }
      //   }
      // });

      // if (recentPayments > 5) {
      //   score += 0.3;
      // }
    }

    // Check for high amount payments
    if (data.amount > 50000) { // 50,000 THB
      score += 0.2;
    }

    // Check for unusual payment times (late night/early morning)
    const hour = data.timestamp.getHours();
    if (hour < 6 || hour > 23) {
      score += 0.1;
    }

    // Check for suspicious user agent
    if (data.userAgent && (
      data.userAgent.includes('bot') ||
      data.userAgent.includes('crawler') ||
      data.userAgent.length < 10
    )) {
      score += 0.4;
    }

    // Check for new user making large payment (mock for now)
    if (data.userId) {
      // const userPayments = await prisma.payment.count({
      //   where: { userId: data.userId }
      // });

      // if (userPayments === 0 && data.amount > 10000) {
      //   score += 0.3;
      // }
    }

  } catch (error) {
    console.error('Error calculating fraud score:', error);
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

function encryptData(data: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// Clear payment attempts on successful payment
export const clearPaymentAttempts = (userId?: string, ip?: string): void => {
  if (userId) {
    paymentAttempts.delete(`user_${userId}`);
  }
  if (ip) {
    paymentAttempts.delete(`ip_${ip}`);
  }
};

// Export all middleware
export default {
  validatePaymentRequest,
  fraudDetection,
  paymentRateLimit,
  verifyWebhookSignature,
  validatePaymentAmount,
  validateCardToken,
  encryptPaymentData,
  clearPaymentAttempts
};