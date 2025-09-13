import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Security Headers Middleware
 * ป้องกัน XSS, CSRF, Clickjacking และ security vulnerabilities อื่นๆ
 */

// Helmet configuration for maximum security
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: []
    }
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: { policy: "require-corp" },

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "same-origin" },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Expect-CT (deprecated, using HSTS instead)
  // expectCt: {
  //   maxAge: 86400,
  //   enforce: true
  // },

  // Feature Policy (deprecated, using Permissions Policy instead)
  // featurePolicy: {
  //   features: {
  //     camera: ["'none'"],
  //     microphone: ["'none'"],
  //     geolocation: ["'none'"],
  //     payment: ["'self'"],
  //     usb: ["'none'"],
  //     magnetometer: ["'none'"],
  //     gyroscope: ["'none'"],
  //     accelerometer: ["'none'"]
  //   }
  // },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permissions Policy (handled in custom headers)
  // permissionsPolicy: {
  //   features: {
  //     camera: [],
  //     microphone: [],
  //     geolocation: [],
  //     payment: ["self"],
  //     usb: [],
  //     magnetometer: [],
  //     gyroscope: [],
  //     accelerometer: []
  //   }
  // },

  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // XSS Filter
  xssFilter: true
});

// Custom security headers - Simplified for development
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Add minimal security headers
  res.set({
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block'
  });

  next();
};

// CORS configuration - Simplified for development
export const corsConfig = {
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400 // 24 hours
};

// CSRF Protection
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints with proper authentication
  if (req.path.startsWith('/api/') && req.headers.authorization) {
    return next();
  }

  // Check CSRF token
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = (req as any).session?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    console.warn(`🚨 CSRF token mismatch`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    res.status(403).json({
      error: 'CSRF token mismatch',
      code: 'CSRF_ERROR',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

// Request ID generator
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Security audit logging
export const securityAuditLog = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log security-relevant requests
  const securitySensitivePaths = [
    '/api/auth',
    '/api/payment',
    '/api/admin',
    '/api/users',
    '/api/booking'
  ];

  const isSecuritySensitive = securitySensitivePaths.some(path => 
    req.path.startsWith(path)
  );

  if (isSecuritySensitive) {
    console.log(`🔒 Security-sensitive request: ${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || generateRequestId()
    });
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    
    if (isSecuritySensitive) {
      console.log(`🔒 Security-sensitive response: ${req.method} ${req.path}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// IP whitelist for admin endpoints
export const adminIPWhitelist = (req: Request, res: Response, next: NextFunction): void => {
  const adminPaths = ['/api/admin', '/api/users', '/api/system'];
  const isAdminPath = adminPaths.some(path => req.path.startsWith(path));

  if (!isAdminPath) {
    return next();
  }

  const allowedIPs = [
    '127.0.0.1',
    '::1',
    '::ffff:127.0.0.1',
    // Add production admin IPs here
    '192.168.1.0/24',
    '10.0.0.0/8'
  ];

  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Simple IP check (in production, use proper IP range checking)
  if (!allowedIPs.includes(clientIP || '')) {
    console.warn(`🚨 Unauthorized admin access attempt from IP: ${clientIP}`, {
      path: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    res.status(403).json({
      error: 'Access denied',
      code: 'IP_NOT_ALLOWED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

export default {
  securityHeaders,
  customSecurityHeaders,
  corsConfig,
  csrfProtection,
  securityAuditLog,
  adminIPWhitelist
};
