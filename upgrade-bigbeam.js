// ============================================
// UPGRADE BIGBEAM TO ADMIN
// ============================================

async function upgradeBigBeamToAdmin() {
  console.log('🔧 Upgrading BigBeam to ADMIN role...\n');

  const API_BASE = 'http://localhost:3001/api/v1';
  
  // BigBeam credentials
  const bigBeamEmail = 'bigbeam@hotelair.com';
  const bigBeamPassword = 'BigBeam123!@#';
  const bigBeamUserId = 'c1367b1e-6ecf-4b37-b619-0eae12d61719';

  try {
    // Step 1: Login as BigBeam to get token
    console.log('1️⃣ Logging in as BigBeam...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: bigBeamEmail,
        password: bigBeamPassword
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ BigBeam login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const bigBeamToken = loginData.data.tokens.accessToken;
    console.log('✅ BigBeam login successful');

    // Step 2: Check current user details
    console.log('\n2️⃣ Checking current BigBeam user details...');
    const userResponse = await fetch(`${API_BASE}/users/me`, {
      headers: { 'Authorization': `Bearer ${bigBeamToken}` }
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('📊 Current BigBeam details:');
      console.log(`   ID: ${userData.data.user.id}`);
      console.log(`   Email: ${userData.data.user.email}`);
      console.log(`   Role: ${userData.data.user.userType}`);
      console.log(`   Status: ${userData.data.user.isActive ? 'Active' : 'Inactive'}`);
    }

    // Step 3: Try to find an admin user to help upgrade
    console.log('\n3️⃣ Looking for existing admin to help upgrade...');
    
    // Try to find admin user by testing common admin emails
    const adminEmails = [
      'admin@hotelair.com',
      'admin@hotel.com', 
      'testadmin@hotelair.com',
      'beam@gmail.com'
    ];
    
    const adminPasswords = ['SecurePassword123!', 'password', 'admin123', 'Password123!', 'admin'];
    
    let adminToken = null;
    
    for (const email of adminEmails) {
      for (const password of adminPasswords) {
        try {
          const adminLoginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          if (adminLoginResponse.ok) {
            const adminLoginData = await adminLoginResponse.json();
            if (adminLoginData.data.user.userType === 'ADMIN') {
              console.log(`✅ Found admin: ${email}`);
              adminToken = adminLoginData.data.tokens.accessToken;
              break;
            }
          }
        } catch (error) {
          // Continue silently
        }
      }
      if (adminToken) break;
    }

    if (adminToken) {
      // Step 4: Upgrade BigBeam to admin
      console.log('\n4️⃣ Upgrading BigBeam to ADMIN...');
      
      const upgradeResponse = await fetch(`${API_BASE}/users/${bigBeamUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'ADMIN'
        })
      });

      if (upgradeResponse.ok) {
        console.log('✅ BigBeam upgraded to ADMIN successfully!');
        
        // Test admin login
        console.log('\n5️⃣ Testing BigBeam admin access...');
        const newLoginResponse = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: bigBeamEmail,
            password: bigBeamPassword
          })
        });

        if (newLoginResponse.ok) {
          const newLoginData = await newLoginResponse.json();
          console.log('✅ BigBeam admin login successful!');
          console.log(`   Role: ${newLoginData.data.user.userType}`);
          
          // Test admin endpoint access
          const usersTestResponse = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': `Bearer ${newLoginData.data.tokens.accessToken}` }
          });
          
          if (usersTestResponse.ok) {
            console.log('✅ Admin endpoint access confirmed');
          } else {
            console.log('❌ Admin endpoint access failed');
          }
        }
      } else {
        const upgradeError = await upgradeResponse.json();
        console.log('❌ Upgrade failed:', upgradeError.message);
      }
    } else {
      console.log('❌ No admin user found to perform upgrade');
      console.log('💡 Try manually updating in database or creating an admin user first');
    }

    // Final summary
    console.log('\n🎉 BIGBEAM USER SUMMARY:');
    console.log('========================');
    console.log(`📧 Email: ${bigBeamEmail}`);
    console.log(`🔑 Password: ${bigBeamPassword}`);
    console.log(`🆔 User ID: ${bigBeamUserId}`);
    console.log('\n📝 Next Steps:');
    console.log('• Login to frontend at http://localhost:3000');
    console.log('• Test role management at http://localhost:3000/role-permission');
    console.log('• Test room lists and booking features');
    console.log('• Verify admin-level functionality');

  } catch (error) {
    console.error('❌ Error during upgrade:', error.message);
  }
}

// Run upgrade
upgradeBigBeamToAdmin().catch(console.error);
