// ============================================
// 🔧 ENDPOINT DEBUG SCRIPT
// Debug specific failing endpoints
// ============================================

const axios = require('axios');

const CONFIG = {
  BASE_URL: 'http://localhost:3001/api/v1',
  ADMIN_EMAIL: 'admin.test@example.com',
  ADMIN_PASSWORD: 'Test123!'
};

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method: method,
      url: `${CONFIG.BASE_URL}${endpoint}`,
      data: data,
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      data: error.response?.data || { error: error.message }
    };
  }
}

async function debugEndpoints() {
  console.log('🔧 DEBUG: Starting endpoint debugging...\n');
  
  // 1. Login first
  console.log('1️⃣ Testing Admin Login...');
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: CONFIG.ADMIN_EMAIL,
    password: CONFIG.ADMIN_PASSWORD
  });
  
  if (!loginResponse.success) {
    console.log('❌ Login failed:', loginResponse.data);
    return;
  }
  
  const adminToken = loginResponse.data.data.tokens.accessToken;
  const refreshToken = loginResponse.data.data.tokens.refreshToken;
  console.log('✅ Login successful\n');
  
  // 2. Test invalid token
  console.log('2️⃣ Testing Invalid Token...');
  const invalidTokenResponse = await makeRequest('GET', '/bookings/list', null, 'invalid_token_here');
  console.log(`Status: ${invalidTokenResponse.status}`);
  console.log('Response:', JSON.stringify(invalidTokenResponse.data, null, 2));
  console.log('');
  
  // 3. Test refresh token
  console.log('3️⃣ Testing Token Refresh...');
  const refreshResponse = await makeRequest('POST', '/auth/refresh', {
    refreshToken: refreshToken
  });
  console.log(`Status: ${refreshResponse.status}`);
  console.log('Response:', JSON.stringify(refreshResponse.data, null, 2));
  console.log('');
  
  // 4. Test get sessions
  console.log('4️⃣ Testing Get Sessions...');
  const sessionsResponse = await makeRequest('GET', '/auth/sessions', null, adminToken);
  console.log(`Status: ${sessionsResponse.status}`);
  console.log('Response:', JSON.stringify(sessionsResponse.data, null, 2));
  console.log('');
  
  // 5. Test cleanup sessions
  console.log('5️⃣ Testing Cleanup Sessions...');
  const cleanupResponse = await makeRequest('POST', '/auth/cleanup', null, adminToken);
  console.log(`Status: ${cleanupResponse.status}`);
  console.log('Response:', JSON.stringify(cleanupResponse.data, null, 2));
  console.log('');
  
  // 6. Test logout all
  console.log('6️⃣ Testing Logout All...');
  const logoutAllResponse = await makeRequest('POST', '/auth/logout-all', null, adminToken);
  console.log(`Status: ${logoutAllResponse.status}`);
  console.log('Response:', JSON.stringify(logoutAllResponse.data, null, 2));
  console.log('');
  
  console.log('🎉 Debug complete!');
}

debugEndpoints().catch(console.error);
