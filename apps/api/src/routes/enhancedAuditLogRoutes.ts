// ============================================
// ENHANCED AUDIT LOG API ROUTES
// ============================================

import express, { Request, Response } from 'express';
import { sessionAuth, requireSessionRole } from '../middleware/sessionAuth';
import { rateLimit } from 'express-rate-limit';
// Import actual services
import { EnhancedAuditLogService } from '../services/enhancedAuditLogService';
import { AnalyticsService } from '../services/analyticsService';
// TODO: Import other services when implemented
import { 
  DataGovernanceService, 
  MonitoringService 
} from '../services/mockServices';

const router = express.Router();

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

const auditLogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many audit log requests, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const analyticsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per window
  message: {
    success: false,
    message: 'Too many analytics requests, please try again later',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: {
    success: false,
    message: 'Too many admin requests, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// CORE AUDIT LOG APIs
// ============================================

/**
 * @route POST /api/v1/audit/logs
 * @desc Create audit log entry
 * @access Private (Session Auth + Admin/Dev Role)
 */
router.post('/logs', 
  sessionAuth,
  requireSessionRole(['ADMIN', 'DEV']),
  auditLogLimiter,
  async (req: Request, res: Response) => {
    try {
      const auditData = req.body;
      const userId = (req as any).user?.userId;
      
      // Validate required fields
      if (!auditData.action) {
        return res.status(400).json({
          success: false,
          message: 'Action is required',
          code: 'MISSING_ACTION'
        });
      }

      // Create audit log with enhanced fields
      const auditLog = await EnhancedAuditLogService.createAuditLog({
        ...auditData,
        userId,
        userEmail: (req as any).user?.email,
        userRole: (req as any).user?.userType,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: (req as any).sessionID
      });

      res.status(201).json({
        success: true,
        message: 'Audit log created successfully',
        data: auditLog
      });
    } catch (error) {
      console.error('Create audit log error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create audit log',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/v1/audit/logs
 * @desc Get audit logs with advanced filtering
 * @access Private (Session Auth + Admin/Manager/Staff Role)
 */
router.get('/logs',
  sessionAuth,
  requireSessionRole(['ADMIN', 'MANAGER', 'STAFF']),
  auditLogLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
        action,
        resourceType,
        resourceId,
        dateFrom,
        dateTo,
        dataClassification,
        complianceLevel,
        validationStatus,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));

      const filters = {
        userId: userId as string,
        action: action as string,
        resourceType: resourceType as string,
        resourceId: resourceId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        dataClassification: dataClassification as string,
        complianceLevel: complianceLevel as string,
        validationStatus: validationStatus as string
      };

      const result = await EnhancedAuditLogService.getAuditLogs({
        filters,
        pagination: { page: pageNum, limit: limitNum },
        sorting: { sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc' }
      });

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: Math.ceil(result.total / limitNum)
        },
        filters: filters
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit logs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/v1/audit/logs/:id
 * @desc Get specific audit log
 * @access Private (Session Auth + Admin/Manager/Staff Role)
 */
router.get('/logs/:id',
  sessionAuth,
  requireSessionRole(['ADMIN', 'MANAGER', 'STAFF']),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const auditLog = await EnhancedAuditLogService.getAuditLogById(id);

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: 'Audit log not found',
          code: 'AUDIT_LOG_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: auditLog
      });
    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit log',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ============================================
// ENHANCED ANALYTICS APIs
// ============================================

/**
 * @route GET /api/v1/audit/analytics/behavior
 * @desc Get user behavior analytics
 * @access Private (Session Auth + Admin/Manager/Data Analyst Role)
 */
router.get('/analytics/behavior',
  sessionAuth,
  requireSessionRole(['ADMIN', 'MANAGER', 'DATA_ANALYST']),
  analyticsLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        dateFrom,
        dateTo,
        userId,
        groupBy = 'day'
      } = req.query;

      const analytics = await AnalyticsService.getUserBehaviorAnalytics({
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        userId: userId as string,
        groupBy: groupBy as string
      });

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('User behavior analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user behavior analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/v1/audit/analytics/risk
 * @desc Get risk assessment data
 * @access Private (Session Auth + Admin/Security Officer Role)
 */
router.get('/analytics/risk',
  sessionAuth,
  requireSessionRole(['ADMIN', 'SECURITY_OFFICER']),
  analyticsLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        dateFrom,
        dateTo,
        riskLevel,
        userId
      } = req.query;

      const riskData = await AnalyticsService.getRiskAssessmentData({
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        riskLevel: riskLevel as string,
        userId: userId as string
      });

      res.json({
        success: true,
        data: riskData
      });
    } catch (error) {
      console.error('Risk assessment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve risk assessment data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/v1/audit/analytics/trends
 * @desc Get trend analysis
 * @access Private (Session Auth + Admin/Manager/Data Analyst Role)
 */
router.get('/analytics/trends',
  sessionAuth,
  requireSessionRole(['ADMIN', 'MANAGER', 'DATA_ANALYST']),
  analyticsLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        trendType,
        dateFrom,
        dateTo,
        confidenceLevel = 0.8
      } = req.query;

      const trends = await AnalyticsService.getTrendAnalysis({
        trendType: trendType as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        confidenceLevel: parseFloat(confidenceLevel as string)
      });

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Trend analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve trend analysis',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/v1/audit/analytics/anomaly-detection
 * @desc Trigger anomaly detection
 * @access Private (Session Auth + Admin/Security Officer Role)
 */
router.post('/analytics/anomaly-detection',
  sessionAuth,
  requireSessionRole(['ADMIN', 'SECURITY_OFFICER']),
  analyticsLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        dateFrom,
        dateTo,
        detectionType = 'AUTOMATIC',
        sensitivity = 'MEDIUM'
      } = req.body;

      const result = await AnalyticsService.triggerAnomalyDetection({
        dateFrom,
        dateTo,
        detectionType,
        sensitivity
      });

      res.json({
        success: true,
        message: 'Anomaly detection triggered successfully',
        data: result
      });
    } catch (error) {
      console.error('Anomaly detection error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger anomaly detection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ============================================
// REAL-TIME MONITORING APIs
// ============================================

/**
 * @route GET /api/v1/audit/monitoring/alerts
 * @desc Get active alerts
 * @access Private (Session Auth + Admin/Security Officer/Manager Role)
 */
router.get('/monitoring/alerts',
  sessionAuth,
  requireSessionRole(['ADMIN', 'SECURITY_OFFICER', 'MANAGER']),
  async (req: Request, res: Response) => {
    try {
      const {
        status = 'ACTIVE',
        severity,
        limit = 50
      } = req.query;

      const alerts = await MonitoringService.getActiveAlerts({
        status: status as string,
        severity: severity as string,
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve alerts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/v1/audit/monitoring/alerts
 * @desc Create custom alert
 * @access Private (Session Auth + Admin/Security Officer Role)
 */
router.post('/monitoring/alerts',
  sessionAuth,
  requireSessionRole(['ADMIN', 'SECURITY_OFFICER']),
  adminLimiter,
  async (req: Request, res: Response) => {
    try {
      const alertData = req.body;
      const userId = (req as any).user?.userId;

      const alert = await MonitoringService.createCustomAlert({
        ...alertData,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: alert
      });
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create alert',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/v1/audit/monitoring/dashboard
 * @desc Get monitoring dashboard data
 * @access Private (Session Auth + Admin/Manager/Security Officer Role)
 */
router.get('/monitoring/dashboard',
  sessionAuth,
  requireSessionRole(['ADMIN', 'MANAGER', 'SECURITY_OFFICER']),
  async (req: Request, res: Response) => {
    try {
      const {
        timeRange = '24h'
      } = req.query;

      const dashboardData = await MonitoringService.getDashboardData({
        timeRange: timeRange as string
      });

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ============================================
// DATA GOVERNANCE APIs
// ============================================

/**
 * @route GET /api/v1/audit/governance/classification
 * @desc Get data classification rules
 * @access Private (Session Auth + Admin/Compliance Officer/Data Analyst Role)
 */
router.get('/governance/classification',
  sessionAuth,
  requireSessionRole(['ADMIN', 'COMPLIANCE_OFFICER', 'DATA_ANALYST']),
  async (req: Request, res: Response) => {
    try {
      const {
        dataType,
        classification,
        isActive = true
      } = req.query;

      const rules = await DataGovernanceService.getClassificationRules({
        dataType: dataType as string,
        classification: classification as string,
        isActive: isActive === 'true'
      });

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('Get classification rules error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve classification rules',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/v1/audit/governance/classification
 * @desc Create classification rule
 * @access Private (Session Auth + Admin/Compliance Officer Role)
 */
router.post('/governance/classification',
  sessionAuth,
  requireSessionRole(['ADMIN', 'COMPLIANCE_OFFICER']),
  adminLimiter,
  async (req: Request, res: Response) => {
    try {
      const ruleData = req.body;
      const userId = (req as any).user?.userId;

      const rule = await DataGovernanceService.createClassificationRule({
        ...ruleData,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Classification rule created successfully',
        data: rule
      });
    } catch (error) {
      console.error('Create classification rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create classification rule',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/v1/audit/governance/retention
 * @desc Get retention policies
 * @access Private (Session Auth + Admin/Compliance Officer Role)
 */
router.get('/governance/retention',
  sessionAuth,
  requireSessionRole(['ADMIN', 'COMPLIANCE_OFFICER']),
  async (req: Request, res: Response) => {
    try {
      const {
        dataType,
        isActive = true
      } = req.query;

      const policies = await DataGovernanceService.getRetentionPolicies({
        dataType: dataType as string,
        isActive: isActive === 'true'
      });

      res.json({
        success: true,
        data: policies
      });
    } catch (error) {
      console.error('Get retention policies error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve retention policies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/v1/audit/governance/compliance
 * @desc Get compliance status
 * @access Private (Session Auth + Admin/Compliance Officer Role)
 */
router.get('/governance/compliance',
  sessionAuth,
  requireSessionRole(['ADMIN', 'COMPLIANCE_OFFICER']),
  async (req: Request, res: Response) => {
    try {
      const {
        complianceType,
        dateFrom,
        dateTo
      } = req.query;

      const complianceStatus = await DataGovernanceService.getComplianceStatus({
        complianceType: complianceType as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });

      res.json({
        success: true,
        data: complianceStatus
      });
    } catch (error) {
      console.error('Get compliance status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve compliance status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ============================================
// EXPORT & REPORTING APIs (DEV ONLY)
// ============================================

/**
 * @route GET /api/v1/audit/logs/export
 * @desc Export audit logs
 * @access Private (Session Auth + DEV Role)
 */
router.get('/logs/export',
  sessionAuth,
  requireSessionRole(['DEV']),
  adminLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        format = 'csv',
        dateFrom,
        dateTo,
        dataClassification,
        complianceLevel
      } = req.query;

      const exportData = await EnhancedAuditLogService.exportAuditLogs({
        format: format as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        dataClassification: dataClassification as string,
        complianceLevel: complianceLevel as string
      });

      res.setHeader('Content-Type', 
        format === 'csv' ? 'text/csv' : 
        format === 'json' ? 'application/json' : 
        'application/pdf'
      );
      res.setHeader('Content-Disposition', 
        `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.${format}`
      );

      res.send(exportData);
    } catch (error) {
      console.error('Export audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export audit logs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ============================================
// BACKUP & RECOVERY APIs
// ============================================

/**
 * @route GET /api/v1/audit/backup/status
 * @desc Get backup status
 * @access Private (Session Auth + Admin/DEV Role)
 */
router.get('/backup/status',
  sessionAuth,
  requireSessionRole(['ADMIN', 'DEV']),
  async (req: Request, res: Response) => {
    try {
      const backupStatus = await EnhancedAuditLogService.getBackupStatus();

      res.json({
        success: true,
        data: backupStatus
      });
    } catch (error) {
      console.error('Get backup status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve backup status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/v1/audit/backup/create
 * @desc Create manual backup
 * @access Private (Session Auth + DEV Role)
 */
router.post('/backup/create',
  sessionAuth,
  requireSessionRole(['DEV']),
  adminLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        backupType = 'FULL',
        includeArchives = true
      } = req.body;

      const backup = await EnhancedAuditLogService.createManualBackup({
        backupType,
        includeArchives
      });

      res.status(201).json({
        success: true,
        message: 'Backup created successfully',
        data: backup
      });
    } catch (error) {
      console.error('Create backup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create backup',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ============================================
// DATA QUALITY APIs
// ============================================

/**
 * @route GET /api/v1/audit/quality/score
 * @desc Get data quality scores
 * @access Private (Session Auth + Admin/Data Analyst Role)
 */
router.get('/quality/score',
  sessionAuth,
  requireSessionRole(['ADMIN', 'DATA_ANALYST']),
  async (req: Request, res: Response) => {
    try {
      const {
        dateFrom,
        dateTo,
        dataType
      } = req.query;

      const qualityScores = await DataGovernanceService.getDataQualityScores({
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        dataType: dataType as string
      });

      res.json({
        success: true,
        data: qualityScores
      });
    } catch (error) {
      console.error('Get data quality scores error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve data quality scores',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/v1/audit/quality/validate
 * @desc Trigger data validation
 * @access Private (Session Auth + Admin/Data Analyst Role)
 */
router.post('/quality/validate',
  sessionAuth,
  requireSessionRole(['ADMIN', 'DATA_ANALYST']),
  adminLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        validationType = 'FULL',
        dataType,
        dateFrom,
        dateTo
      } = req.body;

      const validationResult = await DataGovernanceService.triggerDataValidation({
        validationType,
        dataType,
        dateFrom,
        dateTo
      });

      res.json({
        success: true,
        message: 'Data validation triggered successfully',
        data: validationResult
      });
    } catch (error) {
      console.error('Trigger data validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger data validation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;