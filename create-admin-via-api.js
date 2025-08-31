// ============================================
// 👤 CREATE ADMIN VIA API  
// Create admin user via register API
// ============================================

const axios = require('axios');

const CONFIG = {
  BASE_URL: 'http://localhost:3001/api/v1'
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

async function createAdminUser() {
  console.log('👤 Creating admin user via API...\n');
  
  const adminData = {
    email: 'admin.test@example.com',
    password: 'Test123!',
    firstName: 'Admin',
    lastName: 'Test',
    phoneNumber: '+66123456789',
    userType: 'ADMIN'
  };
  
  const registerResponse = await makeRequest('POST', '/auth/register', adminData);
  
  if (registerResponse.success) {
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log('\n🔄 Testing login...');
    
    // Test login immediately
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: adminData.email,
      password: adminData.password
    });
    
    if (loginResponse.success) {
      console.log('✅ Login successful!');
      console.log(`🎫 Token: ${loginResponse.data.data.tokens.accessToken.substring(0, 20)}...`);
      return {
        email: adminData.email,
        password: adminData.password,
        token: loginResponse.data.data.tokens.accessToken,
        refreshToken: loginResponse.data.data.tokens.refreshToken
      };
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
  } else {
    console.log('❌ Registration failed:', registerResponse.data);
  }
}

createAdminUser().then(result => {
  if (result) {
    console.log('\n🎯 Ready to update test configs!');
  }
}).catch(console.error);
