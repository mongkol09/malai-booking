// ============================================
// CREATE BIGBEAM USER SCRIPT
// ============================================

// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:3001/api/v1';

// Configuration for BigBeam user
const BIGBEAM_USER_DATA = {
  email: 'bigbeam@hotelair.com',
  password: 'BigBeam123!@#',
  firstName: 'Big',
  lastName: 'Beam',
  phoneNumber: '+66-99-999-9999',
  country: 'Thailand',
  role: 'ADMIN', // Highest level
  // Staff fields for admin
  employeeId: 'EMP-BIGBEAM-001',
  position: 'Chief Executive Officer',
  departmentId: 1, // Assuming management department
  roleId: 1, // Assuming admin role
  hireDate: new Date().toISOString(),
  salary: '1000000'
};

async function checkExistingUsers() {
  console.log('🔍 Checking existing users in the system...\n');
  
  try {
    // First get admin token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@hotelair.com',
        password: 'SecurePassword123!'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Could not login as admin. Make sure admin@hotelair.com exists.');
      return null;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    // Get all users
    const usersResponse = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      console.log('❌ Could not fetch users');
      return null;
    }

    const usersData = await usersResponse.json();
    console.log('📋 Existing users:');
    console.log('================');
    
    if (usersData.data && usersData.data.users) {
      usersData.data.users.forEach(user => {
        console.log(`📧 ${user.email} | ${user.firstName} ${user.lastName} | Role: ${user.userType || 'N/A'} | Active: ${user.isActive ? '✅' : '❌'}`);
      });
    }

    console.log('\n================\n');
    
    // Check if bigbeam exists
    const bigbeamExists = usersData.data.users.find(user => 
      user.email === BIGBEAM_USER_DATA.email || 
      user.firstName.toLowerCase() === 'big' && user.lastName.toLowerCase() === 'beam'
    );

    if (bigbeamExists) {
      console.log('⚠️  BigBeam user already exists!');
      console.log(`   Email: ${bigbeamExists.email}`);
      console.log(`   Name: ${bigbeamExists.firstName} ${bigbeamExists.lastName}`);
      console.log(`   Role: ${bigbeamExists.userType}`);
      console.log(`   Status: ${bigbeamExists.isActive ? 'Active' : 'Inactive'}\n`);
      return { token, userExists: true, existingUser: bigbeamExists };
    }

    return { token, userExists: false };

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    return null;
  }
}

async function createBigBeamUser(token) {
  console.log('🚀 Creating BigBeam user...\n');
  
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(BIGBEAM_USER_DATA)
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Failed to create user:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
      
      if (response.status === 409) {
        console.log('\n💡 Conflict detected. This usually means:');
        console.log('   • Email already exists: ' + BIGBEAM_USER_DATA.email);
        console.log('   • Employee ID already exists: ' + BIGBEAM_USER_DATA.employeeId);
        console.log('\n🔧 Solutions:');
        console.log('   1. Use a different email (e.g., bigbeam2@hotelair.com)');
        console.log('   2. Use a different employee ID (e.g., EMP-BIGBEAM-002)');
        console.log('   3. Delete the existing user first');
      }
      
      return false;
    }

    console.log('✅ BigBeam user created successfully!');
    console.log(`   Email: ${BIGBEAM_USER_DATA.email}`);
    console.log(`   Name: ${BIGBEAM_USER_DATA.firstName} ${BIGBEAM_USER_DATA.lastName}`);
    console.log(`   Role: ${BIGBEAM_USER_DATA.role}`);
    console.log(`   Employee ID: ${BIGBEAM_USER_DATA.employeeId}`);
    console.log(`   Position: ${BIGBEAM_USER_DATA.position}\n`);

    return true;

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    return false;
  }
}

async function testBigBeamLogin() {
  console.log('🔐 Testing BigBeam login...\n');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: BIGBEAM_USER_DATA.email,
        password: BIGBEAM_USER_DATA.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ BigBeam login failed:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
      return false;
    }

    console.log('✅ BigBeam login successful!');
    console.log(`   Token: ${data.data.accessToken.substring(0, 20)}...`);
    console.log(`   User ID: ${data.data.user.id}`);
    console.log(`   Role: ${data.data.user.userType}`);
    
    // Test role management access
    console.log('\n🧪 Testing role management access...');
    
    const roleResponse = await fetch(`${API_BASE}/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (roleResponse.ok) {
      console.log('✅ Role management access: SUCCESS');
    } else {
      console.log('❌ Role management access: FAILED');
    }

    console.log('\n🎉 BigBeam user is ready for testing!');
    console.log('📋 Login credentials:');
    console.log(`   Email: ${BIGBEAM_USER_DATA.email}`);
    console.log(`   Password: ${BIGBEAM_USER_DATA.password}`);
    
    return true;

  } catch (error) {
    console.error('❌ Error testing login:', error.message);
    return false;
  }
}

async function main() {
  console.log('🏨 BigBeam User Creation Script');
  console.log('===============================\n');

  // Step 1: Check existing users
  const checkResult = await checkExistingUsers();
  if (!checkResult) {
    console.log('❌ Cannot proceed without admin access');
    return;
  }

  // Step 2: Create user if not exists
  if (checkResult.userExists) {
    console.log('ℹ️  BigBeam user already exists. Proceeding to test login...\n');
  } else {
    const created = await createBigBeamUser(checkResult.token);
    if (!created) {
      console.log('❌ Could not create BigBeam user');
      return;
    }
  }

  // Step 3: Test login
  await testBigBeamLogin();
}

// Run the script
main().catch(console.error);
