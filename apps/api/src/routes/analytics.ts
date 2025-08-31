// ============================================
// ANALYTICS ROUTES
// ============================================
// Hotel KPI Dashboard, Revenue Analytics, Occupancy Analysis, Booking Trends

import { Router } from 'express';
import { 
  getHotelKPIs,
  getRevenueAnalytics,
  getOccupancyAnalytics,
  getBookingTrends,
  getRealTimeDashboard,
  getRevenueTrends,
  getRoomOccupancyByType,
  getPaymentStatusOverview
} from '../controllers/analyticsController';
import { validateSimpleApiKey } from '../middleware/simpleApiKey';

const router = Router();

// All analytics routes require API key authentication
router.use(validateSimpleApiKey);

// ============================================
// HOTEL KPI DASHBOARD ROUTES
// ============================================

/**
 * GET /api/v1/analytics/dashboard/kpis
 * Main KPI dashboard with Occupancy Rate, ADR, RevPAR, Revenue
 * 
 * Query params:
 * - period: 'today' | 'week' | 'month' | 'quarter' | 'year' (default: 'today')
 * 
 * Response:
 * - Occupancy Rate (%)
 * - ADR (Average Daily Rate)
 * - RevPAR (Revenue Per Available Room)
 * - Total Revenue
 * - Trends (compared to previous period)
 */
router.get('/hotel-kpis', getHotelKPIs);

/**
 * GET /api/v1/analytics/real-time/dashboard
 * Real-time dashboard data for admin panel
 * 
 * Response:
 * - Today's arrivals/departures
 * - Current occupancy
 * - Today's revenue
 * - Recent bookings activity
 * - Upcoming events
 */
router.get('/realtime-dashboard', getRealTimeDashboard);

// ============================================
// REVENUE ANALYTICS ROUTES
// ============================================

/**
 * GET /api/v1/analytics/revenue
 * Detailed revenue analytics by room type, date range
 * 
 * Query params:
 * - dateFrom: YYYY-MM-DD (required)
 * - dateTo: YYYY-MM-DD (required)
 * - roomTypeId: string (optional) - filter by specific room type
 * - groupBy: 'day' | 'week' | 'month' (default: 'day')
 * 
 * Response:
 * - Revenue by time period
 * - Revenue by room type
 * - Summary statistics
 */
router.get('/revenue', getRevenueAnalytics);

// ============================================
// OCCUPANCY ANALYTICS ROUTES
// ============================================

/**
 * GET /api/v1/analytics/occupancy
 * Occupancy analytics and trends
 * 
 * Query params:
 * - dateFrom: YYYY-MM-DD (required)
 * - dateTo: YYYY-MM-DD (required)
 * - roomTypeId: string (optional) - filter by specific room type
 * - groupBy: 'day' | 'week' | 'month' (default: 'day')
 * 
 * Response:
 * - Occupancy rates by period
 * - Room utilization statistics
 * - Trends analysis
 */
router.get('/occupancy', getOccupancyAnalytics);

// ============================================
// BOOKING TRENDS & FORECASTING ROUTES
// ============================================

/**
 * GET /api/v1/analytics/booking-trends
 * Booking trends analysis and forecasting
 * 
 * Query params:
 * - dateFrom: YYYY-MM-DD (required)
 * - dateTo: YYYY-MM-DD (required)
 * - groupBy: 'day' | 'week' | 'month' (default: 'day')
 * 
 * Response:
 * - Booking trends over time
 * - Growth analysis
 * - Simple forecasting
 * - Insights and recommendations
 */
router.get('/booking-trends', getBookingTrends);

export default router;

/**
 * ============================================
 * ANALYTICS API USAGE EXAMPLES
 * ============================================
 * 
 * 1. Get today's KPIs:
 * GET /api/v1/analytics/dashboard/kpis?period=today
 * 
 * 2. Get monthly revenue by room type:
 * GET /api/v1/analytics/revenue?dateFrom=2025-01-01&dateTo=2025-01-31&groupBy=month
 * 
 * 3. Get weekly occupancy trends:
 * GET /api/v1/analytics/occupancy?dateFrom=2025-01-01&dateTo=2025-01-31&groupBy=week
 * 
 * 4. Get booking trends with forecasting:
 * GET /api/v1/analytics/booking-trends?dateFrom=2025-01-01&dateTo=2025-01-31&groupBy=week
 * 
 * 5. Get real-time dashboard:
 * GET /api/v1/analytics/real-time/dashboard
 * 
 * ============================================
 * RESPONSE EXAMPLES
 * ============================================
 * 
 * KPI Dashboard Response:
 * {
 *   "success": true,
 *   "data": {
 *     "period": "today",
 *     "kpis": {
 *       "occupancyRate": 75.5,
 *       "adr": 3200.00,
 *       "revpar": 2416.00,
 *       "totalRevenue": 145000.00,
 *       "totalBookings": 45
 *     },
 *     "trends": {
 *       "occupancyRate": { "value": 75.5, "change": 5.2, "trend": "up" },
 *       "adr": { "value": 3200, "change": -2.1, "trend": "down" }
 *     }
 *   }
 * }
 * 
 * Revenue Analytics Response:
 * {
 *   "success": true,
 *   "data": {
 *     "revenueAnalysis": {
 *       "byPeriod": [
 *         { "period": "2025-01-01", "revenue": 25000 },
 *         { "period": "2025-01-02", "revenue": 28000 }
 *       ],
 *       "byRoomType": [
 *         { "roomType": "Deluxe", "revenue": 150000, "bookings": 30 }
 *       ]
 *     }
 *   }
 * }
 */

// ============================================
// PRIORITY 1 ANALYTICS ROUTES
// ============================================

/**
 * GET /api/v1/analytics/revenue-trends
 * Daily revenue trends for line chart
 * 
 * Query params:
 * - period: 'daily' | 'weekly' | 'monthly' (default: 'daily')
 * - days: number of days to fetch (default: 30)
 * 
 * Response:
 * - Daily revenue data with dates
 * - Growth rate calculation
 * - Summary statistics
 */
router.get('/revenue-trends', getRevenueTrends);

/**
 * GET /api/v1/analytics/room-occupancy
 * Room occupancy by type for donut chart
 * 
 * Response:
 * - Occupancy rate by room type
 * - Chart data formatted for ApexCharts
 * - Revenue per room type
 */
router.get('/room-occupancy', getRoomOccupancyByType);

/**
 * GET /api/v1/analytics/payment-status
 * Payment status overview for bar chart
 * 
 * Response:
 * - Payment status breakdown (Paid, Pending, Overdue, Refunded)
 * - Count and amount for each status
 * - Chart data formatted for ApexCharts
 */
router.get('/payment-status', getPaymentStatusOverview);
