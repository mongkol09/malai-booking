const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRoomData() {
  console.log('🏨 ===== สร้างข้อมูลห้องพักใหม่ =====');
  
  try {
    // 1. ลบข้อมูลห้องเก่าก่อน (ถ้ามี) ตามลำดับ foreign key
    console.log('🗑️ ลบข้อมูลห้องเก่า...');
    
    // ลบ Daily Availability ก่อน
    await prisma.dailyAvailability.deleteMany({});
    console.log('✅ ลบ Daily Availability แล้ว');
    
    // ลบ Daily Room Rates
    await prisma.dailyRoomRate.deleteMany({});
    console.log('✅ ลบ Daily Room Rates แล้ว');
    
    // ลบ Bookings ที่เกี่ยวข้อง
    await prisma.booking.deleteMany({});
    console.log('✅ ลบ Bookings แล้ว');
    
    // ลบ Rooms
    await prisma.room.deleteMany({});
    console.log('✅ ลบ Rooms แล้ว');
    
    // ลบ Room Types
    await prisma.roomType.deleteMany({});
    console.log('✅ ลบ Room Types แล้ว');
    
    // 2. สร้าง Room Types ใหม่ (ตรงกับ Prisma schema)
    console.log('📋 สร้าง Room Types...');
    
    const roomTypesData = [
      {
        name: 'Cinnamon Room',
        description: 'ห้องซินนามอน - ห้องพักหรูพร้อมสิ่งอำนวยความสะดวกครบครัน',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 0,
        bedType: 'King Bed',
        sizeSqm: 35,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV'],
        imageUrl: 'cinnamon-room-1.jpg'
      },
      {
        name: 'Basil Room',
        description: 'ห้องโหระพา - ห้องพักสุดหรูในบรรยากาศธรรมชาติ',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 0,
        bedType: 'King Bed',
        sizeSqm: 30,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Balcony', 'TV'],
        imageUrl: 'basil-room-1.jpg'
      },
      {
        name: 'Cardamom Room',
        description: 'ห้องกะเทย - ห้องพักพรีเมียมที่ผสมผสานความหรูหราและความสบาย',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 0,
        bedType: 'King Bed',
        sizeSqm: 32,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV', 'Balcony'],
        imageUrl: 'cardamom-room-1.jpg'
      },
      {
        name: 'Clove Room',
        description: 'ห้องกานพลู - ห้องพักหรูระดับพรีเมียม',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 0,
        bedType: 'King Bed',
        sizeSqm: 28,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'TV'],
        imageUrl: 'clove-room-1.jpg'
      },
      {
        name: 'Ginger Room',
        description: 'ห้องขิง - ห้องพักสไตล์โมเดิร์นผสมผสานวัฒนธรรมไทย',
        baseRate: 7500, // แก้ไขราคาให้เหมาะสม
        capacityAdults: 1,
        capacityChildren: 0,
        bedType: 'Queen Bed',
        sizeSqm: 25,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'TV'],
        imageUrl: 'ginger-room-1.jpg'
      },
      {
        name: 'Rose Room',
        description: 'ห้องกุหลาบ - ห้องพักสุดหรูในบรรยากาศโรแมนติก',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 0,
        bedType: 'King Bed',
        sizeSqm: 30,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV'],
        imageUrl: 'rose-room-1.jpg'
      },
      {
        name: 'Kaffir Lime Room',
        description: 'ห้องมะกรูด - ห้องพักขนาดกะทัดรัดแต่ครบครัน',
        baseRate: 7500,
        capacityAdults: 1,
        capacityChildren: 0,
        bedType: 'Queen Bed',
        sizeSqm: 22,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'TV'],
        imageUrl: 'kaffir-lime-room-1.jpg'
      },
      {
        name: 'Lemongrass Room',
        description: 'ห้องตะไคร้ - ห้องพักสำหรับนักเดินทางเดี่ยว',
        baseRate: 7500,
        capacityAdults: 1,
        capacityChildren: 0,
        bedType: 'Queen Bed',
        sizeSqm: 22,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'TV'],
        imageUrl: 'lemongrass-room-1.jpg'
      },
      {
        name: 'Malai Private',
        description: 'เพนท์เฮาส์สมุนไพรไทย - ห้องพักหรูระดับสูงสุดพร้อมวิวพาโนราม่า',
        baseRate: 28900,
        capacityAdults: 4,
        capacityChildren: 2,
        bedType: 'King Bed + Sofa Bed',
        sizeSqm: 85,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV', 'Balcony', 'Kitchen', 'Living Room'],
        imageUrl: 'thai-herbs-penthouse-1.jpg'
      }
    ];

    const createdRoomTypes = [];
    for (const roomTypeData of roomTypesData) {
      const roomType = await prisma.roomType.create({
        data: roomTypeData
      });
      createdRoomTypes.push(roomType);
      console.log(`✅ สร้าง Room Type: ${roomType.name}`);
    }

    // 3. สร้าง Rooms
    console.log('🚪 สร้าง Rooms...');
    
    const roomsData = [
      // Cinnamon Room
      { roomTypeId: createdRoomTypes[0].id, roomNumber: 'C1' },
      
      // Basil Room
      { roomTypeId: createdRoomTypes[1].id, roomNumber: 'B1' },
      
      // Cardamom Room
      { roomTypeId: createdRoomTypes[2].id, roomNumber: 'B2' },
      
      // Clove Room
      { roomTypeId: createdRoomTypes[3].id, roomNumber: 'C2' },
      
      // Ginger Room (3 ห้อง: E1, E2, E3)
      { roomTypeId: createdRoomTypes[4].id, roomNumber: 'E1' },
      { roomTypeId: createdRoomTypes[4].id, roomNumber: 'E2' },
      { roomTypeId: createdRoomTypes[4].id, roomNumber: 'E3' },
      
      // Rose Room (ห้อง D1)
      { roomTypeId: createdRoomTypes[5].id, roomNumber: 'D1' },
      
      // Kaffir Lime Room - ไม่มีห้องในการจัดสรรนี้
      
      // Lemongrass Room (3 ห้อง: F1, F2, F3)
      { roomTypeId: createdRoomTypes[7].id, roomNumber: 'F1' },
      { roomTypeId: createdRoomTypes[7].id, roomNumber: 'F2' },
      { roomTypeId: createdRoomTypes[7].id, roomNumber: 'F3' },
      
      // Thai Herbs Penthouse
      { roomTypeId: createdRoomTypes[8].id, roomNumber: 'PH01' }
    ];

    const createdRooms = [];
    for (const roomData of roomsData) {
      const room = await prisma.room.create({
        data: {
          roomNumber: roomData.roomNumber,
          roomTypeId: roomData.roomTypeId,
          status: 'Available'
        }
      });
      createdRooms.push(room);
      console.log(`✅ สร้าง Room: ${room.roomNumber}`);
    }

    // 4. สร้าง Daily Room Rates
    console.log('📊 กำลังสร้างข้อมูล Daily Room Rates...');
    
    // สร้าง Daily Rates สำหรับช่วงวันที่ 1-13 มกราคม 2024
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-13');
    let currentDate = new Date(startDate);
    
    const dailyRates = [];
    while (currentDate <= endDate) {
      for (const roomType of createdRoomTypes) {
        dailyRates.push({
          roomTypeId: roomType.id,
          date: new Date(currentDate),
          currentRate: roomType.baseRate,
          availability: 5
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await prisma.dailyRoomRate.createMany({
      data: dailyRates,
      skipDuplicates: true
    });

    console.log(`✅ สร้าง Daily Room Rates สำเร็จ ${dailyRates.length} รายการ`);

    // แสดงสรุปข้อมูลที่สร้าง
    console.log('\n📋 สรุปข้อมูลที่สร้าง:');
    console.log(`🏨 Room Types: ${createdRoomTypes.length} ประเภท`);
    console.log(`🚪 Rooms: ${createdRooms.length} ห้อง`);
    console.log(`📅 Daily Rates: ${dailyRates.length} รายการ`);
    
    // แสดงรายละเอียด Room Types
    console.log('\n🏨 รายละเอียด Room Types:');
    for (const roomType of createdRoomTypes) {
      const roomCount = createdRooms.filter(room => room.roomTypeId === roomType.id).length;
      console.log(`  ${roomType.name}: ${roomType.baseRate} บาท (${roomCount} ห้อง)`);
    }
    
    // แสดงรายละเอียด Rooms
    console.log('\n🚪 รายละเอียด Rooms:');
    const rooms = await prisma.room.findMany({
      include: {
        roomType: {
          select: {
            name: true,
            baseRate: true
          }
        }
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });
    
    for (const room of rooms) {
      console.log(`  ห้อง ${room.roomNumber}: ${room.roomType.name} (${room.roomType.baseRate} บาท)`);
    }
    
    console.log('\n🎉 สร้างข้อมูลโรงแรมเสร็จสิ้น!');

  } catch (error) {
    console.error('💥 ล้มเหลว:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRoomData();