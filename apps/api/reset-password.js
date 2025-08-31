// 🔐 RESET PASSWORD FOR mongkol09ms@gmail.com
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  console.log('🔐 === RESETTING PASSWORD ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    const targetEmail = 'mongkol09ms@gmail.com';
    const newPassword = 'dev123';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail }
    });
    
    if (!user) {
      console.log(`❌ User with email ${targetEmail} not found!`);
      return;
    }
    
    console.log('👤 USER FOUND:');
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Type: ${user.userType}`);
    console.log(`  Active: ${user.isActive}`);
    console.log(`  Email Verified: ${user.emailVerified}`);
    
    // Hash new password
    console.log(`\n🔑 Hashing new password: "${newPassword}"`);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: {
        passwordHash,
        isActive: true,
        emailVerified: true,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Password updated successfully!\n');
    
    // Test the new password
    console.log('🧪 TESTING NEW PASSWORD:');
    const passwordTest = await bcrypt.compare(newPassword, updatedUser.passwordHash);
    console.log(`Password verification: ${passwordTest ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    console.log('\n📝 NEW LOGIN CREDENTIALS:');
    console.log('='.repeat(40));
    console.log(`Email: ${targetEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log(`User Type: ${updatedUser.userType}`);
    console.log(`Status: ${updatedUser.isActive ? 'Active' : 'Inactive'}`);
    console.log(`Email Verified: ${updatedUser.emailVerified ? 'Yes' : 'No'}`);
    
    console.log('\n✅ PASSWORD RESET COMPLETE!');
    console.log('🎯 You can now login with the above credentials');
    
  } catch (error) {
    console.error('❌ Password reset failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetPassword();
