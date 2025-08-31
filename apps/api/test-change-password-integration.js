const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testChangePasswordIntegration() {
  try {
    console.log('🧪 === ทดสอบระบบ Change Password และ Role Permissions ===\n');
    
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 1. ทดสอบหา user ที่มี staff profile
    console.log('👤 ทดสอบการดึงข้อมูล User และ Role:');
    console.log('='.repeat(60));
    
    const testUser = await prisma.user.findFirst({
      where: {
        staffProfile: {
          isNot: null
        }
      },
      include: {
        staffProfile: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });
    
    if (testUser) {
      console.log(`✅ พบ Test User: ${testUser.email}`);
      console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`   User Type: ${testUser.userType}`);
      
      if (testUser.staffProfile && testUser.staffProfile.role) {
        const role = testUser.staffProfile.role;
        console.log(`   Role: ${role.name}`);
        console.log(`   Role Description: ${role.description}`);
        console.log(`   Permissions: ${role.permissions.length}`);
        
        if (role.permissions.length > 0) {
          console.log('   📝 Detailed Permissions:');
          role.permissions.forEach(perm => {
            const actions = [];
            if (perm.canRead) actions.push('Read');
            if (perm.canWrite) actions.push('Write');
            if (perm.canCreate) actions.push('Create');
            if (perm.canDelete) actions.push('Delete');
            console.log(`      - ${perm.resourceName}: ${actions.join(', ')}`);
          });
        }
      } else {
        console.log('   ❌ ไม่มี Role');
      }
    } else {
      console.log('❌ ไม่พบ User ที่มี Staff Profile');
      return;
    }
    
    console.log('\n');
    
    // 2. ทดสอบ API endpoints ที่จำเป็น
    console.log('🔍 ทดสอบ API Endpoints:');
    console.log('='.repeat(60));
    
    // API endpoints ที่ต้องมี
    const requiredEndpoints = [
      { path: '/users/me/password', method: 'PUT', description: 'Change Password' },
      { path: '/users/me/role', method: 'GET', description: 'Get User Role' },
      { path: '/roles', method: 'GET', description: 'Get All Roles' },
      { path: '/role-permissions', method: 'GET', description: 'Get Role Permissions' },
      { path: '/roles', method: 'POST', description: 'Create Role' },
      { path: '/roles/:id', method: 'PUT', description: 'Update Role' },
      { path: '/roles/:id', method: 'DELETE', description: 'Delete Role' },
      { path: '/roles/:id/permissions', method: 'PUT', description: 'Update Role Permissions' }
    ];
    
    requiredEndpoints.forEach(endpoint => {
      console.log(`📡 ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
    });
    
    console.log('\n');
    
    // 3. ทดสอบการเข้าถึง resources ตาม permissions
    console.log('🛡️ ทดสอบ Permission Checks:');
    console.log('='.repeat(60));
    
    if (testUser.staffProfile && testUser.staffProfile.role) {
      const role = testUser.staffProfile.role;
      const resources = ['users', 'roles', 'bookings', 'rooms', 'reports', 'settings', 'promocodes', 'events'];
      const actions = ['read', 'write', 'create', 'delete'];
      
      console.log(`Testing permissions for Role: ${role.name}\n`);
      
      resources.forEach(resource => {
        const resourcePerms = role.permissions.find(p => p.resourceName === resource);
        if (resourcePerms) {
          const allowedActions = [];
          if (resourcePerms.canRead) allowedActions.push('Read');
          if (resourcePerms.canWrite) allowedActions.push('Write');
          if (resourcePerms.canCreate) allowedActions.push('Create');
          if (resourcePerms.canDelete) allowedActions.push('Delete');
          
          console.log(`✅ ${resource}: ${allowedActions.length > 0 ? allowedActions.join(', ') : 'No permissions'}`);
        } else {
          console.log(`❌ ${resource}: No access`);
        }
      });
    }
    
    console.log('\n');
    
    // 4. แสดงข้อมูลสำหรับ Frontend Testing
    console.log('🌐 Frontend Testing Information:');
    console.log('='.repeat(60));
    console.log('Test User Credentials:');
    console.log(`  Email: ${testUser.email}`);
    console.log(`  Role: ${testUser.staffProfile?.role?.name || 'No Role'}`);
    console.log(`  User Type: ${testUser.userType}`);
    
    console.log('\nFrontend URLs to test:');
    console.log('  - Account Settings: http://localhost:3000/accounts-setting');
    console.log('  - Role Permission: http://localhost:3000/role-permission');
    console.log('  - Login: http://localhost:3000/login');
    
    console.log('\nAPI Base URL:');
    console.log('  - Development: http://localhost:3001/api/v1');
    
    console.log('\nToken Storage:');
    console.log('  - LocalStorage Key: hotel_admin_token');
    console.log('  - User Key: hotel_admin_user');
    
    // 5. ทดสอบการสร้าง test data สำหรับ permissions
    console.log('\n🧪 Frontend Permission Test Cases:');
    console.log('='.repeat(60));
    
    const testCases = [
      {
        component: 'Security.jsx',
        description: 'Change Password Form',
        requiredPermissions: 'Authenticated user only',
        testSteps: [
          '1. Login as test user',
          '2. Navigate to Account Settings',
          '3. Try changing password with correct current password',
          '4. Verify success message',
          '5. Try with wrong current password',
          '6. Verify error message'
        ]
      },
      {
        component: 'RolePermission.jsx',
        description: 'Role Management',
        requiredPermissions: 'roles:read minimum',
        testSteps: [
          '1. Login as admin user',
          '2. Navigate to Role Permission page',
          '3. Check if page loads without permission denied',
          '4. Try creating a new role (needs roles:create)',
          '5. Try editing existing role (needs roles:write)',
          '6. Try deleting role (needs roles:delete)'
        ]
      },
      {
        component: 'PermissionGate',
        description: 'UI Permission Controls',
        requiredPermissions: 'Various based on component',
        testSteps: [
          '1. Login as different role users',
          '2. Check button visibility based on permissions',
          '3. Verify menu items show/hide correctly',
          '4. Test fallback content for denied access'
        ]
      }
    ];
    
    testCases.forEach((testCase, index) => {
      console.log(`${index + 1}. ${testCase.component} - ${testCase.description}`);
      console.log(`   Required: ${testCase.requiredPermissions}`);
      console.log('   Test Steps:');
      testCase.testSteps.forEach(step => {
        console.log(`      ${step}`);
      });
      console.log('');
    });
    
    // 6. แสดงข้อมูลสำหรับ Manual Testing
    console.log('📋 Manual Testing Checklist:');
    console.log('='.repeat(60));
    console.log('Frontend Setup:');
    console.log('✓ Check all service files are imported correctly');
    console.log('✓ Verify hook dependencies are available');
    console.log('✓ Ensure component imports are working');
    console.log('✓ Check console for any errors');
    
    console.log('\nBackend Setup:');
    console.log('✓ API server is running on port 3001');
    console.log('✓ Database has role and permission data');
    console.log('✓ User authentication is working');
    console.log('✓ CORS is configured for frontend');
    
    console.log('\nPermission Testing:');
    console.log('✓ Login as Super Admin - should see all features');
    console.log('✓ Login as Admin - should see most features');
    console.log('✓ Login as Staff - should see limited features');
    console.log('✓ Check permission gates work correctly');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Start frontend server: cd app/admin && npm start');
    console.log('2. Test change password functionality');
    console.log('3. Test role permission management');
    console.log('4. Verify permission-based UI controls');
    console.log('5. Check API authorization is working');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChangePasswordIntegration();
