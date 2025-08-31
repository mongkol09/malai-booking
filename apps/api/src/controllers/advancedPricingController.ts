// ============================================
// ADVANCED DYNAMIC PRICING CONTROLLER
// ============================================

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, asyncHandler } from '../utils/auth';

const prisma = new PrismaClient();

// ============================================
// PRICING CALCULATION ENGINE
// ============================================

interface PricingCondition {
  [key: string]: any;
}

interface PricingAction {
  type: 'increase_rate_by_percent' | 'decrease_rate_by_percent' | 'increase_rate_by_amount' | 'decrease_rate_by_amount' | 'set_new_rate' | 'apply_restriction';
  value?: number;
  target_room_type?: string;
  based_on?: string;
  modifier_type?: string;
  modifier_value?: number;
}

interface CalculatePricingParams {
  roomTypeId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests?: number;
  leadTimeDays?: number;
}

export const calculateAdvancedPricing = asyncHandler(async (req: Request, res: Response) => {
  const {
    roomTypeId,
    checkInDate,
    checkOutDate,
    numberOfGuests = 2,
    leadTimeDays
  }: CalculatePricingParams = req.body;

  try {
    // Get base rate for room type
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: {
        id: true,
        name: true,
        baseRate: true,
      }
    });

    if (!roomType) {
      res.status(404).json({
        success: false,
        error: 'Room type not found'
      });
      return;
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate lead time if not provided
    const actualLeadTimeDays = leadTimeDays || Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Get applicable pricing rules (ordered by priority)
    const pricingRules = await prisma.dynamicPricingRule.findMany({
      where: {
        isActive: true,
        OR: [
          { dateRangeStart: null, dateRangeEnd: null },
          {
            AND: [
              { dateRangeStart: { lte: startDate } },
              { dateRangeEnd: { gte: endDate } }
            ]
          }
        ]
      },
      orderBy: { priority: 'asc' }, // Lower priority number = higher importance
    });

    // Calculate pricing for each night
    const nightlyPrices = [];
    const appliedRules = [];
    
    for (let night = 0; night < nights; night++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + night);
      
      let finalPrice = Number(roomType.baseRate);
      let appliedRule = null;

      // Get current occupancy for the date
      const occupancyData = await calculateOccupancyForDate(currentDate, roomTypeId);
      
      // Apply pricing rules (First Match Wins based on priority)
      for (const rule of pricingRules) {
        if (await evaluateRuleConditions(rule.conditions as any, {
          currentDate,
          roomTypeId,
          occupancyData,
          leadTimeDays: actualLeadTimeDays,
          numberOfGuests,
          dayOfWeek: currentDate.getDay()
        })) {
          const actionResult = await applyPricingAction(
            rule.action as any,
            finalPrice,
            roomType.baseRate as any,
            roomTypeId
          );
          
          if (actionResult.priceAdjustment !== null) {
            finalPrice = actionResult.priceAdjustment;
            appliedRule = {
              ruleId: rule.id,
              ruleName: rule.name,
              priority: rule.priority,
              action: rule.action,
              originalPrice: Number(roomType.baseRate),
              adjustedPrice: finalPrice
            };
            break; // First Match Wins
          }
        }
      }

      nightlyPrices.push({
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: currentDate.getDay(),
        basePrice: Number(roomType.baseRate),
        finalPrice: finalPrice,
        appliedRule: appliedRule
      });

      if (appliedRule) {
        appliedRules.push(appliedRule);
      }
    }

    const totalAmount = nightlyPrices.reduce((sum, night) => sum + night.finalPrice, 0);
    const averageNightlyRate = totalAmount / nights;
    const totalDiscount = nightlyPrices.reduce((sum, night) => sum + (night.basePrice - night.finalPrice), 0);

    res.json({
      success: true,
      data: {
        roomType: {
          id: roomType.id,
          name: roomType.name,
          baseRate: Number(roomType.baseRate)
        },
        bookingDetails: {
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          nights: nights,
          numberOfGuests: numberOfGuests,
          leadTimeDays: actualLeadTimeDays
        },
        pricing: {
          nightlyPrices: nightlyPrices,
          totalAmount: Math.round(totalAmount * 100) / 100,
          averageNightlyRate: Math.round(averageNightlyRate * 100) / 100,
          totalDiscount: Math.round(totalDiscount * 100) / 100,
          appliedRulesCount: appliedRules.length
        },
        appliedRules: appliedRules,
        calculatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Advanced pricing calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate advanced pricing'
    });
  }
});

