import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/appError';

/**
 * Rate Limiting Middleware
 * ป้องกัน Brute Force และ DDoS attacks
 */

// Store for tracking requests (in production, use Redis)
const requestStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (now > value.resetTime) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Custom rate limiter
export const createCustomRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = options.keyGenerator ? options.keyGenerator(req) : req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Get or create entry
    let entry = requestStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + options.windowMs };
      requestStore.set(key, entry);
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > options.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      res.set({
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': options.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
      });

      throw new AppError(
        options.message || 'Too many requests, please try again later',
        429,
        {
          retryAfter,
          limit: options.max,
          resetTime: entry.resetTime,
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      );
    }

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': options.max.toString(),
      'X-RateLimit-Remaining': (options.max - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    });

    next();
  };
};

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    throw new AppError('Too many requests from this IP', 429, {
      retryAfter: '15 minutes',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Authentication rate limiting (stricter)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    console.warn(`🚨 Too many auth attempts from IP: ${req.ip}`, {
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    throw new AppError('Too many authentication attempts', 429, {
      retryAfter: '15 minutes',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Payment rate limiting (very strict)
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 3 payment attempts per minute
  message: {
    error: 'Too many payment attempts, please try again later',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`🚨 Too many payment attempts from IP: ${req.ip}`, {
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    throw new AppError('Too many payment attempts', 429, {
      retryAfter: '1 minute',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Booking rate limiting
export const bookingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 booking attempts per minute
  message: {
    error: 'Too many booking attempts, please try again later',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    throw new AppError('Too many booking attempts', 429, {
      retryAfter: '1 minute',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Admin operations rate limiting
export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 admin operations per minute
  message: {
    error: 'Too many admin operations, please try again later',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    throw new AppError('Too many admin operations', 429, {
      retryAfter: '1 minute',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// User-specific rate limiting
export const userRateLimit = createCustomRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each user to 30 requests per minute
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise fall back to IP
    return (req as any).user?.id || req.ip || 'unknown';
  },
  message: 'Too many requests for this user, please try again later'
});

// IP-based rate limiting with progressive penalties
export const progressiveRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const key = `progressive_${ip}`;
  
  let entry = requestStore.get(key);
  if (!entry) {
    entry = { count: 0, resetTime: now + 60 * 1000 }; // 1 minute window
    requestStore.set(key, entry);
  }

  // Reset if window expired
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + 60 * 1000;
  }

  entry.count++;

  // Progressive limits based on violation count
  let maxRequests = 100; // Default limit
  if (entry.count > 200) {
    maxRequests = 10; // Very strict
  } else if (entry.count > 150) {
    maxRequests = 25; // Strict
  } else if (entry.count > 100) {
    maxRequests = 50; // Moderate
  }

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    res.set({
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    });

    throw new AppError('Rate limit exceeded', 429, {
      retryAfter,
      limit: maxRequests,
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': (maxRequests - entry.count).toString(),
    'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
  });

  next();
};

// Rate limit bypass for trusted IPs
export const trustedIPs = [
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1'
];

export const bypassRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress;
  
  if (trustedIPs.includes(ip || '')) {
    res.set({
      'X-RateLimit-Bypass': 'true',
      'X-RateLimit-Limit': 'unlimited',
      'X-RateLimit-Remaining': 'unlimited'
    });
  }
  
  next();
};

export default {
  generalRateLimit,
  authRateLimit,
  paymentRateLimit,
  bookingRateLimit,
  adminRateLimit,
  userRateLimit,
  progressiveRateLimit,
  bypassRateLimit,
  createCustomRateLimit
};
