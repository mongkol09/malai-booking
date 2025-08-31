// Simple API test without authentication first
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testBasicAPI() {
  try {
    console.log('🧪 Testing Hotel Booking API...\n');

    // Test 1: Health Check
    console.log('1. Testing Health Check');
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log('✅ Health Check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health Check Error:', error.message);
      return;
    }

    // Test 2: Public Room Search (should work without auth)
    console.log('\n2. Testing Public Room Availability Search');
    try {
      const availabilityResponse = await axios.get(`${API_BASE}/bookings/availability`, {
        params: {
          checkinDate: '2025-12-25T14:00:00Z',
          checkoutDate: '2025-12-26T12:00:00Z',
          numberOfGuests: 2
        }
      });
      console.log('✅ Public Availability Search:', availabilityResponse.data);
    } catch (error) {
      console.log('❌ Public Search Error:', error.response?.data || error.message);
    }

    // Test 3: Try Admin Availability (should require auth)
    console.log('\n3. Testing Admin Availability (should require auth)');
    try {
      const adminResponse = await axios.get(`${API_BASE}/admin/availability/room-types`);
      console.log('⚠️ Unexpected success (should require auth):', adminResponse.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Correctly blocked - requires authentication:', error.response.status);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Basic API testing completed!');

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Run tests
testBasicAPI();
