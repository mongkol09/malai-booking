// ============================================
// DYNAMIC PRICING CONTROLLER - สำคัญมาก!
// ============================================

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/validateApiKey';
import HolidayCalendarService from '../services/holidayCalendarService';

const prisma = new PrismaClient();

// ============================================
// CREATE PRICING RULE
// ============================================

export const createPricingRule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    priority,
    conditions,
    action,
    dateRangeStart,
    dateRangeEnd,
    roomTypes,
    isActive = true
  } = req.body;

  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ 
      success: false, 
      error: 'User not authenticated' 
    });
    return;
  }

  const rule = await prisma.dynamicPricingRule.create({
    data: {
      name,
      description,
      priority: parseInt(priority),
      conditions,
      action,
      dateRangeStart: dateRangeStart ? new Date(dateRangeStart) : null,
      dateRangeEnd: dateRangeEnd ? new Date(dateRangeEnd) : null,
      roomTypes: roomTypes || [],
      isActive: Boolean(isActive),
      createdBy: userId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Pricing rule created successfully',
    data: { rule },
  });
});

// ============================================
// GET ALL PRICING RULES
// ============================================

export const getPricingRules = asyncHandler(async (req: Request, res: Response) => {
  const { isActive, roomType } = req.query;

  const where: any = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  if (roomType) {
    where.roomTypes = {
      has: roomType as string,
    };
  }

  const rules = await prisma.dynamicPricingRule.findMany({
    where,
    orderBy: {
      priority: 'asc', // Priority น้อยที่สุดก่อน (สำคัญที่สุด)
    },
    include: {
      creator: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: { rules },
  });
});

// ============================================
// CALCULATE DYNAMIC PRICING (สำคัญมาก!)
// ============================================

export const calculateDynamicPrice = asyncHandler(async (req: Request, res: Response) => {
  const {
    roomTypeId,
    checkInDate,
    checkOutDate,
    leadTimeDays,
    numAdults = 1,
    numChildren = 0
  } = req.body;

  // 1. ดึงราคาพื้นฐาน
  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    select: { baseRate: true, name: true },
  });

  if (!roomType) {
    throw new AppError('Room type not found', 404);
  }

  let finalRate = parseFloat(roomType.baseRate.toString());
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // 2. ดึงกฎทั้งหมดที่เปิดใช้งาน เรียงตาม priority
  const rules = await prisma.dynamicPricingRule.findMany({
    where: {
      isActive: true,
      OR: [
        { roomTypes: { isEmpty: true } }, // กฎที่ใช้กับห้องทุกประเภท
        { roomTypes: { has: roomTypeId } }, // กฎเฉพาะประเภทห้องนี้
      ],
      // ตรวจสอบช่วงวันที่
      AND: [
        {
          OR: [
            { dateRangeStart: null },
            { dateRangeStart: { lte: checkIn } },
          ],
        },
        {
          OR: [
            { dateRangeEnd: null },
            { dateRangeEnd: { gte: checkOut } },
          ],
        },
      ],
    },
    orderBy: {
      priority: 'asc', // Priority น้อยที่สุดก่อน
    },
  });

  // 3. หาอัตราการเข้าพักปัจจุบัน
  const totalRooms = await prisma.room.count({
    where: { roomTypeId },
  });

  const occupiedRooms = await prisma.booking.count({
    where: {
      roomType: { id: roomTypeId },
      status: { in: ['Confirmed', 'InHouse'] },
      OR: [
        {
          AND: [
            { checkinDate: { lte: checkIn } },
            { checkoutDate: { gt: checkIn } },
          ],
        },
        {
          AND: [
            { checkinDate: { lt: checkOut } },
            { checkoutDate: { gte: checkOut } },
          ],
        },
        {
          AND: [
            { checkinDate: { gte: checkIn } },
            { checkoutDate: { lte: checkOut } },
          ],
        },
      ],
    },
  });

  const occupancyPercent = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // 4. ประมวลผลกฎตาม Priority (First Match Wins)
  let appliedRule = null;
  
  for (const rule of rules) {
    const conditions = rule.conditions as any;
    let matchesAllConditions = true;

    // ตรวจสอบเงื่อนไขต่างๆ
    if (conditions.and) {
      for (const condition of conditions.and) {
        // ตรวจสอบเงื่อนไข occupancy
        if (condition.occupancy_percent) {
          const { gte, lte, eq } = condition.occupancy_percent;
          if (gte && occupancyPercent < gte) matchesAllConditions = false;
          if (lte && occupancyPercent > lte) matchesAllConditions = false;
          if (eq && occupancyPercent !== eq) matchesAllConditions = false;
        }

        // ตรวจสอบเงื่อนไข lead time
        if (condition.lead_time_days) {
          const { gte, lte, eq } = condition.lead_time_days;
          if (gte && leadTimeDays < gte) matchesAllConditions = false;
          if (lte && leadTimeDays > lte) matchesAllConditions = false;
          if (eq && leadTimeDays !== eq) matchesAllConditions = false;
        }

        // ตรวจสอบเงื่อนไขวันในสัปดาห์
        if (condition.day_of_week) {
          const dayOfWeek = checkIn.getDay(); // 0=Sunday, 6=Saturday
          if (condition.day_of_week.in && !condition.day_of_week.in.includes(dayOfWeek)) {
            matchesAllConditions = false;
          }
          if (condition.day_of_week.not_in && condition.day_of_week.not_in.includes(dayOfWeek)) {
            matchesAllConditions = false;
          }
        }

        // ⭐ NEW: ตรวจสอบเงื่อนไขวันหยุด (Holiday Premium)
        if (condition.is_holiday) {
          const isHoliday = HolidayCalendarService.isHoliday(checkIn);
          if (condition.is_holiday.eq === true && !isHoliday) {
            matchesAllConditions = false;
          }
          if (condition.is_holiday.eq === false && isHoliday) {
            matchesAllConditions = false;
          }
        }

        // ⭐ NEW: ตรวจสอบเงื่อนไขเทศกาลพิเศษ
        if (condition.is_festival) {
          const festival = HolidayCalendarService.isFestivalPeriod(checkIn);
          if (condition.is_festival.eq === true && !festival.isFestival) {
            matchesAllConditions = false;
          }
          if (condition.is_festival.eq === false && festival.isFestival) {
            matchesAllConditions = false;
          }
        }

        // ⭐ NEW: ตรวจสอบเงื่อนไข Long Weekend
        if (condition.is_long_weekend) {
          const isLongWeekend = HolidayCalendarService.isLongWeekend(checkIn);
          if (condition.is_long_weekend.eq === true && !isLongWeekend) {
            matchesAllConditions = false;
          }
          if (condition.is_long_weekend.eq === false && isLongWeekend) {
            matchesAllConditions = false;
          }
        }
      }
    }

    // ถ้าเงื่อนไขตรงกัน ใช้กฎนี้แล้วหยุด (First Match Wins)
    if (matchesAllConditions) {
      appliedRule = rule;
      
      const action = rule.action as any;
      
      switch (action.type) {
        case 'increase_rate_by_percent':
          finalRate = finalRate * (1 + action.value / 100);
          break;
        case 'decrease_rate_by_percent':
          finalRate = finalRate * (1 - action.value / 100);
          break;
        case 'increase_rate_by_amount':
          finalRate = finalRate + action.value;
          break;
        case 'decrease_rate_by_amount':
          finalRate = finalRate - action.value;
          break;
        case 'set_new_rate':
          if (action.modifier_type === 'percent') {
            finalRate = parseFloat(roomType.baseRate.toString()) * (action.modifier_value / 100);
          } else {
            finalRate = action.modifier_value;
          }
          break;
      }
      
      break; // หยุดหากฎแรกที่ตรงเงื่อนไข
    }
  }

  const totalPrice = finalRate * nights;

  // ⭐ NEW: เพิ่มข้อมูลวันหยุดใน response
  const holidayInfo = HolidayCalendarService.getHoliday(checkIn);
  const festivalInfo = HolidayCalendarService.isFestivalPeriod(checkIn);

  res.json({
    success: true,
    data: {
      roomType: roomType.name,
      baseRate: parseFloat(roomType.baseRate.toString()),
      finalRate: Math.round(finalRate),
      nights,
      totalPrice: Math.round(totalPrice),
      occupancyPercent: Math.round(occupancyPercent * 100) / 100,
      appliedRule: appliedRule ? {
        id: appliedRule.id,
        name: appliedRule.name,
        priority: appliedRule.priority,
        action: appliedRule.action,
      } : null,
      calculation: {
        leadTimeDays,
        checkInDate,
        checkOutDate,
        dayOfWeek: checkIn.getDay(),
      },
      // ⭐ NEW: ข้อมูลวันหยุด
      holidayInfo: {
        isHoliday: HolidayCalendarService.isHoliday(checkIn),
        holiday: holidayInfo,
        isFestival: festivalInfo.isFestival,
        festivalName: festivalInfo.festivalName,
        isLongWeekend: HolidayCalendarService.isLongWeekend(checkIn),
        holidayIntensity: HolidayCalendarService.getHolidayIntensity(checkIn)
      }
    },
  });
});

