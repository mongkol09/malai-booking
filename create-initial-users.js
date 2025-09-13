// ============================================
// CREATE INITIAL USERS SCRIPT
// ============================================

const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const bcrypt = require('./apps/api/node_modules/bcrypt');

const prisma = new PrismaClient();

async function createInitialUsers() {
  console.log('👤 Creating initial users...\n');

  try {
    // Users to create
    const usersToCreate = [
      {
        email: 'ai@gmail.com',
        password: 'Aa123456**',
        firstName: 'AI',
        lastName: 'Assistant',
        userType: 'DEV',
        role: 'dev'
      },
      {
        email: 'mongkol03su@gmail.com',
        password: 'Aa123456**',
        firstName: 'Mongkol',
        lastName: 'Developer',
        userType: 'DEV',
        role: 'dev'
      }
    ];

    console.log('🔐 Hashing passwords...');
    
    for (const userData of usersToCreate) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user
        const newUser = await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userType: userData.userType,
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`✅ Created user: ${userData.email}`);
        console.log(`   - ID: ${newUser.id}`);
        console.log(`   - Name: ${userData.firstName} ${userData.lastName}`);
        console.log(`   - Role: ${userData.userType}`);
        console.log(`   - Active: ${newUser.isActive}`);
        console.log('');

      } catch (userError) {
        console.error(`❌ Failed to create user ${userData.email}:`, userError.message);
      }
    }

    // Display all users
    console.log('\n📋 All users in database:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (allUsers.length === 0) {
      console.log('   No users found');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Name: ${user.firstName} ${user.lastName}`);
        console.log(`      Type: ${user.userType}`);
        console.log(`      Active: ${user.isActive}`);
        console.log(`      Verified: ${user.emailVerified}`);
        console.log(`      Created: ${user.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    console.log('🎉 User creation completed!');

  } catch (error) {
    console.error('❌ User creation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
module.exports = {
  createInitialUsers
};

// Run if called directly
if (require.main === module) {
  createInitialUsers()
    .then(() => {
      console.log('\n✅ Initial users setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Initial users setup failed:', error.message);
      process.exit(1);
    });
}
