/**
 * Payment Security Middleware
 * ===========================
 * 
 * Middleware สำหรับความปลอดภัยของระบบการชำระเงิน
 * รวมถึง fraud detection, rate limiting, และ validation
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { omiseConfig } from '../config/omise';

// ============================================
// FRAUD DETECTION
// ============================================

interface FraudCheckResult {
  isSuspicious: boolean;
  riskScore: number;
  reasons: string[];
}

export const fraudDetection = (req: Request, res: Response, next: NextFunction) => {
  try {
    const fraudResult = performFraudCheck(req);
    
    if (fraudResult.isSuspicious) {
      console.warn(`🚨 [Fraud Detection] Suspicious payment attempt:`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        reasons: fraudResult.reasons,
        riskScore: fraudResult.riskScore
      });
      
      // Log suspicious activity
      // TODO: Send alert to admin
      
      if (fraudResult.riskScore > 80) {
        return res.status(403).json({
          success: false,
          message: 'Payment request blocked due to security concerns',
          error: 'FRAUD_DETECTED'
        });
      }
    }
    
    // Add fraud check result to request for logging
    (req as any).fraudCheck = fraudResult;
    
    next();
  } catch (error) {
    console.error('❌ [Fraud Detection] Error:', error);
    next();
  }
};

const performFraudCheck = (req: Request): FraudCheckResult => {
  const reasons: string[] = [];
  let riskScore = 0;
  
  // Check IP address
  const ip = req.ip;
  if (isKnownFraudulentIP(ip)) {
    reasons.push('Known fraudulent IP address');
    riskScore += 50;
  }
  
  // Check user agent
  const userAgent = req.get('User-Agent') || '';
  if (isSuspiciousUserAgent(userAgent)) {
    reasons.push('Suspicious user agent');
    riskScore += 20;
  }
  
  // Check request frequency
  if (isHighFrequencyRequest(req)) {
    reasons.push('High frequency requests');
    riskScore += 30;
  }
  
  // Check amount patterns
  const amount = parseFloat(req.body?.amount || '0');
  if (isSuspiciousAmount(amount)) {
    reasons.push('Suspicious amount pattern');
    riskScore += 25;
  }
  
  // Check geographic location (if available)
  if (isHighRiskLocation(req)) {
    reasons.push('High risk geographic location');
    riskScore += 40;
  }
  
  return {
    isSuspicious: riskScore > 30,
    riskScore,
    reasons
  };
};

// ============================================
// SECURITY VALIDATION
// ============================================

export const validatePaymentSignature = (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-omise-signature'] as string;
    const timestamp = req.headers['x-omise-timestamp'] as string;
    
    if (!signature || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment signature or timestamp'
      });
    }
    
    // Check timestamp freshness (within 5 minutes)
    const requestTime = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (Math.abs(currentTime - requestTime) > 300) {
      return res.status(400).json({
        success: false,
        message: 'Request timestamp expired'
      });
    }
    
    // Verify signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', omiseConfig.webhookSecret)
      .update(payload + timestamp)
      .digest('hex');
    
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ [Payment Signature] Validation error:', error);
    return res.status(400).json({
      success: false,
      message: 'Payment signature validation failed'
    });
  }
};

// ============================================
// AMOUNT VALIDATION
// ============================================

export const validatePaymentAmount = (req: Request, res: Response, next: NextFunction) => {
  try {
    const amount = parseFloat(req.body?.amount || '0');
    
    // Check minimum amount
    if (amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount too low'
      });
    }
    
    // Check maximum amount
    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount too high'
      });
    }
    
    // Check for suspicious round numbers
    if (isSuspiciousRoundAmount(amount)) {
      console.warn(`⚠️ [Amount Validation] Suspicious round amount: ${amount}`);
    }
    
    next();
  } catch (error) {
    console.error('❌ [Amount Validation] Error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid payment amount'
    });
  }
};

// ============================================
// CURRENCY VALIDATION
// ============================================

export const validatePaymentCurrency = (req: Request, res: Response, next: NextFunction) => {
  try {
    const currency = req.body?.currency || 'THB';
    
    // Only allow THB for now
    if (currency !== 'THB') {
      return res.status(400).json({
        success: false,
        message: 'Only THB currency is supported'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ [Currency Validation] Error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid payment currency'
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const isKnownFraudulentIP = (ip: string): boolean => {
  // TODO: Implement IP blacklist check
  // This could connect to a fraud detection service
  return false;
};

const isSuspiciousUserAgent = (userAgent: string): boolean => {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /perl/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};

const isHighFrequencyRequest = (req: Request): boolean => {
  // TODO: Implement rate limiting check
  // This should integrate with Redis or similar
  return false;
};

const isSuspiciousAmount = (amount: number): boolean => {
  // Check for common fraud amounts
  const suspiciousAmounts = [999, 9999, 99999, 1000, 10000, 100000];
  return suspiciousAmounts.includes(amount);
};

const isHighRiskLocation = (req: Request): boolean => {
  // TODO: Implement geographic risk assessment
  // This could use IP geolocation services
  return false;
};

const isSuspiciousRoundAmount = (amount: number): boolean => {
  // Check if amount is suspiciously round
  return amount % 1000 === 0 && amount > 10000;
};

// ============================================
// COMPOSITE MIDDLEWARE
// ============================================

export const paymentSecurityMiddleware = [
  fraudDetection,
  validatePaymentAmount,
  validatePaymentCurrency
];

export const webhookSecurityMiddleware = [
  validatePaymentSignature
];
