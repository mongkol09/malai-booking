#!/usr/bin/env node

/**
 * Email Service with Fallback Support
 * 
 * Provides email sending with automatic fallback from MailerSend to Gmail SMTP
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.mailerSendConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };
    
    // Gmail fallback configuration
    this.gmailConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || 'your-gmail@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password',
      },
    };
  }
  
  async testConnection(config, serviceName) {
    try {
      const transporter = nodemailer.createTransport(config);
      await transporter.verify();
      console.log(`✅ ${serviceName} connection successful`);
      return { success: true, transporter };
    } catch (error) {
      console.log(`❌ ${serviceName} connection failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  async sendBookingConfirmation(bookingData) {
    console.log('📧 Attempting to send booking confirmation email...');
    
    // Try MailerSend first
    console.log('\n1️⃣ Trying MailerSend...');
    const mailerSendResult = await this.testConnection(this.mailerSendConfig, 'MailerSend');
    
    if (mailerSendResult.success) {
      return await this.sendEmailWithTransporter(mailerSendResult.transporter, bookingData, 'MailerSend');
    }
    
    // Fallback to Gmail
    console.log('\n2️⃣ Falling back to Gmail SMTP...');
    const gmailResult = await this.testConnection(this.gmailConfig, 'Gmail SMTP');
    
    if (gmailResult.success) {
      return await this.sendEmailWithTransporter(gmailResult.transporter, bookingData, 'Gmail SMTP');
    }
    
    // Both failed
    console.log('\n❌ All email services failed');
    return { success: false, error: 'All email services unavailable' };
  }
  
  async sendEmailWithTransporter(transporter, bookingData, serviceName) {
    try {
      const emailFrom = serviceName === 'Gmail SMTP' 
        ? `"Malai Resort" <${process.env.GMAIL_USER || 'noreply@gmail.com'}>`
        : `"Malai Resort" <${process.env.FROM_EMAIL}>`;
      
      const mailOptions = {
        from: emailFrom,
        to: bookingData.email,
        subject: `🏨 การยืนยันการจอง - Hotel Booking #${bookingData.id}`,
        html: this.generateBookingEmailHTML(bookingData, serviceName),
        text: this.generateBookingEmailText(bookingData),
      };
      
      const info = await transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully via ${serviceName}!`);
      console.log('📧 Message ID:', info.messageId);
      
      return {
        success: true,
        service: serviceName,
        messageId: info.messageId,
        recipient: bookingData.email
      };
      
    } catch (error) {
      console.log(`❌ Failed to send via ${serviceName}: ${error.message}`);
      return { success: false, error: error.message, service: serviceName };
    }
  }
  
  generateBookingEmailHTML(booking, service) {
    const serviceTag = service === 'Gmail SMTP' ? '🔄 Backup Service' : '🚀 Primary Service';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>การยืนยันการจอง - Malai Resort</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
        <div style="background: white; padding: 30px; border-radius: 10px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🏨 Malai Resort</h1>
            <p style="color: #666; margin: 5px 0 0 0;">การยืนยันการจองห้องพัก</p>
          </div>
          
          <!-- Service Info -->
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">
              📧 ${serviceTag} - Email System Active
            </p>
          </div>
          
          <!-- Booking Details -->
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #16a34a; margin-top: 0;">✅ การจองสำเร็จ!</h2>
            <p style="margin: 10px 0; color: #333;">ขอบคุณที่เลือกใช้บริการ Malai Resort</p>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">📋 รายละเอียดการจอง:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">หมายเลขการจอง:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">#${booking.id || 'DEMO001'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">ชื่อผู้จอง:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${booking.customerName || 'คุณลูกค้า'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">อีเมล:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${booking.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">เบอร์โทรศัพท์:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${booking.phone || 'ไม่ระบุ'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">วันที่เช็คอิน:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${booking.checkIn || 'ไม่ระบุ'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">วันที่เช็คเอาท์:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${booking.checkOut || 'ไม่ระบุ'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ประเภทห้อง:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${booking.roomType || 'Standard Room'}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <!-- Important Info -->
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">📌 ข้อมูลสำคัญ:</h3>
            <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
              <li>กรุณาเก็บอีเมลนี้ไว้เป็นหลักฐานการจอง</li>
              <li>เช็คอินได้ตั้งแต่เวลา 14:00 น.</li>
              <li>เช็คเอาท์ก่อนเวลา 12:00 น.</li>
              <li>หากต้องการยกเลิกหรือแก้ไข กรุณาติดต่อล่วงหน้า 24 ชั่วโมง</li>
            </ul>
          </div>
          
          <!-- Contact Info -->
          <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">📞 ติดต่อเรา</h3>
            <p style="margin: 5px 0; color: #6b7280;">โทรศัพท์: 02-xxx-xxxx</p>
            <p style="margin: 5px 0; color: #6b7280;">Email: info@malairesort.com</p>
            <p style="margin: 5px 0; color: #6b7280;">Website: www.malairesort.com</p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} Malai Resort. All rights reserved.<br>
              Email sent via ${service} • ${new Date().toLocaleString('th-TH')}
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }
  
  generateBookingEmailText(booking) {
    return `
🏨 MALAI RESORT - การยืนยันการจอง

✅ การจองสำเร็จ!
ขอบคุณที่เลือกใช้บริการ Malai Resort

📋 รายละเอียดการจอง:
- หมายเลขการจอง: #${booking.id || 'DEMO001'}
- ชื่อผู้จอง: ${booking.customerName || 'คุณลูกค้า'}
- อีเมล: ${booking.email}
- เบอร์โทรศัพท์: ${booking.phone || 'ไม่ระบุ'}
- วันที่เช็คอิน: ${booking.checkIn || 'ไม่ระบุ'}
- วันที่เช็คเอาท์: ${booking.checkOut || 'ไม่ระบุ'}
- ประเภทห้อง: ${booking.roomType || 'Standard Room'}

📌 ข้อมูลสำคัญ:
- กรุณาเก็บอีเมลนี้ไว้เป็นหลักฐานการจอง
- เช็คอินได้ตั้งแต่เวลา 14:00 น.
- เช็คเอาท์ก่อนเวลา 12:00 น.
- หากต้องการยกเลิกหรือแก้ไข กรุณาติดต่อล่วงหน้า 24 ชั่วโมง

📞 ติดต่อเรา:
โทรศัพท์: 02-xxx-xxxx
Email: info@malairesort.com
Website: www.malairesort.com

© ${new Date().getFullYear()} Malai Resort. All rights reserved.
    `;
  }
}

// Test the email service
async function testEmailService() {
  console.log('🧪 Testing Email Service with Fallback');
  console.log('='.repeat(60));
  
  const emailService = new EmailService();
  
  // Sample booking data
  const sampleBooking = {
    id: 'DEMO001',
    customerName: 'คุณทดสอบ ระบบ',
    email: 'ai@gmail.com', // Change to your email
    phone: '081-234-5678',
    checkIn: '25/08/2568',
    checkOut: '27/08/2568',
    roomType: 'Deluxe Room',
  };
  
  try {
    const result = await emailService.sendBookingConfirmation(sampleBooking);
    
    console.log('\n📊 Email Service Test Results:');
    console.log('='.repeat(40));
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Service used:', result.service);
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Recipient:', result.recipient);
      
      console.log('\n🎯 Integration Ready:');
      console.log('- Email service is working');
      console.log('- Automatic fallback functional');
      console.log('- Ready for booking integration');
      
    } else {
      console.log('❌ Email service failed:', result.error);
      
      console.log('\n🔧 Required Setup:');
      console.log('1. Wait for MailerSend approval, OR');
      console.log('2. Setup Gmail SMTP credentials in .env:');
      console.log('   GMAIL_USER=your-gmail@gmail.com');
      console.log('   GMAIL_APP_PASSWORD=your-app-password');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Export for use in other files
module.exports = EmailService;

// Run test if called directly
if (require.main === module) {
  testEmailService();
}