// ============================================
// UPDATE PRICING RULE
// ============================================

export const updatePricingRule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    res.status(400).json({
      success: false,
      error: 'Pricing rule ID is required'
    });
    return;
  }

  // Filter out fields that shouldn't be updated
  const allowedFields = [
    'name', 'description', 'priority', 'isActive', 'conditions', 'action', 
    'dateRangeStart', 'dateRangeEnd', 'roomTypes', 'category', 
    'urgencyLevel', 'overrideReason', 'expiresAt', 'disabledRuleIds'
  ];

  const filteredUpdateData = Object.keys(updateData)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {} as any);

  const rule = await prisma.dynamicPricingRule.update({
    where: { id },
    data: {
      ...filteredUpdateData,
      dateRangeStart: filteredUpdateData.dateRangeStart ? new Date(filteredUpdateData.dateRangeStart) : undefined,
      dateRangeEnd: filteredUpdateData.dateRangeEnd ? new Date(filteredUpdateData.dateRangeEnd) : undefined,
      updatedAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'Pricing rule updated successfully',
    data: { rule },
  });
});

// ============================================
// DELETE PRICING RULE
// ============================================

export const deletePricingRule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      error: 'Pricing rule ID is required'
    });
    return;
  }

  await prisma.dynamicPricingRule.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Pricing rule deleted successfully',
  });
});
