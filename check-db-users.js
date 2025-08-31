// ============================================
// 👥 CHECK DATABASE USERS
// Simple user verification script
// ============================================

const path = require('path');

// Add the API's node_modules to the path
process.env.NODE_PATH = path.join(__dirname, 'apps', 'api', 'node_modules');
require('module')._initPaths();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking database users...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`✅ Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Type: ${user.userType}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Verified: ${user.emailVerified}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    // Check for admin users specifically
    const adminUsers = users.filter(user => user.userType === 'ADMIN');
    console.log(`👑 Admin users: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach(admin => {
        console.log(`   📧 ${admin.email} (${admin.isActive ? 'Active' : 'Inactive'})`);
      });
    }

  } catch (error) {
    console.error('💥 Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
