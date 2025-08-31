import { PrismaClient } from '@prisma/client';
import { EmailType } from '../types/emailTypes';

const prisma = new PrismaClient();

// ============================================
// EMAIL SETTINGS SERVICE
// ตรวจสอบการตั้งค่าก่อนส่งอีเมล
// ============================================

export class EmailSettingsService {
  private static instance: EmailSettingsService;
  private settingsCache: Map<string, boolean> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds cache

  static getInstance(): EmailSettingsService {
    if (!EmailSettingsService.instance) {
      EmailSettingsService.instance = new EmailSettingsService();
    }
    return EmailSettingsService.instance;
  }

  /**
   * ตรวจสอบว่าการส่งอีเมลประเภทนี้เปิดใช้งานหรือไม่
   */
  async isEmailTypeEnabled(emailType: EmailType): Promise<boolean> {
    try {
      // ตรวจสอบ cache ก่อน
      const cacheKey = `${emailType}_enabled`;
      const cachedValue = this.getCachedValue(cacheKey);
      
      if (cachedValue !== null) {
        return cachedValue;
      }

      // ตรวจสอบทั้งระบบโดยรวมและประเภทเฉพาะ
      const systemEnabled = await this.getSettingValue('email_service_enabled');
      if (!systemEnabled) {
        this.setCachedValue(cacheKey, false);
        return false;
      }

      // ตรวจสอบการตั้งค่าสำหรับประเภทอีเมลเฉพาะ
      const typeSpecificKey = this.getEmailTypeSettingKey(emailType);
      const typeEnabled = await this.getSettingValue(typeSpecificKey);
      
      this.setCachedValue(cacheKey, typeEnabled);
      return typeEnabled;

    } catch (error) {
      console.error(`❌ Error checking email type ${emailType}:`, error);
      // ในกรณีเกิดข้อผิดพลาด ให้ return false เพื่อความปลอดภัย
      return false;
    }
  }

  /**
   * ตรวจสอบว่าระบบ email queue เปิดใช้งานหรือไม่
   */
  async isEmailQueueEnabled(): Promise<boolean> {
    try {
      const cacheKey = 'email_queue_enabled';
      const cachedValue = this.getCachedValue(cacheKey);
      
      if (cachedValue !== null) {
        return cachedValue;
      }

      const queueEnabled = await this.getSettingValue('email_queue_enabled');
      this.setCachedValue(cacheKey, queueEnabled);
      
      return queueEnabled;

    } catch (error) {
      console.error('❌ Error checking email queue setting:', error);
      return false;
    }
  }

  /**
   * ตรวจสอบว่าการลองส่งซ้ำเปิดใช้งานหรือไม่
   */
  async isEmailRetryEnabled(): Promise<boolean> {
    try {
      const cacheKey = 'email_retry_enabled';
      const cachedValue = this.getCachedValue(cacheKey);
      
      if (cachedValue !== null) {
        return cachedValue;
      }

      const retryEnabled = await this.getSettingValue('email_retry_enabled');
      this.setCachedValue(cacheKey, retryEnabled);
      
      return retryEnabled;

    } catch (error) {
      console.error('❌ Error checking email retry setting:', error);
      return false;
    }
  }

  /**
   * ตรวจสอบว่าการจำกัดอัตราการส่งเปิดใช้งานหรือไม่
   */
  async isEmailRateLimitEnabled(): Promise<boolean> {
    try {
      const cacheKey = 'email_rate_limit_enabled';
      const cachedValue = this.getCachedValue(cacheKey);
      
      if (cachedValue !== null) {
        return cachedValue;
      }

      const rateLimitEnabled = await this.getSettingValue('email_rate_limit_enabled');
      this.setCachedValue(cacheKey, rateLimitEnabled);
      
      return rateLimitEnabled;

    } catch (error) {
      console.error('❌ Error checking rate limit setting:', error);
      return true; // เปิดใช้งาน rate limit เป็นค่าเริ่มต้นเพื่อความปลอดภัย
    }
  }

