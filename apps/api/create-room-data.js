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
    
    // 2. สร้าง Room Types ใหม่
    console.log('📋 สร้าง Room Types...');
    
    const roomTypesData = [
      {
        name: 'Cinnamon Room',
        description: 'ห้องซินนามอน - ห้องพักหรูพร้อมสิ่งอำนวยความสะดวกครบครัน',
        baseRate: 15000, // แก้เป็น baseRate
        capacityAdults: 2, // แก้เป็น capacityAdults
        bedType: 'King Bed',
        sizeSqm: 35, // แก้เป็น sizeSqm
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV'],
        imageUrl: 'cinnamon-room-1.jpg'
      },
      {
        name: 'Basil Room',
        description: 'ห้องโหระพา - ห้องพักสุดหรูในบรรยากาศธรรมชาติ',
        baseRate: 15000,
        capacityAdults: 2,
        bedType: 'King Bed',
        sizeSqm: 30,
        amenities: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Balcony', 'TV'],
        imageUrl: 'basil-room-1.jpg'
        roomSize: 35,
        features: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV'],
        images: ['basil-room-1.jpg']
      },
      {
        name: 'Bergamot Room',
        description: 'ห้องมะกรูด - ห้องพักหรูสไตล์ไทยร่วมสมัย',
        basePrice: 15000,
        maxGuests: 2,
        bedType: 'King Bed',
        roomSize: 35,
        features: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV'],
        images: ['bergamot-room-1.jpg']
      },
      {
        name: 'Jasmine Room',
        description: 'ห้องมะลิ - ห้องพักสไตล์คลาสสิกพร้อมกลิ่นหอมของมะลิ',
        basePrice: 15000,
        maxGuests: 2,
        bedType: 'King Bed',
        roomSize: 35,
        features: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV'],
        images: ['jasmine-room-1.jpg']
      },
      {
        name: 'Rose Room',
        description: 'ห้องกุหลาบ - ห้องพักโรแมนติกสำหรับคู่รัก',
        basePrice: 15000,
        maxGuests: 2,
        bedType: 'King Bed',
        roomSize: 35,
        features: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Mini Bar', 'TV'],
        images: ['rose-room-1.jpg']
      },
      {
        name: 'Ginger Room',
        description: 'ห้องขิง - ห้องพักสบายพร้อมสมุนไพรขิงหอมกรุ่น',
        basePrice: 7500,
        maxGuests: 2,
        bedType: 'Queen Bed',
        roomSize: 25,
        features: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'TV'],
        images: ['ginger-room-1.jpg']
      },
      {
        name: 'Lemongrass Room',
        description: 'ห้องตะไคร้ - ห้องพักแสนสบายพร้อมกลิ่นหอมของตะไคร้',
        basePrice: 7500,
        maxGuests: 2,
        bedType: 'Queen Bed',
        roomSize: 25,
        features: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'TV'],
        images: ['lemongrass-room-1.jpg']
      },
      {
        name: 'Private House',
        description: 'บ้านส่วนตัว - บ้านพักเดี่ยวขนาดใหญ่สำหรับครอบครัว',
        basePrice: 28900,
        maxGuests: 6,
        bedType: 'Multiple Beds',
        roomSize: 80,
        features: ['Air Conditioning', 'Private Bathroom', 'Wi-Fi', 'Kitchen', 'Living Room', 'Private Pool'],
        images: ['private-house-1.jpg']
      }
    ];

    const createdRoomTypes = [];
    for (const roomTypeData of roomTypesData) {
      const roomType = await prisma.roomType.create({
        data: {
          name: roomTypeData.name,
          description: roomTypeData.description,
          baseRate: roomTypeData.basePrice,  // ใช้ baseRate แทน basePrice
          capacityAdults: roomTypeData.maxGuests,
          capacityChildren: 0,
          sizeSqm: roomTypeData.roomSize,
          bedType: roomTypeData.bedType,
          amenities: roomTypeData.features,
          isActive: true
        }
      });
      createdRoomTypes.push(roomType);
      console.log(`✅ สร้าง Room Type: ${roomType.name} (${roomType.baseRate} บาท)`);
    }

    // 3. สร้างห้องพักตามจำนวนที่กำหนด
    console.log('\n🏠 สร้างห้องพัก...');
    
    const roomsToCreate = [
      // Cinnamon Room - 1 หลัง
      { roomTypeId: createdRoomTypes[0].id, roomNumber: 'C1' },
      
      // Basil Room - 1 หลัง
      { roomTypeId: createdRoomTypes[1].id, roomNumber: 'B1' },
      
      // Bergamot Room (B สมุนไพรไทย) - 1 หลัง  
      { roomTypeId: createdRoomTypes[2].id, roomNumber: 'B2' },
      
      // Jasmine Room - 1 หลัง
      { roomTypeId: createdRoomTypes[3].id, roomNumber: 'C2' },
      
      // Rose Room - 1 หลัง
      { roomTypeId: createdRoomTypes[4].id, roomNumber: 'D1' },
      
      // Ginger Room - 3 หลัง
      { roomTypeId: createdRoomTypes[5].id, roomNumber: 'E1' },
      { roomTypeId: createdRoomTypes[5].id, roomNumber: 'E2' },
      { roomTypeId: createdRoomTypes[5].id, roomNumber: 'E3' },
      
      // Lemongrass Room - 3 หลัง
      { roomTypeId: createdRoomTypes[6].id, roomNumber: 'F1' },
      { roomTypeId: createdRoomTypes[6].id, roomNumber: 'F2' },
      { roomTypeId: createdRoomTypes[6].id, roomNumber: 'F3' },
      
      // Private House - 1 หลัง
      { roomTypeId: createdRoomTypes[7].id, roomNumber: 'PH01' }
    ];

    const createdRooms = [];
    for (const roomData of roomsToCreate) {
      const room = await prisma.room.create({
        data: {
          roomNumber: roomData.roomNumber,
          status: 'Available',
          roomTypeId: roomData.roomTypeId,
          notes: `ห้อง ${roomData.roomNumber} พร้อมให้บริการ`
        },
        include: {
          roomType: true
        }
      });
      createdRooms.push(room);
      console.log(`✅ สร้างห้อง: ${room.roomNumber} (${room.roomType.name}) - ${room.roomType.baseRate} บาท`);
    }

    // 4. สร้าง Daily Room Rates สำหรับปีนี้
    console.log('\n💰 สร้างราคาห้องรายวัน...');
    
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    let currentDate = new Date(startDate);
    
    const dailyRates = [];
    while (currentDate <= endDate) {
      for (const roomType of createdRoomTypes) {
        dailyRates.push({
          roomTypeId: roomType.id,
          date: new Date(currentDate),
          currentRate: roomType.baseRate, // ใช้ currentRate
          availability: 5 // ตั้งค่าห้องว่าง 5 ห้องต่อวัน
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Insert daily rates in batches
    const batchSize = 100;
    for (let i = 0; i < dailyRates.length; i += batchSize) {
      const batch = dailyRates.slice(i, i + batchSize);
      await prisma.dailyRoomRate.createMany({
        data: batch,
        skipDuplicates: true
      });
    }
    
    console.log(`✅ สร้างราคาห้องรายวัน ${dailyRates.length} รายการ`);

    // 5. สรุปผลลัพธ์
    console.log('\n🎯 ===== สรุปข้อมูลห้องพักที่สร้าง =====');
    
    const summary = await prisma.roomType.findMany({
      include: {
        rooms: {
          select: {
            roomNumber: true,
            status: true
          }
        },
        _count: {
          select: {
            rooms: true
          }
        }
      },
      orderBy: {
        baseRate: 'desc'
      }
    });

    summary.forEach((roomType, index) => {
      console.log(`${index + 1}. ${roomType.name}`);
      console.log(`   💰 ราคา: ${roomType.baseRate.toLocaleString()} บาท`);
      console.log(`   🏠 จำนวนห้อง: ${roomType._count.rooms} ห้อง`);
      console.log(`   🚪 หมายเลขห้อง: ${roomType.rooms.map(r => r.roomNumber).join(', ')}`);
      console.log('');
    });

    console.log('🎉 สร้างข้อมูลห้องพักเสร็จสิ้น!');
    
    return {
      roomTypes: createdRoomTypes.length,
      rooms: createdRooms.length,
      dailyRates: dailyRates.length
    };

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// รันสคริปต์
if (require.main === module) {
  createRoomData()
    .then((result) => {
      console.log(`\n✅ สำเร็จ! สร้าง ${result.roomTypes} ประเภทห้อง, ${result.rooms} ห้องพัก, ${result.dailyRates} ราคารายวัน`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 ล้มเหลว:', error);
      process.exit(1);
    });
}

module.exports = { createRoomData };