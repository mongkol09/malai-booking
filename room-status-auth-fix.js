// 🎯 ROOM STATUS AUTHENTICATION FIX
// ============================================

console.log('🔧 ROOM STATUS AUTHENTICATION FIX');
console.log('='.repeat(60));

console.log('\n📋 CURRENT AUTHENTICATION STATUS:');
console.log('='.repeat(60));

// Check current localStorage state
const authToken = localStorage.getItem('authToken');
const hotelAdminToken = localStorage.getItem('hotel_admin_token');
const hotelAdminUser = localStorage.getItem('hotel_admin_user');

console.log('🔑 Auth Tokens:');
console.log(`   authToken: ${authToken ? '✅ Present' : '❌ Missing'}`);
console.log(`   hotel_admin_token: ${hotelAdminToken ? '✅ Present' : '❌ Missing'}`);

console.log('\n👤 User Data:');
console.log(`   hotel_admin_user: ${hotelAdminUser ? '✅ Present' : '❌ Missing'}`);

if (hotelAdminUser) {
  try {
    const userData = JSON.parse(hotelAdminUser);
    console.log(`   User Type: ${userData.userType || 'Not set'}`);
    console.log(`   Email: ${userData.email || 'Not set'}`);
  } catch (error) {
    console.log('   ❌ Invalid user data format');
  }
}

console.log('\n🎯 FIXING AUTHENTICATION:');
console.log('='.repeat(60));

// Set up proper authentication for DEV user
const devToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NDhiYjBiOS02ODE2LTRmOWEtODdiMi0zNjkxNGU3MmM3YjYiLCJlbWFpbCI6Im1vbmdrb2wwOW1zQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiREVWIiwic2Vzc2lvbklkIjoiZGV2LXNlc3Npb24tMTc1NTQwNDc5MjMzNi15aTdhdjB1ODciLCJpYXQiOjE3NTU0MDQ3OTIsImV4cCI6MTc1NjAwOTU5Mn0.xz8yIFTy5xKhWOYm6INMIw7pGg-27LovWUJJzipFe3o';

const devUserData = {
  id: '548bb0b9-6816-4f9a-87b2-36914e72c7b6',
  email: 'mongkol09ms@gmail.com',
  firstName: 'Malai',
  lastName: 'Dev',
  userType: 'DEV',
  isActive: true,
  emailVerified: true
};

// Set all necessary localStorage items
localStorage.setItem('authToken', devToken);
localStorage.setItem('hotel_admin_token', devToken);
localStorage.setItem('token', devToken);
localStorage.setItem('hotel_admin_user', JSON.stringify(devUserData));

console.log('✅ Authentication tokens set');
console.log('✅ User data configured for DEV role');

console.log('\n📋 UPDATED AUTHENTICATION STATUS:');
console.log('='.repeat(60));
console.log('🔑 Auth Token: ✅ Set');
console.log('👤 User Type: DEV (Highest privileges)');
console.log('📧 Email: mongkol09ms@gmail.com');

console.log('\n🎯 INSTRUCTIONS:');
console.log('='.repeat(60));
console.log('1. The authentication has been fixed');
console.log('2. Refresh the Room Status page');
console.log('3. The DEV role should now have access');

console.log('\n✅ AUTHENTICATION FIX COMPLETE!');
console.log('Room Status page should now work with DEV privileges.');
