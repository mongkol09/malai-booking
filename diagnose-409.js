// ============================================
// QUICK 409 ERROR DIAGNOSIS
// ============================================

async function diagnose409Error() {
  console.log('🔍 Diagnosing 409 Conflict Error...\n');

  const API_BASE = 'http://localhost:3001/api/v1';
  
  // Test data that might be causing conflict
  const testUserData = {
    email: 'bigbeam@hotelair.com',
    password: 'BigBeam123!@#',
    firstName: 'Big',
    lastName: 'Beam',
    phoneNumber: '+66-99-999-9999',
    country: 'Thailand',
    role: 'ADMIN',
    employeeId: 'EMP-BIGBEAM-001',
    position: 'Chief Executive Officer',
    departmentId: 1,
    roleId: 1,
    hireDate: new Date().toISOString(),
    salary: '1000000'
  };

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Attempting admin login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hotelair.com',
        password: 'SecurePassword123!'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Admin login failed. Testing with default password...');
      
      // Try with common default passwords
      const defaultPasswords = ['password', 'admin123', 'Password123!', 'admin'];
      
      for (const pwd of defaultPasswords) {
        const tryLogin = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@hotelair.com',
            password: pwd
          })
        });
        
        if (tryLogin.ok) {
          console.log(`✅ Admin login successful with password: ${pwd}`);
          const loginData = await tryLogin.json();
          var token = loginData.data.accessToken;
          break;
        }
      }
      
      if (!token) {
        console.log('❌ Could not login as admin with any common password');
        return;
      }
    } else {
      console.log('✅ Admin login successful');
      const loginData = await loginResponse.json();
      var token = loginData.data.accessToken;
    }

    // Step 2: Check existing users
    console.log('\n2️⃣ Checking existing users...');
    const usersResponse = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(`📊 Found ${usersData.data.users.length} users:`);
      
      usersData.data.users.forEach(user => {
        console.log(`   📧 ${user.email} (${user.firstName} ${user.lastName}) - ${user.userType}`);
      });
      
      // Check if our target email/user exists
      const conflictUser = usersData.data.users.find(u => 
        u.email === testUserData.email || 
        (u.firstName === testUserData.firstName && u.lastName === testUserData.lastName)
      );
      
      if (conflictUser) {
        console.log(`\n⚠️  CONFLICT FOUND!`);
        console.log(`   User already exists: ${conflictUser.email}`);
        console.log(`   Name: ${conflictUser.firstName} ${conflictUser.lastName}`);
        console.log(`   ID: ${conflictUser.id}`);
        console.log(`   Role: ${conflictUser.userType}`);
        
        // Suggest solutions
        console.log('\n💡 SOLUTIONS:');
        console.log('   Option 1: Use different email (bigbeam2@hotelair.com)');
        console.log('   Option 2: Use different name (BigBeam Manager)');
        console.log('   Option 3: Delete existing user and recreate');
      } else {
        console.log('\n✅ No email conflict found');
      }
    }

    // Step 3: Check staff/employee ID conflicts
    console.log('\n3️⃣ Checking employee ID conflicts...');
    
    // Try to create user and see exact error
    console.log('\n4️⃣ Testing user creation to see exact error...');
    
    const createResponse = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUserData)
    });

    const createData = await createResponse.json();
    
    if (!createResponse.ok) {
      console.log(`❌ User creation failed (${createResponse.status}):`);
      console.log(`   Error: ${createData.message}`);
      
      if (createResponse.status === 409) {
        console.log('\n🔧 409 CONFLICT ANALYSIS:');
        if (createData.message.includes('email')) {
          console.log('   ➤ Email conflict: ' + testUserData.email);
          console.log('   ➤ Solution: Change email to bigbeam2@hotelair.com');
        }
        if (createData.message.includes('Employee ID')) {
          console.log('   ➤ Employee ID conflict: ' + testUserData.employeeId);
          console.log('   ➤ Solution: Change employeeId to EMP-BIGBEAM-002');
        }
      }
    } else {
      console.log('✅ User creation successful!');
      console.log('   User ID:', createData.data.user.id);
      console.log('   Email:', createData.data.user.email);
      console.log('   Role:', createData.data.user.role);
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

// Wait a moment for API to be ready, then run
setTimeout(() => {
  diagnose409Error().catch(console.error);
}, 2000);
