import { Request, Response, NextFunction } from 'express';

export const validateSimpleApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const validApiKeys = [
      'dev-api-key-2024',
      process.env.API_KEY,
      process.env.ADMIN_API_KEY
    ].filter(Boolean);

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: {
          message: 'API key required',
          code: 'MISSING_API_KEY'
        }
      });
      return;
    }

    if (!validApiKeys.includes(apiKey)) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid API key',
          code: 'INVALID_API_KEY'
        }
      });
      return;
    }

    // API key valid, proceed
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'API key validation failed',
        code: 'VALIDATION_ERROR'
      }
    });
  }
};
