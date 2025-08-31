// ============================================
// TEST LOGIN SCRIPT
// ============================================

const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 ทดสอบ login API...');
    console.log('');
    
    const API_BASE = 'http://localhost:3001/api/v1';
    
    const loginData = {
      email: 'mongkol03su@gmail.com',
      password: 'password123'
    };
    
    console.log('📤 Sending login request...');
    console.log('📧 Email:', loginData.email);
    console.log('🔑 Password:', loginData.password);
    console.log('');
    
    const response = await axios.post(`${API_BASE}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'hotel-booking-api-key-2024'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      const { token, refreshToken, user } = response.data.data;
      
      console.log('');
      console.log('🎫 Token Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔑 Access Token:', token.substring(0, 50) + '...');
      console.log('🔄 Refresh Token:', refreshToken.substring(0, 50) + '...');
      console.log('');
      console.log('👤 User Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', user.email);
      console.log('🏷️  Role:', user.role);
      console.log('👤 Name:', user.firstName, user.lastName);
      console.log('🔋 Active:', user.isActive);
      console.log('📅 Session Expires:', user.sessionExpiresAt);
    }
    
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('');
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('📋 Error:', error.message);
    }
  }
}

// Run test
testLogin().catch(console.error);
