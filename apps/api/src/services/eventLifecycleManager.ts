/**
 * Event Lifecycle Manager
 * ======================
 * 
 * จัดการ Lifecycle ของ Event และ Pricing Rules ให้ทำงานสอดคล้องกัน
 */

export class EventLifecycleManager {
  
  /**
   * Cron Job: ทำงานทุกวันเพื่อตรวจสอบ Event ที่จบไปแล้ว
   */
  static async cleanupExpiredEvents(): Promise<void> {
    const now = new Date();
    
    // หา Events ที่จบไปแล้วแต่ Rules ยังทำงานอยู่
    const expiredEvents = await prisma.event.findMany({
      where: {
        endTime: { lt: now },
        status: 'CONFIRMED',
        suggestedPricingRule: {
          isActive: true
        }
      },
      include: {
        suggestedPricingRule: true
      }
    });
    
    for (const event of expiredEvents) {
      await this.deactivateEventRule(event);
    }
  }
  
  /**
   * ปิดการทำงานของ Pricing Rule เมื่อ Event จบแล้ว
   */
  static async deactivateEventRule(event: any): Promise<void> {
    if (event.suggestedPricingRule) {
      await prisma.dynamicPricingRule.update({
        where: { id: event.suggestedPricingRule.id },
        data: { 
          isActive: false,
          // เก็บประวัติว่าปิดเพราะ event จบแล้ว
          conditions: {
            ...event.suggestedPricingRule.conditions,
            deactivatedReason: 'EVENT_ENDED',
            deactivatedAt: new Date()
          }
        }
      });
      
      console.log(`🔄 Deactivated pricing rule for ended event: ${event.title}`);
    }
  }
  
  /**
   * ตรวจสอบ Event ที่กำลังจะเริ่มในอีก 7 วัน
   */
  static async activateUpcomingEventRules(): Promise<void> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const upcomingEvents = await prisma.event.findMany({
      where: {
        startTime: { lte: sevenDaysFromNow },
        status: 'CONFIRMED',
        suggestedPricingRule: {
          isActive: false
        }
      },
      include: {
        suggestedPricingRule: true
      }
    });
    
    for (const event of upcomingEvents) {
      await this.activateEventRule(event);
    }
  }
  
  /**
   * เปิดการทำงานของ Pricing Rule เมื่อใกล้วัน Event
   */
  static async activateEventRule(event: any): Promise<void> {
    if (event.suggestedPricingRule) {
      await prisma.dynamicPricingRule.update({
        where: { id: event.suggestedPricingRule.id },
        data: { 
          isActive: true,
          conditions: {
            ...event.suggestedPricingRule.conditions,
            activatedAt: new Date(),
            activatedReason: 'EVENT_APPROACHING'
          }
        }
      });
      
      console.log(`✅ Activated pricing rule for upcoming event: ${event.title}`);
    }
  }
}

/**
 * Event-Rule Integration Service
 * =============================
 * 
 * ประสานงานระหว่าง Event Management และ Dynamic Pricing
 */
export class EventRuleIntegrationService {
  
  /**
   * สร้าง Pricing Rule จาก Event พร้อมการตรวจสอบ Conflicts
   */
  static async createEventRule(event: any, aiSuggestion: any): Promise<any> {
    
    // 1. ตรวจสอบ Conflicts
    const conflictReport = await RuleConflictDetector.detectConflicts({
      dateRangeStart: event.startTime,
      dateRangeEnd: event.endTime,
      priority: aiSuggestion.suggestedPriority,
      action: aiSuggestion.action
    });
    
    if (conflictReport.hasConflicts && !conflictReport.canProceed) {
      throw new Error(`Cannot create event rule due to conflicts: ${conflictReport.recommendations.join(', ')}`);
    }
    
    // 2. ปรับ Priority ถ้าจำเป็น
    const finalPriority = conflictReport.hasConflicts ? 
      EventPriorityManager.calculateEventPriority(event, await this.getExistingRules()) :
      aiSuggestion.suggestedPriority;
    
    // 3. สร้าง Rule ใหม่
    const newRule = await prisma.dynamicPricingRule.create({
      data: {
        name: `🎯 Event: ${event.title}`,
        description: `AI-generated rule for ${event.title}`,
        priority: finalPriority,
        isActive: false, // จะ activate ทีหลังตาม Lifecycle
        conditions: {
          eventId: event.id,
          eventCategory: event.category,
          dateRange: {
            start: event.startTime,
            end: event.endTime
          },
          metadata: {
            createdBy: 'AI_EVENT_MANAGEMENT',
            aiConfidence: aiSuggestion.confidence,
            conflictResolved: conflictReport.hasConflicts
          }
        },
        action: aiSuggestion.action,
        dateRangeStart: event.startTime,
        dateRangeEnd: event.endTime,
        roomTypes: aiSuggestion.roomTypes || ['all']
      }
    });
    
    // 4. Update Event กับ Rule ที่สร้าง
    await prisma.event.update({
      where: { id: event.id },
      data: {
        suggestedPricingRuleId: newRule.id,
        suggestionDetails: JSON.stringify({
          aiSuggestion,
          conflictReport,
          finalPriority,
          createdAt: new Date()
        })
      }
    });
    
    return newRule;
  }
  
  /**
   * แก้ไข Event และ Rule ให้สอดคล้องกัน
   */
  static async updateEventRule(eventId: string, updates: any): Promise<void> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { suggestedPricingRule: true }
    });
    
    if (!event) throw new Error('Event not found');
    
    // อัพเดท Event
    await prisma.event.update({
      where: { id: eventId },
      data: updates
    });
    
    // อัพเดท Rule ให้สอดคล้องกัน (ถ้ามี)
    if (event.suggestedPricingRule && (updates.startTime || updates.endTime)) {
      await prisma.dynamicPricingRule.update({
        where: { id: event.suggestedPricingRule.id },
        data: {
          dateRangeStart: updates.startTime || event.startTime,
          dateRangeEnd: updates.endTime || event.endTime,
          conditions: {
            ...event.suggestedPricingRule.conditions,
            dateRange: {
              start: updates.startTime || event.startTime,
              end: updates.endTime || event.endTime
            },
            lastModified: new Date()
          }
        }
      });
    }
  }
  
  /**
   * ลบ Event และ Rule ที่เกี่ยวข้อง
   */
  static async deleteEventRule(eventId: string): Promise<void> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { suggestedPricingRule: true }
    });
    
    if (!event) return;
    
    // ลบ Rule ก่อน (ถ้ามี)
    if (event.suggestedPricingRule) {
      await prisma.dynamicPricingRule.delete({
        where: { id: event.suggestedPricingRule.id }
      });
    }
    
    // ลบ Event
    await prisma.event.delete({
      where: { id: eventId }
    });
  }
  
  private static async getExistingRules(): Promise<any[]> {
    return await prisma.dynamicPricingRule.findMany({
      where: { isActive: true }
    });
  }
}
