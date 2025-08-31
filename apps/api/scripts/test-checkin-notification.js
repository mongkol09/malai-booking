#!/usr/bin/env node

// ============================================
// CHECK-IN NOTIFICATION TEST SCRIPT
// ============================================
// Tests the check-in notification system

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCheckinNotification() {
  console.log('🧪 ===== TESTING CHECK-IN NOTIFICATION SYSTEM =====\n');

  try {
    // 1. Test direct notification trigger
    console.log('📢 1. Testing direct check-in notification...');
    
    const notificationResponse = await axios.post(`${BASE_URL}/api/notifications/test`, {
      eventType: 'GuestCheckIn',
      data: {
        bookingId: 'TEST-CHECKIN-001',
        guestName: 'คุณทดสอบ เช็คอิน',
        roomNumber: 'B1',
        phoneNumber: '081-234-5678',
        email: 'test-checkin@example.com',
        checkinDate: '31/08/2024',
        checkoutDate: '01/09/2024',
        guestCount: 1,
        totalAmount: 3500,
        paymentStatus: 'ชำระแล้ว',
        checkInTime: new Date().toLocaleString('th-TH'),
        checkedInBy: 'Test System'
      }
    });

    console.log('✅ Direct notification response:', notificationResponse.data);
    console.log('');

    // 2. Test notification service availability
    console.log('📡 2. Testing notification service...');
    
    const serviceTestResponse = await axios.post(`${BASE_URL}/api/notifications/test`, {
      eventType: 'SystemTest',
      data: {
        message: 'Testing check-in notification system',
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Notification service response:', serviceTestResponse.data);
    console.log('');

    // 3. Check environment variables
    console.log('🔍 3. Checking configuration...');
    console.log('   - API Base URL:', BASE_URL);
    console.log('   - Test completed at:', new Date().toLocaleString('th-TH'));
    console.log('');

    console.log('🎉 Test completed! Check your Telegram for notifications.');
    console.log('');
    console.log('💡 If no notifications received, check:');
    console.log('   - Telegram bot token and chat ID in .env file');
    console.log('   - Server logs for error messages');
    console.log('   - Network connectivity');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 Tip: Make sure the notification API endpoint exists');
      console.log('   Expected: POST /api/notifications/test');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tip: Make sure the API server is running on port 3001');
      console.log('   Try: npm run dev in the apps/api directory');
    }
  }
}

// Check API availability first
async function checkAPI() {
  try {
    console.log('🔍 Checking API availability...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ API is running:', healthResponse.data.status);
    return true;
  } catch (error) {
    console.error('❌ API is not available:', error.message);
    return false;
  }
}

// Check notification routes
async function checkNotificationRoutes() {
  try {
    console.log('🔍 Checking notification routes...');
    const response = await axios.get(`${BASE_URL}/api/notifications/status`);
    console.log('✅ Notification routes available');
    return true;
  } catch (error) {
    console.log('⚠️ Notification routes not found:', error.response?.status);
    return false;
  }
}

// Run tests
async function runAllTests() {
  const apiAvailable = await checkAPI();
  if (!apiAvailable) {
    console.log('\n❌ Cannot run tests: API server is not running');
    return;
  }

  await checkNotificationRoutes();
  await testCheckinNotification();
  
  console.log('\n📋 ===== TEST SUMMARY =====');
  console.log('1. ✅ API availability test completed');
  console.log('2. ✅ Direct notification test completed'); 
  console.log('3. ✅ Service test completed');
  console.log('\n🔔 Expected notifications:');
  console.log('   - Check-in notification (Telegram/Discord/Slack)');
  console.log('   - Admin dashboard notification (WebSocket)');
  console.log('\n💡 Next steps if no notifications:');
  console.log('   1. Check server logs: npm run dev');
  console.log('   2. Verify .env configuration');
  console.log('   3. Test with actual check-in API');
}

if (require.main === module) {
  runAllTests();
}

module.exports = {
  testCheckinNotification,
  checkAPI
};