// ============================================
// 🛡️ HTTP METHOD VALIDATION MIDDLEWARE
// Reject unsupported HTTP methods
// ============================================

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate HTTP methods for specific routes
 */
export const validateHttpMethod = (allowedMethods: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    
    if (!allowedMethods.includes(method)) {
      console.log(`❌ Invalid HTTP method: ${method} for ${req.path}`);
      
      res.status(405).json({
        success: false,
        error: {
          message: `Method ${method} not allowed`,
          code: 'METHOD_NOT_ALLOWED',
          allowedMethods: allowedMethods,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    next();
  };
};

/**
 * Default method validation for API routes
 */
export const defaultMethodValidation = validateHttpMethod(['GET', 'POST', 'PUT', 'DELETE']);

export default validateHttpMethod;
