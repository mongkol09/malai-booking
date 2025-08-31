// ============================================
// CHECK DATABASE USERS
// ============================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isActive: true,
        staffProfile: {
          select: {
            id: true,
            employeeId: true,
            position: true,
            role: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { userType: 'desc' }
    });
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Type: ${user.userType}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Active: ${user.isActive}`);
      if (user.staffProfile) {
        console.log(`   Staff ID: ${user.staffProfile.employeeId}`);
        console.log(`   Position: ${user.staffProfile.position}`);
        if (user.staffProfile.role) {
          console.log(`   Role: ${user.staffProfile.role.name}`);
        }
      }
      console.log('');
    });
    
    // Check for admin users specifically
    const adminUsers = users.filter(u => u.userType === 'ADMIN');
    console.log(`\n👑 Admin users: ${adminUsers.length}`);
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.isActive ? 'Active' : 'Inactive'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
