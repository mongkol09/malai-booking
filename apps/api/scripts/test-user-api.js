const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testUserAPI() {
  try {
    console.log('🧪 ===== TESTING USER API WITH DEV ACCOUNT =====');
    console.log('');
    
    // Step 1: Login
    console.log('🔐 Step 1: Login with DEV account...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mongkol03su@gmail.com',
      password: 'newpassword123'
    });
    
    console.log('✅ Login successful');
    const tokens = loginResponse.data.data.tokens;
    const user = loginResponse.data.data.user;
    
    console.log(`📧 User: ${user.email} (${user.userType})`);
    console.log(`🔑 Access Token: ${tokens.accessToken.substring(0, 50)}...`);
    console.log('');
    
    // Step 2: Test User API
    console.log('👥 Step 2: Testing User API...');
    const authHeaders = {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'X-API-Key': 'hotel-booking-api-key-2024'
    };
    
    try {
      const usersResponse = await axios.get(`${API_BASE}/users?status=all`, {
        headers: authHeaders
      });
      
      console.log('✅ User API successful!');
      console.log(`📊 Found ${usersResponse.data.data?.length || 0} users`);
      console.log('📋 User list:', usersResponse.data.data?.map(u => `${u.email} (${u.userType})`));
      
    } catch (userApiError) {
      console.error('❌ User API failed:');
      console.error('   Status:', userApiError.response?.status);
      console.error('   Error:', userApiError.response?.data);
      console.error('   Message:', userApiError.message);
    }
    
    // Step 3: Test Current User API
    console.log('');
    console.log('👤 Step 3: Testing Current User API...');
    try {
      const meResponse = await axios.get(`${API_BASE}/users/me`, {
        headers: authHeaders
      });
      
      console.log('✅ Current User API successful!');
      console.log('📋 Current user:', JSON.stringify(meResponse.data.data, null, 2));
      
    } catch (meApiError) {
      console.error('❌ Current User API failed:');
      console.error('   Status:', meApiError.response?.status);
      console.error('   Error:', meApiError.response?.data);
    }
    
    console.log('');
    console.log('🎉 User API testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data);
    console.error('   Message:', error.message);
  }
}

testUserAPI();
