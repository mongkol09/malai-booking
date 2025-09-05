import { Router, Request, Response } from 'express';
import { healthCheckService } from '../services/healthCheckService';

const router = Router();

// 🏥 Quick Health Check (สำหรับ Railway)
router.get('/', async (req: Request, res: Response) => {
  try {
    // Simple health check without database dependency for Railway
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'API is running',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 🏥 Comprehensive Health Check
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckService.runHealthCheck();
    const statusCode = result.status === 'healthy' ? 200 : 
                      result.status === 'warning' ? 200 : 503;
    
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 🔍 Database Health Check
router.get('/database', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckService.quickHealthCheck();
    const statusCode = result.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      status: result.status,
      timestamp: result.timestamp,
      database: result.status === 'healthy' ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 🔍 Memory Health Check
router.get('/memory', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckService.runHealthCheck();
    const memoryCheck = result.checks.find(c => c.name === 'memory');
    
    if (memoryCheck) {
      const statusCode = memoryCheck.status === 'healthy' ? 200 : 200; // Warning is still OK
      res.status(statusCode).json({
        status: memoryCheck.status,
        timestamp: new Date().toISOString(),
        memory: memoryCheck.details,
        responseTime: memoryCheck.responseTime
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Memory check not found'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 🔍 Environment Health Check
router.get('/environment', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckService.runHealthCheck();
    const envCheck = result.checks.find(c => c.name === 'environment');
    
    if (envCheck) {
      const statusCode = envCheck.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json({
        status: envCheck.status,
        timestamp: new Date().toISOString(),
        environment: envCheck.details,
        responseTime: envCheck.responseTime
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Environment check not found'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 🔍 External Services Health Check
router.get('/external', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckService.runHealthCheck();
    const externalCheck = result.checks.find(c => c.name === 'external_services');
    
    if (externalCheck) {
      const statusCode = externalCheck.status === 'healthy' ? 200 : 
                        externalCheck.status === 'warning' ? 200 : 503;
      res.status(statusCode).json({
        status: externalCheck.status,
        timestamp: new Date().toISOString(),
        external_services: externalCheck.details,
        responseTime: externalCheck.responseTime
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'External services check not found'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 🔍 Application Metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckService.runHealthCheck();
    const appCheck = result.checks.find(c => c.name === 'application');
    
    if (appCheck) {
      res.status(200).json({
        status: appCheck.status,
        timestamp: new Date().toISOString(),
        metrics: appCheck.details,
        responseTime: appCheck.responseTime
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Application metrics not found'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
