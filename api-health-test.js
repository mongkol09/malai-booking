// ============================================
// API HEALTH CHECK & AUTH TEST
// ============================================

async function testAPI() {
  console.log('🔍 Testing API Health & Authentication\n');

  const API_BASE = 'http://localhost:3001/api/v1';

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing API health...');
    const healthResponse = await fetch('http://localhost:3001/health');
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ API Health OK:', healthData);
    } else {
      console.log('❌ API Health failed');
    }

    // Test 2: Auth endpoint check
    console.log('\n2️⃣ Testing auth endpoint...');
    const authTestResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'wrongpassword'
      })
    });

    const authTestData = await authTestResponse.json();
    console.log(`Auth endpoint response (${authTestResponse.status}):`, authTestData);

    // Test 3: Try to find any working user
    console.log('\n3️⃣ Testing database connection via users endpoint...');
    
    // Try without auth first to see what happens
    const usersTestResponse = await fetch(`${API_BASE}/users`);
    console.log(`Users endpoint (no auth) status: ${usersTestResponse.status}`);
    
    if (!usersTestResponse.ok) {
      const usersTestData = await usersTestResponse.json();
      console.log('Users endpoint response:', usersTestData);
    }

    // Test 4: Check what auth methods are available
    console.log('\n4️⃣ Checking available endpoints...');
    
    const endpoints = [
      '/auth/register',
      '/auth/login', 
      '/auth/logout',
      '/users',
      '/roles'
    ];

    for (const endpoint of endpoints) {
      try {
        const testResponse = await fetch(`${API_BASE}${endpoint}`, {
          method: 'GET'
        });
        console.log(`${endpoint}: ${testResponse.status}`);
      } catch (error) {
        console.log(`${endpoint}: ERROR - ${error.message}`);
      }
    }

    // Test 5: Try to register a new admin user
    console.log('\n5️⃣ Trying to register new admin user...');
    
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bigbeam@hotelair.com',
        password: 'BigBeam123!@#',
        firstName: 'Big',
        lastName: 'Beam',
        role: 'ADMIN'
      })
    });

    const registerData = await registerResponse.json();
    console.log(`Register response (${registerResponse.status}):`, registerData);

    if (registerResponse.ok) {
      console.log('✅ Registration successful! Now testing login...');
      
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bigbeam@hotelair.com',
          password: 'BigBeam123!@#'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ BigBeam login successful!');
        console.log('🎉 READY TO TEST:');
        console.log('   Email: bigbeam@hotelair.com');
        console.log('   Password: BigBeam123!@#');
        console.log(`   Token: ${loginData.data.accessToken.substring(0, 20)}...`);
      } else {
        const loginError = await loginResponse.json();
        console.log('❌ Login failed:', loginError);
      }
    }

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

// Run test
testAPI().catch(console.error);
