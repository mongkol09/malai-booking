import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// 🏥 Health Check Service สำหรับ Malai Resort API
export class HealthCheckService {
  private startTime: Date;
  private checks: HealthCheckResult[] = [];

  constructor() {
    this.startTime = new Date();
  }

  // 🔍 ตรวจสอบ Database Connection
  private async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        name: 'database',
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        details: {
          connection: 'active',
          responseTime: responseTime
        }
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: `${Date.now() - start}ms`,
        error: error instanceof Error ? error.message : 'Unknown database error',
        details: {
          connection: 'failed',
          error: error
        }
      };
    }
  }

  // 🔍 ตรวจสอบ Memory Usage
  private async checkMemory(): Promise<HealthCheckResult> {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const usagePercent = (usedMem / totalMem) * 100;

    return {
      name: 'memory',
      status: usagePercent > 90 ? 'warning' : 'healthy',
      responseTime: '0ms',
      details: {
        heapUsed: `${Math.round(usedMem / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(totalMem / 1024 / 1024)}MB`,
        usagePercent: `${usagePercent.toFixed(2)}%`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
      }
    };
  }

  // 🔍 ตรวจสอบ Disk Space
  private async checkDiskSpace(): Promise<HealthCheckResult> {
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      
      return {
        name: 'disk',
        status: 'healthy',
        responseTime: '0ms',
        details: {
          available: 'unknown', // ต้องการ fs.statvfs() ที่ไม่มีใน Node.js
          message: 'Disk space check not implemented'
        }
      };
    } catch (error) {
      return {
        name: 'disk',
        status: 'warning',
        responseTime: '0ms',
        error: 'Disk space check failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // 🔍 ตรวจสอบ Environment Variables
  private async checkEnvironment(): Promise<HealthCheckResult> {
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NODE_ENV'
    ];

    const missingVars: string[] = [];
    const presentVars: string[] = [];

    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        presentVars.push(varName);
      } else {
        missingVars.push(varName);
      }
    });

    return {
      name: 'environment',
      status: missingVars.length > 0 ? 'unhealthy' : 'healthy',
      responseTime: '0ms',
      details: {
        required: requiredEnvVars,
        present: presentVars,
        missing: missingVars,
        total: requiredEnvVars.length,
        presentCount: presentVars.length
      }
    };
  }

  // 🔍 ตรวจสอบ External Services
  private async checkExternalServices(): Promise<HealthCheckResult> {
    const services = [
      { name: 'omise', url: 'https://api.omise.co' },
      { name: 'mailersend', url: 'https://api.mailersend.com' }
    ];

    const results: any[] = [];
    let healthyCount = 0;

    for (const service of services) {
      try {
        const start = Date.now();
        const response = await axios.get(service.url, { timeout: 5000 });
        const responseTime = Date.now() - start;
        
        results.push({
          name: service.name,
          status: response.status === 200 ? 'healthy' : 'warning',
          responseTime: `${responseTime}ms`,
          statusCode: response.status
        });
        
        if (response.status === 200) healthyCount++;
      } catch (error) {
        results.push({
          name: service.name,
          status: 'unhealthy',
          responseTime: 'timeout',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      name: 'external_services',
      status: healthyCount === services.length ? 'healthy' : 
              healthyCount > 0 ? 'warning' : 'unhealthy',
      responseTime: '0ms',
      details: {
        services: results,
        healthyCount,
        totalCount: services.length
      }
    };
  }

  // 🔍 ตรวจสอบ Application Metrics
  private async checkApplicationMetrics(): Promise<HealthCheckResult> {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    return {
      name: 'application',
      status: 'healthy',
      responseTime: '0ms',
      details: {
        uptime: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
        uptimeSeconds: uptime,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        startTime: this.startTime.toISOString()
      }
    };
  }

  // 🔍 ตรวจสอบ Database Tables
  private async checkDatabaseTables(): Promise<HealthCheckResult> {
    try {
      const tables = [
        'User', 'Role', 'Room', 'RoomType', 'Booking', 
        'Payment', 'Guest', 'AuditLog', 'DailyAvailability'
      ];

      const results: any[] = [];
      let healthyCount = 0;

      for (const table of tables) {
        try {
          const start = Date.now();
          const count = await (prisma as any)[table.toLowerCase()].count();
          const responseTime = Date.now() - start;
          
          results.push({
            table,
            status: 'healthy',
            count,
            responseTime: `${responseTime}ms`
          });
          healthyCount++;
        } catch (error) {
          results.push({
            table,
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        name: 'database_tables',
        status: healthyCount === tables.length ? 'healthy' : 
                healthyCount > 0 ? 'warning' : 'unhealthy',
        responseTime: '0ms',
        details: {
          tables: results,
          healthyCount,
          totalCount: tables.length
        }
      };
    } catch (error) {
      return {
        name: 'database_tables',
        status: 'unhealthy',
        responseTime: '0ms',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          error: error
        }
      };
    }
  }

  // 🏥 รัน Health Check ทั้งหมด
  public async runHealthCheck(): Promise<HealthCheckResponse> {
    const startTime = Date.now();
    
    try {
      // รัน checks ทั้งหมดแบบ parallel
      const [
        database,
        memory,
        disk,
        environment,
        externalServices,
        application,
        databaseTables
      ] = await Promise.all([
        this.checkDatabase(),
        this.checkMemory(),
        this.checkDiskSpace(),
        this.checkEnvironment(),
        this.checkExternalServices(),
        this.checkApplicationMetrics(),
        this.checkDatabaseTables()
      ]);

      this.checks = [
        database,
        memory,
        disk,
        environment,
        externalServices,
        application,
        databaseTables
      ];

      // คำนวณ overall status
      const overallStatus = this.calculateOverallStatus();
      const totalResponseTime = Date.now() - startTime;

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: `${totalResponseTime}ms`,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.API_VERSION || 'v1.0.0',
        checks: this.checks,
        summary: {
          total: this.checks.length,
          healthy: this.checks.filter(c => c.status === 'healthy').length,
          warning: this.checks.filter(c => c.status === 'warning').length,
          unhealthy: this.checks.filter(c => c.status === 'unhealthy').length
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.API_VERSION || 'v1.0.0',
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: this.checks,
        summary: {
          total: this.checks.length,
          healthy: 0,
          warning: 0,
          unhealthy: this.checks.length
        }
      };
    }
  }

  // 🔍 คำนวณ Overall Status
  private calculateOverallStatus(): 'healthy' | 'warning' | 'unhealthy' {
    const unhealthyCount = this.checks.filter(c => c.status === 'unhealthy').length;
    const warningCount = this.checks.filter(c => c.status === 'warning').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  }

  // 🔍 Quick Health Check (สำหรับ Railway)
  public async quickHealthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// 📊 Types
export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'warning' | 'unhealthy';
  responseTime: string;
  error?: string;
  details?: any;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'warning' | 'unhealthy';
  timestamp: string;
  responseTime: string;
  environment: string;
  version: string;
  error?: string;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    warning: number;
    unhealthy: number;
  };
}

// 🏥 Export singleton instance
export const healthCheckService = new HealthCheckService();
