// ============================================
// RESET USER PASSWORD SCRIPT
// ============================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('🔧 กำลังรีเซ็ต password สำหรับ mongkol03su@gmail.com...');
    console.log('');
    
    const email = 'mongkol03su@gmail.com';
    const newPassword = 'password123'; // Demo password
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        passwordHash,
        updatedAt: new Date()
      },
      select: {
        email: true,
        userType: true,
        firstName: true,
        lastName: true
      }
    });
    
    console.log('✅ Password รีเซ็ตเรียบร้อย!');
    console.log('');
    console.log('🔐 Demo Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${newPassword}`);
    console.log(`🏷️  Role: ${updatedUser.userType}`);
    console.log(`👤 Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🚀 ตอนนี้สามารถ login ได้แล้ว!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run reset
resetPassword().catch(console.error);
