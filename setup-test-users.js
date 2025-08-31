// ============================================
// 🔧 CREATE ADMIN USER FOR TESTING
// 🌟 Setup script for session authentication tests
// ============================================

const axios = require('axios');
const colors = require('colors');

const CONFIG = {
  BASE_URL: 'http://localhost:3001/api/v1',
  ADMIN_DATA: {
    email: 'admin@hotelair.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    userType: 'ADMIN'
  },
  TEST_USER_DATA: {
    email: 'testuser@example.com',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    userType: 'CUSTOMER'
  }
};

async function createUser(userData, userTitle) {
  console.log(`\n🔧 Creating ${userTitle}...`);
  
  try {
    const response = await axios.post(`${CONFIG.BASE_URL}/auth/register`, userData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data.success) {
      console.log(`✅ ${userTitle} created successfully: ${userData.email}`.green);
      return true;
    } else {
      console.log(`❌ Failed to create ${userTitle}: ${response.data.error?.message}`.red);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.error?.message?.includes('already exists')) {
      console.log(`ℹ️ ${userTitle} already exists: ${userData.email}`.yellow);
      return true; // User exists, that's fine
    } else {
      console.log(`❌ Error creating ${userTitle}: ${error.response?.data?.error?.message || error.message}`.red);
      console.log(`Status: ${error.response?.status}`.gray);
      console.log(`Response: ${JSON.stringify(error.response?.data, null, 2)}`.gray);
      return false;
    }
  }
}

async function testLogin(userData, userTitle) {
  console.log(`\n🔍 Testing ${userTitle} login...`);
  
  try {
    const response = await axios.post(`${CONFIG.BASE_URL}/auth/login`, {
      email: userData.email,
      password: userData.password
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data.success && response.data.accessToken) {
      console.log(`✅ ${userTitle} login successful!`.green);
      console.log(`🔑 Token: ${response.data.accessToken.substring(0, 30)}...`);
      return response.data;
    } else {
      console.log(`❌ ${userTitle} login failed: ${response.data.error?.message}`.red);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${userTitle} login error: ${error.response?.data?.error?.message || error.message}`.red);
    return null;
  }
}

async function setupTestUsers() {
  console.log('🚀 SETTING UP TEST USERS FOR SESSION AUTHENTICATION'.rainbow.bold);
  console.log('='.repeat(60));
  console.log(`🎯 Target Server: ${CONFIG.BASE_URL}`);
  console.log('');

  // Test server health first
  try {
    const healthResponse = await axios.get(`http://localhost:3001/health`);
    console.log(`✅ Server is healthy: ${healthResponse.data.status}`.green);
  } catch (error) {
    console.log(`❌ Server health check failed: ${error.message}`.red);
    console.log('Please make sure the server is running on http://localhost:3001');
    process.exit(1);
  }

  // Create users
  const adminCreated = await createUser(CONFIG.ADMIN_DATA, 'Admin User');
  const userCreated = await createUser(CONFIG.TEST_USER_DATA, 'Test User');

  // Test logins
  if (adminCreated) {
    const adminLogin = await testLogin(CONFIG.ADMIN_DATA, 'Admin User');
    if (adminLogin) {
      console.log(`📊 Admin User Type: ${adminLogin.user?.userType}`.cyan);
    }
  }

  if (userCreated) {
    const userLogin = await testLogin(CONFIG.TEST_USER_DATA, 'Test User');
    if (userLogin) {
      console.log(`📊 Test User Type: ${userLogin.user?.userType}`.cyan);
    }
  }

  console.log('\n🎉 Test user setup completed!'.green.bold);
  console.log('📋 Now you can run the session authentication tests:');
  console.log('   node test-session-auth-complete.js'.cyan);
  console.log('   node test-session-utilities.js'.cyan);
  console.log('   node test-session-database.js'.cyan);
  console.log('   node master-session-test.js'.cyan);
}

// Run setup
setupTestUsers().catch(error => {
  console.error('💥 Setup failed:', error.message);
  process.exit(1);
});
