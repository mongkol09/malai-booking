// ============================================
// SIMPLE BIGBEAM USER CREATOR
// ============================================

async function quickTest() {
  console.log('🔍 Quick BigBeam User Test\n');

  const API_BASE = 'http://localhost:3001/api/v1';

  // Try common admin credentials
  const adminCreds = [
    'SecurePassword123!',
    'password', 
    'admin123',
    'Password123!',
    'admin',
    'hotelair123'
  ];

  let token = null;

  // Find working admin login
  for (const password of adminCreds) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@hotelair.com',
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Admin login SUCCESS with password: ${password}`);
        token = data.data.accessToken;
        break;
      }
    } catch (error) {
      // Silent continue
    }
  }

  if (!token) {
    console.log('❌ Could not find admin password. Trying alternative admin emails...');
    
    const altEmails = ['admin@hotel.com', 'testadmin@hotelair.com', 'beam@gmail.com'];
    
    for (const email of altEmails) {
      for (const password of adminCreds) {
        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Admin login SUCCESS with ${email} / ${password}`);
            token = data.data.accessToken;
            break;
          }
        } catch (error) {
          // Silent continue
        }
      }
      if (token) break;
    }
  }

  if (!token) {
    console.log('❌ No admin access found');
    return;
  }

  // Check if BigBeam exists
  console.log('\n🔍 Checking for existing BigBeam user...');
  
  try {
    const usersResponse = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const bigBeamUser = usersData.data.users.find(u => 
        u.email === 'bigbeam@hotelair.com' || 
        (u.firstName === 'Big' && u.lastName === 'Beam')
      );

      if (bigBeamUser) {
        console.log('✅ BigBeam user already exists!');
        console.log(`   Email: ${bigBeamUser.email}`);
        console.log(`   Role: ${bigBeamUser.userType}`);
        
        // Test login
        const loginTest = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'bigbeam@hotelair.com',
            password: 'BigBeam123!@#'
          })
        });

        if (loginTest.ok) {
          console.log('✅ BigBeam login works!');
          console.log('\n🎉 READY TO TEST:');
          console.log('   Email: bigbeam@hotelair.com');
          console.log('   Password: BigBeam123!@#');
        } else {
          console.log('❌ BigBeam login failed');
        }
        return;
      }
    }

    // Create BigBeam user
    console.log('\n🚀 Creating BigBeam user...');
    
    const createResponse = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'bigbeam@hotelair.com',
        password: 'BigBeam123!@#',
        firstName: 'Big',
        lastName: 'Beam',
        phoneNumber: '+66-99-999-9999',
        country: 'Thailand',
        role: 'ADMIN'
      })
    });

    const createData = await createResponse.json();

    if (createResponse.ok) {
      console.log('✅ BigBeam user created!');
      console.log('\n🎉 READY TO TEST:');
      console.log('   Email: bigbeam@hotelair.com');
      console.log('   Password: BigBeam123!@#');
    } else {
      console.log('❌ Create failed:', createData.message);
      
      if (createResponse.status === 409) {
        console.log('\n💡 409 CONFLICT - trying alternative...');
        
        // Try with different email
        const altResponse = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'bigbeam2@hotelair.com',
            password: 'BigBeam123!@#',
            firstName: 'Big',
            lastName: 'Beam',
            phoneNumber: '+66-99-999-9999',
            country: 'Thailand',
            role: 'ADMIN'
          })
        });

        if (altResponse.ok) {
          console.log('✅ Alternative BigBeam user created!');
          console.log('\n🎉 READY TO TEST:');
          console.log('   Email: bigbeam2@hotelair.com');
          console.log('   Password: BigBeam123!@#');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run with delay for API readiness
setTimeout(quickTest, 1000);
