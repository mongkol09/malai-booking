const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const bcrypt = require('./apps/api/node_modules/bcrypt');

const prisma = new PrismaClient();t { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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
        firstName: 'Mongkol',
        lastName: 'Developer',
        phoneNumber: '+66123456789',
        country: 'Thailand',
        isActive: true,
        emailVerified: true,
      },
    });

    console.log('✅ Dev user created successfully:');
    console.log({
      id: devUser.id,
      email: devUser.email,
      userType: devUser.userType,
      firstName: devUser.firstName,
      lastName: devUser.lastName,
      isActive: devUser.isActive,
      emailVerified: devUser.emailVerified,
      createdAt: devUser.createdAt,
    });

    // Check if roles exist and create staff profile if needed
    try {
      const roles = await prisma.role.findMany();
      console.log(`📋 Found ${roles.length} roles in database`);

      if (roles.length > 0) {
        // Find the highest role (admin/dev role)
        const adminRole = roles.find(role => 
          role.name.toLowerCase().includes('admin') || 
          role.name.toLowerCase().includes('dev') ||
          role.name.toLowerCase().includes('super')
        ) || roles[0]; // fallback to first role

        // Create staff profile
        const staffProfile = await prisma.staff.create({
          data: {
            userId: devUser.id,
            employeeId: 'DEV001',
            firstName: devUser.firstName,
            lastName: devUser.lastName,
            email: devUser.email,
            phoneNumber: devUser.phoneNumber,
            position: 'Lead Developer',
            departmentId: null, // Will need to create department first if required
            roleId: adminRole.id,
            hireDate: new Date(),
            salary: 100000,
            isActive: true,
            status: 'Active',
          },
        });

        console.log('✅ Staff profile created successfully:');
        console.log({
          id: staffProfile.id,
          employeeId: staffProfile.employeeId,
          position: staffProfile.position,
          roleId: staffProfile.roleId,
          roleName: adminRole.name,
        });
      } else {
        console.log('⚠️  No roles found in database. Staff profile not created.');
        console.log('💡 You may need to seed roles first.');
      }
    } catch (staffError) {
      console.log('⚠️  Could not create staff profile:', staffError.message);
      console.log('💡 This might be due to missing departments or roles.');
    }

    console.log('🎉 Dev user setup completed!');
    console.log('📧 Email: mongkol03su@gmail.com');
    console.log('🔑 Password: Aa123456**');
    console.log('👤 Role: DEV (highest role)');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  User with this email already exists!');
      
      // Try to find existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: 'mongkol03su@gmail.com' },
        include: { staffProfile: true }
      });

      if (existingUser) {
        console.log('📋 Existing user found:');
        console.log({
          id: existingUser.id,
          email: existingUser.email,
          userType: existingUser.userType,
          isActive: existingUser.isActive,
          hasStaffProfile: !!existingUser.staffProfile,
        });
      }
    } else {
      console.error('❌ Error creating dev user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createDevUser();
