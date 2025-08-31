const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';
const API_KEY = 'hotel-booking-api-key-2024';

async function testTelegramNotifications() {
  try {
    console.log('📱 Testing Telegram Housekeeping Notifications...');
    console.log('');
    
    // Login first to get access token
    console.log('🔐 Step 0: Login to get access token...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ai@gmail.com',
      password: 'Aa12345'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });
    
    const { tokens, user } = loginResponse.data.data;
    console.log(`✅ Login successful - User: ${user.email} (${user.userType})`);
    console.log('');
    
    const authHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${tokens.accessToken}`
    };
    
    // Test 1: Test Dual Bot Status
    console.log('🤖 Step 1: Testing dual bot status...');
    try {
      const botStatusResponse = await axios.post(`${API_BASE}/housekeeping/test-bots`, {}, {
        headers: authHeaders
      });
      console.log('✅ Bot status test successful:', botStatusResponse.data);
    } catch (error) {
      console.log('❌ Bot status test failed:', error.response?.data || error.message);
    }
    
    console.log('');
    
    // Test 2: Test cleaning notification
    console.log('🧹 Step 2: Testing cleaning notification...');
    try {
      const notificationPayload = {
        roomNumber: 'F3',
        roomType: 'Standard',
        guestName: 'Test Guest',
        checkOutTime: '14:00',
        priority: 'normal',
        specialInstructions: 'Test notification for room cleaning'
      };
      
      const notificationResponse = await axios.post(`${API_BASE}/housekeeping/cleaning-notification`, notificationPayload, {
        headers: authHeaders
      });
      console.log('✅ Cleaning notification sent successfully:', notificationResponse.data);
    } catch (error) {
      console.log('❌ Cleaning notification failed:', error.response?.data || error.message);
    }
    
    console.log('');
    
    // Test 3: Test check-in notification
    console.log('🏨 Step 3: Testing check-in notification...');
    try {
      const checkinPayload = {
        roomNumber: 'F3',
        roomType: 'Standard',
        guestName: 'Test Guest',
        checkInTime: '12:00',
        vip: false,
        specialRequests: 'Late checkout requested'
      };
      
      const checkinResponse = await axios.post(`${API_BASE}/housekeeping/checkin-notification`, checkinPayload, {
        headers: authHeaders
      });
      console.log('✅ Check-in notification sent successfully:', checkinResponse.data);
    } catch (error) {
      console.log('❌ Check-in notification failed:', error.response?.data || error.message);
    }
    
    console.log('');
    console.log('🎉 Telegram notification testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testTelegramNotifications();
