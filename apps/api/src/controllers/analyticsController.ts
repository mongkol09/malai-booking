// ============================================
// HOTEL ANALYTICS & REPORTING CONTROLLER
// ============================================
// Comprehensive analytics for hotel KPIs, revenue tracking, and performance metrics

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const analyticsQuerySchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  roomTypeId: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

const dashboardQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'quarter', 'year']).default('today')
});

// ============================================
// HOTEL KPI DASHBOARD
// ============================================

/**
 * GET /api/v1/analytics/dashboard/kpis
 * Main KPI dashboard with Occupancy, ADR, RevPAR, Revenue
 */
export const getHotelKPIs = async (req: Request, res: Response) => {
  try {
    const { period } = dashboardQuerySchema.parse(req.query);
    
    // Calculate date range based on period
    const dateRange = calculateDateRange(period);
    
    console.log(`📊 Calculating KPIs for period: ${period}`, dateRange);

    // Mock KPI data for now (replace with real calculations)
    const kpis = {
      occupancyRate: 75.5,
      adr: 3200.00,
      revpar: 2416.00,
      totalRevenue: 145000.00,
      totalBookings: 45,
      occupiedRoomNights: 340,
      totalRoomNights: 450
    };

    // Mock trends data
    const trends = {
      occupancyRate: { value: 75.5, change: 5.2, trend: 'up' },
      adr: { value: 3200, change: -2.1, trend: 'down' },
      revpar: { value: 2416, change: 2.8, trend: 'up' },
      totalRevenue: { value: 145000, change: 8.5, trend: 'up' }
    };

    res.json({
      success: true,
      data: {
        period,
        dateRange,
        kpis,
        trends,
        metadata: {
          totalRooms: 60,
          totalBookings: 45,
          calculatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ KPI calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate hotel KPIs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/analytics/revenue
 * Detailed revenue analytics by room type, date range
 */
export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo, roomTypeId, groupBy } = analyticsQuerySchema.parse(req.query);
    
    console.log(`💰 Calculating revenue analytics from ${dateFrom} to ${dateTo}`);

    // Mock revenue data
    const revenueAnalysis = {
      byPeriod: [
        { period: '2025-08-01', revenue: 25000 },
        { period: '2025-08-02', revenue: 28000 },
        { period: '2025-08-03', revenue: 22000 }
      ],
      byRoomType: [
        { roomType: 'Deluxe Suite', revenue: 75000, bookings: 15, averageRevenue: 5000 },
        { roomType: 'Standard Room', revenue: 45000, bookings: 20, averageRevenue: 2250 },
        { roomType: 'Premium Villa', revenue: 120000, bookings: 10, averageRevenue: 12000 }
      ],
      summary: {
        totalRevenue: 240000,
        averageRevenue: 5333
      }
    };

    res.json({
      success: true,
      data: {
        period: {
          dateFrom,
          dateTo,
          groupBy
        },
        revenueAnalysis,
        summary: {
          totalRevenue: revenueAnalysis.summary.totalRevenue,
          averageRevenue: revenueAnalysis.summary.averageRevenue,
          totalBookings: 45,
          roomTypes: revenueAnalysis.byRoomType
        }
      }
    });

  } catch (error) {
    console.error('❌ Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate revenue analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/analytics/real-time/dashboard
 * Real-time dashboard data for admin panel
 */
export const getRealTimeDashboard = async (req: Request, res: Response) => {
  try {
    console.log('⚡ Fetching real-time dashboard data');

    // Mock real-time data
    const todayMetrics = {
      arrivals: 12,
      departures: 8,
      occupiedRooms: 45,
      totalRooms: 60,
      occupancyRate: 75.0,
      todayRevenue: 48000
    };

    const recentBookings = [
      {
        id: 'booking-001',
        guestName: 'John Smith',
        roomNumber: '101',
        roomType: 'Deluxe Suite',
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'booking-002',
        guestName: 'Alice Johnson',
        roomNumber: '205',
        roomType: 'Premium Villa',
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'InHouse',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        todayMetrics,
        recentActivity: {
          recentBookings
        }
      }
    });

  } catch (error) {
    console.error('❌ Real-time dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/analytics/occupancy
 * Occupancy analytics and trends
 */
export const getOccupancyAnalytics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo, roomTypeId } = analyticsQuerySchema.parse(req.query);
    
    console.log(`🏨 Calculating occupancy analytics from ${dateFrom} to ${dateTo}`);

    // Mock occupancy data
    const occupancyData = {
      overall: {
        occupancyRate: 75.5,
        occupiedRooms: 45,
        totalRooms: 60
      },
      trends: [
        { period: '2025-08-01', occupancyRate: 72.0, occupiedRooms: 43, totalRooms: 60 },
        { period: '2025-08-02', occupancyRate: 78.0, occupiedRooms: 47, totalRooms: 60 },
        { period: '2025-08-03', occupancyRate: 75.0, occupiedRooms: 45, totalRooms: 60 }
      ]
    };

    res.json({
      success: true,
      data: {
        period: {
          dateFrom,
          dateTo
        },
        occupancyData
      }
    });

  } catch (error) {
    console.error('❌ Occupancy analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate occupancy analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/analytics/booking-trends
 * Booking trends analysis and forecasting
 */
export const getBookingTrends = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo, groupBy } = analyticsQuerySchema.parse(req.query);
    
    console.log(`📈 Analyzing booking trends from ${dateFrom} to ${dateTo}`);

    // Mock trend analysis
    const trendAnalysis = {
      trends: [
        { period: '2025-08-01', bookings: 8 },
        { period: '2025-08-02', bookings: 12 },
        { period: '2025-08-03', bookings: 10 },
        { period: '2025-08-04', bookings: 15 }
      ],
      summary: {
        totalBookings: 45,
        averageBookingsPerPeriod: 11.25
      }
    };

    // Mock forecast
    const forecast = {
      nextPeriod: {
        predictedBookings: 13,
        confidence: 'Medium',
        trend: 'Increasing'
      },
      insights: [
        'Bookings trending upward',
        'Average change: +2.5 bookings per period'
      ]
    };

    const insights = [
      'Bookings increased by 5 in the latest period',
      'Strong booking volume observed',
      'Weekend bookings show 20% higher than weekdays'
    ];

    res.json({
      success: true,
      data: {
        period: {
          dateFrom,
          dateTo,
          groupBy
        },
        trendAnalysis,
        forecast,
        insights
      }
    });

  } catch (error) {
    console.error('❌ Booking trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze booking trends',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateDateRange(period: string) {
  const today = new Date();
  const endDate = new Date(today);
  let startDate = new Date();

  switch (period) {
    case 'today':
      startDate = new Date(today.toDateString());
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(today.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
}

// ============================================
// PRIORITY 1 ANALYTICS - NEW ENDPOINTS
// ============================================

/**
 * GET /api/v1/analytics/revenue-trends
 * Daily/Weekly/Monthly revenue trends for charts
 */
export const getRevenueTrends = async (req: Request, res: Response) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    
    console.log(`📈 Getting revenue trends for period: ${period}, days: ${days}`);

    // Generate mock daily revenue data for the last 30 days
    const generateRevenueData = (numDays: number) => {
      const data = [];
      const today = new Date();
      
      for (let i = numDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate realistic revenue data with some variation
        const baseRevenue = 25000;
        const weekendBoost = date.getDay() === 0 || date.getDay() === 6 ? 1.4 : 1.0;
        const randomVariation = 0.7 + Math.random() * 0.6; // 70% to 130%
        const revenue = Math.round(baseRevenue * weekendBoost * randomVariation);
        
        data.push({
          date: date.toISOString().split('T')[0],
          revenue: revenue,
          bookings: Math.round(revenue / 2500), // Avg booking value ~2500
          occupancy: Math.min(95, Math.round((revenue / baseRevenue) * 75))
        });
      }
      return data;
    };

    const trendData = generateRevenueData(Number(days));
    
    // Calculate summary statistics
    const totalRevenue = trendData.reduce((sum, day) => sum + day.revenue, 0);
    const averageRevenue = Math.round(totalRevenue / trendData.length);
    const totalBookings = trendData.reduce((sum, day) => sum + day.bookings, 0);
    
    // Calculate growth compared to previous period
    const currentPeriodRevenue = trendData.slice(-7).reduce((sum, day) => sum + day.revenue, 0);
    const previousPeriodRevenue = trendData.slice(-14, -7).reduce((sum, day) => sum + day.revenue, 0);
    const growthRate = previousPeriodRevenue > 0 ? 
      ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100) : 0;

    res.json({
      success: true,
      data: {
        period,
        trends: trendData,
        summary: {
          totalRevenue,
          averageRevenue,
          totalBookings,
          averageOccupancy: Math.round(trendData.reduce((sum, day) => sum + day.occupancy, 0) / trendData.length),
          growthRate: Math.round(growthRate * 100) / 100
        },
        metadata: {
          dataPoints: trendData.length,
          dateRange: {
            from: trendData[0]?.date,
            to: trendData[trendData.length - 1]?.date
          },
          generatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Revenue trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue trends',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/analytics/room-occupancy
 * Room occupancy by type for donut chart
 */
export const getRoomOccupancyByType = async (req: Request, res: Response) => {
  try {
    console.log('🏠 Getting room occupancy by type');

    // Mock data for different room types
    const roomOccupancy = [
      {
        roomType: 'Deluxe Suite',
        totalRooms: 15,
        occupiedRooms: 12,
        occupancyRate: 80.0,
        revenue: 75000,
        averageRate: 6250
      },
      {
        roomType: 'Premium Villa',
        totalRooms: 8,
        occupiedRooms: 7,
        occupancyRate: 87.5,
        revenue: 84000,
        averageRate: 12000
      },
      {
        roomType: 'Standard Room',
        totalRooms: 25,
        occupiedRooms: 18,
        occupancyRate: 72.0,
        revenue: 45000,
        averageRate: 2500
      },
      {
        roomType: 'Family Suite',
        totalRooms: 12,
        occupiedRooms: 9,
        occupancyRate: 75.0,
        revenue: 54000,
        averageRate: 6000
      }
    ];

    // Calculate totals
    const totalRooms = roomOccupancy.reduce((sum, room) => sum + room.totalRooms, 0);
    const totalOccupied = roomOccupancy.reduce((sum, room) => sum + room.occupiedRooms, 0);
    const overallOccupancy = Math.round((totalOccupied / totalRooms) * 100 * 10) / 10;
    const totalRevenue = roomOccupancy.reduce((sum, room) => sum + room.revenue, 0);

    res.json({
      success: true,
      data: {
        roomTypes: roomOccupancy,
        summary: {
          totalRooms,
          totalOccupied,
          overallOccupancy,
          totalRevenue,
          averageRate: Math.round(totalRevenue / totalOccupied)
        },
        chartData: roomOccupancy.map(room => ({
          name: room.roomType,
          value: room.occupiedRooms,
          percentage: room.occupancyRate,
          color: getColorForRoomType(room.roomType)
        }))
      }
    });

  } catch (error) {
    console.error('❌ Room occupancy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room occupancy data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/analytics/payment-status
 * Payment status overview for bar chart
 */
export const getPaymentStatusOverview = async (req: Request, res: Response) => {
  try {
    console.log('💳 Getting payment status overview');

    // Mock payment status data
    const paymentStatus = [
      {
        status: 'Paid',
        count: 32,
        amount: 180000,
        percentage: 71.1,
        color: '#28a745'
      },
      {
        status: 'Pending',
        count: 8,
        amount: 45000,
        percentage: 17.8,
        color: '#ffc107'
      },
      {
        status: 'Overdue',
        count: 3,
        amount: 18000,
        percentage: 6.7,
        color: '#dc3545'
      },
      {
        status: 'Refunded',
        count: 2,
        amount: 10000,
        percentage: 4.4,
        color: '#6c757d'
      }
    ];

    const totalBookings = paymentStatus.reduce((sum, status) => sum + status.count, 0);
    const totalAmount = paymentStatus.reduce((sum, status) => sum + status.amount, 0);

    res.json({
      success: true,
      data: {
        paymentStatus,
        summary: {
          totalBookings,
          totalAmount,
          paidPercentage: Math.round(((paymentStatus[0]?.count || 0) / totalBookings) * 100 * 10) / 10,
          outstandingAmount: paymentStatus.slice(1, 3).reduce((sum, status) => sum + status.amount, 0)
        },
        chartData: {
          categories: paymentStatus.map(status => status.status),
          series: [{
            name: 'Count',
            data: paymentStatus.map(status => status.count)
          }, {
            name: 'Amount (THB)',
            data: paymentStatus.map(status => status.amount)
          }],
          colors: paymentStatus.map(status => status.color)
        }
      }
    });

  } catch (error) {
    console.error('❌ Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function for room type colors
const getColorForRoomType = (roomType: string): string => {
  const colors: { [key: string]: string } = {
    'Deluxe Suite': '#ff6b6b',
    'Premium Villa': '#4ecdc4',
    'Standard Room': '#45b7d1',
    'Family Suite': '#96ceb4'
  };
  return colors[roomType] || '#95a5a6';
};
