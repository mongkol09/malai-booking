// ============================================
// ENHANCED ANALYTICS ROUTES
// ============================================
// Advanced forecasting, filters, and drill-down routes

import { Router } from 'express';
import { EnhancedAnalyticsController } from '../controllers/enhancedAnalyticsController';
import { validateSimpleApiKey } from '../middleware/simpleApiKey';

const router = Router();

// Apply API key middleware to all routes
router.use(validateSimpleApiKey);

// ============================================
// ADVANCED FORECASTING ROUTES
// ============================================

/**
 * Advanced Revenue Forecasting
 * GET /api/analytics/advanced/revenue-forecast
 * Query params:
 * - startDate: Start date for historical data (default: 2024-01-01)
 * - endDate: End date for historical data (default: 2024-12-31)
 * - algorithm: Forecasting algorithm (holt-winters|arima|ml|ensemble, default: ensemble)
 * - forecastPeriods: Number of periods to forecast (default: 30)
 */
router.get('/advanced/revenue-forecast', EnhancedAnalyticsController.getAdvancedRevenueForecast);

/**
 * Advanced Occupancy Forecasting
 * GET /api/analytics/advanced/occupancy-forecast
 * Same query params as revenue forecast
 */
router.get('/advanced/occupancy-forecast', EnhancedAnalyticsController.getAdvancedOccupancyForecast);

// ============================================
// ADVANCED FILTERING & DRILL-DOWN ROUTES
// ============================================

/**
 * Multi-dimensional Analytics
 * GET /api/analytics/advanced/multi-dimensional
 * Query params:
 * - filters: JSON string of AdvancedFilters object
 * Example filters:
 * {
 *   "dateRange": {
 *     "start": "2024-01-01T00:00:00.000Z",
 *     "end": "2024-12-31T23:59:59.999Z",
 *     "granularity": "month"
 *   },
 *   "customer": {
 *     "segments": ["business", "leisure"],
 *     "loyaltyTiers": ["gold", "platinum"]
 *   },
 *   "property": {
 *     "roomTypes": ["suite", "deluxe"],
 *     "priceRange": { "min": 100, "max": 500 }
 *   },
 *   "booking": {
 *     "channels": ["direct", "ota"],
 *     "leadTime": { "min": 1, "max": 90 }
 *   }
 * }
 */
router.get('/advanced/multi-dimensional', EnhancedAnalyticsController.getMultiDimensionalAnalytics);

/**
 * Drill-down Analysis
 * GET /api/analytics/advanced/drill-down
 * Query params:
 * - drillDown: JSON string of DrillDownRequest object
 * Example drillDown:
 * {
 *   "metric": "revenue",
 *   "dimensions": ["country"],
 *   "filters": { ... },
 *   "groupBy": ["country"],
 *   "sortBy": { "field": "revenue", "direction": "desc" },
 *   "limit": 20
 * }
 */
router.get('/advanced/drill-down', EnhancedAnalyticsController.performDrillDown);

/**
 * Customer Cohort Analysis
 * GET /api/analytics/advanced/cohort-analysis
 * Query params:
 * - filters: JSON string of AdvancedFilters object
 */
router.get('/advanced/cohort-analysis', EnhancedAnalyticsController.getCohortAnalysis);

/**
 * Advanced Customer Segmentation
 * GET /api/analytics/advanced/segmentation
 * Query params:
 * - filters: JSON string of AdvancedFilters object
 */
router.get('/advanced/segmentation', EnhancedAnalyticsController.getAdvancedSegmentation);

// ============================================
// REAL-TIME ANALYTICS ROUTES
// ============================================

/**
 * Real-time Performance Dashboard
 * GET /api/analytics/advanced/real-time
 * Returns live metrics, hourly trends, alerts, and insights
 */
router.get('/advanced/real-time', EnhancedAnalyticsController.getRealTimePerformance);

/**
 * Predictive Analytics Dashboard
 * GET /api/analytics/advanced/predictive
 * Query params:
 * - granularity: Time granularity (hour|day|week|month, default: day)
 */
router.get('/advanced/predictive', EnhancedAnalyticsController.getPredictiveAnalytics);

export default router;
