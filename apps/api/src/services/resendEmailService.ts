import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
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

const prisma = new PrismaClient();

// ============================================
// RESEND EMAIL SERVICE
// ============================================

export class ResendEmailService {
  private resend: Resend;
  private config: EmailServiceConfig;

  constructor() {
    this.config = {
      provider: 'resend',
      apiKey: process.env.RESEND_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'bookings@malairesort.com',
      fromName: process.env.FROM_NAME || 'Malai Khaoyai Resort',
      maxRetries: 3,
      retryDelayMinutes: 5
    };

    if (process.env.REPLY_TO_EMAIL) {
      this.config.replyToEmail = process.env.REPLY_TO_EMAIL;
    }

    // Initialize Resend
    this.resend = new Resend(this.config.apiKey);
  }

  // ============================================
  // TEMPLATE METHODS
  // ============================================

  /**
   * ดึง HTML template สำหรับแต่ละประเภทอีเมล
   */
  private getEmailTemplate(emailType: EmailType): (data: any) => string {
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
        throw new Error(`Unknown email type: ${emailType}`);
    }
  }

  /**
   * สร้าง subject line สำหรับแต่ละประเภทอีเมล
   */
  private getEmailSubject(emailType: EmailType, data: any): string {
    switch (emailType) {
      case EmailType.BOOKING_CONFIRMATION:
        return `ยืนยันการจอง ${data.bookingId} ที่ ${this.config.fromName}`;
      case EmailType.PAYMENT_RECEIPT:
        return `ใบเสร็จการชำระเงิน - ${data.bookingId}`;
      case EmailType.CHECKIN_REMINDER:
        return `แจ้งเตือนเช็คอิน - ${data.bookingId}`;
      case EmailType.PASSWORD_RESET:
        return 'รีเซ็ตรหัสผ่าน - Malai Resort';
      default:
        return 'การแจ้งเตือนจาก Malai Resort';
    }
  }

  // ============================================
  // CORE EMAIL SENDING
  // ============================================

  /**
   * ส่งอีเมลผ่าน Resend
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    const startTime = Date.now();
    
    try {
      console.log(`📧 [Resend] Sending ${emailData.type} email to ${emailData.to}`);

      // ดึง template และสร้าง HTML content
      const templateFunction = this.getEmailTemplate(emailData.type);
      const htmlContent = templateFunction(emailData.templateData);
      
      // สร้าง subject
      const subject = this.getEmailSubject(emailData.type, emailData.templateData);

      // เตรียม email data สำหรับ Resend
      const resendEmailData = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: emailData.to,
        subject: subject,
        html: htmlContent,
        reply_to: this.config.replyToEmail
      };

      console.log('📤 [Resend] Email payload prepared:', {
        from: resendEmailData.from,
        to: resendEmailData.to,
        subject: resendEmailData.subject,
        htmlLength: htmlContent.length
      });

      // ส่งอีเมลผ่าน Resend
      const response = await this.resend.emails.send(resendEmailData);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ [Resend] Email sent successfully in ${duration}ms`);
      console.log('📨 [Resend] Response:', {
        id: response.data?.id,
        success: !!response.data
      });

      // Log to database
      await this.logEmail({
        messageId: response.data?.id || '',
        to: emailData.to,
        toName: emailData.toName,
        type: emailData.type,
        status: EmailStatus.SENT,
        sentAt: new Date(),
        provider: 'resend',
        subject: subject,
        templateData: emailData.templateData
      });

      return {
        success: true,
        messageId: response.data?.id || '',
        provider: 'resend',
        sentAt: new Date(),
        duration
      };

    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error(`❌ [Resend] Email sending failed after ${duration}ms:`, error);

      // Log error to database
      await this.logEmail({
        messageId: '',
        to: emailData.to,
        toName: emailData.toName,
        type: emailData.type,
        status: EmailStatus.FAILED,
        sentAt: new Date(),
        provider: 'resend',
        subject: this.getEmailSubject(emailData.type, emailData.templateData),
        templateData: emailData.templateData,
        errorMessage: error.message
      });

      return {
        success: false,
        error: error.message,
        provider: 'resend',
        duration
      };
    }
  }

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  /**
   * ส่งอีเมลยืนยันการจอง
   */
  async sendBookingConfirmation(
    guestEmail: string,
    guestName: string,
    bookingData: any
  ): Promise<EmailResult> {
    console.log(`🏨 [Resend] Sending booking confirmation to ${guestEmail}`);
    
    const emailData: EmailData = {
      type: EmailType.BOOKING_CONFIRMATION,
      to: guestEmail,
      toName: guestName,
      templateData: {
        guestName,
        bookingId: bookingData.bookingReferenceId,
        roomType: bookingData.roomType?.name || 'Standard Room',
        roomNumber: bookingData.room?.roomNumber || 'TBD',
        checkinDate: bookingData.checkinDate,
        checkoutDate: bookingData.checkoutDate,
        totalAmount: bookingData.finalAmount,
        hotelName: this.config.fromName,
        // QR Code data (อาจจะเพิ่มในอนาคต)
        qrCode: bookingData.qrCode || null
      }
    };

    return await this.sendEmail(emailData);
  }

  /**
   * ส่งอีเมลใบเสร็จการชำระเงิน
   */
  async sendPaymentReceipt(
    guestEmail: string,
    guestName: string,
    paymentData: any
  ): Promise<EmailResult> {
    console.log(`💳 [Resend] Sending payment receipt to ${guestEmail}`);
    
    const emailData: EmailData = {
      type: EmailType.PAYMENT_RECEIPT,
      to: guestEmail,
      toName: guestName,
      templateData: {
        guestName,
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        paymentMethod: paymentData.method,
        transactionId: paymentData.transactionId,
        paidAt: paymentData.paidAt,
        hotelName: this.config.fromName
      }
    };

    return await this.sendEmail(emailData);
  }

  /**
   * ส่งอีเมลแจ้งเตือนเช็คอิน
   */
  async sendCheckinReminder(
    guestEmail: string,
    guestName: string,
    bookingData: any
  ): Promise<EmailResult> {
    console.log(`🔔 [Resend] Sending check-in reminder to ${guestEmail}`);
    
    const emailData: EmailData = {
      type: EmailType.CHECKIN_REMINDER,
      to: guestEmail,
      toName: guestName,
      templateData: {
        guestName,
        bookingId: bookingData.bookingReferenceId,
        checkinDate: bookingData.checkinDate,
        roomType: bookingData.roomType?.name || 'Standard Room',
        hotelName: this.config.fromName,
        checkinTime: '14:00'
      }
    };

    return await this.sendEmail(emailData);
  }

  // ============================================
  // DATABASE LOGGING
  // ============================================

  /**
   * บันทึก log การส่งอีเมลลงฐานข้อมูล
   */
  private async logEmail(logData: EmailLog): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: {
          messageId: logData.messageId,
          to: logData.to,
          toName: logData.toName,
          type: logData.type,
          status: logData.status,
          sentAt: logData.sentAt,
          provider: logData.provider,
          subject: logData.subject,
          templateData: logData.templateData,
          errorMessage: logData.errorMessage
        }
      });
    } catch (error) {
      console.error('❌ Failed to log email to database:', error);
      // Don't throw error - logging failure shouldn't stop email sending
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * ทดสอบการเชื่อมต่อ Resend
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 [Resend] Testing connection...');
      
      // ส่ง test email (ไปยัง admin email)
      const testEmail = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: 'admin@malairesort.com', // ใช้ admin email สำหรับทดสอบ
        subject: 'Resend Connection Test',
        html: '<h1>Resend is working!</h1><p>This is a test email from Resend service.</p>'
      };

      const response = await this.resend.emails.send(testEmail);
      
      if (response.data?.id) {
        console.log('✅ [Resend] Connection test successful');
        return {
          success: true,
          message: `Resend connection successful. Test email ID: ${response.data.id}`
        };
      } else {
        throw new Error('No message ID returned');
      }
      
    } catch (error: any) {
      console.error('❌ [Resend] Connection test failed:', error);
      return {
        success: false,
        message: `Resend connection failed: ${error.message}`
      };
    }
  }

  /**
   * ดึงสถิติการส่งอีเมล
   */
  async getEmailStats(): Promise<any> {
    try {
      const stats = await prisma.emailLog.groupBy({
        by: ['status', 'type'],
        _count: {
          id: true
        },
        where: {
          provider: 'resend',
          sentAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      return {
        provider: 'resend',
        period: 'last_30_days',
        stats
      };
    } catch (error) {
      console.error('❌ Failed to get email stats:', error);
      return { error: 'Failed to retrieve stats' };
    }
  }
}

// Export singleton instance
export const resendEmailService = new ResendEmailService();
