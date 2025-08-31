import { EmailData, EmailResult, EmailType } from '../types/emailTypes';
import { resendEmailService } from './resendEmailService';

// ============================================
// UNIFIED EMAIL SERVICE
// ============================================
// รองรับทั้ง MailerSend และ Resend พร้อม switching

export enum EmailProvider {
  MAILERSEND = 'mailersend',
  RESEND = 'resend'
}

interface EmailServiceConfig {
  primary: EmailProvider;
  fallback: EmailProvider;
  autoFailover: boolean;
  testMode: boolean;
}

export class UnifiedEmailService {
  private config: EmailServiceConfig;
  private mailerSendService: any;
  private resendService: any;

  constructor() {
    // อ่านการตั้งค่าจาก environment variables
    this.config = {
      primary: (process.env.EMAIL_PRIMARY_PROVIDER as EmailProvider) || EmailProvider.MAILERSEND,
      fallback: (process.env.EMAIL_FALLBACK_PROVIDER as EmailProvider) || EmailProvider.RESEND,
      autoFailover: process.env.EMAIL_AUTO_FAILOVER === 'true',
      testMode: process.env.NODE_ENV === 'development'
    };

    console.log('📧 Unified Email Service Configuration:');
    console.log(`  - Primary: ${this.config.primary}`);
    console.log(`  - Fallback: ${this.config.fallback}`);
    console.log(`  - Auto Failover: ${this.config.autoFailover}`);
    console.log(`  - Test Mode: ${this.config.testMode}`);

    this.initializeServices();
  }

