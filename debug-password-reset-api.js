// 🔍 Debug API Connection
const debugPasswordResetAPI = async () => {
  console.log('🔍 === DEBUG PASSWORD RESET API ===\n');
  
  const email = 'mongkol09ms@gmail.com';
  
  console.log('Testing API connection...');
  console.log(`Testing email: ${email}`);
  console.log(`API URL: http://localhost:5000/api/v1/auth/forgot-password\n`);
  
  try {
    // Test 1: Check if API server is running
    console.log('1. Testing API server health...');
    try {
      const healthResponse = await fetch('http://localhost:5000/api/v1/health');
      console.log(`✅ API server is running (Status: ${healthResponse.status})`);
    } catch (healthError) {
      console.log('❌ API server is not running or not accessible');
      console.log('   Please start the API server first');
      return;
    }
    
    // Test 2: Test forgot-password endpoint
    console.log('\n2. Testing forgot-password endpoint...');
    const response = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('\n📄 Response Data:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('\n✅ API is working correctly!');
        console.log('Email should be sent (check console logs in API server)');
      } else {
        console.log('\n⚠️ API returned an error:', data.message);
      }
    } else {
      const text = await response.text();
      console.log('\n❌ Server returned non-JSON response:');
      console.log(text.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('fetch failed')) {
      console.log('\nTroubleshooting:');
      console.log('1. Make sure API server is running on port 5000');
      console.log('2. Check if the server started without errors');
      console.log('3. Try: cd apps/api && npm start');
    }
  }
};

// Run the debug
debugPasswordResetAPI();
