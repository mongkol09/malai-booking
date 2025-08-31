#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testResendEmail() {
  console.log('🧪 ===== RESEND EMAIL SERVICE TEST =====\n');
  console.log('⏰ Time:', new Date().toLocaleString('th-TH'));
  
  try {
    // Import Resend service
    console.log('📦 Loading Resend service...');
    const { resendEmailService } = require('../src/services/resendEmailService');
    console.log('✅ Resend service loaded successfully');
    
    // ตรวจสอบ environment variables
    console.log('\n🔍 Environment check:');
    console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    console.log('  - FROM_EMAIL:', process.env.FROM_EMAIL || 'Using default');
    console.log('  - FROM_NAME:', process.env.FROM_NAME || 'Using default');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('\n❌ RESEND_API_KEY is missing in .env file');
      console.log('💡 Please add: RESEND_API_KEY=re_xxxxxxxxxxxx');
      return;
    }

    // ทดสอบการเชื่อมต่อ
    console.log('\n📡 Testing Resend connection...');
    const connectionTest = await resendEmailService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Connection successful:', connectionTest.message);
    } else {
      console.error('❌ Connection failed:', connectionTest.message);
      return;
    }

    // ทดสอบส่ง booking confirmation email
    console.log('\n📧 Testing booking confirmation email...');
    
    const testBookingData = {
      bookingReferenceId: 'TEST-' + Date.now(),
      roomType: { name: 'Deluxe Room with Garden View' },
      room: { roomNumber: 'D101' },
      checkinDate: new Date(),
      checkoutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      finalAmount: 3500,
      numAdults: 2,
      numChildren: 1
    };

    // ใช้ admin email สำหรับทดสอบ
    const testEmail = process.env.ADMIN_EMAIL || 'admin@malairesort.com';
    const testName = 'Test Customer';

    console.log(`📤 Sending test email to: ${testEmail}`);
    console.log('📋 Test booking data:', JSON.stringify(testBookingData, null, 2));

    const emailResult = await resendEmailService.sendBookingConfirmation(
      testEmail,
      testName,
      testBookingData
    );

    if (emailResult.success) {
      console.log('\n✅ Booking confirmation email sent successfully!');
      console.log('📨 Message ID:', emailResult.messageId);
      console.log('📅 Sent at:', emailResult.sentAt);
      console.log('⏱️ Duration:', emailResult.duration, 'ms');
      console.log('🌐 Provider:', emailResult.provider);
      
      console.log('\n📱 Please check the email inbox for the confirmation email.');
      
    } else {
      console.error('\n❌ Failed to send booking confirmation email');
      console.error('🔍 Error:', emailResult.error);
    }

    // ดึงสถิติการส่งอีเมล
    console.log('\n📊 Getting email statistics...');
    const stats = await resendEmailService.getEmailStats();
    console.log('📈 Email stats:', JSON.stringify(stats, null, 2));

    console.log('\n🎉 Test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Check your email inbox for the test email');
    console.log('2. Verify email formatting and content');
    console.log('3. Test with real booking creation');
    console.log('4. Monitor Resend dashboard for delivery status');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('📋 Stack trace:', error.stack);
    
    // Common troubleshooting tips
    console.log('\n🔧 Troubleshooting tips:');
    
    if (error.message.includes('API key')) {
      console.log('   - Check RESEND_API_KEY in .env file');
      console.log('   - Make sure API key starts with "re_"');
      console.log('   - Verify API key in Resend dashboard');
    }
    
    if (error.message.includes('domain')) {
      console.log('   - Verify domain in Resend dashboard');
      console.log('   - Check DNS settings for your domain');
      console.log('   - Make sure FROM_EMAIL uses verified domain');
    }
    
    if (error.message.includes('template')) {
      console.log('   - Check email template functions');
      console.log('   - Verify template data structure');
    }
  }
}

// ตรวจสอบ node modules ที่จำเป็น
async function checkDependencies() {
  console.log('🔍 Checking dependencies...');
  
  try {
    require('resend');
    console.log('✅ resend package - OK');
  } catch (error) {
    console.error('❌ resend package missing');
    console.log('💡 Run: npm install resend');
    return false;
  }
  
  return true;
}

// เรียกใช้งาน
async function runTest() {
  console.log('🚀 Starting Resend Email Service Test...\n');
  
  const dependenciesOK = await checkDependencies();
  if (!dependenciesOK) {
    return;
  }
  
  await testResendEmail();
}

if (require.main === module) {
  runTest();
}

module.exports = { testResendEmail };
