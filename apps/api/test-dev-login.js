// 🔐 TEST DEV USER LOGIN
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testDevLogin() {
  console.log('🔐 === TESTING DEV USER LOGIN ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // Check dev users
    const devUsers = await prisma.user.findMany({
      where: {
        OR: [
          { userType: 'ADMIN' },
          { userType: 'DEV' }
        ]
      }
    });
    
    console.log('👥 FOUND DEV/ADMIN USERS:');
    console.log('='.repeat(40));
    
    for (const user of devUsers) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
      console.log(`🏷️ Type: ${user.userType}`);
      console.log(`✅ Active: ${user.isActive}`);
      console.log(`📧 Email Verified: ${user.emailVerified}`);
      console.log(`🔒 Password Hash: ${user.passwordHash.substring(0, 20)}...`);
      
      // Test different possible passwords
      const possiblePasswords = [
        'dev123',
        'admin123', 
        'password',
        'dev2024',
        'admin2024',
        'test123'
      ];
      
      console.log(`\n🔍 Testing passwords for ${user.email}:`);
      
      let foundPassword = false;
      for (const pwd of possiblePasswords) {
        try {
          const isMatch = await bcrypt.compare(pwd, user.passwordHash);
          if (isMatch) {
            console.log(`  ✅ Password found: "${pwd}"`);
            foundPassword = true;
            break;
          } else {
            console.log(`  ❌ Not: "${pwd}"`);
          }
        } catch (error) {
          console.log(`  ⚠️ Error testing "${pwd}": ${error.message}`);
        }
      }
      
      if (!foundPassword) {
        console.log(`  ❌ None of the common passwords work`);
        console.log(`  💡 Need to reset password for this user`);
      }
      
      console.log('\n' + '-'.repeat(40) + '\n');
    }
    
    // Check if we need to create a fresh dev user
    console.log('🆕 CREATING FRESH DEV USER FOR TESTING:');
    console.log('='.repeat(40));
    
    const freshDevEmail = 'dev.fresh@hotel.com';
    const freshPassword = 'dev123';
    
    // Check if fresh dev user exists
    const existingFreshDev = await prisma.user.findUnique({
      where: { email: freshDevEmail }
    });
    
    if (existingFreshDev) {
      console.log(`User ${freshDevEmail} already exists, updating password...`);
      
      const newPasswordHash = await bcrypt.hash(freshPassword, 10);
      await prisma.user.update({
        where: { email: freshDevEmail },
        data: { 
          passwordHash: newPasswordHash,
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log(`✅ Updated password for ${freshDevEmail}`);
    } else {
      console.log(`Creating new dev user: ${freshDevEmail}`);
      
      const passwordHash = await bcrypt.hash(freshPassword, 10);
      const newDevUser = await prisma.user.create({
        data: {
          email: freshDevEmail,
          passwordHash,
          userType: 'DEV',
          firstName: 'Fresh',
          lastName: 'Developer',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log(`✅ Created new dev user: ${newDevUser.email}`);
    }
    
    console.log('\n📝 LOGIN CREDENTIALS FOR TESTING:');
    console.log('='.repeat(40));
    console.log(`Email: ${freshDevEmail}`);
    console.log(`Password: ${freshPassword}`);
    console.log('User Type: DEV');
    
    // Test the fresh password
    const testUser = await prisma.user.findUnique({
      where: { email: freshDevEmail }
    });
    
    const passwordWorks = await bcrypt.compare(freshPassword, testUser.passwordHash);
    console.log(`Password Test: ${passwordWorks ? '✅ WORKS' : '❌ FAILED'}`);
    
    console.log('\n✅ DEV USER LOGIN TEST COMPLETE!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDevLogin();
