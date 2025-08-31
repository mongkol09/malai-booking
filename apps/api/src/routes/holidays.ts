// ============================================
// HOLIDAY MANAGEMENT ROUTES
// ============================================

import express from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import HolidayCalendarService from '../services/holidayCalendarService';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

/**
 * @route   GET /api/v1/holidays
 * @desc    Get all holidays for the year
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const holidays = HolidayCalendarService.getAllHolidays();
  
  res.json({
    success: true,
    data: {
      holidays,
      count: holidays.length,
      year: 2025
    },
    message: 'Holidays retrieved successfully'
  });
}));

/**
 * @route   GET /api/v1/holidays/check/:date
 * @desc    Check if a specific date is a holiday
 * @access  Public
 */
router.get('/check/:date', 
  param('date').isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    const isHoliday = HolidayCalendarService.isHoliday(date);
    const holiday = HolidayCalendarService.getHoliday(date);
    const festivalInfo = HolidayCalendarService.isFestivalPeriod(date);
    const isLongWeekend = HolidayCalendarService.isLongWeekend(date);
    const intensity = HolidayCalendarService.getHolidayIntensity(date);
    
    res.json({
      success: true,
      data: {
        date,
        isHoliday,
        holiday,
        isFestival: festivalInfo.isFestival,
        festivalName: festivalInfo.festivalName,
        isLongWeekend,
        holidayIntensity: intensity,
        dayOfWeek: new Date(date).getDay()
      },
      message: `Holiday check for ${date} completed`
    });
  })
);

/**
 * @route   GET /api/v1/holidays/month/:year/:month
 * @desc    Get holidays for a specific month
 * @access  Public
 */
router.get('/month/:year/:month',
  param('year').isInt({ min: 2024, max: 2030 }).withMessage('Year must be between 2024-2030'),
  param('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1-12'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { year, month } = req.params;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month parameters are required'
      });
    }
    
    const holidays = HolidayCalendarService.getHolidaysInMonth(parseInt(year), parseInt(month));
    
    res.json({
      success: true,
      data: {
        holidays,
        count: holidays.length,
        year: parseInt(year),
        month: parseInt(month)
      },
      message: `Holidays for ${year}-${String(month).padStart(2, '0')} retrieved successfully`
    });
  })
);

/**
 * @route   GET /api/v1/holidays/range
 * @desc    Get holidays in a date range
 * @access  Public
 */
router.get('/range',
  query('startDate').isISO8601().withMessage('Start date must be in YYYY-MM-DD format'),
  query('endDate').isISO8601().withMessage('End date must be in YYYY-MM-DD format'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const holidays = HolidayCalendarService.getHolidaysInRange(startDate as string, endDate as string);
    
    res.json({
      success: true,
      data: {
        holidays,
        count: holidays.length,
        dateRange: {
          start: startDate,
          end: endDate
        }
      },
      message: `Holidays in range ${startDate} to ${endDate} retrieved successfully`
    });
  })
);

/**
 * @route   POST /api/v1/holidays/test-pricing
 * @desc    Test pricing calculation for multiple dates
 * @access  Public
 */
router.post('/test-pricing',
  body('dates').isArray().withMessage('Dates must be an array'),
  body('dates.*').isISO8601().withMessage('Each date must be in YYYY-MM-DD format'),
  body('roomTypeId').isUUID().withMessage('Room type ID must be a valid UUID'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { dates, roomTypeId } = req.body;
    
    const results = [];
    
    for (const date of dates) {
      const holidayInfo = {
        isHoliday: HolidayCalendarService.isHoliday(date),
        holiday: HolidayCalendarService.getHoliday(date),
        isFestival: HolidayCalendarService.isFestivalPeriod(date),
        isLongWeekend: HolidayCalendarService.isLongWeekend(date),
        intensity: HolidayCalendarService.getHolidayIntensity(date)
      };
      
      results.push({
        date,
        holidayInfo,
        dayOfWeek: new Date(date).getDay()
      });
    }
    
    res.json({
      success: true,
      data: {
        roomTypeId,
        testResults: results,
        summary: {
          totalDates: dates.length,
          holidayDates: results.filter(r => r.holidayInfo.isHoliday).length,
          festivalDates: results.filter(r => r.holidayInfo.isFestival.isFestival).length,
          longWeekendDates: results.filter(r => r.holidayInfo.isLongWeekend).length
        }
      },
      message: 'Holiday pricing test completed successfully'
    });
  })
);

export default router;
