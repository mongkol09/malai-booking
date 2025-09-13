const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHistoryQuery() {
  try {
    console.log('🔍 Testing History Query endpoint...');
    
    // Login first
    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ai@gmail.com',
        password: 'Aa123456**'
      })
    });

    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginRes.status, await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    console.log('Login response structure:', JSON.stringify(loginData, null, 2));
    
    const accessToken = loginData?.data?.tokens?.accessToken || loginData?.data?.access_token || loginData?.accessToken;
    
    if (!accessToken) {
      console.error('❌ No access token found in login response');
      return;
    }

    console.log('✅ Login successful, access token received');

    // Test History Query
    console.log('\n📋 Testing History Query...');
    const historyRes = await fetch('http://localhost:3001/api/v1/booking-history/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('History Query status:', historyRes.status);
    
    if (!historyRes.ok) {
      const errorText = await historyRes.text();
      console.error('❌ History Query failed:', errorText);
      return;
    }

    const historyData = await historyRes.json();
    console.log('✅ History Query successful');
    console.log('Data structure:', JSON.stringify(historyData, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHistoryQuery();