const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updateUserPassword() {
  try {
    console.log('🔑 อัปเดต Password สำหรับ User...\n');

    // 1. ค้นหา user
    const existingUser = await prisma.user.findUnique({
      where: { email: 'mongkol03su@gmail.com' }
    });

    if (!existingUser) {
      console.log('❌ ไม่พบ user ที่ต้องการ');
      return;
    }

    console.log('👤 พบ User:');
    console.log(`   📧 Email: ${existingUser.email}`);
    console.log(`   🔑 Role: ${existingUser.userType}`);
    console.log(`   👤 Name: ${existingUser.firstName} ${existingUser.lastName}`);

    // 2. Hash password ใหม่
    const newPassword = 'Aa123456**';
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 3. อัปเดต password
    const updatedUser = await prisma.user.update({
      where: { email: 'mongkol03su@gmail.com' },
      data: {
        passwordHash: newPasswordHash,
        userType: 'DEV', // อัปเดต role ให้เป็น DEV
        isActive: true
      }
    });

    console.log('\n✅ อัปเดต User สำเร็จ!');
    console.log(`   📧 Email: ${updatedUser.email}`);
    console.log(`   🔑 New Role: ${updatedUser.userType}`);
    console.log(`   👤 Name: ${updatedUser.firstName} ${updatedUser.lastName}`);

    // 4. ตรวจสอบ users ทั้งหมด
    console.log('\n👥 รายการ Users ทั้งหมดในระบบ:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true
      }
    });

    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.userType}) - ${user.firstName} ${user.lastName}`);
      console.log(`      Status: ${user.isActive ? 'Active' : 'Inactive'} | Created: ${user.createdAt.toLocaleDateString('th-TH')}`);
    });

    console.log('\n🔐 ข้อมูลสำหรับเข้าสู่ระบบ:');
    console.log('─────────────────────────────────────');
    console.log(`📧 Email: mongkol03su@gmail.com`);
    console.log(`🔑 Password: Aa123456**`);
    console.log(`👨‍💻 Role: DEV`);
    console.log('─────────────────────────────────────');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการอัปเดต user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้ function
updateUserPassword().catch(console.error);