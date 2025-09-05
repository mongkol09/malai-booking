/**
 * Application Error Class
 * =======================
 * 
 * Custom error class สำหรับ application errors
 */

export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
