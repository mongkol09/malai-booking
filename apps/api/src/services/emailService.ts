import { PrismaClient } from '@prisma/client';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { 
  EmailData, 
  EmailResult, 
  EmailType, 
  EmailStatus,
  EmailServiceConfig,
  EmailLog
} from '../types/emailTypes';
import { bookingConfirmationTemplate } from '../templates/bookingConfirmationTemplate';
import { paymentReceiptTemplate } from '../templates/paymentReceiptTemplate';
import { checkinReminderTemplate } from '../templates/checkinReminderTemplate';
import { passwordResetTemplate } from '../templates/passwordResetTemplate';
import { emailSettingsService, checkEmailPermission } from './emailSettingsService';
import { validateEmailPermission } from './enhancedEmailPermissionService';

const prisma = new PrismaClient();

// ============================================
// CORE EMAIL SERVICE
// ============================================

export class EmailService {
  private mailerSend: MailerSend;
  private config: EmailServiceConfig;

  constructor() {
    this.config = {
      provider: 'mailersend',
      apiKey: process.env.MAILERSEND_API_TOKEN || '',
      fromEmail: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      fromName: process.env.FROM_NAME || 'Malai Khaoyai Resort',
      maxRetries: 3,
      retryDelayMinutes: 5
    };

    if (process.env.REPLY_TO_EMAIL) {
      this.config.replyToEmail = process.env.REPLY_TO_EMAIL;
    }

    this.mailerSend = new MailerSend({
      apiKey: this.config.apiKey,
    });
  }

  // ============================================
  // TEMPLATE METHODS
  // ============================================

  /**
   * ดึง HTML template สำหรับแต่ละประเภทอีเมล
   */
  private getEmailTemplate(emailType: EmailType): string {
    switch (emailType) {
      case EmailType.BOOKING_CONFIRMATION:
        return bookingConfirmationTemplate;
      case EmailType.PAYMENT_RECEIPT:
        return paymentReceiptTemplate;
      case EmailType.CHECKIN_REMINDER:
        return checkinReminderTemplate;
      case EmailType.PASSWORD_RESET:
        return passwordResetTemplate;
      default:
        return bookingConfirmationTemplate; // Fallback
    }
  }

