import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AppError } from '../utils/appError';

/**
 * Input Validation Middleware
 * ป้องกัน SQL Injection และ XSS attacks
 */

// Common validation rules
export const commonValidations = {
  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),

  // Phone validation
  phone: body('phone')
    .isMobilePhone('th-TH')
    .withMessage('Invalid phone number format'),

  // Name validation
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Zก-๙\s]+$/)
    .withMessage('Name must be 2-100 characters and contain only letters'),

  // ID validation
  id: param('id')
    .isUUID()
    .withMessage('Invalid ID format'),

  // Date validation
  date: body('date')
    .isISO8601()
    .withMessage('Invalid date format'),

  // Price validation
  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  // Room number validation
  roomNumber: body('roomNumber')
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Room number must be 1-10 characters and contain only uppercase letters, numbers, and hyphens'),

  // Booking reference validation
  bookingRef: body('bookingReferenceId')
    .trim()
    .isLength({ min: 6, max: 20 })
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Booking reference must be 6-20 characters and contain only uppercase letters, numbers, and hyphens'),

  // Password validation
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8-128 characters with at least one lowercase, uppercase, number, and special character'),

  // SQL injection prevention
  safeString: (field: string) => body(field)
    .trim()
    .isLength({ max: 1000 })
    .matches(/^[a-zA-Z0-9ก-๙\s@._-]+$/)
    .withMessage(`${field} contains invalid characters`),

  // Numeric validation
  positiveInt: (field: string) => body(field)
    .isInt({ min: 1 })
    .withMessage(`${field} must be a positive integer`),

  // Boolean validation
  boolean: (field: string) => body(field)
    .isBoolean()
    .withMessage(`${field} must be a boolean value`),

  // Array validation
  array: (field: string) => body(field)
    .isArray()
    .withMessage(`${field} must be an array`),

  // Object validation
  object: (field: string) => body(field)
    .isObject()
    .withMessage(`${field} must be an object`)
};

// Specific validation chains
export const bookingValidations = [
  commonValidations.email,
  commonValidations.phone,
  body('firstName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Zก-๙\s]+$/),
  body('lastName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Zก-๙\s]+$/),
  body('checkInDate').isISO8601(),
  body('checkOutDate').isISO8601(),
  body('adults').isInt({ min: 1, max: 10 }),
  body('children').isInt({ min: 0, max: 10 }),
  body('totalPrice').isFloat({ min: 0 }),
  body('roomTypeId').isUUID(),
  body('specialRequests').optional().trim().isLength({ max: 500 })
];

export const roomValidations = [
  commonValidations.roomNumber,
  body('roomTypeId').isUUID(),
  body('floor').isInt({ min: 1, max: 50 }),
  body('status').isIn(['Available', 'Occupied', 'Maintenance', 'Out of Order']),
  body('housekeepingStatus').isIn(['Clean', 'Dirty', 'Maintenance', 'Inspected'])
];

export const userValidations = [
  commonValidations.email,
  commonValidations.password,
  body('firstName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Zก-๙\s]+$/),
  body('lastName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Zก-๙\s]+$/),
  body('role').isIn(['admin', 'staff', 'manager', 'housekeeping'])
];

export const paymentValidations = [
  body('amount').isFloat({ min: 0 }),
  body('currency').isIn(['THB', 'USD', 'EUR']),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'bank_transfer', 'cash']),
  body('bookingId').isUUID(),
  body('cardToken').optional().isLength({ min: 10, max: 100 })
];

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }));

    throw new AppError('Validation failed', 400, {
      validationErrors: errorMessages,
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  next();
};

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Remove potentially dangerous characters
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .replace(/[--]/g, '') // Remove SQL comments
      .trim();
  };

  // Sanitize string fields in body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize string fields in query
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  next();
};

// Rate limiting validation
export const validateRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /onload/i,
    /onerror/i,
    /union.*select/i,
    /drop.*table/i,
    /delete.*from/i,
    /insert.*into/i,
    /update.*set/i
  ];

  const requestBody = JSON.stringify(req.body);
  const requestQuery = JSON.stringify(req.query);
  const requestParams = JSON.stringify(req.params);

  const allRequestData = `${requestBody}${requestQuery}${requestParams}${userAgent}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(allRequestData)) {
      console.warn(`🚨 Suspicious request detected from IP: ${ip}`, {
        pattern: pattern.toString(),
        userAgent,
        timestamp: new Date().toISOString()
      });
      
      throw new AppError('Suspicious request detected', 400, {
        requestId: req.headers['x-request-id'] || 'unknown',
        ip,
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

export default {
  commonValidations,
  bookingValidations,
  roomValidations,
  userValidations,
  paymentValidations,
  handleValidationErrors,
  sanitizeInput,
  validateRateLimit
};
