// ============================================
// MOCK SERVICES FOR BUILD COMPATIBILITY
// ============================================

export class DataGovernanceService {
  static async getDataRetentionPolicies() {
    return {
      success: true,
      data: [],
      message: 'Mock service - not implemented yet'
    };
  }

  static async getRetentionPolicies(params: any = {}) {
    return {
      success: true,
      data: [],
      message: 'Mock service - not implemented yet'
    };
  }

  static async updateDataRetentionPolicy(policyId: string, data: any) {
    return {
      success: true,
      message: 'Mock service - not implemented yet'
    };
  }

  static async getClassificationRules(params: any = {}) {
    return {
      success: true,
      data: [],
      message: 'Mock service - not implemented yet'
    };
  }

  static async createClassificationRule(params: any = {}) {
    return {
      success: true,
      data: { ruleId: 'mock-rule-id' },
      message: 'Mock service - not implemented yet'
    };
  }

  static async getComplianceStatus(params: any = {}) {
    return {
      success: true,
      data: { status: 'compliant' },
      message: 'Mock service - not implemented yet'
    };
  }

  static async getDataQualityScores(params: any = {}) {
    return {
      success: true,
      data: { score: 95 },
      message: 'Mock service - not implemented yet'
    };
  }

  static async triggerDataValidation(params: any = {}) {
    return {
      success: true,
      data: { validationId: 'mock-validation-id' },
      message: 'Mock service - not implemented yet'
    };
  }
}

export class MonitoringService {
  static async getSystemHealth() {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      },
      message: 'Mock service - basic implementation'
    };
  }

  static async getPerformanceMetrics() {
    return {
      success: true,
      data: [],
      message: 'Mock service - not implemented yet'
    };
  }

  static async getActiveAlerts(params: any = {}) {
    return {
      success: true,
      data: [],
      message: 'Mock service - not implemented yet'
    };
  }

  static async createCustomAlert(params: any = {}) {
    return {
      success: true,
      data: { alertId: 'mock-alert-id' },
      message: 'Mock service - not implemented yet'
    };
  }

  static async getDashboardData(params: any = {}) {
    return {
      success: true,
      data: { widgets: [], metrics: [] },
      message: 'Mock service - not implemented yet'
    };
  }
}