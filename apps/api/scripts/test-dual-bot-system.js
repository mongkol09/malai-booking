/**
 * Test Dual Bot Telegram System
 * ทดสอบระบบ Bot สองตัว (CEO + Staff)
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1/housekeeping';

async function testDualBotSystem() {
  console.log('🤖 DUAL BOT TELEGRAM SYSTEM TEST');
  console.log('='.repeat(50));
  
  try {
    // 1. Test Bot Status
    console.log('\n1️⃣ Testing Bot Status...');
    const statusResponse = await axios.get(`${API_BASE}/bot-status`);
    console.log('📊 Bot Status:', JSON.stringify(statusResponse.data, null, 2));
    
    // 2. Test Both Bots Connection
    console.log('\n2️⃣ Testing Bot Connections...');
    const testResponse = await axios.post(`${API_BASE}/test-bots`);
    console.log('🔗 Connection Test:', JSON.stringify(testResponse.data, null, 2));
    
    // 3. Test Booking Notification (Both Bots)
    console.log('\n3️⃣ Testing Booking Notification...');
    const bookingResponse = await axios.post(`${API_BASE}/test-booking-notification`);
    console.log('📋 Booking Test:', JSON.stringify(bookingResponse.data, null, 2));
    
    // 4. Test Housekeeping Notification (Staff Bot Only)
    console.log('\n4️⃣ Testing Housekeeping Notification...');
    const housekeepingData = {
      roomNumber: 'A101',
      roomType: 'Grand Serenity Suite',
      guestName: 'คุณทดสอบ ระบบ',
      checkOutTime: new Date().toLocaleTimeString('th-TH'),
      priority: 'high',
      specialInstructions: 'การทดสอบระบบ Dual Bot - แจ้งเตือนทำความสะอาด'
    };
    
    const cleaningResponse = await axios.post(`${API_BASE}/cleaning-notification`, housekeepingData);
    console.log('🧹 Housekeeping Test:', JSON.stringify(cleaningResponse.data, null, 2));
    
    console.log('\n✅ ALL TESTS COMPLETED!');
    console.log('='.repeat(50));
    
    // Summary
    console.log('\n📋 TEST SUMMARY:');
    console.log('🤖 Bot Status:', statusResponse.data.success ? '✅' : '❌');
    console.log('🔗 Connection Test:', testResponse.data.success ? '✅' : '❌');
    console.log('📋 Booking Test:', bookingResponse.data.success ? '✅' : '❌');
    console.log('🧹 Housekeeping Test:', cleaningResponse.data.success ? '✅' : '❌');
    
    // Bot Results
    if (testResponse.data.success) {
      console.log('\n🤖 BOT RESULTS:');
      console.log('👔 CEO Bot:', testResponse.data.data.ceo.status);
      console.log('🏨 Staff Bot:', testResponse.data.data.staff.status);
    }
    
    if (bookingResponse.data.success) {
      console.log('\n📋 BOOKING NOTIFICATION RESULTS:');
      console.log('👔 CEO (Executive):', bookingResponse.data.data.ceo.status);
      console.log('🏨 Staff (Operational):', bookingResponse.data.data.staff.status);
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    if (error.response) {
      console.error('📄 Response Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure API server is running on port 3001');
    console.log('2. Check bot tokens in environment variables');
    console.log('3. Verify chat IDs are correct');
    console.log('4. Ensure bots are added to respective chats');
  }
}

// Helper function to display bot configuration guide
function showBotSetupGuide() {
  console.log('\n📱 BOT SETUP GUIDE:');
  console.log('='.repeat(30));
  
  console.log('\n👔 CEO Bot (Financial/Executive):');
  console.log('• Token: 8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8');
  console.log('• Chat ID: -1002579208700');
  console.log('• Purpose: Revenue, payments, full booking details');
  
  console.log('\n🏨 Staff Bot (Operations):');
  console.log('• Token: 8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI');
  console.log('• Chat ID: [NEEDS CONFIGURATION]');
  console.log('• Purpose: Check-in/out, housekeeping, filtered data');
  
  console.log('\n🔧 Environment Variables Needed:');
  console.log('TELEGRAM_BOT_TOKEN="8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8"');
  console.log('TELEGRAM_CHAT_ID="-1002579208700"');
  console.log('STAFF_TELEGRAM_BOT_TOKEN="8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI"');
  console.log('STAFF_TELEGRAM_CHAT_ID="[YOUR_STAFF_CHAT_ID]"');
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showBotSetupGuide();
  process.exit(0);
}

// Run the test
testDualBotSystem();
