const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRealRoomsData() {
  console.log('🏨 เริ่มสร้างข้อมูลห้องจริงของโรงแรม...');

  try {
    // 1. ลบข้อมูลเก่าทั้งหมด (ต้องลบตามลำดับเพื่อไม่ให้ติด Foreign key)
    console.log('🗑️ กำลังลบข้อมูลเก่า...');
    console.log('   - ลบ Bookings และ related data...');
    await prisma.booking.deleteMany({});
    await prisma.bookingIntent.deleteMany({});
    console.log('   - ลบ Housekeeping และ related data...');
    await prisma.housekeepingTask.deleteMany({});
    await prisma.maintenanceTicket.deleteMany({});
    await prisma.roomImage.deleteMany({});
    await prisma.roomComplementaryItem.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.calendar.deleteMany({});
    await prisma.fileManager.deleteMany({});
    await prisma.housekeepingSchedule.deleteMany({});
    await prisma.roomStatusHistory.deleteMany({});
    await prisma.checkinSession.deleteMany({});
    console.log('   - ลบ Daily Room Rates...');
    await prisma.dailyRoomRate.deleteMany({});
    console.log('   - ลบ Rooms...');
    await prisma.room.deleteMany({});
    console.log('   - ลบ Room Types...');
    await prisma.roomType.deleteMany({});
    console.log('   - ลบ Floor Plans...');
    await prisma.floorPlan.deleteMany({});

    // 2. สร้าง Room Types จริง
    const realRoomTypes = [
      {
        name: 'Private House',
        description: 'บ้านส่วนตัวสำหรับครอบครอบใหญ่ พื้นที่กว้างขวาง',
        baseRate: 35000.00,
        capacityAdults: 6,
        capacityChildren: 4,
        sizeSqm: 200.0,
        bedType: 'Multiple King Beds',
        amenities: {
          features: ['Private Kitchen', 'Living Room', 'Multiple Bedrooms', 'Private Garden', 'Parking', 'Free WiFi', 'Air Conditioning']
        }
      },
      {
        name: 'Grand Serenity',
        description: 'ห้องพักระดับ Grand Serenity หรูหราสุดพิเศษ',
        baseRate: 15000.00,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 85.0,
        bedType: 'King Bed',
        amenities: {
          features: ['Premium Amenities', 'Sea View', 'Private Balcony', 'Premium Mini Bar', 'Butler Service', 'Free WiFi', 'Air Conditioning']
        }
      },
      {
        name: 'Serenity Villa',
        description: 'วิลล่าเซเรนิตี้ ที่พักสงบร่มรื่น',
        baseRate: 8000.00,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 60.0,
        bedType: 'King Bed',
        amenities: {
          features: ['Private Villa', 'Garden View', 'Private Terrace', 'Mini Bar', 'Free WiFi', 'Air Conditioning']
        }
      },
      {
        name: 'Onsen Villa',
        description: 'วิลล่าออนเซ็น พร้อมบ่อน้ำร้อนส่วนตัว',
        baseRate: 12000.00,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 70.0,
        bedType: 'King Bed',
        amenities: {
          features: ['Private Onsen', 'Hot Spring Bath', 'Private Villa', 'Garden View', 'Mini Bar', 'Free WiFi', 'Air Conditioning']
        }
      }
    ];

    console.log('📋 กำลังสร้าง Room Types จริง...');
    const createdRoomTypes = {};
    
    for (const roomType of realRoomTypes) {
      const created = await prisma.roomType.create({
        data: roomType
      });
      createdRoomTypes[roomType.name] = created;
      console.log(`   ✅ สร้าง ${roomType.name} สำเร็จ (${roomType.baseRate} บาท/คืน)`);
    }

    // 3. สร้างข้อมูลห้องจริงตามรายการที่ให้มา
    console.log('🚪 กำลังสร้างห้องจริง...');
    const realRooms = [
      // Private House
      {
        roomNumber: 'PH-1',
        roomTypeId: createdRoomTypes['Private House'].id,
        status: 'Available',
        housekeepingStatus: 'Clean',
        notes: 'บ้านส่วนตัวหลังเดียว'
      },
      
      // Grand Serenity Rooms
      {
        roomNumber: 'F3',
        roomTypeId: createdRoomTypes['Grand Serenity'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      {
        roomNumber: 'F2',
        roomTypeId: createdRoomTypes['Grand Serenity'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      {
        roomNumber: 'F1',
        roomTypeId: createdRoomTypes['Grand Serenity'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      
      // Serenity Villa Rooms
      {
        roomNumber: 'E3',
        roomTypeId: createdRoomTypes['Serenity Villa'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      {
        roomNumber: 'E2',
        roomTypeId: createdRoomTypes['Serenity Villa'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      {
        roomNumber: 'E1',
        roomTypeId: createdRoomTypes['Serenity Villa'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      
      // Onsen Villa Rooms
      {
        roomNumber: 'D1',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      {
        roomNumber: 'C2',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      {
        roomNumber: 'C1',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      {
        roomNumber: 'B2',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      },
      {
        roomNumber: 'B1',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      }
    ];

    console.log(`📝 กำลังสร้าง ${realRooms.length} ห้องจริง...`);
    
    for (const room of realRooms) {
      await prisma.room.create({ data: room });
      console.log(`   ✅ สร้างห้อง ${room.roomNumber} สำเร็จ`);
    }

    // 4. สรุปผลลัพธ์
    const totalRoomTypes = await prisma.roomType.count();
    const totalRooms = await prisma.room.count();

    console.log('\n🎉 สรุปข้อมูลห้องจริงในระบบ:');
    console.log(`   📋 ประเภทห้อง: ${totalRoomTypes} ประเภท`);
    console.log(`   🚪 ห้องพัก: ${totalRooms} ห้อง`);

    // แสดงรายละเอียดห้องแต่ละประเภท
    console.log('\n📊 จำนวนห้องจริงแต่ละประเภท:');
    for (const [typeName, roomType] of Object.entries(createdRoomTypes)) {
      const count = await prisma.room.count({
        where: { roomTypeId: roomType.id }
      });
      console.log(`   ${typeName}: ${count} ห้อง (${roomType.baseRate} บาท/คืน)`);
      
      // แสดงเลขห้อง
      const rooms = await prisma.room.findMany({
        where: { roomTypeId: roomType.id },
        select: { roomNumber: true }
      });
      const roomNumbers = rooms.map(r => r.roomNumber).join(', ');
      console.log(`     ห้อง: ${roomNumbers}`);
    }

    console.log('\n✨ ระบบพร้อมใช้งานกับข้อมูลห้องจริงแล้ว!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างข้อมูลห้องจริง:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้งานฟังก์ชัน
if (require.main === module) {
  seedRealRoomsData()
    .then(() => {
      console.log('🎯 อัพเดทข้อมูลห้องจริงเสร็จสิ้น!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 เกิดข้อผิดพลาด:', error);
      process.exit(1);
    });
}

module.exports = { seedRealRoomsData };
