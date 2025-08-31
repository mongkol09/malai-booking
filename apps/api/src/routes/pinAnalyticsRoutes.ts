import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyAdminToken, requireAdminRole } from '../middleware/adminAuth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get PIN analytics data
 * GET /api/v1/admin/pin-analytics
 */
router.get('/pin-analytics', verifyAdminToken, requireAdminRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '7d';
    const now = new Date();
    const startDate = getStartDate(now, timeRange);

    // Fetch analytics data in parallel
    const [
      summary,
      usageTrend,
      userTypeDistribution,
      hourlyDistribution,
      recentActivity,
      securityAlerts
    ] = await Promise.all([
      getSummaryData(startDate, now),
      getUsageTrend(startDate, now, timeRange),
      getUserTypeDistribution(startDate, now),
      getHourlyDistribution(startDate, now),
      getRecentActivity(startDate, now, 20),
      getSecurityAlerts(startDate, now)
    ]);

    res.json({
      success: true,
      data: {
        summary,
        usageTrend,
        userTypeDistribution,
        hourlyDistribution,
        recentActivity,
        securityAlerts,
        timeRange,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('PIN analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Get real-time PIN activity
 * GET /api/v1/admin/pin-realtime
 */
router.get('/pin-realtime', verifyAdminToken, requireAdminRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    // Get latest activity in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentActivity = await prisma.activityLog.findFirst({
      where: {
        activityType: { startsWith: 'PIN_' },
        createdAt: { gte: fiveMinutesAgo }
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (recentActivity) {
      const parsedData = JSON.parse(recentActivity.data || '{}');
      
      res.json({
        success: true,
        data: {
          timestamp: recentActivity.createdAt.toISOString(),
          action: recentActivity.activityType,
          success: recentActivity.activityType.includes('SUCCESS'),
          userEmail: recentActivity.user?.email || 'Unknown',
          ipAddress: parsedData.ipAddress || 'Unknown'
        }
      });
    } else {
      res.json({
        success: true,
        data: null
      });
    }

  } catch (error) {
    console.error('Real-time PIN data error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Export PIN analytics to Excel
 * GET /api/v1/admin/pin-analytics/export
 */
router.get('/pin-analytics/export', verifyAdminToken, requireAdminRole(['ADMIN']), async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '7d';
    const now = new Date();
    const startDate = getStartDate(now, timeRange);

    // Fetch detailed data for export
    const [
      summaryData,
      usageData,
      userActivities,
      securityEvents
    ] = await Promise.all([
      getSummaryData(startDate, now),
      getDetailedUsageData(startDate, now),
      getUserActivities(startDate, now),
      getSecurityEvents(startDate, now)
    ]);

    // Return JSON data instead of Excel for now
    res.json({
      success: true,
      data: {
        timeRange,
        exportDate: now.toISOString(),
        summary: summaryData,
        usageData: usageData,
        userActivities: userActivities.slice(0, 100), // Limit for JSON response
        securityEvents: securityEvents.slice(0, 50),
        message: 'Analytics data exported successfully'
      }
    });

  } catch (error) {
    console.error('Export PIN analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Helper functions
function getStartDate(now: Date, timeRange: string): Date {
  const ranges = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  };
  
  const days = ranges[timeRange as keyof typeof ranges] || 7;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

async function getSummaryData(startDate: Date, endDate: Date) {
  const totalLogs = await prisma.activityLog.count({
    where: {
      activityType: { startsWith: 'PIN_' },
      createdAt: { gte: startDate, lte: endDate }
    }
  });

  const successfulLogs = await prisma.activityLog.count({
    where: {
      activityType: 'PIN_VERIFICATION_SUCCESS',
      createdAt: { gte: startDate, lte: endDate }
    }
  });

  const failedLogs = await prisma.activityLog.count({
    where: {
      activityType: 'PIN_VERIFICATION_FAILED',
      createdAt: { gte: startDate, lte: endDate }
    }
  });

  const activeUsers = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: {
      activityType: { startsWith: 'PIN_' },
      createdAt: { gte: startDate, lte: endDate },
      userId: { not: null }
    }
  });

  const successRate = totalLogs > 0 ? Math.round((successfulLogs / totalLogs) * 100) : 0;
  const failureRate = totalLogs > 0 ? Math.round((failedLogs / totalLogs) * 100) : 0;

  return {
    totalUsage: totalLogs,
    successfulAttempts: successfulLogs,
    failedAttempts: failedLogs,
    successRate,
    failureRate,
    activeUsers: activeUsers.length
  };
}

async function getUsageTrend(startDate: Date, endDate: Date, timeRange: string) {
  const groupFormat = timeRange === '1d' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d';
  
  const rawData = await prisma.$queryRaw`
    SELECT 
      DATE_FORMAT(created_at, ${groupFormat}) as date,
      activity_type,
      COUNT(*) as count
    FROM activity_logs 
    WHERE 
      activity_type LIKE 'PIN_%' 
      AND created_at >= ${startDate} 
      AND created_at <= ${endDate}
    GROUP BY DATE_FORMAT(created_at, ${groupFormat}), activity_type
    ORDER BY date
  ` as any[];

  // Process raw data into chart format
  const processedData = processUsageTrendData(rawData, timeRange);
  return processedData;
}

function processUsageTrendData(rawData: any[], timeRange: string) {
  const dataMap = new Map();
  
  rawData.forEach(row => {
    const date = row.date;
    if (!dataMap.has(date)) {
      dataMap.set(date, { date, successful: 0, failed: 0, locked: 0 });
    }
    
    const entry = dataMap.get(date);
    if (row.activity_type === 'PIN_VERIFICATION_SUCCESS') {
      entry.successful = row.count;
    } else if (row.activity_type === 'PIN_VERIFICATION_FAILED') {
      entry.failed = row.count;
    } else if (row.activity_type === 'PIN_LOCKOUT') {
      entry.locked = row.count;
    }
  });
  
  return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

async function getUserTypeDistribution(startDate: Date, endDate: Date) {
  const rawData = await prisma.$queryRaw`
    SELECT 
      u.user_type,
      COUNT(DISTINCT al.user_id) as count
    FROM activity_logs al
    JOIN users u ON al.user_id = u.user_id
    WHERE 
      al.activity_type LIKE 'PIN_%'
      AND al.created_at >= ${startDate} 
      AND al.created_at <= ${endDate}
      AND al.user_id IS NOT NULL
    GROUP BY u.user_type
  ` as any[];

  return rawData.map(row => ({
    name: row.user_type,
    value: row.count
  }));
}

async function getHourlyDistribution(startDate: Date, endDate: Date) {
  const rawData = await prisma.$queryRaw`
    SELECT 
      HOUR(created_at) as hour,
      COUNT(*) as count
    FROM activity_logs 
    WHERE 
      activity_type LIKE 'PIN_%'
      AND created_at >= ${startDate} 
      AND created_at <= ${endDate}
    GROUP BY HOUR(created_at)
    ORDER BY hour
  ` as any[];

  // Fill missing hours with 0
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i.toString().padStart(2, '0') + ':00',
    count: 0
  }));

  rawData.forEach(row => {
    hourlyData[row.hour].count = row.count;
  });

  return hourlyData;
}

async function getRecentActivity(startDate: Date, endDate: Date, limit: number = 20) {
  const activities = await prisma.activityLog.findMany({
    where: {
      activityType: { startsWith: 'PIN_' },
      createdAt: { gte: startDate, lte: endDate }
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return activities.map(activity => {
    const parsedData = JSON.parse(activity.data || '{}');
    return {
      id: activity.id,
      timestamp: activity.createdAt.toISOString(),
      userEmail: activity.user?.email || 'Unknown',
      action: activity.activityType,
      success: activity.activityType.includes('SUCCESS'),
      ipAddress: parsedData.ipAddress || 'Unknown'
    };
  });
}

async function getSecurityAlerts(startDate: Date, endDate: Date) {
  const alerts = [];

  // Check for suspicious activity patterns
  const suspiciousIPs = await prisma.$queryRaw`
    SELECT 
      JSON_UNQUOTE(JSON_EXTRACT(data, '$.ipAddress')) as ip_address,
      COUNT(*) as failed_count
    FROM activity_logs 
    WHERE 
      activity_type = 'PIN_VERIFICATION_FAILED'
      AND created_at >= ${startDate}
      AND created_at <= ${endDate}
      AND JSON_EXTRACT(data, '$.ipAddress') IS NOT NULL
    GROUP BY JSON_UNQUOTE(JSON_EXTRACT(data, '$.ipAddress'))
    HAVING failed_count >= 10
  ` as any[];

  suspiciousIPs.forEach(ip => {
    alerts.push({
      level: 'high',
      message: `Suspicious activity detected from IP ${ip.ip_address}: ${ip.failed_count} failed PIN attempts`,
      timestamp: new Date().toISOString()
    });
  });

  // Check for users with excessive failed attempts
  const problematicUsers = await prisma.$queryRaw`
    SELECT 
      u.email,
      COUNT(*) as failed_count
    FROM activity_logs al
    JOIN users u ON al.user_id = u.user_id
    WHERE 
      al.activity_type = 'PIN_VERIFICATION_FAILED'
      AND al.created_at >= ${startDate}
      AND al.created_at <= ${endDate}
    GROUP BY al.user_id, u.email
    HAVING failed_count >= 5
  ` as any[];

  problematicUsers.forEach(user => {
    alerts.push({
      level: 'medium',
      message: `User ${user.email} has ${user.failed_count} failed PIN attempts`,
      timestamp: new Date().toISOString()
    });
  });

  return alerts;
}

async function getDetailedUsageData(startDate: Date, endDate: Date) {
  return getUsageTrend(startDate, endDate, '7d');
}

async function getUserActivities(startDate: Date, endDate: Date) {
  return prisma.activityLog.findMany({
    where: {
      activityType: { startsWith: 'PIN_' },
      createdAt: { gte: startDate, lte: endDate }
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getSecurityEvents(startDate: Date, endDate: Date) {
  return prisma.activityLog.findMany({
    where: {
      activityType: { 
        in: ['PIN_LOCKOUT', 'PIN_VERIFICATION_FAILED', 'ADMIN_PIN_RESET', 'ADMIN_PIN_DISABLED'] 
      },
      createdAt: { gte: startDate, lte: endDate }
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export default router;
