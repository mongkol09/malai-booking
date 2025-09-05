import { EmailData, EmailResult, EmailType } from '../types/emailTypes';
import { malaiBookingConfirmationTemplate, malaiBookingConfirmationTextTemplate } from '../templates/malaiBookingConfirmationTemplate';

/**
 * Malai Khaoyai Resort Email Service
 * Configured for immediate production use with Resend
 */

export interface MalaiBookingData {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_type: string;
  guest_count: string;
  checkin_date: string;
  checkout_date: string;
  payment_amount: string;
  tax_amount: string;
  booking_reference: string;
  hotel_name?: string;
  current_date?: string;
}

export class MalaiEmailService {
  private resend: any;
  private config: {
    fromEmail: string;
    fromName: string;
    apiKey: string;
  };

  constructor() {
    // Production-ready configuration
    this.config = {
      fromEmail: 'onboarding@resend.dev', // Working immediately
      fromName: 'Malai Khaoyai Resort',
      apiKey: process.env.RESEND_API_KEY || ''
    };

    this.initializeResend();
  }

  private async initializeResend() {
    try {
      const { Resend } = await import('resend');
      this.resend = new Resend(this.config.apiKey);
      console.log('✅ Malai Email Service initialized with Resend');
    } catch (error) {
      console.error('❌ Failed to initialize Resend:', error);
    }
  }

