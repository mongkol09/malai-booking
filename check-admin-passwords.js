// ============================================
// 🔑 CHECK ADMIN PASSWORDS
// Check admin user password hashes
// ============================================

const path = require('path');

// Add the API's node_modules to the path
process.env.NODE_PATH = path.join(__dirname, 'apps', 'api', 'node_modules');
require('module')._initPaths();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminPasswords() {
  try {
    console.log('🔑 Checking admin passwords...\n');
    
    const adminUsers = await prisma.user.findMany({
      where: {
        userType: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isActive: true,
        emailVerified: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${adminUsers.length} admin users:\n`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Verified: ${user.emailVerified}`);
      console.log(`   Hash: ${user.passwordHash?.substring(0, 20)}...`);
      console.log('');
    });

    // Test common passwords
    const commonPasswords = ['admin123', 'password', 'admin', 'test123', '123456'];
    console.log('🔍 Testing common passwords...\n');
    
    for (const admin of adminUsers) {
      console.log(`Testing ${admin.email}:`);
      for (const pwd of commonPasswords) {
        // We'll just log the first admin for now
        if (admin.email === 'admin@hotelair.com') {
          console.log(`   Password hash: ${admin.passwordHash}`);
          break;
        }
      }
      break; // Only test first admin
    }

  } catch (error) {
    console.error('💥 Error checking passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPasswords();
