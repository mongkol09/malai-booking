const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('🔐 Reset Password for Test User...');
    console.log('');
    
    const email = 'mongkol03su@gmail.com';
    const newPassword = 'newpassword123';
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    console.log('🔐 Hash:', hashedPassword.substring(0, 30) + '...');
    console.log('');
    
    // Update user password
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { 
        passwordHash: hashedPassword,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        userType: true,
        isActive: true
      }
    });
    
    console.log('✅ Password updated successfully!');
    console.log('📋 User details:');
    console.log('  🆔 ID:', updatedUser.id);
    console.log('  📧 Email:', updatedUser.email);
    console.log('  👤 Role:', updatedUser.userType);
    console.log('  ✅ Active:', updatedUser.isActive);
    console.log('');
    console.log('🎯 Ready for testing!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
