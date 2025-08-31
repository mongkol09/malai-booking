// Test login endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testLoginEndpoints() {
  try {
    console.log('🔐 Testing Login Endpoints...\n');

    // Test different login paths
    const loginPaths = [
      '/auth/staff/login',
      '/auth/admin/login', 
      '/auth/login',
      '/auth/session/login'
    ];

    for (const path of loginPaths) {
      console.log(`Testing: ${path}`);
      try {
        const response = await axios.post(`${API_BASE}${path}`, {
          email: 'ai@gmail.com',
          password: 'Aa12345'
        });
        console.log('✅ Success:', response.data);
        break; // Found working endpoint
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('❌ Not found (404)');
        } else if (error.response?.status === 401) {
          console.log('✅ Found endpoint (401 - wrong credentials)');
          console.log('Response:', error.response.data);
          break;
        } else {
          console.log('❌ Error:', error.response?.data || error.message);
        }
      }
    }

    console.log('\n🎉 Login endpoint discovery completed!');

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Run tests
testLoginEndpoints();
