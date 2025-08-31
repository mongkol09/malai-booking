// ============================================
// 🔧 SESSION LIFECYCLE TEST  
// Test complete session refresh and validation
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

async function testSessionLifecycle() {
  console.log('🔧 SESSION LIFECYCLE TEST\n');
  
  // 1. Login
  console.log('1️⃣ Login...');
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: CONFIG.ADMIN_EMAIL,
    password: CONFIG.ADMIN_PASSWORD
  });
  
  if (!loginResponse.success) {
    console.log('❌ Login failed');
    return;
  }
  
  const originalToken = loginResponse.data.data.tokens.accessToken;
  const refreshToken = loginResponse.data.data.tokens.refreshToken;
  console.log(`✅ Original token: ${originalToken.substring(0, 30)}...`);
  
  // 2. Test original token
  console.log('\n2️⃣ Testing original token...');
  const testOriginal = await makeRequest('GET', '/auth/sessions', null, originalToken);
  console.log(`Status: ${testOriginal.status} | Success: ${testOriginal.success}`);
  
  // 3. Refresh token
  console.log('\n3️⃣ Refreshing token...');
  const refreshResponse = await makeRequest('POST', '/auth/refresh', {
    refreshToken: refreshToken
  });
  
  if (!refreshResponse.success) {
    console.log('❌ Refresh failed');
    return;
  }
  
  const newToken = refreshResponse.data.data.tokens.accessToken;
  console.log(`✅ New token: ${newToken.substring(0, 30)}...`);
  console.log(`🔄 Same token? ${originalToken === newToken ? 'YES' : 'NO'}`);
  
  // 4. Test new token immediately
  console.log('\n4️⃣ Testing new token immediately...');
  const testNew = await makeRequest('GET', '/auth/sessions', null, newToken);
  console.log(`Status: ${testNew.status} | Success: ${testNew.success}`);
  if (!testNew.success) {
    console.log(`Error: ${testNew.data.error?.message}`);
  }
  
  // 5. Test original token (should be invalid now)
  console.log('\n5️⃣ Testing original token (should be invalid)...');
  const testOldAfterRefresh = await makeRequest('GET', '/auth/sessions', null, originalToken);
  console.log(`Status: ${testOldAfterRefresh.status} | Success: ${testOldAfterRefresh.success}`);
  if (!testOldAfterRefresh.success) {
    console.log(`Error: ${testOldAfterRefresh.data.error?.message}`);
  }
  
  // 6. Wait and test again
  console.log('\n6️⃣ Waiting 2 seconds and testing new token again...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const testNewAgain = await makeRequest('GET', '/auth/sessions', null, newToken);
  console.log(`Status: ${testNewAgain.status} | Success: ${testNewAgain.success}`);
  if (!testNewAgain.success) {
    console.log(`Error: ${testNewAgain.data.error?.message}`);
  }
}

testSessionLifecycle().catch(console.error);
