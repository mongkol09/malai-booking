#!/usr/bin/env node

// ============================================
// DIRECT NOTIFICATION SERVICE TEST
// ============================================
// Tests notification service directly without HTTP

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 ===== DIRECT NOTIFICATION SERVICE TEST =====\n');

async function testDirectNotification() {
  try {
    console.log('📦 Loading notification service...');
    
    // Try to import the service
    const { getNotificationService } = require('../src/services/notificationService');
    const notificationService = getNotificationService();
    
    console.log('✅ Notification service loaded');
    
    // Test environment variables
    console.log('\n🔍 Checking environment variables:');
    console.log('  - TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Present' : 'Missing');
    console.log('  - TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? 'Present' : 'Missing');
    console.log('  - NODE_ENV:', process.env.NODE_ENV || 'undefined');
    
    // Test notification
    console.log('\n📢 Testing direct check-in notification...');
    
    const result = await notificationService.notifyGuestCheckIn({
      bookingId: 'DIRECT-TEST-001',
      guestName: 'คุณทดสอบ โดยตรง',
      roomNumber: 'B1',
      phoneNumber: '081-234-5678',
      email: 'direct-test@example.com',
      checkinDate: '31/08/2024',
      checkoutDate: '01/09/2024',
      guestCount: 1,
      totalAmount: 3500,
      paymentStatus: 'ชำระแล้ว',
      checkInTime: new Date().toLocaleString('th-TH'),
      checkedInBy: 'Direct Test System'
    });
    
    console.log('✅ Direct notification result:', result);
    
    // Test external notification service
    console.log('\n📡 Testing external notification service...');
    
    const { ExternalNotificationService } = require('../src/services/externalNotificationService');
    const externalService = new ExternalNotificationService();
    
    const externalResult = await externalService.notifyGuestCheckIn({
      bookingId: 'EXTERNAL-TEST-001',
      guestName: 'คุณทดสอบ External',
      roomNumber: 'B2',
      phoneNumber: '081-234-5679',
      email: 'external-test@example.com'
    });
    
    console.log('✅ External notification result:', externalResult);
    
    console.log('\n🎉 Direct test completed! Check your Telegram for notifications.');
    
  } catch (error) {
    console.error('❌ Direct test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Check for common issues
    if (error.message.includes('Cannot find module')) {
      console.log('\n💡 Tip: Build the TypeScript first:');
      console.log('   npm run build');
    }
    
    if (error.message.includes('TELEGRAM')) {
      console.log('\n💡 Tip: Check Telegram configuration in .env:');
      console.log('   TELEGRAM_BOT_TOKEN=your_bot_token');
      console.log('   TELEGRAM_CHAT_ID=your_chat_id');
    }
  }
}

// Check if modules exist
async function checkModules() {
  console.log('🔍 Checking required modules...');
  
  const modules = [
    '../src/services/notificationService',
    '../src/services/externalNotificationService'
  ];
  
  for (const module of modules) {
    try {
      require(module);
      console.log(`✅ ${module} - OK`);
    } catch (error) {
      console.log(`❌ ${module} - Error:`, error.message);
    }
  }
}

async function runTest() {
  await checkModules();
  await testDirectNotification();
}

if (require.main === module) {
  runTest();
}

module.exports = { testDirectNotification };
