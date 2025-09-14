const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createNewUser() {
  try {
    console.log('👤 สร้าง User ใหม่สำหรับเข้าใช้งาน...\n');

    // 1. Hash password
    const password = 'Aa123456**';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 2. สร้าง user ใหม่
    const newUser = await prisma.user.create({
      data: {
        email: 'mongkol03su@gmail.com',
        passwordHash: passwordHash,
        userType: 'DEV',
        firstName: 'มงคล',
        lastName: 'สุวรรณศรี',
        phoneNumber: '0896136301',
        isActive: true
      }
    });

    console.log('✅ สร้าง User ใหม่สำเร็จ!');
    console.log(`   📧 Email: ${newUser.email}`);
    console.log(`   🔑 Role: ${newUser.userType}`);
    console.log(`   👤 Name: ${newUser.firstName} ${newUser.lastName}`);
    console.log(`   📱 Phone: ${newUser.phoneNumber}`);
    console.log(`   🆔 User ID: ${newUser.id}`);

    // 3. ตรวจสอบ users ทั้งหมดในระบบ
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
    if (error.code === 'P2002') {
      console.log('⚠️  User นี้มีอยู่แล้วในระบบ!');
      console.log('   ลองใช้ email อื่น หรือลบ user เดิมก่อน');
    } else {
      console.error('❌ เกิดข้อผิดพลาดในการสร้าง user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้ function
createNewUser().catch(console.error);