import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

const prisma = new PrismaClient();

/**
 * Advanced PIN Security Middleware
 * ระบบรักษาความปลอดภัยระดับสูงสำหรับ PIN
 */

// IP-based rate limiting for PIN operations
export const pinRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 PIN attempts per window
  message: {
    success: false,
    message: 'Too many PIN attempts from this IP. Please try again later.',
    type: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // Custom key generator to include user context
  keyGenerator: (req: Request) => {
    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return `pin_${ip}_${Buffer.from(userAgent).toString('base64').slice(0, 10)}`;
  },
  
  // Skip rate limiting for successful attempts
  skip: (req: Request, res: Response) => {
    return res.statusCode < 400;
  }
});

// Progressive slowdown for repeated attempts
export const pinSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 3, // allow 3 requests per window without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 10000, // maximum delay of 10 seconds
  
  keyGenerator: (req: Request) => {
    const ip = req.ip || 'unknown';
    return `pin_slow_${ip}`;
  }
});

// PIN attempt tracking middleware
export const trackPinAttempt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userId = (req as any).userId; // Set by auth middleware
    
    // Log attempt details
    console.log(`🔐 PIN attempt from IP: ${ip}, User: ${userId}, UA: ${userAgent.slice(0, 50)}`);
    
    // Store attempt info in request for later use
    (req as any).attemptInfo = {
      ip,
      userAgent,
      timestamp: new Date(),
      userId
    };
    
    next();
  } catch (error) {
    console.error('PIN attempt tracking error:', error);
    next(); // Continue even if tracking fails
  }
};

// Suspicious activity detection
export const detectSuspiciousActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || 'unknown';
    const userId = (req as any).userId;
    
    // Check for suspicious patterns in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentAttempts = await prisma.activityLog.findMany({
      where: {
        activityType: 'PIN_VERIFICATION_FAILED',
        createdAt: {
          gte: oneHourAgo
        },
        data: {
          contains: ip
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Flag if more than 15 failed attempts from same IP in 1 hour
    if (recentAttempts.length >= 15) {
      console.warn(`🚨 Suspicious activity detected from IP: ${ip}`);
      
      // Log security event
      await logSecurityEvent('SUSPICIOUS_PIN_ACTIVITY', {
        ip,
        userId,
        failedAttempts: recentAttempts.length,
        timeWindow: '1_hour',
        action: 'BLOCKED'
      });
      
      return res.status(429).json({
        success: false,
        message: 'Suspicious activity detected. Access temporarily blocked.',
        type: 'SECURITY_BLOCK'
      });
    }
    
    next();
  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    next(); // Continue even if detection fails
  }
};

// Device fingerprinting for enhanced security
export const deviceFingerprint = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // Create device fingerprint
  const fingerprint = Buffer.from(
    `${userAgent}|${acceptLanguage}|${acceptEncoding}`
  ).toString('base64');
  
  (req as any).deviceFingerprint = fingerprint;
  next();
};

// Time-based access control
export const timeBasedAccess = (req: Request, res: Response, next: NextFunction) => {
  const now = new Date();
  const hour = now.getHours();
  
  // Allow emergency access (PIN 9999) 24/7
  const pin = req.body.pin;
  if (pin === '999999') {
    (req as any).emergencyAccess = true;
    return next();
  }
  
  // Restrict access during maintenance hours (2 AM - 4 AM)
  if (hour >= 2 && hour < 4) {
    const userId = (req as any).userId;
    
    // Only allow admin/manager access during maintenance
    if (!userId || !['ADMIN', 'MANAGER'].includes((req as any).userRole)) {
      return res.status(403).json({
        success: false,
        message: 'System maintenance in progress. Access restricted.',
        type: 'MAINTENANCE_RESTRICTION'
      });
    }
  }
  
  next();
};

// PIN encryption/decryption utilities
export class PinCrypto {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  
  // Generate secure PIN hash with salt
  static async hashPin(pin: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const bcrypt = require('bcrypt');
    const saltRounds = 12;
    
    if (!salt) {
      salt = await bcrypt.genSalt(saltRounds);
    }
    
    const hash = await bcrypt.hash(pin, salt);
    
    return { hash, salt };
  }
  
