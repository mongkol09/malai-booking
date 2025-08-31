// 🔍 CHECK USER ROLE FOR mongkol09ms@gmail.com
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRole() {
  console.log('🔍 === CHECKING USER ROLE ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    const targetEmail = 'mongkol09ms@gmail.com';
    
    // Find user with detailed information
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        staffProfile: {
          select: {
            position: true,
            department: true,
            hireDate: true,
            salary: true
          }
        }
      }
    });
    
    if (!user) {
      console.log(`❌ User with email ${targetEmail} not found!`);
      return;
    }
    
    console.log('👤 USER INFORMATION:');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`🏷️ User Type: ${user.userType}`);
    console.log(`✅ Active: ${user.isActive ? 'Yes' : 'No'}`);
    console.log(`📧 Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
    console.log(`📅 Created: ${user.createdAt.toLocaleString('th-TH')}`);
    console.log(`🔐 Last Login: ${user.lastLoginAt ? user.lastLoginAt.toLocaleString('th-TH') : 'Never'}`);
    
    // Check if user has staff profile
    if (user.staffProfile) {
      console.log('\n👔 STAFF PROFILE:');
      console.log('-'.repeat(30));
      console.log(`Position: ${user.staffProfile.position || 'Not set'}`);
      console.log(`Department: ${user.staffProfile.department || 'Not set'}`);
      console.log(`Hire Date: ${user.staffProfile.hireDate ? user.staffProfile.hireDate.toLocaleDateString('th-TH') : 'Not set'}`);
      console.log(`Salary: ${user.staffProfile.salary ? `฿${Number(user.staffProfile.salary).toLocaleString('th-TH')}` : 'Not set'}`);
    } else {
      console.log('\n👔 STAFF PROFILE: Not found');
    }
    
    // Role Analysis
    console.log('\n🎯 ROLE ANALYSIS:');
    console.log('='.repeat(50));
    
    const roleCheck = {
      isDev: user.userType === 'DEV',
      isAdmin: user.userType === 'ADMIN',
      isStaff: user.userType === 'STAFF',
      isCustomer: user.userType === 'CUSTOMER'
    };
    
    console.log(`🔧 Is DEV: ${roleCheck.isDev ? '✅ YES' : '❌ NO'}`);
    console.log(`👨‍💼 Is ADMIN: ${roleCheck.isAdmin ? '✅ YES' : '❌ NO'}`);
    console.log(`👷 Is STAFF: ${roleCheck.isStaff ? '✅ YES' : '❌ NO'}`);
    console.log(`👤 Is CUSTOMER: ${roleCheck.isCustomer ? '✅ YES' : '❌ NO'}`);
    
    // Permissions Analysis
    console.log('\n🔐 PERMISSIONS ANALYSIS:');
    console.log('='.repeat(50));
    
    const permissions = {
      canAccessAdminPanel: roleCheck.isDev || roleCheck.isAdmin,
      canManageUsers: roleCheck.isDev || roleCheck.isAdmin,
      canManageRooms: roleCheck.isDev || roleCheck.isAdmin || roleCheck.isStaff,
      canViewReports: roleCheck.isDev || roleCheck.isAdmin,
      canManageSystem: roleCheck.isDev,
      canResetPasswords: roleCheck.isDev || roleCheck.isAdmin
    };
    
    Object.entries(permissions).forEach(([permission, hasAccess]) => {
      console.log(`${hasAccess ? '✅' : '❌'} ${permission}`);
    });
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    
    if (roleCheck.isDev) {
      console.log('🎯 This user is a DEVELOPER with full system access');
      console.log('🔧 Can access all admin functions');
      console.log('⚡ Has highest privileges in the system');
    } else if (roleCheck.isAdmin) {
      console.log('👨‍💼 This user is an ADMIN with management access');
      console.log('📊 Can manage users and view reports');
      console.log('🏨 Can manage hotel operations');
    } else if (roleCheck.isStaff) {
      console.log('👷 This user is STAFF with operational access');
      console.log('🏨 Can manage day-to-day operations');
      console.log('📋 Limited to assigned responsibilities');
    } else {
      console.log('👤 This user is a CUSTOMER with basic access');
      console.log('🏨 Can make bookings and view their data');
    }
    
    console.log('\n✅ USER ROLE CHECK COMPLETE!');
    
  } catch (error) {
    console.error('❌ Role check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUserRole();
