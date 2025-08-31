/**
 * Manual Override System
 * =====================
 * 
 * ระบบที่ให้แอดมินสามารถ override pricing rules ได้ทันที
 * สำหรับสถานการณ์เร่งด่วนที่ไม่สามารถรอ AI analysis ได้
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ManualOverrideRequest {
  eventTitle: string;
  startDate: Date;
  endDate: Date;
  category: 'EMERGENCY_HOLIDAY' | 'SURPRISE_EVENT' | 'CRISIS_MANAGEMENT' | 'LAST_MINUTE_OPPORTUNITY';
  pricingStrategy: 'INCREASE' | 'DECREASE' | 'BLOCK_BOOKINGS' | 'CUSTOM';
  pricingValue?: number; // เปอร์เซ็นต์หรือจำนวนเงิน
  targetRoomTypes?: string[];
  reason: string; // เหตุผลจำเป็น
  urgencyLevel: 'HIGH' | 'CRITICAL';
  staffId: string;
}

export interface OverrideRule {
  id: string;
  name: string;
  priority: number; // จะได้ priority สูงสุด (1-5)
  isOverride: boolean;
  originalRuleIds: string[]; // Rules ที่ถูก override
  createdBy: string;
  expiresAt?: Date;
}

export class ManualOverrideService {
  
  /**
   * สร้าง Emergency Override Rule ทันที
   * จะได้ priority สูงสุดและมีผลทันที
   */
  static async createEmergencyOverride(request: ManualOverrideRequest): Promise<OverrideRule> {
    console.log(`🚨 Emergency Override Requested: ${request.eventTitle}`);
    
    // 1. หา Rules ที่จะถูก Override (ในช่วงวันที่กำหนด)
    const conflictingRules = await this.findConflictingRules(
      request.startDate, 
      request.endDate
    );
    
    // 2. คำนวณ Priority สูงสุด (สำหรับ Emergency จะได้ 1-5)
    const emergencyPriority = await this.calculateEmergencyPriority(request.urgencyLevel);
    
    // 3. สร้าง Override Rule
    const overrideRule = await prisma.dynamicPricingRule.create({
      data: {
        name: `🚨 OVERRIDE: ${request.eventTitle}`,
        description: `Emergency override by admin. Reason: ${request.reason}`,
        priority: emergencyPriority,
        isActive: true,
        conditions: {
          isOverride: true,
          overrideType: 'EMERGENCY',
          category: request.category,
          urgencyLevel: request.urgencyLevel,
          originalReason: request.reason,
          overriddenRules: conflictingRules.map(r => r.id),
          dateRange: {
            start: request.startDate,
            end: request.endDate
          },
          metadata: {
            createdBy: request.staffId,
            createdAt: new Date(),
            source: 'MANUAL_OVERRIDE'
          }
        },
        action: this.buildOverrideAction(request),
        dateRangeStart: request.startDate,
        dateRangeEnd: request.endDate,
        roomTypes: request.targetRoomTypes || ['all']
      }
    });
    
    // 4. ปิดการทำงานของ Rules ที่ถูก Override ชั่วคราว
    await this.temporarilyDisableConflictingRules(conflictingRules, overrideRule.id);
    
    // 5. บันทึก Override History
    await this.logOverrideAction(request, overrideRule, conflictingRules);
    
    // 6. ส่ง Notification ให้ทีมงาน
    await this.notifyOverrideCreated(request, overrideRule);
    
    console.log(`✅ Emergency Override Created: Rule ID ${overrideRule.id}`);
    
    return {
      id: overrideRule.id,
      name: overrideRule.name,
      priority: overrideRule.priority,
      isOverride: true,
      originalRuleIds: conflictingRules.map(r => r.id),
      createdBy: request.staffId,
      expiresAt: request.endDate
    };
  }
  
  /**
   * Quick Event Creation + Auto Override
   * สร้าง event และ override rule ในขั้นตอนเดียว
   */
  static async createQuickEventOverride(request: ManualOverrideRequest): Promise<{event: any, rule: OverrideRule}> {
    
    // 1. สร้าง Event ก่อน
    const quickEvent = await prisma.event.create({
      data: {
        title: request.eventTitle,
        description: `Emergency event created by admin: ${request.reason}`,
        startTime: request.startDate,
        endTime: request.endDate,
        source: 'MANUAL_EMERGENCY',
        status: 'CONFIRMED', // Skip review process
        affectsPricing: true,
        suggestionDetails: JSON.stringify({
          emergencyOverride: true,
          reason: request.reason,
          urgencyLevel: request.urgencyLevel,
          createdAt: new Date()
        })
      }
    });
    
    // 2. สร้าง Override Rule
    const overrideRule = await this.createEmergencyOverride({
      ...request,
      eventTitle: `${request.eventTitle} (Event ID: ${quickEvent.id})`
    });
    
    // 3. Link Event กับ Rule
    await prisma.event.update({
      where: { id: quickEvent.id },
      data: { suggestedPricingRuleId: overrideRule.id }
    });
    
    return { event: quickEvent, rule: overrideRule };
  }
  
  /**
   * แก้ไข Override Rule แบบ Real-time
   */
  static async updateOverrideRule(ruleId: string, updates: Partial<ManualOverrideRequest>): Promise<void> {
    const rule = await prisma.dynamicPricingRule.findUnique({
      where: { id: ruleId }
    });
    
    if (!rule || !rule.conditions?.isOverride) {
      throw new Error('Rule not found or not an override rule');
    }
    
    await prisma.dynamicPricingRule.update({
      where: { id: ruleId },
      data: {
        action: updates.pricingStrategy ? this.buildOverrideAction(updates as ManualOverrideRequest) : rule.action,
        roomTypes: updates.targetRoomTypes || rule.roomTypes,
        dateRangeStart: updates.startDate || rule.dateRangeStart,
        dateRangeEnd: updates.endDate || rule.dateRangeEnd,
        conditions: {
          ...rule.conditions,
          lastModified: new Date(),
          modificationReason: updates.reason || 'Updated by admin'
        }
      }
    });
    
    console.log(`🔄 Override Rule Updated: ${ruleId}`);
  }
  
  /**
   * ยกเลิก Override และคืน Rules เดิม
   */
  static async removeOverride(ruleId: string, staffId: string, reason?: string): Promise<void> {
    const overrideRule = await prisma.dynamicPricingRule.findUnique({
      where: { id: ruleId }
    });
    
    if (!overrideRule || !overrideRule.conditions?.isOverride) {
      throw new Error('Override rule not found');
    }
    
    // 1. เปิดการทำงานของ Rules เดิมที่ถูก disable
    const originalRuleIds = overrideRule.conditions.overriddenRules || [];
    await this.restoreOriginalRules(originalRuleIds, ruleId);
    
    // 2. ปิดการทำงานของ Override Rule
    await prisma.dynamicPricingRule.update({
      where: { id: ruleId },
      data: { 
        isActive: false,
        conditions: {
          ...overrideRule.conditions,
          deactivatedAt: new Date(),
          deactivatedBy: staffId,
          deactivationReason: reason || 'Manual removal'
        }
      }
    });
    
    // 3. บันทึก History
    await this.logOverrideRemoval(ruleId, staffId, reason);
    
    console.log(`❌ Override Removed: ${ruleId}`);
  }
  
  /**
   * Auto-Expire Override Rules
   * Cron job ที่ทำงานทุกชั่วโมงเพื่อตรวจสอบ Override ที่หมดอายุ
   */
  static async autoExpireOverrides(): Promise<void> {
    const now = new Date();
    
    const expiredOverrides = await prisma.dynamicPricingRule.findMany({
      where: {
        isActive: true,
        dateRangeEnd: { lt: now },
        conditions: {
          path: ['isOverride'],
          equals: true
        }
      }
    });
    
    for (const rule of expiredOverrides) {
      await this.removeOverride(rule.id, 'SYSTEM', 'Auto-expired after event end');
    }
    
    if (expiredOverrides.length > 0) {
      console.log(`🕰️ Auto-expired ${expiredOverrides.length} override rules`);
    }
  }
  
  /**
   * Dashboard: Override Rules ที่กำลังทำงาน
   */
  static async getActiveOverrides(): Promise<any[]> {
    return await prisma.dynamicPricingRule.findMany({
      where: {
        isActive: true,
        conditions: {
          path: ['isOverride'],
          equals: true
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { priority: 'asc' } // แสดง priority สูงสุดก่อน
    });
  }
  
  // ===== Helper Methods =====
  
  private static async calculateEmergencyPriority(urgencyLevel: string): Promise<number> {
    // Emergency Override จะได้ priority 1-5 (สูงสุด)
    const emergencyPriorities = {
      'CRITICAL': 1, // สำคัญสุด
      'HIGH': 3      // สำคัญรองลงมา
    };
    
    return emergencyPriorities[urgencyLevel] || 5;
  }
  
  private static buildOverrideAction(request: ManualOverrideRequest): any {
    switch (request.pricingStrategy) {
      case 'INCREASE':
        return {
          type: 'increase_rate_by_percent',
          value: request.pricingValue || 25,
          reason: 'Emergency price increase'
        };
      
      case 'DECREASE':
        return {
          type: 'decrease_rate_by_percent',
          value: request.pricingValue || 15,
          reason: 'Emergency discount'
        };
      
      case 'BLOCK_BOOKINGS':
        return {
          type: 'apply_restriction',
          value: { 
            block_bookings: true,
            reason: 'Emergency booking block'
          }
        };
      
      case 'CUSTOM':
        return {
          type: 'set_new_rate',
          value: request.pricingValue,
          reason: 'Custom emergency pricing'
        };
      
      default:
        return {
          type: 'increase_rate_by_percent',
          value: 20,
          reason: 'Default emergency adjustment'
        };
    }
  }
  
  private static async findConflictingRules(startDate: Date, endDate: Date): Promise<any[]> {
    return await prisma.dynamicPricingRule.findMany({
      where: {
        isActive: true,
        OR: [
          {
            AND: [
              { dateRangeStart: { lte: endDate } },
              { dateRangeEnd: { gte: startDate } }
            ]
          }
        ]
      }
    });
  }
  
  private static async temporarilyDisableConflictingRules(rules: any[], overrideRuleId: string): Promise<void> {
    for (const rule of rules) {
      await prisma.dynamicPricingRule.update({
        where: { id: rule.id },
        data: {
          isActive: false,
          conditions: {
            ...rule.conditions,
            temporarilyDisabled: true,
            disabledBy: overrideRuleId,
            disabledAt: new Date(),
            disableReason: 'Temporarily disabled by emergency override'
          }
        }
      });
    }
  }
  
  private static async restoreOriginalRules(ruleIds: string[], overrideRuleId: string): Promise<void> {
    for (const ruleId of ruleIds) {
      const rule = await prisma.dynamicPricingRule.findUnique({
        where: { id: ruleId }
      });
      
      if (rule && rule.conditions?.disabledBy === overrideRuleId) {
        await prisma.dynamicPricingRule.update({
          where: { id: ruleId },
          data: {
            isActive: true,
            conditions: {
              ...rule.conditions,
              temporarilyDisabled: false,
              restoredAt: new Date(),
              restoredReason: 'Override removed'
            }
          }
        });
      }
    }
  }
  
  private static async logOverrideAction(
    request: ManualOverrideRequest, 
    rule: any, 
    affectedRules: any[]
  ): Promise<void> {
    // บันทึกลง Override History table (สร้างทีหลัง)
    console.log(`📝 Override Action Logged: ${rule.id}`);
    console.log(`   Event: ${request.eventTitle}`);
    console.log(`   Affected Rules: ${affectedRules.length}`);
    console.log(`   Staff: ${request.staffId}`);
  }
  
  private static async logOverrideRemoval(ruleId: string, staffId: string, reason?: string): Promise<void> {
    console.log(`📝 Override Removal Logged: ${ruleId} by ${staffId}`);
    console.log(`   Reason: ${reason}`);
  }
  
  private static async notifyOverrideCreated(request: ManualOverrideRequest, rule: any): Promise<void> {
    // ส่ง notification ไปยัง Telegram/Slack/Email
    const message = `🚨 Emergency Override Created\n` +
                   `Event: ${request.eventTitle}\n` +
                   `Date: ${request.startDate.toDateString()} - ${request.endDate.toDateString()}\n` +
                   `Strategy: ${request.pricingStrategy}\n` +
                   `Reason: ${request.reason}\n` +
                   `Rule ID: ${rule.id}`;
    
    // TODO: Integration with notification service
    console.log('📢 Override Notification:', message);
  }
}

export default ManualOverrideService;
