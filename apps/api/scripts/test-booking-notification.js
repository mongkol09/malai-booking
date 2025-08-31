#!/usr/bin/env node

// ============================================
// BOOKING NOTIFICATION TEST SCRIPT
// ============================================
// Tests the booking notification system

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBookingNotification() {
  console.log('🧪 ===== TESTING BOOKING NOTIFICATION SYSTEM =====\n');

  try {
    // 1. Test direct notification trigger
    console.log('📢 1. Testing direct notification trigger...');
    
    const notificationResponse = await axios.post(`${BASE_URL}/api/notifications/test`, {
      eventType: 'NewBookingCreated',
      data: {
        bookingId: 'TEST-BOOKING-001',
        guestName: 'คุณทดสอบ การจอง',
        roomNumber: '101',
        roomTypeName: 'Deluxe Room',
        checkinDate: '2024-01-15',
        checkoutDate: '2024-01-17',
        nights: 2,
        totalPrice: 4500,
        status: 'Confirmed'
      }
    });

    console.log('✅ Direct notification response:', notificationResponse.data);
    console.log('');

    // 2. Test actual booking creation
    console.log('📋 2. Testing actual booking creation...');
    
    const bookingData = {
      guestFirstName: 'ทดสอบ',
      guestLastName: 'การจอง',
      guestEmail: 'test-booking@example.com',
      guestPhone: '081-234-5678',
      
      roomId: 'clqkjxv3k0004h7omdz5r1234', // ใส่ Room ID ที่มีจริง
      checkInDate: '2024-01-20',
      checkOutDate: '2024-01-22',
      adults: 2,
      children: 0,
      totalAmount: 5000,
      specialRequests: 'ทดสอบระบบแจ้งเตือน'
    };

    const bookingResponse = await axios.post(`${BASE_URL}/api/simple-booking-telegram`, bookingData);
    
    console.log('✅ Booking creation response:', {
      success: bookingResponse.data.success,
      message: bookingResponse.data.message,
      bookingReference: bookingResponse.data.booking?.reference
    });
    console.log('');

    // 3. Wait and check logs
    console.log('⏳ 3. Checking server logs for notifications...');
    console.log('📝 Check your server console for:');
    console.log('   - "✅ CEO Level booking notification sent successfully"');
    console.log('   - "✅ Telegram notification sent successfully"');
    console.log('   - Telegram messages in your chat');
    console.log('');

    console.log('🎉 Test completed! Check your Telegram for notifications.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('💡 Tip: Make sure you have a valid roomId in the test data');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tip: Make sure the API server is running on port 5000');
    }
  }
}

// Helper function to test individual components
async function testIndividualComponents() {
  console.log('\n🔍 ===== TESTING INDIVIDUAL COMPONENTS =====\n');

  try {
    // Test notification service
    console.log('📢 Testing notification service...');
    
    const notificationTest = await axios.post(`${BASE_URL}/api/notifications/test`, {
      eventType: 'SystemTest',
      data: {
        message: 'Testing booking notification system'
      }
    });

    console.log('✅ Notification service:', notificationTest.data.success ? 'Working' : 'Failed');

    // Test room availability
    console.log('🏨 Testing room availability...');
    
    const roomsResponse = await axios.get(`${BASE_URL}/api/rooms`);
    
    if (roomsResponse.data.length > 0) {
      console.log('✅ Rooms available:', roomsResponse.data.length);
      console.log('📝 Sample room ID:', roomsResponse.data[0].id);
    } else {
      console.log('⚠️ No rooms found - add some rooms first');
    }

  } catch (error) {
    console.error('❌ Component test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testBookingNotification();
  await testIndividualComponents();
  
  console.log('\n📋 ===== TEST SUMMARY =====');
  console.log('1. ✅ Direct notification test completed');
  console.log('2. ✅ Booking creation test completed'); 
  console.log('3. ✅ Component tests completed');
  console.log('\n🔔 Expected notifications:');
  console.log('   - CEO Level notification (Telegram/Discord/Slack)');
  console.log('   - Admin dashboard notification (WebSocket)');
  console.log('   - Legacy Telegram notification');
  console.log('\n💡 If no notifications received, check:');
  console.log('   - Telegram bot token and chat ID in .env');
  console.log('   - Server logs for error messages');
  console.log('   - Network connectivity');
}

if (require.main === module) {
  runAllTests();
}

module.exports = {
  testBookingNotification,
  testIndividualComponents
};
