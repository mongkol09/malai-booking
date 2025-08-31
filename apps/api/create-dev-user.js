const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createDevUser() {
  try {
    console.log('🚀 Creating Dev user...');

    // Hash password
    const passwordHash = await bcrypt.hash('Aa123456**', 12);

    // Create dev user
    const devUser = await prisma.user.create({
      data: {
        email: 'mongkol03su@gmail.com',
        passwordHash: passwordHash,
        userType: 'DEV',
        firstName: 'Dev',
        lastName: 'User',
        phoneNumber: '0000000000',
        country: 'Thailand',
        isActive: true,
        emailVerified: true,
        lastLoginAt: new Date()
      }
    });

    console.log('✅ Dev user created successfully:', {
      id: devUser.id,
      email: devUser.email,
      userType: devUser.userType
    });

    // Check if we have roles to create staff profile
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });

    if (roles.length > 0) {
      // Find the highest role (assuming first role has highest privileges)
      const highestRole = roles[0];
      
      // Create staff profile for dev user
      const staffProfile = await prisma.staff.create({
        data: {
          userId: devUser.id,
          roleId: highestRole.id,
          employeeId: 'DEV001',
          department: 'Development',
          position: 'System Developer',
          salary: 0,
          isActive: true,
          dateJoined: new Date()
        }
      });

      console.log('✅ Staff profile created successfully:', {
        id: staffProfile.id,
        employeeId: staffProfile.employeeId,
        role: highestRole.name,
        department: staffProfile.department
      });
    } else {
      console.log('⚠️ No roles found in database, skipping staff profile creation');
    }

    console.log('\n🎉 Dev user setup completed!');
    console.log('📧 Email: mongkol03su@gmail.com');
    console.log('🔑 Password: Aa123456**');
    console.log('👤 User Type: DEV');

  } catch (error) {
    console.error('❌ Error creating dev user:', error);
    if (error.code === 'P2002') {
      console.log('📝 User with this email already exists');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createDevUser();
