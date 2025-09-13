const axios = require('axios');

async function checkFrontendSession() {
    try {
        console.log('🔍 Checking Frontend Session Status...\n');
        
        // Step 1: Get session-info without login
        console.log('1. Checking current session status...');
        try {
            const sessionResponse = await axios.get('http://localhost:3001/api/v1/auth/session-info', {
                withCredentials: true
            });
            console.log('✅ Current Session:', sessionResponse.data);
        } catch (sessionError) {
            console.log('❌ No active session:', sessionError.response?.status, sessionError.response?.statusText);
        }
        
        // Step 2: Login fresh
        console.log('\n2. Creating fresh login session...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'mongkol03su@gmail.com',
            password: 'Aa123456**'
        }, {
            withCredentials: true
        });
        
        console.log('✅ Login successful');
        const cookies = loginResponse.headers['set-cookie'];
        
        // Step 3: Test session-info with new session
        console.log('\n3. Checking session after login...');
        const sessionInfoResponse = await axios.get('http://localhost:3001/api/v1/auth/session-info', {
            headers: {
                'Cookie': cookies?.join('; ') || ''
            },
            withCredentials: true
        });
        console.log('✅ Session Info:', sessionInfoResponse.data);
        
        // Step 4: Test rooms API
        console.log('\n4. Testing Rooms API with fresh session...');
        const roomsResponse = await axios.get('http://localhost:3001/api/v1/rooms', {
            headers: {
                'Cookie': cookies?.join('; ') || ''
            },
            withCredentials: true
        });
        
        console.log(`✅ Rooms API Success: ${roomsResponse.data.length} rooms`);
        console.log('First room:', {
            roomNumber: roomsResponse.data[0]?.roomNumber,
            type: roomsResponse.data[0]?.type,
            status: roomsResponse.data[0]?.status
        });
        
        console.log('\n=== SUMMARY ===');
        console.log('✅ API และ Authentication ทำงานได้ปกติ');
        console.log('❓ ปัญหาอาจอยู่ที่ Browser Frontend');
        console.log('💡 แนะนำ: ลอง Hard Refresh + Clear Cache ใน Browser');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.statusText);
        console.error('   Details:', error.response?.data || error.message);
    }
}

checkFrontendSession();
