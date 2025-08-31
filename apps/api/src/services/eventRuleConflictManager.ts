/**
 * Event Management Priority Strategy
 * =================================
 * 
 * แก้ปัญหา Priority Conflicts โดยให้ AI วิเคราะห์และกำหนด Priority อย่างฉลาด
 */

export class EventPriorityManager {
  
  /**
   * กำหนด Priority สำหรับ Event-driven Rules อย่างฉลาด
   */
  static calculateEventPriority(event: any, existingRules: any[]): number {
    
    // ฐานของ Event-Driven Rules คือ 11-20
    let basePriority = 15;
    
    // ปรับ Priority ตาม Event Category
    switch (event.category) {
      case 'National Holiday':
      case 'Royal Event':
        // สำคัญมาก ให้ใกล้กับ Strategic Restrictions
        basePriority = 8;
        break;
        
      case 'International Concert':
      case 'Major Sports Event':
        // สำคัญปานกลาง
        basePriority = 12;
        break;
        
      case 'Local Festival':
      case 'Business Conference':
        // สำคัญน้อย
        basePriority = 18;
        break;
        
      default:
        basePriority = 15;
    }
    
    // ตรวจสอบ Conflict กับ Rules ที่มีอยู่
    const conflictingRules = existingRules.filter(rule => 
      this.hasDateOverlap(event, rule) && rule.priority === basePriority
    );
    
    // ถ้ามี Conflict ให้ปรับ Priority
    if (conflictingRules.length > 0) {
      basePriority = this.findNextAvailablePriority(basePriority, existingRules);
    }
    
    return basePriority;
  }
  
  /**
   * ตรวจสอบว่า Event และ Rule มีช่วงวันซ้อนทับกันหรือไม่
   */
  static hasDateOverlap(event: any, rule: any): boolean {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const ruleStart = new Date(rule.dateRangeStart);
    const ruleEnd = new Date(rule.dateRangeEnd);
    
    return !(eventEnd < ruleStart || eventStart > ruleEnd);
  }
  
  /**
   * หา Priority ที่ว่างถัดไป
   */
  static findNextAvailablePriority(preferredPriority: number, existingRules: any[]): number {
    const usedPriorities = existingRules.map(rule => rule.priority);
    
    // ลองหา Priority ที่ใกล้เคียงและว่าง
    for (let offset = 1; offset <= 5; offset++) {
      const higher = preferredPriority - offset;
      const lower = preferredPriority + offset;
      
      if (higher >= 11 && !usedPriorities.includes(higher)) {
        return higher;
      }
      
      if (lower <= 20 && !usedPriorities.includes(lower)) {
        return lower;
      }
    }
    
    // ถ้าหาไม่เจอ ให้ใช้ Priority ที่สูงสุดใน Event range
    return 20;
  }
}

/**
 * Event Rule Conflict Detector
 * ============================
 * 
 * ตรวจสอบและป้องกัน Rule Conflicts
 */
export class RuleConflictDetector {
  
  /**
   * ตรวจสอบ Rule Conflicts ก่อนสร้าง Event Rule
   */
  static async detectConflicts(newEventRule: any): Promise<ConflictReport> {
    const existingRules = await this.getActiveRulesInDateRange(
      newEventRule.dateRangeStart,
      newEventRule.dateRangeEnd
    );
    
    const conflicts: RuleConflict[] = [];
    
    for (const existingRule of existingRules) {
      const conflictType = this.analyzeConflictType(newEventRule, existingRule);
      
      if (conflictType !== 'NONE') {
        conflicts.push({
          existingRule,
          conflictType,
          severity: this.calculateConflictSeverity(newEventRule, existingRule),
          recommendation: this.getResolutionRecommendation(conflictType)
        });
      }
    }
    
    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      canProceed: conflicts.every(c => c.severity <= ConflictSeverity.LOW),
      recommendations: this.generateGlobalRecommendations(conflicts)
    };
  }
  
  /**
   * วิเคราะห์ประเภทของ Conflict
   */
  static analyzeConflictType(newRule: any, existingRule: any): ConflictType {
    // Priority Conflict
    if (newRule.priority === existingRule.priority) {
      return 'PRIORITY_CONFLICT';
    }
    
    // Business Logic Conflict
    if (this.hasLogicalConflict(newRule, existingRule)) {
      return 'LOGICAL_CONFLICT';
    }
    
    // Date Overlap
    if (this.hasDateOverlap(newRule, existingRule)) {
      return 'DATE_OVERLAP';
    }
    
    return 'NONE';
  }
  
  /**
   * ตรวจสอบ Logical Conflict
   * เช่น Rule A บอกให้ขึ้นราคา 50% แต่ Rule B บอกให้ลดราคา 20%
   */
  static hasLogicalConflict(rule1: any, rule2: any): boolean {
    const action1 = rule1.action;
    const action2 = rule2.action;
    
    // ถ้า Rule หนึ่งขึ้นราคา อีกตัวลดราคา = Conflict
    if (
      (action1.type.includes('increase') && action2.type.includes('decrease')) ||
      (action1.type.includes('decrease') && action2.type.includes('increase'))
    ) {
      return true;
    }
    
    // ถ้า Rule ทั้งสองขึ้นราคาในปริมาณที่แตกต่างมาก = Potential Conflict
    if (
      action1.type.includes('increase') && action2.type.includes('increase')
    ) {
      const diff = Math.abs(action1.value - action2.value);
      return diff > 30; // ถ้าต่างกันมากกว่า 30% ถือว่า conflict
    }
    
    return false;
  }
}

interface ConflictReport {
  hasConflicts: boolean;
  conflicts: RuleConflict[];
  canProceed: boolean;
  recommendations: string[];
}

interface RuleConflict {
  existingRule: any;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  recommendation: string;
}

enum ConflictType {
  PRIORITY_CONFLICT = 'PRIORITY_CONFLICT',
  LOGICAL_CONFLICT = 'LOGICAL_CONFLICT', 
  DATE_OVERLAP = 'DATE_OVERLAP',
  NONE = 'NONE'
}

enum ConflictSeverity {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}
