const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateLemongrassRoomPrice() {
  try {
    console.log('🔍 กำลังค้นหาห้อง Lemongrass Room...');
    
    // ค้นหาห้อง Lemongrass Room
    const lemongrassRoomType = await prisma.roomType.findFirst({
      where: {
        name: {
          contains: 'Lemongrass',
          mode: 'insensitive'
        }
      }
    });

    if (!lemongrassRoomType) {
      console.log('❌ ไม่พบห้อง Lemongrass Room ในฐานข้อมูล');
      
      // แสดงห้องทั้งหมดที่มี
      const allRoomTypes = await prisma.roomType.findMany({
        select: {
          id: true,
          name: true,
          baseRate: true
        }
      });
      
      console.log('\n📋 ห้องทั้งหมดในระบบ:');
      allRoomTypes.forEach(room => {
        console.log(`  - ${room.name}: ฿${room.baseRate}`);
      });
      
      return;
    }

    console.log(`✅ พบห้อง: ${lemongrassRoomType.name}`);
    console.log(`📍 ราคาปัจจุบัน: ฿${lemongrassRoomType.baseRate}`);
    
    if (lemongrassRoomType.baseRate == 7500) {
      console.log('✨ ราคาถูกต้องแล้ว (7500 บาท)');
      return;
    }

    // อัพเดทราคา
    console.log('🔄 กำลังอัพเดทราคาเป็น 7500 บาท...');
    
    const updatedRoomType = await prisma.roomType.update({
      where: {
        id: lemongrassRoomType.id
      },
      data: {
        baseRate: 7500
      }
    });

    console.log('✅ อัพเดทราคาสำเร็จ!');
    console.log(`📍 ราคาใหม่: ฿${updatedRoomType.baseRate}`);
    
    // ตรวจสอบอีกครั้ง
    const verifyUpdate = await prisma.roomType.findUnique({
      where: {
        id: lemongrassRoomType.id
      }
    });
    
    console.log(`\n🔍 ยืนยันการอัพเดท:`);
    console.log(`  - ชื่อห้อง: ${verifyUpdate.name}`);
    console.log(`  - ราคา: ฿${verifyUpdate.baseRate}`);
    console.log(`  - สถานะ: ${verifyUpdate.baseRate == 7500 ? '✅ ถูกต้อง' : '❌ ยังผิด'}`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้ฟังก์ชัน
updateLemongrassRoomPrice();