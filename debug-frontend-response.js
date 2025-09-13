// Debug frontend API response format
const fetch = require('./apps/api/node_modules/node-fetch');

async function debugFrontendResponse() {
  console.log('🔍 Debugging Frontend Response Format...\n');

  try {
    // Login
    const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mongkol03su@gmail.com',
        password: 'Aa123456**'
      })
    });

    const loginData = await loginResponse.json();
    const cookies = loginResponse.headers.get('set-cookie');
    
    console.log('✅ Login successful');

    // Test API call exactly like frontend does
    const roomsResponse = await fetch('http://localhost:3001/api/v1/rooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'hotel-booking-api-key-2024',
        'Authorization': `Bearer ${loginData.sessionToken}`,
        'Cookie': cookies
      },
      credentials: 'include'
    });

    console.log(`📊 Response Status: ${roomsResponse.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(roomsResponse.headers));
    
    const responseText = await roomsResponse.text();
    console.log(`📋 Raw Response Text (first 500 chars):`);
    console.log(responseText.substring(0, 500));
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
      console.log(`\n📋 Parsed Response Type: ${Array.isArray(parsedData) ? 'Array' : typeof parsedData}`);
      
      if (Array.isArray(parsedData)) {
        console.log(`📊 Array Length: ${parsedData.length}`);
        if (parsedData.length > 0) {
          console.log(`📋 First Item Keys:`, Object.keys(parsedData[0]));
        }
      } else if (typeof parsedData === 'object') {
        console.log(`📊 Object Keys:`, Object.keys(parsedData));
        if (parsedData.data) {
          console.log(`📊 Data Array Length: ${Array.isArray(parsedData.data) ? parsedData.data.length : 'Not array'}`);
        }
      }
    } catch (parseError) {
      console.error(`❌ Failed to parse JSON:`, parseError.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugFrontendResponse();
