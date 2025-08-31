// ============================================
// PRICING RULES SEEDER - ตามตัวอย่างจาก Requirements
// ============================================

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, asyncHandler } from '../utils/auth';

const prisma = new PrismaClient();

export const seedPricingRules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
    return;
  }

  try {
    // ลบกฎเก่าทั้งหมด (ถ้าต้องการ reset)
    if (req.body.resetRules) {
      await prisma.dynamicPricingRule.deleteMany({});
    }

    // กลุ่มที่ 1: กฎข้อบังคับเชิงกลยุทธ์ (Strategic Restrictions) - Priority 1-10
    const strategicRules = [
      {
        name: "Minimum Stay on Peak Holidays",
        description: "บังคับพักขั้นต่ำ 3 คืนในช่วงเทศกาล",
        priority: 5,
        conditions: {
          and: [
            { is_holiday: { eq: true } },
            { event_type: { in: ["New Year", "Songkran"] } }
          ]
        },
        action: {
          type: "apply_restriction",
          value: { mlos: 3 }
        },
        isActive: true,
        createdBy: userId
      }
    ];

    // กลุ่มที่ 2: กฎสำหรับโอกาสพิเศษ (Event-Driven Rules) - Priority 11-20
    const eventRules = [
      {
        name: "Major Concert Surcharge",
        description: "ขึ้นราคา 50% ช่วงคอนเสิร์ตใหญ่",
        priority: 15,
        conditions: {
          and: [
            { event_nearby: { eq: true } },
            { event_category: { eq: "International Concert" } }
          ]
        },
        action: {
          type: "increase_rate_by_percent",
          value: 50
        },
        isActive: true,
        createdBy: userId
      }
    ];

    // กลุ่มที่ 3: กฎตามพฤติกรรมการจอง (Behavioral Rules) - Priority 21-40
    const behavioralRules = [
      {
        name: "Last Minute Premium Price",
        description: "ราคาพิเศษสำหรับจองกระชั้นชิด",
        priority: 25,
        conditions: {
          and: [
            { lead_time_days: { lte: 2 } },
            { occupancy_percent: { gte: 70 } }
          ]
        },
        action: {
          type: "increase_rate_by_percent",
          value: 25
        },
        isActive: true,
        createdBy: userId
      },
      {
        name: "Early Bird Discount",
        description: "ส่วนลดสำหรับจองล่วงหน้านานๆ",
        priority: 35,
        conditions: {
          and: [
            { lead_time_days: { gte: 90 } },
            { day_of_week: { not_in: [5, 6] } }
          ]
        },
        action: {
          type: "decrease_rate_by_percent",
          value: 15
        },
        isActive: true,
        createdBy: userId
      }
    ];

    // กลุ่มที่ 4: กฎตามอัตราการเข้าพัก (Occupancy-Based Rules) - Priority 41-60
    const occupancyRules = [
      {
        name: "Yielding - Very High Occupancy",
        description: "ปรับราคาเมื่อห้องใกล้เต็มมาก",
        priority: 45,
        conditions: {
          and: [
            { occupancy_percent: { gte: 90 } }
          ]
        },
        action: {
          type: "increase_rate_by_amount",
          value: 1000
        },
        isActive: true,
        createdBy: userId
      },
      {
        name: "Yielding - High Occupancy",
        description: "ปรับราคาเมื่อห้องเริ่มเต็ม",
        priority: 50,
        conditions: {
          and: [
            { occupancy_percent: { gte: 75 } }
          ]
        },
        action: {
          type: "increase_rate_by_percent",
          value: 20
        },
        isActive: true,
        createdBy: userId
      }
    ];

    // กลุ่มที่ 5: กฎตามรูปแบบของวัน (Pattern-Based Rules) - Priority 61-80
    const patternRules = [
      {
        name: "Weekend Pricing",
        description: "ราคาสำหรับวันหยุดสุดสัปดาห์",
        priority: 70,
        conditions: {
          and: [
            { day_of_week: { in: [5, 6] } }
          ]
        },
        action: {
          type: "set_new_rate",
          based_on: "base_rate",
          modifier_type: "percent",
          modifier_value: 120
        },
        isActive: true,
        createdBy: userId
      }
    ];

    // กลุ่มที่ 6: กฎสำหรับเติมช่องว่างการจอง (Gap Filling Rules) - Priority 81-110
    const gapFillingRules = [
      {
        name: "Accelerated Pacing Adjustment",
        description: "ปรับราคาขึ้นเมื่อยอดจองเร็วกว่าปกติ",
        priority: 95,
        conditions: {
          and: [
            { booking_pace_delta: { gte: 1.2 } }
          ]
        },
        action: {
          type: "increase_rate_by_percent",
          value: 10
        },
        isActive: true,
        createdBy: userId
      },
      {
        name: "Orphan Night Discount",
        description: "ลดราคาพิเศษสำหรับคืนที่ว่างคั่นกลาง",
        priority: 105,
        conditions: {
          and: [
            { is_orphan_night: { eq: true } }
          ]
        },
        action: {
          type: "decrease_rate_by_percent",
          value: 25
        },
        isActive: true,
        createdBy: userId
      }
    ];

    // รวมกฎทั้งหมด
    const allRules = [
      ...strategicRules,
      ...eventRules,
      ...behavioralRules,
      ...occupancyRules,
      ...patternRules,
      ...gapFillingRules
    ];

    // สร้างกฎในฐานข้อมูล
    const createdRules = await prisma.dynamicPricingRule.createMany({
      data: allRules
    });

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdRules.count} pricing rules`,
      data: {
        createdCount: createdRules.count,
        ruleCategories: {
          strategic: strategicRules.length,
          event: eventRules.length,
          behavioral: behavioralRules.length,
          occupancy: occupancyRules.length,
          pattern: patternRules.length,
          gapFilling: gapFillingRules.length
        }
      }
    });

  } catch (error) {
    console.error('Error seeding pricing rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed pricing rules'
    });
  }
});

// ============================================
// PREVIEW PRICING RULES APPLICATION
// ============================================

export const previewPricingRulesApplication = asyncHandler(async (req: Request, res: Response) => {
  const {
    roomTypeId,
    checkInDate,
    checkOutDate,
    simulateOccupancy = 50,
    simulateLeadTime = 30
  } = req.body;

  try {
    // Get all active rules
    const rules = await prisma.dynamicPricingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' }
    });

    // Get room type
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId }
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

    const preview = [];

    for (let night = 0; night < nights; night++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + night);

      const dayOfWeek = currentDate.getDay();
      let applicableRules = [];

      // Simulate rule evaluation
      for (const rule of rules) {
        let matches = false;
        const conditions = rule.conditions as any;

        // Simple condition checking for preview
        if (conditions.and) {
          matches = true;
          for (const condition of conditions.and) {
            const key = Object.keys(condition)[0];
            const value = condition[key];

            switch (key) {
              case 'day_of_week':
                if (value.in && !value.in.includes(dayOfWeek)) matches = false;
                if (value.not_in && value.in.includes(dayOfWeek)) matches = false;
                break;
              case 'occupancy_percent':
                if (value.gte && simulateOccupancy < value.gte) matches = false;
                if (value.lte && simulateOccupancy > value.lte) matches = false;
                break;
              case 'lead_time_days':
                if (value.gte && simulateLeadTime < value.gte) matches = false;
                if (value.lte && simulateLeadTime > value.lte) matches = false;
                break;
              default:
                matches = false; // Unknown condition
            }
          }
        }

        if (matches) {
          applicableRules.push({
            ruleId: rule.id,
            name: rule.name,
            priority: rule.priority,
            action: rule.action
          });
          break; // First Match Wins
        }
      }

      preview.push({
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: dayOfWeek,
        simulatedOccupancy: simulateOccupancy,
        simulatedLeadTime: simulateLeadTime,
        applicableRules: applicableRules
      });
    }

    res.json({
      success: true,
      data: {
        roomType: {
          id: roomType.id,
          name: roomType.name,
          baseRate: Number(roomType.baseRate)
        },
        preview: preview,
        totalRulesInSystem: rules.length,
        previewParameters: {
          simulateOccupancy,
          simulateLeadTime
        }
      }
    });

  } catch (error) {
    console.error('Error previewing pricing rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to preview pricing rules'
    });
  }
});
