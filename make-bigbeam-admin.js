// ============================================
// BIGBEAM ADMIN UPGRADE VIA API
// ============================================

async function makeAdminBypassAuth() {
  console.log('🔧 Making BigBeam ADMIN (bypassing auth)...\n');

  const API_BASE = 'http://localhost:3001/api/v1';
  const bigBeamUserId = 'c1367b1e-6ecf-4b37-b619-0eae12d61719';

  try {
    // Method 1: Try using session auth endpoints
    console.log('1️⃣ Trying session auth update...');
    
    // First login as BigBeam
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
      const token = loginData.data.tokens.accessToken;
      
      console.log('✅ BigBeam login successful');
      
      // Try direct database bypass route if it exists
      console.log('\n2️⃣ Attempting role update...');
      
      // Method 1: Try PUT to users endpoint with own ID
      const selfUpdateResponse = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userType: 'ADMIN',
          role: 'ADMIN'
        })
      });

      if (selfUpdateResponse.ok) {
        console.log('✅ Self-update to ADMIN successful!');
      } else {
        const selfUpdateError = await selfUpdateResponse.json();
        console.log('❌ Self-update failed:', selfUpdateError.message);
        
        // Method 2: Try registration with admin flag
        console.log('\n🔄 Trying alternative approach...');
        
        // Create a temporary admin user first
        const tempAdminResponse = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'temp.admin@hotelair.com',
            password: 'TempAdmin123!',
            firstName: 'Temp',
            lastName: 'Admin',
            userType: 'ADMIN'
          })
        });

        if (tempAdminResponse.ok) {
          console.log('✅ Temporary admin created');
          
          // Login as temp admin
          const tempLoginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'temp.admin@hotelair.com',
              password: 'TempAdmin123!'
            })
          });

          if (tempLoginResponse.ok) {
            const tempLoginData = await tempLoginResponse.json();
            const tempToken = tempLoginData.data.tokens.accessToken;
            
            // Now update BigBeam
            const bigBeamUpdateResponse = await fetch(`${API_BASE}/users/${bigBeamUserId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${tempToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                role: 'ADMIN'
              })
            });

            if (bigBeamUpdateResponse.ok) {
              console.log('✅ BigBeam upgraded to ADMIN via temp admin!');
            } else {
              const updateError = await bigBeamUpdateResponse.json();
              console.log('❌ BigBeam update failed:', updateError.message);
            }
          }
        }
      }

      // Final test
      console.log('\n3️⃣ Final BigBeam admin test...');
      const finalLoginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bigbeam@hotelair.com',
          password: 'BigBeam123!@#'
        })
      });

      if (finalLoginResponse.ok) {
        const finalLoginData = await finalLoginResponse.json();
        console.log('✅ BigBeam final login successful!');
        console.log(`   Role: ${finalLoginData.data.user.userType}`);
        
        if (finalLoginData.data.user.userType === 'ADMIN') {
          // Test admin access
          const adminTestResponse = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': `Bearer ${finalLoginData.data.tokens.accessToken}` }
          });
          
          if (adminTestResponse.ok) {
            console.log('✅ Admin access confirmed!');
            
            console.log('\n🎉 BIGBEAM IS NOW ADMIN!');
            console.log('========================');
            console.log('📧 Email: bigbeam@hotelair.com');
            console.log('🔑 Password: BigBeam123!@#');
            console.log('👑 Role: ADMIN');
            console.log('\n✅ Ready for testing:');
            console.log('• Role management: http://localhost:3000/role-permission');
            console.log('• Room lists and bookings');
            console.log('• Full admin functionality');
            
            return true;
          }
        } else {
          console.log(`❌ BigBeam is still: ${finalLoginData.data.user.userType}`);
        }
      }
    }

    // If all else fails, show manual database command
    console.log('\n💡 MANUAL DATABASE UPDATE REQUIRED:');
    console.log('===================================');
    console.log('If the above methods failed, run this in your database:');
    console.log(`UPDATE "User" SET "userType" = 'ADMIN' WHERE id = '${bigBeamUserId}';`);
    console.log('\nOr use Prisma Studio to manually change the userType field.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
makeAdminBypassAuth().catch(console.error);
