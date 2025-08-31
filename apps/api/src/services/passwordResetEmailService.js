// 📧 PASSWORD RESET EMAIL SERVICE (JavaScript Version)
const crypto = require('crypto');

/**
 * ส่งอีเมลรีเซ็ตรหัสผ่าน
 */
const sendPasswordResetEmail = async (email, userName, resetToken, expiryMinutes = 60) => {
  try {
    console.log(`📧 Sending password reset email to: ${email}`);

    // สร้าง reset URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${resetToken}`;

    // แสดงข้อมูลอีเมลใน console (สำหรับ development)
    console.log('\n📧 PASSWORD RESET EMAIL:');
    console.log('='.repeat(50));
    console.log(`📧 To: ${email}`);
    console.log(`👤 User: ${userName}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log(`⏰ Expires in: ${expiryMinutes} minutes`);
    console.log(`🔑 Token: ${resetToken.substring(0, 10)}...`);
    console.log('='.repeat(50));
    
    // HTML Email Template
    const emailHTML = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>รีเซ็ตรหัสผ่าน - Hotel Management System</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px 20px; text-align: center; color: white; }
        .header h1 { font-size: 24px; margin: 0 0 10px 0; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .message { font-size: 16px; margin-bottom: 30px; color: #555; line-height: 1.8; }
        .reset-button { text-align: center; margin: 30px 0; }
        .reset-button a { display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; }
        .security-info { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0; }
        .security-title { color: #856404; font-weight: 600; margin-bottom: 10px; }
        .security-list { color: #856404; font-size: 14px; margin: 0; padding-left: 20px; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 รีเซ็ตรหัสผ่าน</h1>
            <p>Hotel Management System</p>
        </div>
        
        <div class="content">
            <div class="greeting">สวัสดี ${userName},</div>
            
            <div class="message">
                เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ หากคุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
            </div>
            
            <div class="reset-button">
                <a href="${resetUrl}" target="_blank">รีเซ็ตรหัสผ่าน</a>
            </div>
            
            <div class="security-info">
                <div class="security-title">🔒 ข้อมูลด้านความปลอดภัย</div>
                <ul class="security-list">
                    <li><strong>ลิงก์นี้จะหมดอายุใน ${expiryMinutes} นาที</strong></li>
                    <li>ลิงก์นี้ใช้ได้เพียงครั้งเดียวเท่านั้น</li>
                    <li>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</li>
                    <li>อย่าแชร์ลิงก์นี้กับผู้อื่น</li>
                </ul>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #495057;">หากปุ่มด้านบนไม่ทำงาน</h4>
                <p style="margin: 0; font-size: 14px;">คุณสามารถคัดลอกลิงก์นี้และวางในเบราว์เซอร์:</p>
                <code style="background: #e9ecef; padding: 5px; border-radius: 4px; font-size: 12px; word-break: break-all;">${resetUrl}</code>
            </div>
        </div>
        
        <div class="footer">
            <p>อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            <div style="margin-top: 10px;">
                📧 support@hotel.com | 📞 02-xxx-xxxx<br>
                🌐 Hotel Management System
            </div>
            <p style="margin-top: 15px; font-size: 12px;">
                © ${new Date().getFullYear()} Hotel Management System. สงวนลิขสิทธิ์
            </p>
        </div>
    </div>
</body>
</html>
    `;

    console.log('\n✅ Email template generated successfully');
    console.log(`📧 Email content preview saved for user: ${userName}`);
    
    // TODO: ใน production ให้เชื่อมต่อกับ email service จริง เช่น MailerSend
    // const emailResult = await mailerSend.email.send(emailParams);
    
    console.log('🚀 Email would be sent in production mode\n');
    
    return true; // ส่งคืน true เพื่อให้ API ทำงานต่อได้

  } catch (error) {
    console.error('❌ Password reset email service error:', error);
    return false;
  }
};

/**
 * ส่งอีเมลแจ้งการรีเซ็ตรหัสผ่านสำเร็จ
 */
const sendPasswordResetSuccessEmail = async (email, userName) => {
  try {
    console.log(`📧 Sending password reset success notification to: ${email}`);
    
    console.log('\n✅ PASSWORD RESET SUCCESS EMAIL:');
    console.log('='.repeat(50));
    console.log(`📧 To: ${email}`);
    console.log(`👤 User: ${userName}`);
    console.log(`📄 Subject: รีเซ็ตรหัสผ่านสำเร็จ`);
    console.log(`💬 Message: รหัสผ่านของคุณได้รับการรีเซ็ตเรียบร้อยแล้ว`);
    console.log('='.repeat(50));
    
    return true;

  } catch (error) {
    console.error('❌ Password reset success email error:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail
};
