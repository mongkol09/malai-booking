// 🧪 Test Password Reset API (Quick)
const testAPI = async () => {
  try {
    console.log('🧪 Testing Password Reset API (After Fix)...');
    console.log('API URL: http://localhost:3001/api/v1/auth/forgot-password');
    console.log('Email: mongkol09ms@gmail.com\n');
    
    const response = await fetch('http://localhost:3001/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'mongkol09ms@gmail.com' 
      })
    });
    
    console.log('Response Status:', response.status);
    
    const data = await response.json();
    console.log('\nResponse Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS! Password reset API is working!');
      console.log('📧 Email template should be displayed in API server console');
      console.log('🔗 User can now use the reset link');
    } else {
      console.log('\n❌ API returned error:', data.message || data.error?.message);
    }
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
  }
};

testAPI();
