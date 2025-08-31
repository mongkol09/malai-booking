// ============================================
// REQUEST LOGGER MIDDLEWARE
// ============================================

import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Create winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response
  res.send = function(body) {
    const duration = Date.now() - startTime;
    const size = Buffer.byteLength(body || '', 'utf8');

    // Log request details
    const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${size} bytes - ${req.ip}`;
    
    if (res.statusCode >= 400) {
      logger.error(logMessage);
    } else {
      logger.info(logMessage);
    }

    // Log request headers in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
    }

    return originalSend.call(this, body);
  };

  next();
};

export { logger };
