import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

/**
 * Audit Logging Middleware
 * บันทึกการใช้งานระบบและตรวจสอบความปลอดภัย
 */

interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
}

// Audit logging middleware
export const auditLogger = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || generateRequestId();
    
    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      const status = res.statusCode >= 400 ? 'failure' : 'success';
      
      // Log the audit entry
      logAuditEntry({
        userId: (req as any).user?.id,
        action,
        resource,
        resourceId: extractResourceId(req),
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: sanitizeRequestBody(req.body),
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestId,
        status,
        errorMessage: res.statusCode >= 400 ? getErrorMessage(res) : undefined
      }).catch(error => {
        console.error('Failed to log audit entry:', error);
      });

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// Security event logging
export const securityLogger = (eventType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = req.headers['x-request-id'] as string || generateRequestId();
    
    // Log security event
    await logSecurityEvent({
      eventType,
      userId: (req as any).user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        method: req.method,
        path: req.path,
        headers: sanitizeHeaders(req.headers),
        body: sanitizeRequestBody(req.body),
        query: req.query,
        timestamp: new Date().toISOString()
      },
      requestId,
      severity: getSecuritySeverity(eventType)
    });

    next();
  };
};

// Authentication logging
export const authLogger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  // Log authentication attempt
  await logAuthEvent({
    email: req.body.email,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    success: false, // Will be updated by auth controller
    requestId,
    timestamp: new Date().toISOString()
  });

  // Override res.end to capture auth result
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const success = res.statusCode === 200;
    
    // Update auth log with result
    updateAuthLog(requestId, success, (req as any).user?.id).catch(error => {
      console.error('Failed to update auth log:', error);
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Payment logging
export const paymentLogger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  // Log payment attempt
  await logPaymentEvent({
    userId: (req as any).user?.id,
    bookingId: req.body.bookingId,
    amount: req.body.amount,
    currency: req.body.currency,
    paymentMethod: req.body.paymentMethod,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    success: false, // Will be updated by payment controller
    requestId,
    timestamp: new Date().toISOString()
  });

  // Override res.end to capture payment result
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const success = res.statusCode === 200;
    
    // Update payment log with result
    updatePaymentLog(requestId, success, res.statusCode).catch(error => {
      console.error('Failed to update payment log:', error);
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Admin action logging
export const adminLogger = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = req.headers['x-request-id'] as string || generateRequestId();
    
    // Log admin action
    await logAdminAction({
      userId: (req as any).user?.id,
      action,
      targetResource: extractResourceId(req),
      details: {
        method: req.method,
        path: req.path,
        body: sanitizeRequestBody(req.body),
        query: req.query,
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestId
    });

    next();
  };
};

// Core logging functions
async function logAuditEntry(data: AuditLogData): Promise<void> {
  try {
    // Mock audit log creation for now
    console.log('📊 Audit Log:', {
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      status: data.status,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual audit log table in Prisma schema
    // await prisma.auditLog.create({
    //   data: {
    //     userId: data.userId,
    //     action: data.action,
    //     resource: data.resource,
    //     resourceId: data.resourceId,
    //     details: data.details as any,
    //     ipAddress: data.ipAddress,
    //     userAgent: data.userAgent,
    //     requestId: data.requestId,
    //     status: data.status,
    //     errorMessage: data.errorMessage,
    //     createdAt: new Date()
    //   }
    // });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

async function logSecurityEvent(data: {
  eventType: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: any;
  requestId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}): Promise<void> {
  try {
    // Mock security event logging for now
    console.log('🚨 Security Event:', {
      eventType: data.eventType,
      userId: data.userId,
      severity: data.severity,
      timestamp: new Date().toISOString()
    });

    // Alert for critical security events
    if (data.severity === 'critical') {
      console.error(`🚨 CRITICAL SECURITY EVENT: ${data.eventType}`, {
        userId: data.userId,
        ip: data.ipAddress,
        timestamp: new Date().toISOString()
      });
    }
    
    // TODO: Implement actual security event table in Prisma schema
  } catch (error) {
    console.error('Failed to create security event log:', error);
  }
}

async function logAuthEvent(data: {
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  requestId: string;
  timestamp: string;
}): Promise<void> {
  try {
    // Mock auth event logging for now
    console.log('🔐 Auth Event:', {
      email: data.email,
      success: data.success,
      timestamp: new Date(data.timestamp).toISOString()
    });
    
    // TODO: Implement actual auth log table in Prisma schema
  } catch (error) {
    console.error('Failed to create auth log:', error);
  }
}

async function logPaymentEvent(data: {
  userId?: string;
  bookingId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  requestId: string;
  timestamp: string;
}): Promise<void> {
  try {
    // Mock payment event logging for now
    console.log('💳 Payment Event:', {
      userId: data.userId,
      bookingId: data.bookingId,
      amount: data.amount,
      success: data.success,
      timestamp: new Date(data.timestamp).toISOString()
    });
    
    // TODO: Implement actual payment log table in Prisma schema
  } catch (error) {
    console.error('Failed to create payment log:', error);
  }
}

async function logAdminAction(data: {
  userId?: string;
  action: string;
  targetResource?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  requestId: string;
}): Promise<void> {
  try {
    // Mock admin action logging for now
    console.log('👑 Admin Action:', {
      userId: data.userId,
      action: data.action,
      targetResource: data.targetResource,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual admin log table in Prisma schema
  } catch (error) {
    console.error('Failed to create admin log:', error);
  }
}

async function updateAuthLog(requestId: string, success: boolean, userId?: string): Promise<void> {
  try {
    // Mock auth log update for now
    console.log('🔐 Auth Log Update:', {
      requestId,
      success,
      userId,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual auth log update in Prisma schema
  } catch (error) {
    console.error('Failed to update auth log:', error);
  }
}

async function updatePaymentLog(requestId: string, success: boolean, statusCode: number): Promise<void> {
  try {
    // Mock payment log update for now
    console.log('💳 Payment Log Update:', {
      requestId,
      success,
      statusCode,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual payment log update in Prisma schema
  } catch (error) {
    console.error('Failed to update payment log:', error);
  }
}

// Helper functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractResourceId(req: Request): string | undefined {
  return req.params.id || req.params.bookingId || req.params.userId || req.params.roomId;
}

function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'cardNumber', 'cvv'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };
  
  // Remove sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

function getErrorMessage(res: Response): string {
  // Extract error message from response
  return res.statusMessage || 'Unknown error';
}

function getSecuritySeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMap: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
    'login_failed': 'medium',
    'multiple_failed_logins': 'high',
    'suspicious_activity': 'high',
    'unauthorized_access': 'critical',
    'sql_injection_attempt': 'critical',
    'xss_attempt': 'high',
    'csrf_attack': 'high',
    'rate_limit_exceeded': 'medium',
    'session_hijacking': 'critical',
    'privilege_escalation': 'critical'
  };
  
  return severityMap[eventType] || 'low';
}

// Export all middleware
export default {
  auditLogger,
  securityLogger,
  authLogger,
  paymentLogger,
  adminLogger
};
