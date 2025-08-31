// ============================================
// EMAIL SERVICE - MAILERSEND INTEGRATION
// ============================================

import nodemailer from 'nodemailer';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Email interfaces
export interface EmailTemplate {
  to: string;
  toName?: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  variables?: Record<string, any>;
}

export interface BookingEmailData {
  guestName: string;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  totalAmount: number;
  hotelName: string;
  hotelAddress?: string;
  hotelPhone?: string;
}

export interface NotificationEmailData {
  recipientName: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

// ============================================
// MAILERSEND CONFIGURATION
// ============================================

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

// ============================================
// NODEMAILER SMTP CONFIGURATION
// ============================================

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // For development
  },
});

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

/**
 * Send email using MailerSend API (Preferred method)
 */
export const sendEmailWithAPI = async (emailData: EmailTemplate): Promise<boolean> => {
  try {
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'noreply@yourhotel.com',
      process.env.FROM_NAME || 'Hotel Booking System'
    );

    const recipients = [
      new Recipient(emailData.to, emailData.toName || '')
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(emailData.subject);

    if (emailData.templateId && emailData.variables) {
      // Use MailerSend template
      emailParams.setTemplateId(emailData.templateId);
      // Note: Variables handling may vary based on MailerSend version
      // emailParams.setVariables([{
      //   email: emailData.to,
      //   substitutions: emailData.variables,
      // }]);
    } else {
      // Use HTML content
      if (emailData.htmlContent) {
        emailParams.setHtml(emailData.htmlContent);
      }
      if (emailData.textContent) {
        emailParams.setText(emailData.textContent);
      }
    }

    await mailerSend.email.send(emailParams);
    console.log(`Email sent successfully to ${emailData.to}`);
    return true;
  } catch (error) {
    console.error('MailerSend API Error:', error);
    return false;
  }
};

/**
 * Send email using SMTP (Fallback method)
 */
export const sendEmailWithSMTP = async (emailData: EmailTemplate): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.textContent,
      html: emailData.htmlContent,
    };

    await smtpTransporter.sendMail(mailOptions);
    console.log(`Email sent via SMTP to ${emailData.to}`);
    return true;
  } catch (error) {
    console.error('SMTP Error:', error);
    return false;
  }
};

/**
 * Main email sending function with fallback
 */
export const sendEmail = async (emailData: EmailTemplate): Promise<boolean> => {
  // Try MailerSend API first
  const apiSuccess = await sendEmailWithAPI(emailData);
  
  if (apiSuccess) {
    return true;
  }

  // Fallback to SMTP
  console.log('MailerSend API failed, trying SMTP...');
  return await sendEmailWithSMTP(emailData);
};

// ============================================
// BOOKING EMAIL TEMPLATES
// ============================================

export const sendBookingConfirmation = async (
  email: string,
  guestName: string,
  bookingData: BookingEmailData
): Promise<boolean> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c5282; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f7fafc; }
        .booking-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .button { background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 Booking Confirmation</h1>
          <p>Thank you for choosing ${bookingData.hotelName}</p>
        </div>
        
        <div class="content">
          <h2>Dear ${guestName},</h2>
          <p>Your booking has been confirmed! Here are your reservation details:</p>
          
          <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <p><strong>Booking Reference:</strong> ${bookingData.bookingReference}</p>
            <p><strong>Check-in Date:</strong> ${bookingData.checkInDate}</p>
            <p><strong>Check-out Date:</strong> ${bookingData.checkOutDate}</p>
            <p><strong>Room Type:</strong> ${bookingData.roomType}</p>
            <p><strong>Total Amount:</strong> ฿${bookingData.totalAmount.toLocaleString()}</p>
          </div>
          
          <div class="booking-details">
            <h3>🏨 Hotel Information</h3>
            <p><strong>Hotel:</strong> ${bookingData.hotelName}</p>
            ${bookingData.hotelAddress ? `<p><strong>Address:</strong> ${bookingData.hotelAddress}</p>` : ''}
            ${bookingData.hotelPhone ? `<p><strong>Phone:</strong> ${bookingData.hotelPhone}</p>` : ''}
          </div>
          
          <p>We look forward to welcoming you! If you have any questions, please don't hesitate to contact us.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/booking/${bookingData.bookingReference}" class="button">
              View Booking Details
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} ${bookingData.hotelName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Booking Confirmation - ${bookingData.hotelName}
    
    Dear ${guestName},
    
    Your booking has been confirmed!
    
    Booking Details:
    - Booking Reference: ${bookingData.bookingReference}
    - Check-in Date: ${bookingData.checkInDate}
    - Check-out Date: ${bookingData.checkOutDate}
    - Room Type: ${bookingData.roomType}
    - Total Amount: ฿${bookingData.totalAmount.toLocaleString()}
    
    Hotel Information:
    - Hotel: ${bookingData.hotelName}
    ${bookingData.hotelAddress ? `- Address: ${bookingData.hotelAddress}` : ''}
    ${bookingData.hotelPhone ? `- Phone: ${bookingData.hotelPhone}` : ''}
    
    We look forward to welcoming you!
    
    © ${new Date().getFullYear()} ${bookingData.hotelName}
  `;

  return await sendEmail({
    to: email,
    toName: guestName,
    subject: `Booking Confirmation - ${bookingData.bookingReference}`,
    htmlContent,
    textContent,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  userName: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e53e3e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f7fafc; }
        .button { background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .warning { background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        
        <div class="content">
          <h2>Dear ${userName},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Security Notice:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    toName: userName,
    subject: 'Password Reset Request',
    htmlContent,
  });
};

// ============================================
// EMAIL VALIDATION
// ============================================

export const validateEmailConfig = async (): Promise<boolean> => {
  try {
    // Test SMTP connection
    await smtpTransporter.verify();
    console.log('✅ SMTP configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ SMTP configuration error:', error);
    return false;
  }
};
