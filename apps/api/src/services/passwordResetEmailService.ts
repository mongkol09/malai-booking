// 📧 PASSWORD RESET EMAIL SERVICE
import { emailService } from './emailService';
import { EmailType } from '../types/emailTypes';

export interface PasswordResetEmailData {
  email: string;
  userName: string;
  resetToken: string;
  expiryMinutes?: number;
}

/**
 * ส่งอีเมลรีเซ็ตรหัสผ่าน
 */
export const sendPasswordResetEmail = async (
  email: string,
  userName: string,
  resetToken: string,
  expiryMinutes: number = 60
): Promise<boolean> => {
  try {
    console.log(`📧 Sending password reset email to: ${email}`);

    // สร้าง reset URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${resetToken}`;

    // เตรียม template variables
    const templateVariables = {
      user_name: userName,
      reset_url: resetUrl,
      reset_token: resetToken,
      expiry_time: expiryMinutes.toString(),
      current_year: new Date().getFullYear().toString(),
      company_name: 'Hotel Management System',
      support_email: 'support@hotel.com',
      support_phone: '02-xxx-xxxx'
    };

    // ส่งอีเมล
    const result = await emailService.sendHtmlEmail({
      to: email,
      toName: userName,
      subject: '🔐 รีเซ็ตรหัสผ่าน - Hotel Management System',
      type: EmailType.PASSWORD_RESET,
      templateData: templateVariables
    });

    if (result.success) {
      console.log(`✅ Password reset email sent successfully to: ${email}`);
      console.log(`📧 Message ID: ${result.messageId}`);
      
      // Log สำหรับ development (ลบออกใน production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔗 RESET LINK (DEV ONLY):`);
        console.log(`URL: ${resetUrl}`);
        console.log(`Token: ${resetToken}`);
        console.log(`Expires in: ${expiryMinutes} minutes\n`);
      }
      
      return true;
    } else {
      console.error(`❌ Failed to send password reset email: ${result.error}`);
      return false;
    }

  } catch (error) {
    console.error('❌ Password reset email service error:', error);
    return false;
  }
};

/**
 * ส่งอีเมลแจ้งการรีเซ็ตรหัสผ่านสำเร็จ
 */
export const sendPasswordResetSuccessEmail = async (
  email: string,
  userName: string
): Promise<boolean> => {
  try {
    console.log(`📧 Sending password reset success notification to: ${email}`);

    // ใช้ template พื้นฐานสำหรับแจ้งเตือน
    const successMessage = `
      <h2>รีเซ็ตรหัสผ่านสำเร็จ</h2>
      <p>สวัสดี ${userName},</p>
      <p>รหัสผ่านของคุณได้รับการรีเซ็ตเรียบร้อยแล้ว</p>
      <p>หากคุณไม่ได้ทำการรีเซ็ตรหัสผ่าน กรุณาติดต่อทีมสนับสนุนทันที</p>
      <p>📧 support@hotel.com | 📞 02-xxx-xxxx</p>
    `;

    const result = await emailService.sendHtmlEmail({
      to: email,
      toName: userName,
      subject: '✅ รีเซ็ตรหัสผ่านสำเร็จ - Hotel Management System',
      type: EmailType.BOOKING_CONFIRMATION, // ใช้ type ที่มีอยู่
      templateData: {
        htmlContent: successMessage
      }
    });

    return result.success;

  } catch (error) {
    console.error('❌ Password reset success email error:', error);
    return false;
  }
};

/**
 * ส่งอีเมลแจ้งเตือนการพยายามรีเซ็ตรหัสผ่าน (สำหรับความปลอดภัย)
 */
export const sendPasswordResetAttemptEmail = async (
  email: string,
  userName: string,
  ipAddress?: string
): Promise<boolean> => {
  try {
    console.log(`📧 Sending password reset attempt notification to: ${email}`);

    const securityMessage = `
      <h2>การพยายามรีเซ็ตรหัสผ่าน</h2>
      <p>สวัสดี ${userName},</p>
      <p>มีการพยายามขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
      ${ipAddress ? `<p>IP Address: ${ipAddress}</p>` : ''}
      <p>หากคุณไม่ได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
      <p>หากคุณสงสัยว่าบัญชีของคุณถูกบุกรุก กรุณาติดต่อทีมสนับสนุนทันที</p>
      <p>📧 support@hotel.com | 📞 02-xxx-xxxx</p>
    `;

    const result = await emailService.sendHtmlEmail({
      to: email,
      toName: userName,
      subject: '🔒 แจ้งเตือนความปลอดภัย - Hotel Management System',
      type: EmailType.BOOKING_CONFIRMATION, // ใช้ type ที่มีอยู่
      templateData: {
        htmlContent: securityMessage
      }
    });

    return result.success;

  } catch (error) {
    console.error('❌ Password reset attempt email error:', error);
    return false;
  }
};

export default {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendPasswordResetAttemptEmail
};
