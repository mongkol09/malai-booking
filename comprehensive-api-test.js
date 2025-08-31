// ============================================
// 🔍 COMPREHENSIVE API VALIDATION TEST
// Test all major API functionalities
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

async function comprehensiveAPITest() {
  console.log('🔍 COMPREHENSIVE API VALIDATION TEST');
  console.log('=====================================\n');
  
  let testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function logTest(name, status, message) {
    const result = { name, status, message };
    testResults.tests.push(result);
    
    if (status === 'PASS') {
      testResults.passed++;
      console.log(`✅ ${name}: ${message}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${name}: ${message}`);
    }
  }
  
  // 1. Authentication Flow
  console.log('🔐 TESTING AUTHENTICATION FLOW\n');
  
  // 1.1 Admin Login
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: CONFIG.ADMIN_EMAIL,
    password: CONFIG.ADMIN_PASSWORD
  });
  
  if (loginResponse.success && loginResponse.data.data?.tokens?.accessToken) {
    logTest('Admin Login', 'PASS', 'Successfully authenticated and received tokens');
    var adminToken = loginResponse.data.data.tokens.accessToken;
    var refreshToken = loginResponse.data.data.tokens.refreshToken;
  } else {
    logTest('Admin Login', 'FAIL', 'Failed to authenticate or receive tokens');
    return testResults;
  }
  
  // 1.2 Invalid Login
  const invalidLogin = await makeRequest('POST', '/auth/login', {
    email: 'invalid@email.com',
    password: 'wrongpassword'
  });
  
  if (!invalidLogin.success && invalidLogin.status === 401) {
    logTest('Invalid Login Rejection', 'PASS', 'Correctly rejected invalid credentials');
  } else {
    logTest('Invalid Login Rejection', 'FAIL', 'Should reject invalid credentials');
  }
  
  console.log('\n🛡️ TESTING SECURITY VALIDATIONS\n');
  
  // 2.1 Invalid Token Rejection
  const invalidTokenTest = await makeRequest('GET', '/bookings/list', null, 'invalid_token');
  if (!invalidTokenTest.success && invalidTokenTest.status === 403) {
    logTest('Invalid Token Rejection', 'PASS', 'Invalid tokens properly rejected');
  } else {
    logTest('Invalid Token Rejection', 'FAIL', 'Should reject invalid tokens');
  }
  
  // 2.2 No Token Rejection  
  const noTokenTest = await makeRequest('GET', '/bookings/list');
  if (!noTokenTest.success && noTokenTest.status === 401) {
    logTest('No Token Rejection', 'PASS', 'Missing tokens properly rejected');
  } else {
    logTest('No Token Rejection', 'FAIL', 'Should reject requests without tokens');
  }
  
  // 2.3 Invalid HTTP Method
  const invalidMethodTest = await makeRequest('PATCH', '/bookings/list', null, adminToken);
  if (!invalidMethodTest.success && invalidMethodTest.status === 405) {
    logTest('Invalid HTTP Method', 'PASS', 'Invalid methods properly rejected');
  } else {
    logTest('Invalid HTTP Method', 'FAIL', 'Should reject invalid HTTP methods');
  }
  
  console.log('\n🔄 TESTING SESSION MANAGEMENT\n');
  
  // 3.1 Valid Token Access
  const validTokenTest = await makeRequest('GET', '/bookings/list', null, adminToken);
  if (validTokenTest.success && validTokenTest.status === 200) {
    logTest('Valid Token Access', 'PASS', 'Valid tokens work correctly');
  } else {
    logTest('Valid Token Access', 'FAIL', 'Valid tokens should work');
  }
  
  // 3.2 Token Refresh
  const refreshTest = await makeRequest('POST', '/auth/refresh', { refreshToken });
  if (refreshTest.success && refreshTest.data.data?.tokens?.accessToken) {
    logTest('Token Refresh', 'PASS', 'Token refresh works correctly');
    var newToken = refreshTest.data.data.tokens.accessToken;
  } else {
    logTest('Token Refresh', 'FAIL', 'Token refresh should work');
  }
  
  // 3.3 New Token Validation
  if (newToken) {
    const newTokenTest = await makeRequest('GET', '/auth/sessions', null, newToken);
    if (newTokenTest.success) {
      logTest('New Token Validation', 'PASS', 'Refreshed tokens work immediately');
    } else {
      logTest('New Token Validation', 'FAIL', 'Refreshed tokens should work immediately');
    }
  }
  
  // 3.4 Session Management Endpoints
  const sessionsTest = await makeRequest('GET', '/auth/sessions', null, newToken || adminToken);
  if (sessionsTest.success) {
    logTest('Get Sessions', 'PASS', 'Session listing works');
  } else {
    logTest('Get Sessions', 'FAIL', 'Session listing should work');
  }
  
  console.log('\n🎭 TESTING ROLE-BASED ACCESS\n');
  
  // 4.1 Admin Endpoint Access (use fresh token)
  const adminEndpointTest = await makeRequest('GET', '/bookings/admin/list', null, newToken || adminToken);
  if (adminEndpointTest.success) {
    logTest('Admin Endpoint Access', 'PASS', 'Admin can access admin endpoints');
  } else {
    logTest('Admin Endpoint Access', 'FAIL', 'Admin should access admin endpoints');
  }
  
  console.log('\n🚪 TESTING LOGOUT FUNCTIONALITY\n');
  
  // 5.1 Session Logout (use the token that's still valid)
  const logoutTest = await makeRequest('POST', '/auth/logout', null, newToken || adminToken);
  if (logoutTest.success) {
    logTest('Session Logout', 'PASS', 'Logout works correctly');
  } else {
    logTest('Session Logout', 'FAIL', 'Logout should work');
  }
  
  // 5.2 Post-Logout Token Validation
  const postLogoutTest = await makeRequest('GET', '/auth/sessions', null, newToken || adminToken);
  if (!postLogoutTest.success && postLogoutTest.status === 401) {
    logTest('Post-Logout Token Invalid', 'PASS', 'Tokens invalid after logout');
  } else {
    logTest('Post-Logout Token Invalid', 'FAIL', 'Tokens should be invalid after logout');
  }
  
  console.log('\n📊 FINAL RESULTS');
  console.log('================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📝 Total: ${testResults.passed + testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 🎉 🎉 API IS 100% FUNCTIONAL! 🎉 🎉 🎉');
  } else {
    console.log('\n⚠️  Some issues found:');
    testResults.tests.filter(t => t.status === 'FAIL').forEach(test => {
      console.log(`   - ${test.name}: ${test.message}`);
    });
  }
  
  return testResults;
}

comprehensiveAPITest().catch(console.error);