  // Verify PIN against hash
  static async verifyPin(pin: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(pin, hash);
  }
  
  // Encrypt sensitive data
  static encryptData(data: string, key: string): string {
    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }
  
  // Decrypt sensitive data
  static decryptData(encryptedData: string, key: string): string {
    const crypto = require('crypto');
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Security audit logging
export const auditPinActivity = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log after response is sent
    setImmediate(async () => {
      try {
        const userId = (req as any).userId;
        const attemptInfo = (req as any).attemptInfo;
        const isSuccess = res.statusCode < 400;
        
        await logSecurityEvent(
          isSuccess ? 'PIN_AUDIT_SUCCESS' : 'PIN_AUDIT_FAILURE',
          {
            userId,
            endpoint: req.path,
            method: req.method,
            statusCode: res.statusCode,
            ip: attemptInfo?.ip,
            userAgent: attemptInfo?.userAgent,
            timestamp: new Date().toISOString(),
            deviceFingerprint: (req as any).deviceFingerprint
          }
        );
      } catch (error) {
        console.error('Audit logging error:', error);
      }
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

// PIN complexity validation
export const validatePinComplexity = (req: Request, res: Response, next: NextFunction) => {
  const { pin, newPin } = req.body;
  const pinToCheck = newPin || pin;
  
  if (!pinToCheck) {
    return next();
  }
  
  const complexity = analyzePinComplexity(pinToCheck);
  
  if (complexity.score < 3) {
    return res.status(400).json({
      success: false,
      message: `PIN security score too low (${complexity.score}/5). ${complexity.suggestions.join(' ')}`,
      type: 'WEAK_PIN'
    });
  }
  
  (req as any).pinComplexity = complexity;
  next();
};

// Analyze PIN complexity
function analyzePinComplexity(pin: string) {
  let score = 0;
  const suggestions = [];
  
  // Check length
  if (pin.length === 6) {
    score += 1;
  } else {
    suggestions.push('PIN must be exactly 6 digits.');
  }
  
  // Check for non-sequential numbers
  if (!isSequential(pin)) {
    score += 1;
  } else {
    suggestions.push('Avoid sequential numbers (123456, 654321).');
  }
  
  // Check for non-repeating numbers
  if (!isRepeating(pin)) {
    score += 1;
  } else {
    suggestions.push('Avoid repeating numbers (111111, 222222).');
  }
  
  // Check for variety in digits
  const uniqueDigits = new Set(pin.split('')).size;
  if (uniqueDigits >= 4) {
    score += 1;
  } else {
    suggestions.push('Use at least 4 different digits.');
  }
  
  // Check for common patterns
  const commonPins = ['000000', '123456', '654321', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999'];
  if (!commonPins.includes(pin)) {
    score += 1;
  } else {
    suggestions.push('Avoid common PIN patterns.');
  }
  
  return { score, suggestions };
}

// Utility functions
function isSequential(pin: string): boolean {
  const digits = pin.split('').map(Number);
  
  // Check ascending sequence
  let isAscending = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i-1] + 1) {
      isAscending = false;
      break;
    }
  }
  
  // Check descending sequence
  let isDescending = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i-1] - 1) {
      isDescending = false;
      break;
    }
  }
  
  return isAscending || isDescending;
}

function isRepeating(pin: string): boolean {
  return /^(.)\1{5}$/.test(pin);
}

// Security event logging
async function logSecurityEvent(eventType: string, data: any) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId || null,
        activityType: eventType,
        data: JSON.stringify(data),
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Security event logging error:', error);
  }
}

export default {
  pinRateLimit,
  pinSlowDown,
  trackPinAttempt,
  detectSuspiciousActivity,
  deviceFingerprint,
  timeBasedAccess,
  auditPinActivity,
  validatePinComplexity,
  PinCrypto
};