  /**
   * ตรวจสอบว่าโหมดดีบักเปิดใช้งานหรือไม่
   */
  async isEmailDebugMode(): Promise<boolean> {
    try {
      const debugMode = await this.getSettingValue('email_debug_mode');
      return debugMode;

    } catch (error) {
      console.error('❌ Error checking debug mode:', error);
      return false;
    }
  }

  /**
   * ตรวจสอบการตั้งค่าทั้งหมดสำหรับ email type นี้
   */
  async getEmailTypeStatus(emailType: EmailType): Promise<{
    systemEnabled: boolean;
    typeEnabled: boolean;
    queueEnabled: boolean;
    retryEnabled: boolean;
    canSend: boolean;
    reason?: string;
  }> {
    try {
      const [systemEnabled, typeEnabled, queueEnabled, retryEnabled] = await Promise.all([
        this.getSettingValue('email_service_enabled'),
        this.isEmailTypeEnabled(emailType),
        this.isEmailQueueEnabled(),
        this.isEmailRetryEnabled()
      ]);

      const canSend = systemEnabled && typeEnabled;
      let reason: string | undefined;

      if (!systemEnabled) {
        reason = 'Email service is disabled system-wide';
      } else if (!typeEnabled) {
        reason = `${emailType} emails are disabled`;
      }

      return {
        systemEnabled,
        typeEnabled,
        queueEnabled,
        retryEnabled,
        canSend,
        ...(reason && { reason })
      };

    } catch (error) {
      console.error(`❌ Error getting status for ${emailType}:`, error);
      return {
        systemEnabled: false,
        typeEnabled: false,
        queueEnabled: false,
        retryEnabled: false,
        canSend: false,
        reason: 'Error checking settings'
      };
    }
  }

  /**
   * ล้าง cache ทั้งหมด
   */
  clearCache(): void {
    this.settingsCache.clear();
    this.cacheExpiry.clear();
    console.log('📧 Email settings cache cleared');
  }

  /**
   * ล้าง cache สำหรับ setting เฉพาะ
   */
  clearCacheForSetting(settingKey: string): void {
    this.settingsCache.delete(settingKey);
    this.cacheExpiry.delete(settingKey);
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async getSettingValue(settingKey: string): Promise<boolean> {
    try {
      const result = await prisma.$queryRaw`
        SELECT get_email_setting(${settingKey}) as enabled
      `;

      return Boolean((result as any[])[0]?.enabled);

    } catch (error) {
      console.error(`❌ Error getting setting ${settingKey}:`, error);
      return false;
    }
  }

  private getEmailTypeSettingKey(emailType: EmailType): string {
    // ใช้ partial mapping และ fallback
    const settingKeys: Partial<Record<EmailType, string>> = {
      [EmailType.BOOKING_CONFIRMATION]: 'booking_confirmation_enabled',
      [EmailType.PAYMENT_RECEIPT]: 'payment_receipt_enabled',
      [EmailType.CHECKIN_REMINDER]: 'checkin_reminder_enabled'
    };

    return settingKeys[emailType] || 'unknown_email_type_enabled';
  }

  private getCachedValue(key: string): boolean | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      // Cache หมดอายุ
      this.settingsCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }

    return this.settingsCache.get(key) ?? null;
  }

  private setCachedValue(key: string, value: boolean): void {
    this.settingsCache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }
}

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Middleware function สำหรับตรวจสอบก่อนส่ง email
 */
export async function checkEmailPermission(emailType: EmailType): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const settingsService = EmailSettingsService.getInstance();
  const status = await settingsService.getEmailTypeStatus(emailType);

  return {
    allowed: status.canSend,
    ...(status.reason && { reason: status.reason })
  };
}

/**
 * Decorator function สำหรับ email sending functions
 */
export function withEmailPermissionCheck(emailType: EmailType) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const permission = await checkEmailPermission(emailType);
      
      if (!permission.allowed) {
        console.log(`🚫 Email sending blocked: ${permission.reason}`);
        return {
          success: false,
          error: permission.reason,
          blocked: true
        };
      }

      return method.apply(this, args);
    };
  };
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const emailSettingsService = EmailSettingsService.getInstance();
export default emailSettingsService;
