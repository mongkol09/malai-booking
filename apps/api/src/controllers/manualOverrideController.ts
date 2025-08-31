import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ManualOverrideService from '../services/manualOverrideService';

// ============================================
// MANUAL OVERRIDE API CONTROLLER
// ============================================

/**
 * POST /api/v1/override/emergency
 * สร้าง Emergency Override Rule ทันที
 */
export const createEmergencyOverride = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const {
      eventTitle,
      startDate,
      endDate,
      category,
      pricingStrategy,
      pricingValue,
      targetRoomTypes,
      reason,
      urgencyLevel,
      staffId
    } = req.body;

    const overrideRule = await ManualOverrideService.createEmergencyOverride({
      eventTitle,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      category,
      pricingStrategy,
      pricingValue,
      targetRoomTypes,
      reason,
      urgencyLevel,
      staffId
    });

    res.status(201).json({
      success: true,
      message: 'Emergency override created successfully',
      data: {
        overrideRule,
        impact: {
          affectedDateRange: `${startDate} to ${endDate}`,
          pricingChange: `${pricingStrategy}: ${pricingValue || 'default'}%`,
          priority: overrideRule.priority
        }
      }
    });

  } catch (error) {
    console.error('Error creating emergency override:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency override',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * POST /api/v1/override/quick-event
 * สร้าง Event + Override Rule ในขั้นตอนเดียว
 */
export const createQuickEventOverride = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const overrideRequest = {
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate)
    };

    const { event, rule } = await ManualOverrideService.createQuickEventOverride(overrideRequest);

    res.status(201).json({
      success: true,
      message: 'Quick event with override created successfully',
      data: {
        event: {
          id: event.id,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          category: event.category || 'N/A'
        },
        overrideRule: rule,
        workflow: {
          step1: '✅ Event created',
          step2: '✅ Override rule activated',
          step3: '✅ Conflicting rules disabled',
          step4: '✅ Team notified'
        }
      }
    });

  } catch (error) {
    console.error('Error creating quick event override:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quick event override',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/override/active
 * ดู Override Rules ที่กำลังทำงาน
 */
export const getActiveOverrides = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeOverrides = await ManualOverrideService.getActiveOverrides();

    const overridesSummary = activeOverrides.map(rule => ({
      id: rule.id,
      name: rule.name,
      priority: rule.priority,
      dateRange: {
        start: rule.dateRangeStart,
        end: rule.dateRangeEnd
      },
      roomTypes: rule.roomTypes,
      createdBy: rule.creator,
      // Check for mock fields since schema might not be updated
      urgencyLevel: rule.conditions?.urgencyLevel || 'Unknown',
      category: rule.conditions?.category || 'Unknown',
      daysRemaining: Math.ceil(
        (new Date(rule.dateRangeEnd!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    }));

    res.json({
      success: true,
      data: {
        activeOverrides: overridesSummary,
        totalCount: activeOverrides.length,
        summary: {
          critical: overridesSummary.filter(r => r.urgencyLevel === 'CRITICAL').length,
          high: overridesSummary.filter(r => r.urgencyLevel === 'HIGH').length,
          expiringSoon: overridesSummary.filter(r => r.daysRemaining <= 3).length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching active overrides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active overrides',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * PUT /api/v1/override/:ruleId
 * แก้ไข Override Rule
 */
export const updateOverrideRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const updates = {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
    };

    await ManualOverrideService.updateOverrideRule(ruleId, updates);

    res.json({
      success: true,
      message: 'Override rule updated successfully',
      data: {
        ruleId,
        updatedFields: Object.keys(req.body),
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error updating override rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update override rule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * DELETE /api/v1/override/:ruleId
 * ยกเลิก Override Rule
 */
export const removeOverride = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const { staffId, reason } = req.body;

    await ManualOverrideService.removeOverride(ruleId, staffId, reason);

    res.json({
      success: true,
      message: 'Override rule removed successfully',
      data: {
        ruleId,
        removedBy: staffId,
        reason: reason || 'Manual removal',
        timestamp: new Date(),
        note: 'Original rules have been restored'
      }
    });

  } catch (error) {
    console.error('Error removing override:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove override',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/override/templates
 * ดูเทมเพลต Override ที่ใช้บ่อย
 */
export const getOverrideTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const templates = [
      {
        id: 'emergency_holiday',
        name: 'Emergency Holiday',
        description: 'วันหยุดเร่งด่วนที่รัฐบาลประกาศก่อนหน้าน้อย',
        category: 'EMERGENCY_HOLIDAY',
        defaultStrategy: 'INCREASE',
        defaultValue: 30,
        urgencyLevel: 'HIGH',
        suggestedDuration: '1-3 days',
        example: 'วันหยุดชดเชยที่ประกาศก่อนหน้า 1-2 วัน'
      },
      {
        id: 'surprise_event',
        name: 'Surprise Major Event',
        description: 'เหตุการณ์ใหญ่ที่เกิดขึ้นกะทันหัน',
        category: 'SURPRISE_EVENT',
        defaultStrategy: 'INCREASE',
        defaultValue: 40,
        urgencyLevel: 'CRITICAL',
        suggestedDuration: '1-7 days',
        example: 'คอนเสิร์ต artist ระดับโลกที่ประกาศขายบัตร last minute'
      },
      {
        id: 'crisis_management',
        name: 'Crisis Management',
        description: 'จัดการในช่วงวิกฤต เช่น ภัยธรรมชาติ',
        category: 'CRISIS_MANAGEMENT',
        defaultStrategy: 'BLOCK_BOOKINGS',
        defaultValue: 0,
        urgencyLevel: 'CRITICAL',
        suggestedDuration: 'Variable',
        example: 'พายุ, น้ำท่วม, เหตุการณ์ไม่คาดคิด'
      },
      {
        id: 'last_minute_opportunity',
        name: 'Last Minute Opportunity',
        description: 'โอกาสพิเศษที่เกิดขึ้นในนาทีสุดท้าย',
        category: 'LAST_MINUTE_OPPORTUNITY',
        defaultStrategy: 'INCREASE',
        defaultValue: 25,
        urgencyLevel: 'HIGH',
        suggestedDuration: '1-5 days',
        example: 'เทศกาลหรือกิจกรรมพิเศษที่ขึ้นมาใหม่'
      }
    ];

    res.json({
      success: true,
      data: {
        templates,
        usage: {
          note: 'เทมเพลตเหล่านี้ช่วยให้สร้าง override ได้เร็วขึ้น',
          recommendation: 'เลือกเทมเพลตที่เหมาะสมแล้วปรับแต่งตามสถานการณ์'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching override templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch override templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  createEmergencyOverride,
  createQuickEventOverride,
  getActiveOverrides,
  updateOverrideRule,
  removeOverride,
  getOverrideTemplates
};