  /**
   * แทนที่ variables ใน template
   */
  private replaceTemplateVariables(template: string, variables: any): string {
    let result = template;
    
    // Replace simple variables like {{variable_name}}
    Object.keys(variables).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const value = variables[key] || '';
      result = result.replace(placeholder, value);
    });
    
    return result;
  }

  // ============================================
  // MAIN EMAIL SENDING METHODS
  // ============================================

  /**
   * ส่งอีเมลพร้อมตรวจสอบ settings แบบละเอียด
   */
  async sendEmailWithGranularCheck(
    emailData: EmailData, 
    context: any = {}
  ): Promise<EmailResult> {
    try {
      // ตรวจสอบการอนุญาตแบบละเอียด
      const permission = await validateEmailPermission(emailData.type, context);
      
      if (!permission.allowed) {
        console.log(`🚫 Email sending blocked for ${emailData.type}:`, {
          reason: permission.reason,
          blockedBy: permission.blockedBy,
          context
        });
        
        // บันทึก log ว่าถูกบล็อก
        await this.logEmail(
          emailData.to,
          emailData.type,
          EmailStatus.FAILED,
          undefined,
          `Granular block: ${permission.reason}`
        );

        return {
          success: false,
          error: permission.reason || 'Email sending is disabled',
          blocked: true
        };
      }

      // ตรวจสอบ debug mode
      const isDebugMode = await emailSettingsService.isEmailDebugMode();
      if (isDebugMode) {
        console.log(`🔧 DEBUG MODE: Would send ${emailData.type} email to ${emailData.to}`);
        console.log('📧 Email data:', JSON.stringify({ emailData, context }, null, 2));
        
        return {
          success: true,
          messageId: `debug-${Date.now()}`,
          debug: true
        };
      }

      // ส่งอีเมลจริง
      return await this.sendHtmlEmail(emailData);

    } catch (error: any) {
      console.error('❌ Error in sendEmailWithGranularCheck:', error);
      return {
        success: false,
        error: error.message || 'Email sending failed'
      };
    }
  }
  async sendHtmlEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      console.log(`📧 Sending HTML email to ${emailData.to} - Subject: ${emailData.subject}`);

      const sentFrom = new Sender(this.config.fromEmail, this.config.fromName);
      const recipients = [new Recipient(emailData.to, emailData.toName)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(emailData.subject);

      if (this.config.replyToEmail) {
        emailParams.setReplyTo(new Sender(this.config.replyToEmail, this.config.fromName));
      }

      // Use HTML template if provided
      if (emailData.templateData && emailData.templateData.htmlContent) {
        emailParams.setHtml(emailData.templateData.htmlContent);
      }

      // Add text version if available
      if (emailData.templateData && emailData.templateData.textContent) {
        emailParams.setText(emailData.templateData.textContent);
      }

      // Add attachments if any
      if (emailData.attachments && emailData.attachments.length > 0) {
        // Note: MailerSend attachments would be added here
        console.log(`📎 Adding ${emailData.attachments.length} attachments`);
      }

      const response = await this.mailerSend.email.send(emailParams);

      return {
        success: true,
        messageId: response.body?.message_id || 'unknown'
      };

    } catch (error: any) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown email sending error'
      };
    }
  }

  /**
   * ส่งอีเมลโดยใช้ MailerSend template
   */
  async sendTemplateEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      console.log(`📧 Sending template email to ${emailData.to} - Template: ${emailData.templateId}`);

      if (!emailData.templateId) {
        throw new Error('Template ID is required for template email');
      }

      const sentFrom = new Sender(this.config.fromEmail, this.config.fromName);
      const recipients = [new Recipient(emailData.to, emailData.toName)];

      const personalization = [{
        email: emailData.to,
        data: emailData.templateData || {}
      }];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(emailData.subject)
        .setTemplateId(emailData.templateId)
        .setPersonalization(personalization);

      if (this.config.replyToEmail) {
        emailParams.setReplyTo(new Sender(this.config.replyToEmail, this.config.fromName));
      }

      const response = await this.mailerSend.email.send(emailParams);

      return {
        success: true,
        messageId: response.body?.message_id || 'unknown'
      };

    } catch (error: any) {
      console.error('❌ Template email sending failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown template email sending error'
      };
    }
  }

  // ============================================
  // EMAIL LOGGING & TRACKING
  // ============================================

  /**
   * บันทึก log การส่งอีเมล
   */
  async logEmail(
    recipientEmail: string,
    emailType: EmailType,
    status: EmailStatus,
    messageId?: string,
    error?: string,
    bookingId?: string
  ): Promise<void> {
    try {
      console.log(`📝 Logging email: ${emailType} to ${recipientEmail} - Status: ${status}`);

      // For now, just console log since EmailLog model might not be migrated yet
      const logData = {
        bookingId,
        recipientEmail,
        emailType,
        status,
        messageId,
        error,
        sentAt: status === EmailStatus.SENT ? new Date() : null,
        createdAt: new Date()
      };

      console.log('📋 Email Log:', JSON.stringify(logData, null, 2));

      // TODO: Uncomment when EmailLog model is ready
      // await prisma.emailLog.create({ data: logData });

    } catch (logError) {
      console.error('❌ Error logging email:', logError);
    }
  }

  // ============================================
  // EMAIL VALIDATION & UTILITIES
  // ============================================

  /**
   * ตรวจสอบความถูกต้องของอีเมล
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * ตรวจสอบสถานะการส่งอีเมล
   */
  async getEmailStatus(messageId: string): Promise<any> {
    try {
      // TODO: Implement MailerSend API call to check email status
      console.log(`🔍 Checking email status for message ID: ${messageId}`);
      return { status: 'unknown' };
    } catch (error) {
      console.error('❌ Error checking email status:', error);
      return { status: 'error', error: error };
    }
  }

  /**
   * ส่งอีเมลแบบ batch
   */
  async sendBatchEmails(emails: EmailData[]): Promise<EmailResult[]> {
    console.log(`📧 Sending batch of ${emails.length} emails`);
    
    const results: EmailResult[] = [];
    
    for (const email of emails) {
      try {
        const result = await this.sendHtmlEmail(email);
        results.push(result);
        
        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Batch complete: ${successCount}/${emails.length} emails sent successfully`);
    
    return results;
  }

  // ============================================
  // EMAIL CONFIGURATION
  // ============================================

  /**
   * อัพเดตการตั้งค่า email service
   */
  updateConfig(newConfig: Partial<EmailServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize MailerSend if API key changed
    if (newConfig.apiKey) {
      this.mailerSend = new MailerSend({
        apiKey: newConfig.apiKey,
      });
    }
    
    console.log('⚙️ Email service configuration updated');
  }

  /**
   * ดูการตั้งค่าปัจจุบัน
   */
  getConfig(): EmailServiceConfig {
    return { ...this.config };
  }

  // ============================================
  // EMAIL ANALYTICS (BASIC)
  // ============================================

  /**
   * ดูสถิติการส่งอีเมลเบื้องต้น
   */
  async getEmailStats(dateRange?: { from: Date; to: Date }): Promise<any> {
    try {
      console.log('📊 Fetching email statistics...');
      
      // TODO: Implement actual analytics from EmailLog table
      return {
        totalSent: 0,
        totalFailed: 0,
        successRate: 0,
        message: 'Email analytics will be available after EmailLog model migration'
      };
      
    } catch (error) {
      console.error('❌ Error fetching email stats:', error);
      return { error: 'Failed to fetch email statistics' };
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const emailService = new EmailService();
export default emailService;
