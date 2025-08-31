#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testResendDirectly() {
  console.log('🧪 ===== SIMPLE RESEND TEST =====\n');
  
  try {
    // Import Resend directly
    const { Resend } = require('resend');
    
    console.log('🔍 Environment check:');
    console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    console.log('  - FROM_EMAIL:', process.env.FROM_EMAIL || 'Using default: bookings@malairesort.com');
    console.log('  - FROM_NAME:', process.env.FROM_NAME || 'Using default: Malai Resort');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('\n❌ RESEND_API_KEY is missing in .env file');
      console.log('💡 Please add to your .env file:');
      console.log('   RESEND_API_KEY=re_xxxxxxxxxxxx');
      return;
    }

    // Initialize Resend
    console.log('\n📦 Initializing Resend...');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Email configuration
    const fromEmail = process.env.FROM_EMAIL || 'bookings@malairesort.com';
    const fromName = process.env.FROM_NAME || 'Malai Khaoyai Resort';
    const testEmail = process.env.TEST_EMAIL || 'admin@malairesort.com';

    console.log(`📤 Sending test email from: ${fromName} <${fromEmail}>`);
    console.log(`📥 Sending test email to: ${testEmail}`);

    // Create booking confirmation email
    const bookingConfirmationHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ยืนยันการจอง - Malai Resort</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2c5282, #3182ce); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .booking-details { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #2d3748; }
        .value { color: #4a5568; }
        .footer { background: #edf2f7; padding: 20px; text-align: center; color: #718096; }
        .total { background: #38a169; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 ยืนยันการจอง</h1>
            <h2>Malai Khaoyai Resort</h2>
        </div>
        
        <div class="content">
            <h3>เรียน คุณทดสอบ การจอง</h3>
            <p>ขอบคุณที่ท่านเลือกใช้บริการของเรา การจองของท่านได้รับการยืนยันแล้ว</p>
            
            <div class="booking-details">
                <h4>📋 รายละเอียดการจอง</h4>
                <div class="detail-row">
                    <span class="label">เลขที่การจอง:</span>
                    <span class="value">RESEND-TEST-${Date.now()}</span>
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
            
            <p><strong>เวลาเช็คอิน:</strong> 14:00 น.</p>
            <p><strong>เวลาเช็คเอาท์:</strong> 12:00 น.</p>
            
            <p>หากท่านมีคำถามหรือต้องการเปลี่ยนแปลงการจอง กรุณาติดต่อเราที่:</p>
            <p>📞 โทร: 02-XXX-XXXX<br>
            📧 อีเมล: info@malairesort.com</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Malai Khaoyai Resort. All rights reserved.</p>
            <p>🧪 นี่คืออีเมลทดสอบจาก Resend Email Service</p>
        </div>
    </div>
</body>
</html>`;

    // Send email
    console.log('\n📧 Sending booking confirmation email...');
    
    const emailData = {
      from: `${fromName} <${fromEmail}>`,
      to: testEmail,
      subject: `ยืนยันการจอง RESEND-TEST-${Date.now()} ที่ ${fromName}`,
      html: bookingConfirmationHTML
    };

    console.log('📦 Email data prepared:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      htmlLength: bookingConfirmationHTML.length
    });

    const response = await resend.emails.send(emailData);

    if (response.data?.id) {
      console.log('\n🎉 SUCCESS! Email sent successfully!');
      console.log('📨 Message ID:', response.data.id);
      console.log('📅 Created at:', response.data.created_at);
      
      console.log('\n✅ Resend integration is working perfectly!');
      console.log('📱 Please check your email inbox for the booking confirmation.');
      
      console.log('\n🔥 Ready for production! Next steps:');
      console.log('1. ✅ Resend service is configured correctly');
      console.log('2. ✅ Email templates are working');
      console.log('3. ✅ API integration is successful');
      console.log('4. 🚀 Create a booking to test the full flow');
      
    } else {
      console.error('\n❌ Email sending failed - no message ID returned');
      console.error('Response data:', response);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Specific error handling
    if (error.message.includes('Invalid API key')) {
      console.log('\n🔧 API Key Error:');
      console.log('1. Check your RESEND_API_KEY in .env file');
      console.log('2. Make sure it starts with "re_"');
      console.log('3. Verify the key in Resend dashboard');
    }
    
    if (error.message.includes('domain')) {
      console.log('\n🔧 Domain Error:');
      console.log('1. Verify your domain in Resend dashboard');
      console.log('2. Check DNS records');
      console.log('3. Make sure FROM_EMAIL uses verified domain');
    }
    
    if (error.message.includes('unauthorized')) {
      console.log('\n🔧 Authorization Error:');
      console.log('1. Check API key permissions');
      console.log('2. Make sure "Sending access" is enabled');
    }
    
    console.log('\n📋 Full error details:', error);
  }
}

// Test connection first
async function testConnection() {
  try {
    console.log('🔗 Testing Resend connection...');
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Simple test
    const testResult = await resend.emails.send({
      from: 'test@malairesort.com',
      to: 'test@malairesort.com',
      subject: 'Connection Test',
      html: '<p>Testing Resend connection</p>'
    });
    
    console.log('✅ Connection test result:', !!testResult.data);
    return true;
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting Simple Resend Test...\n');
  
  // Check dependencies
  try {
    require('resend');
    console.log('✅ resend package available');
  } catch (error) {
    console.error('❌ resend package not found');
    console.log('💡 Run: npm install resend');
    return;
  }
  
  await testResendDirectly();
}

if (require.main === module) {
  runTest();
}

module.exports = { testResendDirectly };
