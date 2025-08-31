// Simple test for availability API
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testAvailabilityAPI() {
  try {
    console.log('🧪 Testing Availability API...\n');

    // Test 1: Get room types
    console.log('1. Testing GET /admin/availability/room-types');
    try {
      const roomTypesResponse = await axios.get(`${API_BASE}/admin/availability/room-types`, {
        headers: {
          'Authorization': 'Bearer YOUR_SESSION_TOKEN', // Replace with actual token
        }
      });
      console.log('✅ Room types:', roomTypesResponse.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Get monthly availability
    console.log('\n2. Testing GET /admin/availability/monthly');
    try {
      const monthlyResponse = await axios.get(`${API_BASE}/admin/availability/monthly`, {
        params: {
          year: 2025,
          month: 12
        },
        headers: {
          'Authorization': 'Bearer YOUR_SESSION_TOKEN',
        }
      });
      console.log('✅ Monthly availability:', monthlyResponse.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 3: Quick search
    console.log('\n3. Testing GET /admin/availability/quick-search');
    try {
      const searchResponse = await axios.get(`${API_BASE}/admin/availability/quick-search`, {
        params: {
          checkinDate: '2025-12-25T14:00:00Z',
          checkoutDate: '2025-12-26T12:00:00Z',
          numberOfGuests: 2
        },
        headers: {
          'Authorization': 'Bearer YOUR_SESSION_TOKEN',
        }
      });
      console.log('✅ Quick search:', searchResponse.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Run tests
testAvailabilityAPI();
