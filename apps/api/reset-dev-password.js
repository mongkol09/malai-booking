const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetDevPassword() {
  try {
    console.log('🔧 Resetting Dev user password...');
    
    const email = 'mongkol03su@gmail.com';
    const newPassword = 'Aa123456**';
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    // Update user password
    const updatedUser = await prisma.user.update({
      where: {
        email: email
      },
      data: {
        passwordHash: passwordHash
      }
    });

    console.log('✅ Password reset successful!');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    console.log('👤 User Type:', updatedUser.userType);
    console.log('🆔 User ID:', updatedUser.id);

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDevPassword();
