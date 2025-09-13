const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCSVExport() {
  try {
    console.log('🔍 Testing CSV Export endpoint...');
    
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
    const accessToken = loginData?.data?.tokens?.accessToken;
    
    if (!accessToken) {
      console.error('❌ No access token found in login response');
      return;
    }

    console.log('✅ Login successful, access token received');

    // Test CSV Export
    console.log('\n📄 Testing CSV Export...');
    const csvRes = await fetch('http://localhost:3001/api/v1/booking-history/export/csv?limit=5', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('CSV Export status:', csvRes.status);
    
    if (!csvRes.ok) {
      const errorText = await csvRes.text();
      console.error('❌ CSV Export failed:', errorText);
      return;
    }

    const csvContent = await csvRes.text();
    console.log('✅ CSV Export successful');
    console.log('CSV Content preview (first 500 chars):');
    console.log(csvContent.substring(0, 500) + '...');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCSVExport();