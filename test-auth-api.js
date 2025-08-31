// Test with authentication
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testWithAuth() {
  try {
    console.log('🔐 Testing with Authentication...\n');

    // Step 1: Login to get session
    console.log('1. Testing Admin Login');
    let sessionCookie = '';
    let accessToken = '';
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'ai@gmail.com',  // Found admin user
        password: 'Aa12345'     // Try original password
      }, {
        headers: {
          'X-API-Key': 'hotel-booking-api-key-2024'
        }
      });
      console.log('✅ Login Response:', {
        success: loginResponse.data.success,
        user: loginResponse.data.data?.user?.email,
        hasTokens: !!loginResponse.data.data?.tokens
      });
      
      // Extract access token for API calls
      if (loginResponse.data.data?.tokens?.accessToken) {
        accessToken = loginResponse.data.data.tokens.accessToken;
        console.log('🔑 Access Token Found:', !!accessToken);
      }
      
      // Extract session cookie (if any)
      const cookies = loginResponse.headers['set-cookie'];
      if (cookies) {
        sessionCookie = cookies.find(cookie => cookie.startsWith('hotel_session='));
        console.log('🍪 Session Cookie Found:', !!sessionCookie);
      }
    } catch (error) {
      console.log('❌ Login Error:', error.response?.data || error.message);
      console.log('💡 Trying to create admin user...');
      
      // Try to register admin
      try {
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
          email: 'ai@gmail.com',
          password: 'Aa12345',
          firstName: 'Admin',
          lastName: 'User'
        }, {
          headers: {
            'X-API-Key': 'hotel-booking-api-key-2024'
          }
        });
        console.log('✅ Admin Created:', registerResponse.data);
        
        // Try login again
        const loginRetry = await axios.post(`${API_BASE}/auth/admin/login`, {
          email: 'ai@gmail.com',
          password: 'Aa12345'
        }, {
          headers: {
            'X-API-Key': 'hotel-booking-api-key-2024'
          }
        });
        
        const cookies = loginRetry.headers['set-cookie'];
        if (cookies) {
          sessionCookie = cookies.find(cookie => cookie.startsWith('hotel_session='));
        }
      } catch (regError) {
        console.log('❌ Registration Error:', regError.response?.data || regError.message);
        return;
      }
    }

    if (!accessToken) {
      console.log('❌ No access token found');
      return;
    }

    // Step 2: Test availability APIs with JWT authorization
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-API-Key': 'hotel-booking-api-key-2024'
    };

    console.log('\n2. Testing Room Types API (with auth)');
    try {
      const roomTypesResponse = await axios.get(`${API_BASE}/admin/availability/room-types`, {
        headers
      });
      console.log('✅ Room Types:', roomTypesResponse.data);
    } catch (error) {
      console.log('❌ Room Types Error:', error.response?.data || error.message);
    }

    console.log('\n3. Testing Monthly Availability API');
    try {
      const monthlyResponse = await axios.get(`${API_BASE}/admin/availability/monthly`, {
        params: {
          year: 2025,
          month: 12
        },
        headers
      });
      console.log('✅ Monthly Availability:', {
        success: monthlyResponse.data.success,
        month: monthlyResponse.data.data?.month,
        totalDays: monthlyResponse.data.data?.totalDays
      });
    } catch (error) {
      console.log('❌ Monthly Availability Error:', error.response?.data || error.message);
    }

    console.log('\n4. Testing Quick Search API');
    try {
      const searchResponse = await axios.get(`${API_BASE}/admin/availability/quick-search`, {
        params: {
          checkinDate: '2025-12-25T14:00:00Z',
          checkoutDate: '2025-12-26T12:00:00Z',
          numberOfGuests: 2
        },
        headers
      });
      console.log('✅ Quick Search:', {
        success: searchResponse.data.success,
        totalOptions: searchResponse.data.data?.totalOptions
      });
    } catch (error) {
      console.log('❌ Quick Search Error:', error.response?.data || error.message);
    }

    console.log('\n🎉 Authentication API testing completed!');

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Run tests
testWithAuth();
