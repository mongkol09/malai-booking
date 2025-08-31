// Quick Login Test Script for Admin Panel
// ใช้สำหรับทดสอบ login และได้ valid token

async function testLogin() {
  const baseURL = 'http://localhost:3001/api/v1';
  
  try {
    console.log('🔐 Testing admin login...');
    
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@hotel.com',
        password: 'SecureAdmin123!'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      console.log('User:', data.data.user);
      console.log('Token:', data.data.accessToken);
      
      // Save to localStorage
      localStorage.setItem('hotel_admin_token', data.data.accessToken);
      localStorage.setItem('hotel_admin_refresh_token', data.data.refreshToken);
      localStorage.setItem('hotel_admin_user', JSON.stringify(data.data.user));
      
      console.log('💾 Token saved to localStorage');
      console.log('🎉 Ready to use User Management!');
      
      return data.data.accessToken;
    } else {
      console.error('❌ Login failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('💥 Login test failed:', error);
    throw error;
  }
}

// Test User Creation
async function testCreateUser() {
  const token = localStorage.getItem('hotel_admin_token');
  
  if (!token) {
    console.error('❌ No token found. Please run testLogin() first');
    return;
  }

  try {
    console.log('👤 Testing user creation...');
    
    const response = await fetch('http://localhost:3001/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: 'test.user@hotel.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STAFF',
        position: 'Front Desk',
        phoneNumber: '+66123456789'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ User created successfully!');
      console.log('New User:', data.data.user);
      console.log('Temp Password:', data.data.tempPassword);
    } else {
      console.error('❌ User creation failed:', data.message);
    }
  } catch (error) {
    console.error('💥 User creation test failed:', error);
  }
}

// Run tests
console.log('🧪 Admin Login & User Management Tests');
console.log('Run testLogin() to get valid token');
console.log('Run testCreateUser() to test user creation');

// Export for use
window.testLogin = testLogin;
window.testCreateUser = testCreateUser;
