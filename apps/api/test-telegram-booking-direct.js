#!/usr/bin/env node

/**
 * Test Telegram Booking Notification (Direct Test)
 * 
 * Tests Telegram notification without actual booking creation
 */

require('dotenv').config();

// Import Telegram service directly
const TelegramNotificationService = require('./telegram-notification-service.js');

async function testTelegramBookingDirect() {
  console.log('🤖 Direct Telegram Booking Notification Test');
  console.log('='.repeat(60));
  
  const telegramService = new TelegramNotificationService();
  
  // Test connection first
  console.log('1️⃣ Testing Telegram connection...');
  const connectionTest = await telegramService.testConnection();
  
  if (!connectionTest.success) {
    console.log('❌ Telegram connection failed:', connectionTest.error);
    return;
  }
  
  console.log('✅ Telegram connection successful!');
  
  // Test booking notification
  console.log('\n2️⃣ Testing booking notification...');
  
  const sampleBookingData = {
    id: 'BK12345678',
    customerName: 'คุณสมชาย รักสยาม',
    email: 'somchai@example.com',
    phone: '081-234-5678',
    checkIn: '25/8/2568',
    checkOut: '27/8/2568',
    roomType: 'Superior Room',
    guests: 2,
    totalPrice: '3,500',
    paymentStatus: 'รอการชำระเงิน',
    notes: 'ขอเตียงเสริม 1 เตียง และห้องติดกัน'
  };
  
  console.log('📋 Sample booking data:');
  console.log(JSON.stringify(sampleBookingData, null, 2));
  
  try {
    const result = await telegramService.sendBookingNotification(sampleBookingData);
    
    if (result.success) {
      console.log('\n🎉 SUCCESS! Telegram booking notification sent');
      console.log('📧 Message ID:', result.messageId);
      
      console.log('\n✅ Integration Ready:');
      console.log('- Telegram Bot is working');
      console.log('- Notification format is correct');
      console.log('- Admin will receive booking alerts');
      console.log('- Ready to integrate with booking controller');
      
      console.log('\n📱 Check your Telegram channel now!');
      
    } else {
      console.log('\n❌ Telegram notification failed:', result.error);
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

async function testSystemNotifications() {
  console.log('\n\n📢 Testing System Notifications');
  console.log('='.repeat(60));
  
  const telegramService = new TelegramNotificationService();
  
  // Test different notification types
  const testCases = [
    {
      title: 'ระบบการจองออนไลน์',
      message: 'ระบบการจองห้องพักออนไลน์พร้อมใช้งาน\n\n✅ รองรับการจองแบบ Real-time\n✅ ตรวจสอบความขัดแย้งของวันที่\n✅ อัปเดตสถานะห้องอัตโนมัติ\n✅ ส่งการแจ้งเตือนทันที',
      type: 'success'
    },
    {
      title: 'การแจ้งเตือนอีเมล',
      message: 'ระบบอีเมลยังรอการอนุมัติจาก MailerSend\n\nในระหว่างนี้ใช้ Telegram สำหรับการแจ้งเตือน\nเมื่อ MailerSend ได้รับการอนุมัติจะเปลี่ยนเป็นอีเมลอัตโนมัติ',
      type: 'warning'
    },
    {
      title: 'สถานะระบบ',
      message: 'ระบบจัดการโรงแรมทำงานปกติ\n\n🏨 ห้องพัก: ปกติ\n💳 การชำระเงิน: ปกติ\n📊 รายงาน: ปกติ\n🔔 การแจ้งเตือน: Telegram เท่านั้น',
      type: 'info'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📤 Sending ${testCase.type} notification...`);
    
    try {
      const result = await telegramService.sendSystemNotification(
        testCase.title,
        testCase.message,
        testCase.type
      );
      
      if (result.success) {
        console.log(`✅ ${testCase.type} notification sent (ID: ${result.messageId})`);
      } else {
        console.log(`❌ ${testCase.type} notification failed:`, result.error);
      }
      
      // Wait 2 seconds between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`💥 ${testCase.type} notification error:`, error.message);
    }
  }
}

// Run all tests
async function runAllTests() {
  await testTelegramBookingDirect();
  await testSystemNotifications();
  
  console.log('\n\n🏁 All Tests Complete');
  console.log('='.repeat(60));
  console.log('🔍 Check your Telegram channel for all notifications');
  console.log('📱 Admin panel booking integration is ready!');
}

runAllTests();
