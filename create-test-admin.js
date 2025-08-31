// ============================================
// 👤 CREATE TEST ADMIN USER
// Create admin user with known credentials for testing
// ============================================

const path = require('path');

// Add the API's node_modules to the path
process.env.NODE_PATH = path.join(__dirname, 'apps', 'api', 'node_modules');
require('module')._initPaths();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simple hash function for testing - DON'T USE IN PRODUCTION
function simpleHash(password) {
  return '$2a$12$dummy.hash.for.test123' + password.slice(-4);
}

async function createTestAdmin() {
  try {
    console.log('👤 Creating test admin user...\n');
    
    const email = 'test.admin@test.com';
    const password = 'test123';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('✅ User already exists, updating password...');
      
      const hashedPassword = simpleHash(password);
      
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash: hashedPassword,
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log(`✅ Updated user: ${email}`);
    } else {
      console.log('👤 Creating new admin user...');
      
      const hashedPassword = simpleHash(password);
      
      const newUser = await prisma.user.create({
        data: {
          email: email,
          passwordHash: hashedPassword,
          firstName: 'Test',
          lastName: 'Admin',
          userType: 'ADMIN',
          isActive: true,
          emailVerified: true,
          phoneNumber: '+66123456789'
        }
      });
      
      console.log(`✅ Created new admin user: ${email}`);
    }
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('🎯 Ready for testing!');

  } catch (error) {
    console.error('💥 Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
