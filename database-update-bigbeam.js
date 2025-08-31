// ============================================
// DIRECT DATABASE UPDATE - BIGBEAM TO ADMIN
// ============================================

// ต้องทำผ่าน Prisma client โดยตรง
const { PrismaClient } = require('@prisma/client');

async function updateBigBeamToAdmin() {
  console.log('🔧 Updating BigBeam to ADMIN via database...\n');

  const prisma = new PrismaClient();

  try {
    // Step 1: Find BigBeam user
    console.log('1️⃣ Finding BigBeam user...');
    const bigBeamUser = await prisma.user.findUnique({
      where: { email: 'bigbeam@hotelair.com' }
    });

    if (!bigBeamUser) {
      console.log('❌ BigBeam user not found');
      return;
    }

    console.log('✅ BigBeam user found:');
    console.log(`   ID: ${bigBeamUser.id}`);
    console.log(`   Email: ${bigBeamUser.email}`);
    console.log(`   Current Role: ${bigBeamUser.userType}`);

    // Step 2: Update to ADMIN
    console.log('\n2️⃣ Updating role to ADMIN...');
    const updatedUser = await prisma.user.update({
      where: { id: bigBeamUser.id },
      data: { userType: 'ADMIN' }
    });

    console.log('✅ BigBeam updated successfully!');
    console.log(`   New Role: ${updatedUser.userType}`);

    // Step 3: Verify by testing login
    console.log('\n3️⃣ Testing BigBeam admin login...');
    
    const API_BASE = 'http://localhost:3001/api/v1';
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bigbeam@hotelair.com',
        password: 'BigBeam123!@#'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ BigBeam admin login successful!');
      console.log(`   Role: ${loginData.data.user.userType}`);
      
      // Test admin endpoints
      const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${loginData.data.tokens.accessToken}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log(`✅ Admin access confirmed - can see ${usersData.data.users.length} users`);
      } else {
        console.log('❌ Admin access test failed');
      }
    } else {
      console.log('❌ Login test failed');
    }

    console.log('\n🎉 BIGBEAM ADMIN USER READY!');
    console.log('============================');
    console.log('📧 Email: bigbeam@hotelair.com');
    console.log('🔑 Password: BigBeam123!@#');
    console.log('👑 Role: ADMIN');
    console.log('\n✅ You can now:');
    console.log('• Login to http://localhost:3000 with BigBeam credentials');
    console.log('• Access role management at http://localhost:3000/role-permission');
    console.log('• Test all admin-level features');
    console.log('• Create/manage rooms, bookings, and users');

  } catch (error) {
    console.error('❌ Database update error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateBigBeamToAdmin().catch(console.error);
