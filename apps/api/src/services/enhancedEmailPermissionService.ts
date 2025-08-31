import { PrismaClient } from '@prisma/client';
import { EmailType } from '../types/emailTypes';
import { emailSettingsService } from './emailSettingsService';

const prisma = new PrismaClient();

// ============================================
// ENHANCED EMAIL PERMISSION SERVICE
// ตรวจสอบการอนุญาตแบบละเอียด (Granular Permissions)
// ============================================

export class EnhancedEmailPermissionService {
  private static instance: EnhancedEmailPermissionService;

  static getInstance(): EnhancedEmailPermissionService {
    if (!EnhancedEmailPermissionService.instance) {
      EnhancedEmailPermissionService.instance = new EnhancedEmailPermissionService();
    }
    return EnhancedEmailPermissionService.instance;
  }

  /**
   * ตรวจสอบการอนุญาตแบบละเอียดสำหรับ Check-in Reminder
   */
  async canSendCheckinReminder(context: {
    timing?: '24h' | '3h' | '1h';
    guestType?: 'vip' | 'regular';
    bookingChannel?: 'online' | 'walk_in';
    roomType?: 'suite' | 'standard' | 'deluxe';
    bookingId?: string;
  }): Promise<{
    allowed: boolean;
    reason?: string;
    blockedBy?: string[];
  }> {
    try {
      const blockedBy: string[] = [];

      // 1. ตรวจสอบระบบโดยรวมก่อน
      const systemCheck = await emailSettingsService.isEmailTypeEnabled(EmailType.CHECKIN_REMINDER);
      if (!systemCheck) {
        return {
          allowed: false,
          reason: 'Check-in reminder emails are disabled system-wide',
          blockedBy: ['checkin_reminder_enabled']
        };
      }

      // 2. ตรวจสอบตาม timing
      if (context.timing) {
        const timingEnabled = await this.getSettingValue(`checkin_reminder_${context.timing}_enabled`);
        if (!timingEnabled) {
          blockedBy.push(`checkin_reminder_${context.timing}_enabled`);
        }
      }

      // 3. ตรวจสอบตาม guest type
      if (context.guestType) {
        const guestTypeEnabled = await this.getSettingValue(`checkin_reminder_${context.guestType}_enabled`);
        if (!guestTypeEnabled) {
          blockedBy.push(`checkin_reminder_${context.guestType}_enabled`);
        }
      }

      // 4. ตรวจสอบตาม booking channel
      if (context.bookingChannel) {
        const channelEnabled = await this.getSettingValue(`checkin_reminder_${context.bookingChannel}_booking_enabled`);
        if (!channelEnabled) {
          blockedBy.push(`checkin_reminder_${context.bookingChannel}_booking_enabled`);
        }
      }

      // 5. ตรวจสอบตาม room type
      if (context.roomType) {
        const roomTypeEnabled = await this.getSettingValue(`checkin_reminder_${context.roomType}_enabled`);
        if (!roomTypeEnabled) {
          blockedBy.push(`checkin_reminder_${context.roomType}_enabled`);
        }
      }

      const allowed = blockedBy.length === 0;
      const reason = allowed ? undefined : `Blocked by: ${blockedBy.join(', ')}`;

      return {
        allowed,
        ...(reason && { reason }),
        ...(blockedBy.length > 0 && { blockedBy })
      };

    } catch (error) {
      console.error('❌ Error checking granular permissions:', error);
      return {
        allowed: false,
        reason: 'Error checking permissions',
        blockedBy: ['system_error']
      };
    }
  }

  /**
   * ตรวจสอบการอนุญาตแบบละเอียดสำหรับ Payment Receipt
   */
  async canSendPaymentReceipt(context: {
    paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash';
    amount?: number;
    guestType?: 'vip' | 'regular';
  }): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      // ตรวจสอบระบบโดยรวม
      const systemCheck = await emailSettingsService.isEmailTypeEnabled(EmailType.PAYMENT_RECEIPT);
      if (!systemCheck) {
        return {
          allowed: false,
          reason: 'Payment receipt emails are disabled'
        };
      }

      // ตรวจสอบตาม payment method
      if (context.paymentMethod) {
        const methodEnabled = await this.getSettingValue(`payment_receipt_${context.paymentMethod}_enabled`);
        if (!methodEnabled) {
          return {
            allowed: false,
            reason: `Payment receipts for ${context.paymentMethod} are disabled`
          };
        }
      }

      // ตรวจสอบตาม amount threshold
      if (context.amount) {
        const minAmountSetting = await this.getSettingValue('payment_receipt_min_amount');
        const minAmount = typeof minAmountSetting === 'number' ? minAmountSetting : 0;
        if (context.amount < minAmount) {
          return {
            allowed: false,
            reason: `Payment amount below minimum threshold for receipt emails`
          };
        }
      }

