/**
 * Security Configuration
 * การตั้งค่าความปลอดภัยสำหรับระบบ Malai Resort
 */

export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    issuer: 'malai-resort-api',
    audience: 'malai-resort-client'
  },

  // Password Configuration
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    saltRounds: 12,
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes
  },

  // Rate Limiting Configuration
  rateLimiting: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // requests per window
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // login attempts per window
    },
    payment: {
      windowMs: 60 * 1000, // 1 minute
      max: 3 // payment attempts per minute
    },
    booking: {
      windowMs: 60 * 1000, // 1 minute
      max: 10 // booking attempts per minute
    },
    admin: {
      windowMs: 60 * 1000, // 1 minute
      max: 20 // admin operations per minute
    }
  },

  // CORS Configuration
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://malai-resort.com',
      'https://www.malai-resort.com',
      'https://admin.malai-resort.com',
      'https://api.malai-resort.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-ID',
      'X-API-Key',
      'X-CSRF-Token',
      'X-MFA-Token'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ],
    maxAge: 86400 // 24 hours
  },

  // Security Headers Configuration
  securityHeaders: {
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
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: ['self'],
      usb: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: []
    }
  },

  // Payment Security Configuration
  payment: {
    encryptionKey: process.env.PAYMENT_ENCRYPTION_KEY || 'your-payment-encryption-key',
    webhookSecret: process.env.OMISE_WEBHOOK_SECRET || 'your-omise-webhook-secret',
    maxAmount: 1000000, // 1,000,000 THB
    minAmount: 1, // 1 THB
    allowedCurrencies: ['THB', 'USD', 'EUR'],
    allowedMethods: ['credit_card', 'debit_card', 'bank_transfer', 'cash'],
    fraudDetection: {
      enabled: true,
      highRiskThreshold: 0.8,
      mediumRiskThreshold: 0.5,
      maxAttemptsPerHour: 5,
      blockDuration: 60 * 60 * 1000 // 1 hour
    }
  },

  // Session Configuration
  session: {
    maxSessionsPerUser: 5,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    inactivityTimeout: 2 * 60 * 60 * 1000, // 2 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const
  },

  // Audit Logging Configuration
  audit: {
    enabled: true,
    logLevel: process.env.LOG_LEVEL || 'info',
    retentionDays: 90,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'cardNumber',
      'cvv',
      'ssn',
      'passport'
    ],
    alertThresholds: {
      failedLogins: 5,
      suspiciousActivity: 3,
      paymentFailures: 3,
      adminActions: 10
    }
  },

  // IP Whitelist Configuration
  ipWhitelist: {
    admin: [
      '127.0.0.1',
      '::1',
      '::ffff:127.0.0.1',
      '192.168.1.0/24',
      '10.0.0.0/8'
    ],
    trusted: [
      '127.0.0.1',
      '::1',
      '::ffff:127.0.0.1'
    ]
  },

  // File Upload Security
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
    scanForMalware: true,
    quarantinePath: '/tmp/quarantine'
  },

  // Database Security
  database: {
    connectionLimit: 10,
    queryTimeout: 30000, // 30 seconds
    maxQuerySize: 1000,
    enableQueryLogging: process.env.NODE_ENV === 'development',
    encryptSensitiveData: true
  },

  // API Security
  api: {
    version: '1.0.0',
    requireApiKey: false, // Set to true for production
    apiKeyHeader: 'X-API-Key',
    requestTimeout: 30000, // 30 seconds
    maxRequestBodySize: '10mb',
    enableRequestLogging: true
  },

  // Monitoring and Alerting
  monitoring: {
    enabled: true,
    healthCheckInterval: 60000, // 1 minute
    alertChannels: ['email', 'telegram'],
    criticalThresholds: {
      responseTime: 5000, // 5 seconds
      errorRate: 0.05, // 5%
      memoryUsage: 0.9, // 90%
      cpuUsage: 0.8 // 80%
    }
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  securityConfig.jwt.secret = process.env.JWT_SECRET!;
  securityConfig.jwt.refreshSecret = process.env.JWT_REFRESH_SECRET!;
  securityConfig.payment.encryptionKey = process.env.PAYMENT_ENCRYPTION_KEY!;
  securityConfig.payment.webhookSecret = process.env.OMISE_WEBHOOK_SECRET!;
  securityConfig.session.secure = true;
  securityConfig.api.requireApiKey = true;
}

export default securityConfig;