  /**
   * Send booking confirmation email with beautiful Malai template
   */
  async sendBookingConfirmation(bookingData: MalaiBookingData): Promise<EmailResult> {
    try {
      console.log(`📧 [Malai] Sending booking confirmation for ${bookingData.booking_reference}`);

      if (!this.resend) {
        await this.initializeResend();
      }

      // Generate template
      const htmlContent = malaiBookingConfirmationTemplate(bookingData);
      const textContent = malaiBookingConfirmationTextTemplate(bookingData);

      const emailData = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: bookingData.guest_email,
        subject: `🏨 Booking Confirmation - ${bookingData.booking_reference} - Malai Khaoyai`,
        html: htmlContent,
        text: textContent
      };

      console.log(`📤 Sending to: ${bookingData.guest_email}`);
      const result = await this.resend.emails.send(emailData);

      if (result.data?.id) {
        console.log(`✅ [Malai] Booking confirmation sent successfully`);
        console.log(`📨 Message ID: ${result.data.id}`);
        
        return {
          success: true,
          messageId: result.data.id
          // provider: 'resend' // Property not in schema
        };
      } else {
        console.log('❌ [Malai] Failed to send - no message ID');
        return {
          success: false,
          error: 'No message ID returned'
          // provider: 'resend' // Property not in schema
        };
      }

    } catch (error: any) {
      console.error('❌ [Malai] Booking confirmation failed:', error?.message || error);
      
      return {
        success: false,
        error: error?.message || 'Unknown error'
        // provider: 'resend' // Property not in schema
      };
    }
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(bookingData: MalaiBookingData & { payment_method?: string; transaction_id?: string }): Promise<EmailResult> {
    try {
      console.log(`📧 [Malai] Sending payment receipt for ${bookingData.booking_reference}`);

      const htmlContent = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #8B7355, #A0896B); color: white; text-align: center; padding: 40px;">
            <div style="margin-bottom: 15px;">🌸 🌸</div>
            <div style="font-size: 48px; font-weight: 300; letter-spacing: 8px; margin: 20px 0 5px 0;">MALAI</div>
            <div style="font-size: 14px; letter-spacing: 2px; margin-bottom: 5px;">Khaoyai</div>
            <div style="font-size: 12px; font-style: italic; opacity: 0.8;">Your most memorable days await you</div>
          </div>
          
          <div style="padding: 40px 30px; background: #f8f6f3; text-align: center;">
            <h1 style="font-size: 36px; color: #8B7355; margin-bottom: 10px;">Payment Receipt</h1>
            <h2 style="font-size: 20px; color: #8B7355; margin-bottom: 30px;">Payment confirmed!</h2>
            
            <div style="text-align: left; color: #666; line-height: 1.6;">
              <p>Dear ${bookingData.guest_name},</p>
              <p>We have successfully received your payment for booking <strong>${bookingData.booking_reference}</strong>.</p>
            </div>
          </div>
          
          <div style="background: white;">
            <div style="background: linear-gradient(135deg, #8B7355, #A0896B); color: white; padding: 15px 20px; font-size: 22px;">
              Payment Details 💳
            </div>
            <div style="padding: 25px;">
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #8B7355; font-weight: 500;">Booking Reference:</span>
                <span style="font-weight: 600;">${bookingData.booking_reference}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #8B7355; font-weight: 500;">Amount Paid:</span>
                <span style="font-weight: 600;">${bookingData.payment_amount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #8B7355; font-weight: 500;">Payment Method:</span>
                <span style="font-weight: 600;">${bookingData.payment_method || 'Bank Transfer'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                <span style="color: #8B7355; font-weight: 500;">Transaction ID:</span>
                <span style="font-weight: 600;">${bookingData.transaction_id || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #8B7355, #A0896B); color: white; padding: 30px; text-align: center;">
            <h3 style="font-size: 28px; font-style: italic; margin-bottom: 8px;">Thank you!</h3>
            <p style="margin-bottom: 15px;">We look forward to welcoming you.</p>
            <div style="font-size: 14px; line-height: 1.8;">
              <div>📞 083-922-2929</div>
              <div>✉️ center@malaikhaoyai.com</div>
              <div>🌐 www.malairesort.com</div>
            </div>
          </div>
        </div>
      `;

      const result = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: bookingData.guest_email,
        subject: `💳 Payment Receipt - ${bookingData.booking_reference} - Malai Khaoyai`,
        html: htmlContent,
        text: `
MALAI KHAOYAI RESORT
Payment Receipt

Dear ${bookingData.guest_name},

We have successfully received your payment for booking ${bookingData.booking_reference}.

PAYMENT DETAILS
===============
Booking Reference: ${bookingData.booking_reference}
Amount Paid: ${bookingData.payment_amount}
Payment Method: ${bookingData.payment_method || 'Bank Transfer'}
Transaction ID: ${bookingData.transaction_id || 'N/A'}

Thank you! We look forward to welcoming you.

Contact: 083-922-2929 | center@malaikhaoyai.com
        `
      });

      if (result.data?.id) {
        console.log(`✅ [Malai] Payment receipt sent successfully`);
        return {
          success: true,
          messageId: result.data.id
          // provider: 'resend' // Property not in schema
        };
      } else {
        return {
          success: false,
          error: 'No message ID returned'
          // provider: 'resend' // Property not in schema
        };
      }

    } catch (error: any) {
      console.error('❌ [Malai] Payment receipt failed:', error?.message || error);
      return {
        success: false,
        error: error?.message || 'Unknown error'
        // provider: 'resend' // Property not in schema
      };
    }
  }

  /**
   * Send check-in reminder email
   */
  async sendCheckinReminder(bookingData: MalaiBookingData & { days_until_checkin?: number }): Promise<EmailResult> {
    try {
      console.log(`📧 [Malai] Sending check-in reminder for ${bookingData.booking_reference}`);

      const daysUntil = bookingData.days_until_checkin || 1;
      const reminderText = daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;

      const htmlContent = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #8B7355, #A0896B); color: white; text-align: center; padding: 40px;">
            <div style="margin-bottom: 15px;">🌸 🌸</div>
            <div style="font-size: 48px; font-weight: 300; letter-spacing: 8px; margin: 20px 0 5px 0;">MALAI</div>
            <div style="font-size: 14px; letter-spacing: 2px; margin-bottom: 5px;">Khaoyai</div>
            <div style="font-size: 12px; font-style: italic; opacity: 0.8;">Your most memorable days await you</div>
          </div>
          
          <div style="padding: 40px 30px; background: #f8f6f3; text-align: center;">
            <h1 style="font-size: 36px; color: #8B7355; margin-bottom: 10px;">Check-in Reminder</h1>
            <h2 style="font-size: 20px; color: #8B7355; margin-bottom: 30px;">Your stay is ${reminderText}!</h2>
            
            <div style="text-align: left; color: #666; line-height: 1.6;">
              <p>Dear ${bookingData.guest_name},</p>
              <p>We're excited to welcome you to <strong>Malai Khaoyai Resort</strong> ${reminderText}!</p>
              <p>Your beautiful ${bookingData.room_type} is ready and waiting for you.</p>
            </div>
          </div>
          
          <div style="background: white;">
            <div style="background: linear-gradient(135deg, #8B7355, #A0896B); color: white; padding: 15px 20px; font-size: 22px;">
              Your Reservation 🏨
            </div>
            <div style="padding: 25px;">
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #8B7355; font-weight: 500;">Booking Reference:</span>
                <span style="font-weight: 600;">${bookingData.booking_reference}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #8B7355; font-weight: 500;">Check-in Date:</span>
                <span style="font-weight: 600;">${bookingData.checkin_date}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #8B7355; font-weight: 500;">Check-in Time:</span>
                <span style="font-weight: 600;">2:00 PM onwards</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                <span style="color: #8B7355; font-weight: 500;">Room Type:</span>
                <span style="font-weight: 600;">${bookingData.room_type}</span>
              </div>
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #8B7355, #A0896B); color: white; padding: 30px; text-align: center;">
            <h3 style="font-size: 28px; font-style: italic; margin-bottom: 8px;">See you soon!</h3>
            <p style="margin-bottom: 15px;">We can't wait to make your stay memorable.</p>
            <div style="font-size: 14px; line-height: 1.8;">
              <div>📞 083-922-2929</div>
              <div>✉️ center@malaikhaoyai.com</div>
              <div>🌐 www.malairesort.com</div>
            </div>
          </div>
        </div>
      `;

      const result = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: bookingData.guest_email,
        subject: `🏨 Check-in Reminder - ${bookingData.booking_reference} - Malai Khaoyai`,
        html: htmlContent,
        text: `
MALAI KHAOYAI RESORT
Check-in Reminder

Dear ${bookingData.guest_name},

We're excited to welcome you to Malai Khaoyai Resort ${reminderText}!

YOUR RESERVATION
================
Booking Reference: ${bookingData.booking_reference}
Check-in Date: ${bookingData.checkin_date}
Check-in Time: 2:00 PM onwards
Room Type: ${bookingData.room_type}

See you soon! We can't wait to make your stay memorable.

Contact: 083-922-2929 | center@malaikhaoyai.com
        `
      });

      if (result.data?.id) {
        console.log(`✅ [Malai] Check-in reminder sent successfully`);
        return {
          success: true,
          messageId: result.data.id
          // provider: 'resend' // Property not in schema
        };
      } else {
        return {
          success: false,
          error: 'No message ID returned'
          // provider: 'resend' // Property not in schema
        };
      }

    } catch (error: any) {
      console.error('❌ [Malai] Check-in reminder failed:', error?.message || error);
      return {
        success: false,
        error: error?.message || 'Unknown error'
        // provider: 'resend' // Property not in schema
      };
    }
  }

  /**
   * Test email service connectivity
   */
  async testConnection(): Promise<EmailResult> {
    try {
      const testData: MalaiBookingData = {
        guest_name: 'Test Guest',
        guest_email: process.env.ADMIN_EMAIL?.replace(/"/g, '') || 'admin@malaikhaoyai.com',
        guest_phone: '083-922-2929',
        room_type: 'Test Suite',
        guest_count: '2 Adults',
        checkin_date: 'Test Date',
        checkout_date: 'Test Date',
        payment_amount: '฿0',
        tax_amount: '฿0',
        booking_reference: 'TEST-001'
      };

      const result = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: testData.guest_email,
        subject: '🧪 Malai Email Service Test',
        text: 'Malai Khaoyai Resort email service is working correctly!'
      });

      return {
        success: !!result.data?.id,
        messageId: result.data?.id
        // provider: 'resend' // Property not in schema
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Connection test failed'
        // provider: 'resend' // Property not in schema
      };
    }
  }

  /**
   * Get current service configuration
   */
  getConfig() {
    return {
      // provider: 'resend', // Property not in schema
      fromEmail: this.config.fromEmail,
      fromName: this.config.fromName,
      ready: !!this.resend
    };
  }
}

// Export singleton instance
export const malaiEmailService = new MalaiEmailService();
export default malaiEmailService;