      return { allowed: true };

    } catch (error) {
      console.error('❌ Error checking payment receipt permissions:', error);
      return {
        allowed: false,
        reason: 'Error checking permissions'
      };
    }
  }

  /**
   * ตรวจสอบการอนุญาตแบบละเอียดสำหรับ Booking Confirmation
   */
  async canSendBookingConfirmation(context: {
    bookingStatus?: 'confirmed' | 'pending' | 'cancelled';
    bookingChannel?: 'online' | 'phone' | 'walk_in';
    roomType?: 'suite' | 'standard' | 'deluxe';
    isRepeatGuest?: boolean;
  }): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      // ตรวจสอบระบบโดยรวม
      const systemCheck = await emailSettingsService.isEmailTypeEnabled(EmailType.BOOKING_CONFIRMATION);
      if (!systemCheck) {
        return {
          allowed: false,
          reason: 'Booking confirmation emails are disabled'
        };
      }

      // ตรวจสอบตาม booking status
      if (context.bookingStatus && context.bookingStatus !== 'confirmed') {
        const statusEnabled = await this.getSettingValue(`booking_confirmation_${context.bookingStatus}_enabled`);
        if (!statusEnabled) {
          return {
            allowed: false,
            reason: `Booking confirmation for ${context.bookingStatus} bookings is disabled`
          };
        }
      }

      // ตรวจสอบตาม repeat guest
      if (context.isRepeatGuest !== undefined) {
        const guestTypeKey = context.isRepeatGuest ? 'repeat_guest' : 'new_guest';
        const guestTypeEnabled = await this.getSettingValue(`booking_confirmation_${guestTypeKey}_enabled`);
        if (!guestTypeEnabled) {
          return {
            allowed: false,
            reason: `Booking confirmation for ${guestTypeKey}s is disabled`
          };
        }
      }

      return { allowed: true };

    } catch (error) {
      console.error('❌ Error checking booking confirmation permissions:', error);
      return {
        allowed: false,
        reason: 'Error checking permissions'
      };
    }
  }

  /**
   * สร้าง permission summary สำหรับ admin dashboard
   */
  async getPermissionSummary(): Promise<{
    checkinReminder: {
      overall: boolean;
      timing: { [key: string]: boolean };
      guestTypes: { [key: string]: boolean };
      channels: { [key: string]: boolean };
      roomTypes: { [key: string]: boolean };
    };
    paymentReceipt: {
      overall: boolean;
      paymentMethods: { [key: string]: boolean };
    };
    bookingConfirmation: {
      overall: boolean;
      channels: { [key: string]: boolean };
      guestTypes: { [key: string]: boolean };
    };
  }> {
    try {
      const [
        // Check-in Reminder
        checkinOverall,
        checkin24h,
        checkin3h,
        checkin1h,
        checkinVip,
        checkinRegular,
        checkinOnline,
        checkinWalkIn,
        checkinSuite,
        checkinStandard,

        // Payment Receipt
        paymentOverall,

        // Booking Confirmation
        bookingOverall
      ] = await Promise.all([
        // Check-in Reminder checks
        emailSettingsService.isEmailTypeEnabled(EmailType.CHECKIN_REMINDER),
        this.getSettingValue('checkin_reminder_24h_enabled'),
        this.getSettingValue('checkin_reminder_3h_enabled'),
        this.getSettingValue('checkin_reminder_1h_enabled'),
        this.getSettingValue('checkin_reminder_vip_enabled'),
        this.getSettingValue('checkin_reminder_regular_enabled'),
        this.getSettingValue('checkin_reminder_online_booking_enabled'),
        this.getSettingValue('checkin_reminder_walk_in_enabled'),
        this.getSettingValue('checkin_reminder_suite_enabled'),
        this.getSettingValue('checkin_reminder_standard_enabled'),

        // Payment Receipt checks
        emailSettingsService.isEmailTypeEnabled(EmailType.PAYMENT_RECEIPT),

        // Booking Confirmation checks
        emailSettingsService.isEmailTypeEnabled(EmailType.BOOKING_CONFIRMATION)
      ]);

      return {
        checkinReminder: {
          overall: checkinOverall,
          timing: {
            '24h': checkin24h,
            '3h': checkin3h,
            '1h': checkin1h
          },
          guestTypes: {
            vip: checkinVip,
            regular: checkinRegular
          },
          channels: {
            online: checkinOnline,
            walkIn: checkinWalkIn
          },
          roomTypes: {
            suite: checkinSuite,
            standard: checkinStandard
          }
        },
        paymentReceipt: {
          overall: paymentOverall,
          paymentMethods: {} // สามารถขยายได้
        },
        bookingConfirmation: {
          overall: bookingOverall,
          channels: {}, // สามารถขยายได้
          guestTypes: {} // สามารถขยายได้
        }
      };

    } catch (error) {
      console.error('❌ Error getting permission summary:', error);
      throw error;
    }
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
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * ตรวจสอบการอนุญาตแบบละเอียดสำหรับ Check-in Reminder
 */
export async function canSendCheckinReminderWithContext(context: {
  timing?: '24h' | '3h' | '1h';
  guestType?: 'vip' | 'regular';
  bookingChannel?: 'online' | 'walk_in';
  roomType?: 'suite' | 'standard';
  bookingId?: string;
}) {
  const service = EnhancedEmailPermissionService.getInstance();
  return await service.canSendCheckinReminder(context);
}

/**
 * ฟังก์ชันสำหรับใช้ใน email sending functions
 */
export async function validateEmailPermission(
  emailType: EmailType,
  context: any = {}
): Promise<{
  allowed: boolean;
  reason?: string;
  blockedBy?: string[];
}> {
  const service = EnhancedEmailPermissionService.getInstance();

  switch (emailType) {
    case EmailType.CHECKIN_REMINDER:
      return await service.canSendCheckinReminder(context);

    case EmailType.PAYMENT_RECEIPT:
      return await service.canSendPaymentReceipt(context);

    case EmailType.BOOKING_CONFIRMATION:
      return await service.canSendBookingConfirmation(context);

    default:
      // Fallback ไปใช้ basic check
      const basicCheck = await emailSettingsService.isEmailTypeEnabled(emailType);
      return {
        allowed: basicCheck,
        ...(basicCheck ? {} : { reason: `${emailType} emails are disabled` })
      };
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const enhancedEmailPermissionService = EnhancedEmailPermissionService.getInstance();
export default enhancedEmailPermissionService;