// ============================================
// PRICING RULE EVALUATION ENGINE
// ============================================

async function evaluateRuleConditions(
  conditions: any,
  context: {
    currentDate: Date;
    roomTypeId: string;
    occupancyData: any;
    leadTimeDays: number;
    numberOfGuests: number;
    dayOfWeek: number;
  }
): Promise<boolean> {
  if (!conditions) return false;

  // Handle AND conditions
  if (conditions.and && Array.isArray(conditions.and)) {
    for (const condition of conditions.and) {
      if (!await evaluateSingleCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  // Handle OR conditions
  if (conditions.or && Array.isArray(conditions.or)) {
    for (const condition of conditions.or) {
      if (await evaluateSingleCondition(condition, context)) {
        return true;
      }
    }
    return false;
  }

  // Handle single condition
  return await evaluateSingleCondition(conditions, context);
}

async function evaluateSingleCondition(condition: any, context: any): Promise<boolean> {
  const key = Object.keys(condition)[0];
  const value = condition[key];

  switch (key) {
    case 'day_of_week':
      if (value.in) return value.in.includes(context.dayOfWeek);
      if (value.not_in) return !value.not_in.includes(context.dayOfWeek);
      if (value.eq) return context.dayOfWeek === value.eq;
      break;

    case 'lead_time_days':
      if (value.gte) return context.leadTimeDays >= value.gte;
      if (value.lte) return context.leadTimeDays <= value.lte;
      if (value.eq) return context.leadTimeDays === value.eq;
      break;

    case 'occupancy_percent':
    case 'overall_occupancy_percent':
      const occupancyPercent = context.occupancyData.occupancyPercent || 0;
      if (value.gte) return occupancyPercent >= value.gte;
      if (value.lte) return occupancyPercent <= value.lte;
      if (value.eq) return occupancyPercent === value.eq;
      break;

    case 'room_type_occupancy':
      if (value.type === context.roomTypeId && value.gte) {
        return context.occupancyData.occupancyPercent >= value.gte;
      }
      break;

    case 'is_holiday':
      const isHoliday = await checkIfHoliday(context.currentDate);
      return value.eq ? isHoliday : !isHoliday;

    case 'event_nearby':
    case 'event_category':
      const events = await checkNearbyEvents(context.currentDate);
      if (key === 'event_nearby') return value.eq ? events.length > 0 : events.length === 0;
      if (key === 'event_category') return events.some((e: any) => e.eventType === value.eq);
      break;

    case 'is_orphan_night':
      const isOrphan = await checkOrphanNight(context.currentDate, context.roomTypeId);
      return value.eq ? isOrphan : !isOrphan;

    case 'booking_pace_delta':
      const paceDelta = await calculateBookingPace(context.currentDate, context.roomTypeId);
      if (value.gte) return paceDelta >= value.gte;
      if (value.lte) return paceDelta <= value.lte;
      break;

    default:
      return false;
  }

  return false;
}

// ============================================
// PRICING ACTION ENGINE
// ============================================

async function applyPricingAction(
  action: PricingAction,
  currentPrice: number,
  baseRate: number,
  roomTypeId: string
): Promise<{ priceAdjustment: number | null; restrictions?: any }> {
  switch (action.type) {
    case 'increase_rate_by_percent':
      return {
        priceAdjustment: currentPrice * (1 + (action.value || 0) / 100)
      };

    case 'decrease_rate_by_percent':
      return {
        priceAdjustment: currentPrice * (1 - (action.value || 0) / 100)
      };

    case 'increase_rate_by_amount':
      return {
        priceAdjustment: currentPrice + (action.value || 0)
      };

    case 'decrease_rate_by_amount':
      return {
        priceAdjustment: currentPrice - (action.value || 0)
      };

    case 'set_new_rate':
      if (action.based_on === 'base_rate' && action.modifier_type === 'percent') {
        return {
          priceAdjustment: baseRate * ((action.modifier_value || 100) / 100)
        };
      }
      return {
        priceAdjustment: action.value || currentPrice
      };

    case 'apply_restriction':
      return {
        priceAdjustment: null,
        restrictions: action.value
      };

    default:
      return { priceAdjustment: null };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function calculateOccupancyForDate(date: Date, roomTypeId: string) {
  const dateStr = date.toISOString().split('T')[0];
  
  // Get total rooms for room type
  const totalRooms = await prisma.room.count({
    where: {
      roomTypeId: roomTypeId,
      status: 'Available'
    }
  });

  // Get booked rooms for the date
  const bookedRooms = await prisma.booking.count({
    where: {
      roomTypeId: roomTypeId,
      status: {
        in: ['Confirmed', 'CheckedIn']
      },
      checkinDate: { lte: date },
      checkoutDate: { gt: date }
    }
  });

  const occupancyPercent = totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0;

  return {
    totalRooms,
    bookedRooms,
    availableRooms: totalRooms - bookedRooms,
    occupancyPercent: Math.round(occupancyPercent * 100) / 100
  };
}

async function checkIfHoliday(date: Date): Promise<boolean> {
  // Check if date is a holiday from Events table
  const events = await prisma.event.findMany({
    where: {
      startTime: { lte: date },
      endTime: { gte: date },
      eventType: 'HOLIDAY'
    }
  });

  return events.length > 0;
}

async function checkNearbyEvents(date: Date) {
  // Check for events within 3 days of the date
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - 3);
  const endDate = new Date(date);
  endDate.setDate(date.getDate() + 3);

  return await prisma.event.findMany({
    where: {
      startTime: { gte: startDate },
      endTime: { lte: endDate },
      affectsPricing: true
    }
  });
}

async function checkOrphanNight(date: Date, roomTypeId: string): Promise<boolean> {
  // Check if this night is isolated between bookings (orphan night)
  const prevDay = new Date(date);
  prevDay.setDate(date.getDate() - 1);
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);

  const prevBooking = await prisma.booking.findFirst({
    where: {
      roomTypeId,
      checkoutDate: date,
      status: { in: ['Confirmed', 'CheckedIn'] }
    }
  });

  const nextBooking = await prisma.booking.findFirst({
    where: {
      roomTypeId,
      checkinDate: nextDay,
      status: { in: ['Confirmed', 'CheckedIn'] }
    }
  });

  return !!(prevBooking && nextBooking);
}

async function calculateBookingPace(date: Date, roomTypeId: string): Promise<number> {
  // Calculate booking pace compared to historical data
  const currentBookings = await prisma.booking.count({
    where: {
      roomTypeId,
      checkinDate: date,
      status: { in: ['Confirmed', 'CheckedIn'] }
    }
  });

  // For demo: return random pace between 0.8 and 1.5
  return 1.0 + (Math.random() - 0.5) * 0.8;
}

// ============================================
// BULK PRICING OPERATIONS
// ============================================

export const bulkCreatePricingRules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { rules } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
    return;
  }

  if (!Array.isArray(rules)) {
    res.status(400).json({
      success: false,
      error: 'Rules must be an array'
    });
    return;
  }

  const createdRules = await prisma.dynamicPricingRule.createMany({
    data: rules.map((rule: any) => ({
      name: rule.name,
      description: rule.description,
      priority: rule.priority,
      conditions: rule.conditions,
      action: rule.action,
      dateRangeStart: rule.dateRangeStart ? new Date(rule.dateRangeStart) : null,
      dateRangeEnd: rule.dateRangeEnd ? new Date(rule.dateRangeEnd) : null,
      roomTypes: rule.roomTypes || [],
      isActive: rule.isActive !== false,
      createdBy: userId,
    }))
  });

  res.status(201).json({
    success: true,
    message: `${createdRules.count} pricing rules created successfully`,
    data: { createdCount: createdRules.count }
  });
});

// ============================================
// PRICING ANALYTICS
// ============================================

export const getPricingAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { dateFrom, dateTo, roomTypeId } = req.query;

  const analytics = {
    totalRulesActive: await prisma.dynamicPricingRule.count({ where: { isActive: true } }),
    averagePriceAdjustment: 0,
    mostUsedRules: [],
    occupancyImpact: 0,
    revenueImpact: 0
  };

  res.json({
    success: true,
    data: analytics
  });
});
