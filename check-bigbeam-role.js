// ============================================
// CHECK BIGBEAM CURRENT ROLE
// ============================================

async function checkBigBeamRole() {
  console.log('🔍 Checking BigBeam current role...\n');

  const API_BASE = 'http://localhost:3001/api/v1';

  try {
    // Step 1: Login as BigBeam to check self
    console.log('1️⃣ Testing BigBeam login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bigbeam@hotelair.com',
        password: 'BigBeam123!@#'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ BigBeam login failed');
      const loginError = await loginResponse.json();
      console.log('Error:', loginError.message);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.tokens.accessToken;
    
    console.log('✅ BigBeam login successful!');
    console.log(`📊 User Info from Login:`);
    console.log(`   ID: ${loginData.data.user.id}`);
    console.log(`   Email: ${loginData.data.user.email}`);
    console.log(`   Name: ${loginData.data.user.firstName} ${loginData.data.user.lastName}`);
    console.log(`   Role: ${loginData.data.user.userType}`);
    console.log(`   Active: ${loginData.data.user.isActive}`);
    console.log(`   Verified: ${loginData.data.user.emailVerified}`);

    // Step 2: Get detailed user info via /me endpoint
    console.log('\n2️⃣ Getting detailed user info...');
    const meResponse = await fetch(`${API_BASE}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('📋 Detailed User Info:');
      console.log(`   ID: ${meData.data.user.id}`);
      console.log(`   Email: ${meData.data.user.email}`);
      console.log(`   Role: ${meData.data.user.userType}`);
      console.log(`   Status: ${meData.data.user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Created: ${meData.data.user.createdAt}`);
      console.log(`   Updated: ${meData.data.user.updatedAt}`);
    }

    // Step 3: Test admin access capabilities
    console.log('\n3️⃣ Testing admin access capabilities...');
    
    // Test users endpoint (admin only)
    const usersResponse = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(`✅ Users endpoint access: SUCCESS (${usersData.data.users.length} users found)`);
      
      // Find BigBeam in the users list to see how it appears from admin perspective
      const bigBeamInList = usersData.data.users.find(u => u.email === 'bigbeam@hotelair.com');
      if (bigBeamInList) {
        console.log('📋 BigBeam in users list:');
        console.log(`   ID: ${bigBeamInList.id}`);
        console.log(`   Email: ${bigBeamInList.email}`);
        console.log(`   Role: ${bigBeamInList.userType}`);
        console.log(`   Status: ${bigBeamInList.isActive ? 'Active' : 'Inactive'}`);
      }
    } else {
      console.log('❌ Users endpoint access: FAILED (not admin)');
      const usersError = await usersResponse.json();
      console.log('Error:', usersError.message);
    }

    // Test roles endpoint
    const rolesResponse = await fetch(`${API_BASE}/roles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json();
      console.log('✅ Roles endpoint access: SUCCESS');
    } else {
      console.log('❌ Roles endpoint access: FAILED');
    }

    // Test room management
    const roomsResponse = await fetch(`${API_BASE}/rooms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (roomsResponse.ok) {
      console.log('✅ Rooms endpoint access: SUCCESS');
    } else {
      console.log('❌ Rooms endpoint access: FAILED');
    }

    // Step 4: Summary
    console.log('\n🏆 BIGBEAM ROLE SUMMARY:');
    console.log('========================');
    
    const currentRole = loginData.data.user.userType;
    console.log(`👤 Current Role: ${currentRole}`);
    
    if (currentRole === 'ADMIN') {
      console.log('🎉 BigBeam has ADMIN privileges!');
      console.log('✅ Can access:');
      console.log('   • User management');
      console.log('   • Role management');
      console.log('   • Room management');
      console.log('   • Booking management');
      console.log('   • All admin features');
    } else if (currentRole === 'STAFF') {
      console.log('👨‍💼 BigBeam has STAFF privileges');
      console.log('✅ Can access:');
      console.log('   • Basic user features');
      console.log('   • Limited booking management');
      console.log('   • Staff-level features');
    } else if (currentRole === 'CUSTOMER') {
      console.log('👤 BigBeam has CUSTOMER privileges');
      console.log('✅ Can access:');
      console.log('   • Basic booking features');
      console.log('   • Personal profile management');
      console.log('   • Customer-level features');
    }

    console.log('\n📋 Login Credentials:');
    console.log(`   Email: bigbeam@hotelair.com`);
    console.log(`   Password: BigBeam123!@#`);
    console.log(`   Frontend: http://localhost:3000`);

  } catch (error) {
    console.error('❌ Error checking BigBeam role:', error.message);
  }
}

// Run the check
checkBigBeamRole().catch(console.error);
