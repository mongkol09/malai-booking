#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testResendSandbox() {
  console.log('🧪 ===== RESEND SANDBOX TEST =====\n');
  
  try {
    const { Resend } = require('resend');
    
    console.log('🔍 Environment check:');
    console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is missing in .env file');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // ใช้ Resend's onboarding@resend.dev สำหรับทดสอบ
    const fromEmail = 'onboarding@resend.dev';
    const fromName = 'Malai Resort (Test)';
    const testEmail = 'delivered@resend.dev'; // Resend's test email

    console.log(`📤 Using Resend sandbox:`);
    console.log(`   From: ${fromName} <${fromEmail}>`);
    console.log(`   To: ${testEmail} (Resend test inbox)`);

    const bookingHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ยืนยันการจอง - Malai Resort</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2c5282, #3182ce); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .booking-details { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #e2e8f0; }
        .label { font-weight: bold; color: #2d3748; }
        .value { color: #4a5568; }
        .total { background: #38a169; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { background: #edf2f7; padding: 20px; text-align: center; color: #718096; }
        .test-notice { background: #fed7d7; color: #c53030; padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 ยืนยันการจอง</h1>
            <h2>Malai Khaoyai Resort</h2>
        </div>
        
        <div class="content">
            <div class="test-notice">
                <strong>🧪 นี่คืออีเมลทดสอบจาก Resend Email Service</strong>
            </div>
            
            <h3>เรียน คุณทดสอบ</h3>
            <p>ขอบคุณที่ท่านเลือกใช้บริการของเรา การจองของท่านได้รับการยืนยันแล้ว</p>
            
            <div class="booking-details">
                <h4>📋 รายละเอียดการจอง</h4>
                <div class="detail-row">
                    <span class="label">เลขที่การจอง:</span>
                    <span class="value">SANDBOX-TEST-${Date.now()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">ประเภทห้อง:</span>
                    <span class="value">Deluxe Room with Garden View</span>
                </div>
                <div class="detail-row">
                    <span class="label">หมายเลขห้อง:</span>
                    <span class="value">D101</span>
                </div>
                <div class="detail-row">
                    <span class="label">วันที่เช็คอิน:</span>
                    <span class="value">${new Date().toLocaleDateString('th-TH')}</span>
                </div>
                <div class="detail-row">
                    <span class="label">วันที่เช็คเอาท์:</span>
                    <span class="value">${new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString('th-TH')}</span>
                </div>
                <div class="detail-row">
                    <span class="label">จำนวนผู้เข้าพัก:</span>
                    <span class="value">2 ผู้ใหญ่, 1 เด็ก</span>
                </div>
            </div>
            
            <div class="total">
                <h3>💰 ยอดเงินรวม: 3,500 บาท</h3>
            </div>
            
            <p><strong>⏰ เวลาเช็คอิน:</strong> 14:00 น.</p>
            <p><strong>⏰ เวลาเช็คเอาท์:</strong> 12:00 น.</p>
            
            <p><strong>📞 ติดต่อเรา:</strong></p>
            <p>โทร: 02-XXX-XXXX<br>
            อีเมล: info@malaikhaoyai.com</p>
            
            <p><strong>🎯 ขั้นตอนต่อไป:</strong></p>
            <p>1. ✅ Email service ทำงานปกติ<br>
            2. 🔗 ต้อง verify domain ของจริง<br>
            3. 🚀 พร้อมใช้งานในระบบ production</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Malai Khaoyai Resort. All rights reserved.</p>
            <p>🔧 Powered by Resend Email Service</p>
        </div>
    </div>
</body>
</html>`;

    console.log('\n📧 Sending test booking confirmation...');
    
    const response = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: testEmail,
      subject: `🧪 ทดสอบ Resend - การจอง SANDBOX-${Date.now()} ที่ Malai Resort`,
      html: bookingHTML
    });

    if (response.data?.id) {
      console.log('\n🎉 SUCCESS! Sandbox email sent successfully!');
      console.log('📨 Message ID:', response.data.id);
      console.log('📅 Created at:', response.data.created_at);
      
      console.log('\n✅ Resend Integration Test PASSED!');
      console.log('\n🔥 Next Steps:');
      console.log('1. ✅ Resend API is working perfectly');
      console.log('2. 🌐 Verify your domain: malaikhaoyai.com');
      console.log('3. 🔄 Update FROM_EMAIL to use verified domain');
      console.log('4. 🚀 Test with real booking creation');
      
      console.log('\n📋 Domain Verification Steps:');
      console.log('• Go to: https://resend.com/domains');
      console.log('• Add domain: malaikhaoyai.com');
      console.log('• Add DNS records as instructed');
      console.log('• Wait for verification (usually 5-10 minutes)');
      
    } else {
      console.error('\n❌ Sandbox test failed');
      console.error('Response:', response);
    }

  } catch (error) {
    console.error('\n❌ Sandbox test failed:', error.message);
    console.error('Full error:', error);
  }
}

if (require.main === module) {
  testResendSandbox();
}

module.exports = { testResendSandbox };
