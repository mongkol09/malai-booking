const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Checking user in database...');
    
    const user = await prisma.user.findUnique({
      where: {
        email: 'mongkol03su@gmail.com'
      }
    });

    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        hasPassword: !!user.passwordHash,
        createdAt: user.createdAt
      });
    } else {
      console.log('❌ User not found!');
      
      // Check all users
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          userType: true,
          isActive: true
        }
      });
      console.log('📋 All users in database:', allUsers);
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