  private async initializeServices() {
    try {
      // Initialize Resend
      this.resendService = resendEmailService;
      console.log('✅ Resend service initialized');

      // Initialize MailerSend (dynamically import to avoid dependency issues)
      if (this.config.primary === EmailProvider.MAILERSEND || 
          this.config.fallback === EmailProvider.MAILERSEND) {
        try {
          const { emailService } = await import('./emailService');
          this.mailerSendService = emailService;
          console.log('✅ MailerSend service initialized');
        } catch (error) {
          console.warn('⚠️ MailerSend service not available:', error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing email services:', error);
    }
  }

  // ============================================
  // MAIN EMAIL SENDING METHOD
  // ============================================

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    console.log(`📧 [UnifiedEmail] Sending ${emailData.type} email to ${emailData.to}`);
    
    // ลองส่งด้วย primary service ก่อน
    const primaryResult = await this.sendWithProvider(this.config.primary, emailData);
    
    if (primaryResult.success) {
      console.log(`✅ [${this.config.primary}] Email sent successfully`);
      return primaryResult;
    }

    console.warn(`⚠️ [${this.config.primary}] Primary service failed:`, primaryResult.error);

    // หาก primary ล้มเหลวและมี auto failover
    if (this.config.autoFailover && this.config.fallback !== this.config.primary) {
      console.log(`🔄 [Failover] Trying ${this.config.fallback}...`);
      
      const fallbackResult = await this.sendWithProvider(this.config.fallback, emailData);
      
      if (fallbackResult.success) {
        console.log(`✅ [${this.config.fallback}] Failover successful`);
        return {
          ...fallbackResult,
          provider: `${this.config.fallback} (failover from ${this.config.primary})`
        };
      }

      console.error(`❌ [${this.config.fallback}] Failover also failed:`, fallbackResult.error);
    }

    // ทั้งสองล้มเหลว
    return {
      success: false,
      error: `Both ${this.config.primary} and ${this.config.fallback} failed`,
      provider: 'unified (failed)'
    };
  }

  // ============================================
  // PROVIDER-SPECIFIC SENDING
  // ============================================

  private async sendWithProvider(provider: EmailProvider, emailData: EmailData): Promise<EmailResult> {
    try {
      switch (provider) {
        case EmailProvider.MAILERSEND:
          return await this.sendWithMailerSend(emailData);
        
        case EmailProvider.RESEND:
          return await this.sendWithResend(emailData);
        
        default:
          throw new Error(`Unknown email provider: ${provider}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: provider
      };
    }
  }

  private async sendWithMailerSend(emailData: EmailData): Promise<EmailResult> {
    if (!this.mailerSendService) {
      throw new Error('MailerSend service not available');
    }

    console.log('📤 [MailerSend] Sending email...');
    return await this.mailerSendService.sendEmail(emailData);
  }

  private async sendWithResend(emailData: EmailData): Promise<EmailResult> {
    if (!this.resendService) {
      throw new Error('Resend service not available');
    }

    console.log('📤 [Resend] Sending email...');
    return await this.resendService.sendEmail(emailData);
  }

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  async sendBookingConfirmation(guestEmail: string, guestName: string, bookingData: any): Promise<EmailResult> {
    console.log(`🏨 [UnifiedEmail] Sending booking confirmation to ${guestEmail}`);

    // ตรวจสอบว่าใช้ provider ไหน
    if (this.config.primary === EmailProvider.MAILERSEND && this.mailerSendService) {
      // ใช้ MailerSend template ที่มีอยู่แล้ว
      console.log('📋 Using existing MailerSend template');
      return await this.sendWithMailerSend({
        type: EmailType.BOOKING_CONFIRMATION,
        to: guestEmail,
        toName: guestName,
        subject: `ยืนยันการจอง ${bookingData.bookingReferenceId} ที่ Malai Khaoyai Resort`,
        templateData: {
          guestName,
          bookingId: bookingData.bookingReferenceId,
          roomType: bookingData.roomType?.name || 'Standard Room',
          roomNumber: bookingData.room?.roomNumber || 'TBD',
          checkinDate: bookingData.checkinDate,
          checkoutDate: bookingData.checkoutDate,
          totalAmount: bookingData.finalAmount,
          hotelName: 'Malai Khaoyai Resort'
        }
      });
    } else {
      // ใช้ Resend service
      console.log('🆕 Using Resend service');
      return await this.resendService.sendBookingConfirmation(guestEmail, guestName, bookingData);
    }
  }

  // ============================================
  // TESTING AND MONITORING
  // ============================================

  async testAllServices(): Promise<{ [key: string]: boolean }> {
    console.log('🧪 Testing all email services...');
    
    const results: { [key: string]: boolean } = {};

    // Test MailerSend
    if (this.mailerSendService) {
      try {
        const testResult = await this.mailerSendService.testConnection();
        results.mailersend = testResult.success;
        console.log(`${results.mailersend ? '✅' : '❌'} MailerSend:`, testResult.message);
      } catch (error: any) {
        results.mailersend = false;
        console.log('❌ MailerSend:', error.message);
      }
    } else {
      results.mailersend = false;
      console.log('❌ MailerSend: Service not available');
    }

    // Test Resend
    if (this.resendService) {
      try {
        const testResult = await this.resendService.testConnection();
        results.resend = testResult.success;
        console.log(`${results.resend ? '✅' : '❌'} Resend:`, testResult.message);
      } catch (error: any) {
        results.resend = false;
        console.log('❌ Resend:', error.message);
      }
    } else {
      results.resend = false;
      console.log('❌ Resend: Service not available');
    }

    return results;
  }

  async switchPrimaryProvider(newProvider: EmailProvider): Promise<void> {
    console.log(`🔄 Switching primary email provider to: ${newProvider}`);
    this.config.primary = newProvider;
    
    // อัพเดท environment variable (runtime only)
    process.env.EMAIL_PRIMARY_PROVIDER = newProvider;
    
    console.log(`✅ Primary provider switched to: ${newProvider}`);
  }

  getCurrentConfiguration(): EmailServiceConfig {
    return { ...this.config };
  }

  // ============================================
  // SERVICE STATUS
  // ============================================

  async getServiceStatus(): Promise<{
    primary: { provider: EmailProvider; status: boolean };
    fallback: { provider: EmailProvider; status: boolean };
    config: EmailServiceConfig;
  }> {
    const testResults = await this.testAllServices();
    
    return {
      primary: {
        provider: this.config.primary,
        status: testResults[this.config.primary] || false
      },
      fallback: {
        provider: this.config.fallback,
        status: testResults[this.config.fallback] || false
      },
      config: this.config
    };
  }
}

// Export singleton instance
export const unifiedEmailService = new UnifiedEmailService();
