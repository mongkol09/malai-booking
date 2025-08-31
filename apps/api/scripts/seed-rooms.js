const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRoomsAndRoomTypes() {
  console.log('🌱 เริ่มสร้างข้อมูลทดสอบห้องและประเภทห้อง...');

  try {
    // 1. สร้าง Room Types
    const roomTypes = [
      {
        name: 'Standard Room',
        description: 'ห้องพักมาตรฐาน พร้อมเตียงเดี่ยวหรือเตียงคู่',
        baseRate: 1500.00,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 25.0,
        bedType: 'Queen Bed',
        amenities: {
          features: ['Air Conditioning', 'Free WiFi', 'TV', 'Mini Fridge', 'Private Bathroom']
        }
      },
      {
        name: 'Deluxe Room',
        description: 'ห้องพักระดับดีลักซ์ กว้างขวางและสิ่งอำนวยความสะดวกครบครัน',
        baseRate: 2500.00,
        capacityAdults: 2,
        capacityChildren: 2,
        sizeSqm: 35.0,
        bedType: 'King Bed',
        amenities: {
          features: ['Air Conditioning', 'Free WiFi', 'Smart TV', 'Mini Bar', 'Private Bathroom', 'Balcony', 'Safe Box']
        }
      },
      {
        name: 'Suite Room',
        description: 'ห้องสวีท หรูหราและพื้นที่กว้างขวาง',
        baseRate: 4500.00,
        capacityAdults: 4,
        capacityChildren: 2,
        sizeSqm: 65.0,
        bedType: 'King Bed + Sofa Bed',
        amenities: {
          features: ['Air Conditioning', 'Free WiFi', 'Smart TV', 'Mini Bar', 'Private Bathroom', 'Living Room', 'Kitchenette', 'Balcony', 'Safe Box']
        }
      },
      {
        name: 'Grand Serenity',
        description: 'ห้องพักระดับ Grand Serenity สำหรับผู้ที่ต้องการความหรูหราสูงสุด',
        baseRate: 8500.00,
        capacityAdults: 4,
        capacityChildren: 2,
        sizeSqm: 95.0,
        bedType: 'King Bed + Living Area',
        amenities: {
          features: ['Air Conditioning', 'Free WiFi', 'Premium Smart TV', 'Premium Mini Bar', 'Luxury Bathroom', 'Private Living Room', 'Full Kitchenette', 'Large Balcony', 'Premium Safe Box', 'Butler Service']
        }
      }
    ];

    console.log('📋 กำลังสร้าง Room Types...');
    const createdRoomTypes = [];
    
    for (const roomType of roomTypes) {
      const existing = await prisma.roomType.findFirst({
        where: { name: roomType.name }
      });
      
      if (!existing) {
        const created = await prisma.roomType.create({
          data: roomType
        });
        createdRoomTypes.push(created);
        console.log(`   ✅ สร้าง ${roomType.name} สำเร็จ`);
      } else {
        createdRoomTypes.push(existing);
        console.log(`   ⏭️  ${roomType.name} มีอยู่แล้ว`);
      }
    }

    // 2. สร้าง Floor Plan
    console.log('🏢 กำลังสร้าง Floor Plans...');
    const floorPlans = [
      { floorNumber: 1, floorName: 'ชั้น 1 - ล็อบบี้', totalRooms: 10 },
      { floorNumber: 2, floorName: 'ชั้น 2 - Standard', totalRooms: 15 },
      { floorNumber: 3, floorName: 'ชั้น 3 - Deluxe', totalRooms: 12 },
      { floorNumber: 4, floorName: 'ชั้น 4 - Suite', totalRooms: 8 }
    ];

    const createdFloorPlans = [];
    for (const floor of floorPlans) {
      const existing = await prisma.floorPlan.findFirst({
        where: { floorNumber: floor.floorNumber }
      });
      
      if (!existing) {
        const created = await prisma.floorPlan.create({ data: floor });
        createdFloorPlans.push(created);
        console.log(`   ✅ สร้าง ${floor.floorName} สำเร็จ`);
      } else {
        createdFloorPlans.push(existing);
        console.log(`   ⏭️  ${floor.floorName} มีอยู่แล้ว`);
      }
    }

    // 3. สร้าง Rooms
    console.log('🚪 กำลังสร้าง Rooms...');
    const rooms = [];
    
    // Standard Rooms (ชั้น 2)
    const standardRoomType = createdRoomTypes.find(rt => rt.name === 'Standard Room');
    const floor2 = createdFloorPlans.find(fp => fp.floorNumber === 2);
    for (let i = 201; i <= 215; i++) {
      rooms.push({
        roomNumber: i.toString(),
        roomTypeId: standardRoomType.id,
        floorPlanId: floor2.id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      });
    }

    // Deluxe Rooms (ชั้น 3)
    const deluxeRoomType = createdRoomTypes.find(rt => rt.name === 'Deluxe Room');
    const floor3 = createdFloorPlans.find(fp => fp.floorNumber === 3);
    for (let i = 301; i <= 312; i++) {
      rooms.push({
        roomNumber: i.toString(),
        roomTypeId: deluxeRoomType.id,
        floorPlanId: floor3.id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      });
    }

    // Suite Rooms (ชั้น 4)
    const suiteRoomType = createdRoomTypes.find(rt => rt.name === 'Suite Room');
    const grandSerenityRoomType = createdRoomTypes.find(rt => rt.name === 'Grand Serenity');
    const floor4 = createdFloorPlans.find(fp => fp.floorNumber === 4);
    
    // Suite Rooms 401-405
    for (let i = 401; i <= 405; i++) {
      rooms.push({
        roomNumber: i.toString(),
        roomTypeId: suiteRoomType.id,
        floorPlanId: floor4.id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      });
    }

    // Grand Serenity Rooms 406-408
    for (let i = 406; i <= 408; i++) {
      rooms.push({
        roomNumber: i.toString(),
        roomTypeId: grandSerenityRoomType.id,
        floorPlanId: floor4.id,
        status: 'Available',
        housekeepingStatus: 'Clean'
      });
    }

    console.log(`📝 กำลังสร้าง ${rooms.length} ห้อง...`);
    let createdCount = 0;
    
    for (const room of rooms) {
      const existing = await prisma.room.findFirst({
        where: { roomNumber: room.roomNumber }
      });
      
      if (!existing) {
        await prisma.room.create({ data: room });
        createdCount++;
        if (createdCount % 5 === 0) {
          console.log(`   ✅ สร้างห้องแล้ว ${createdCount}/${rooms.length}`);
        }
      }
    }

    console.log(`✅ สร้างห้องใหม่ทั้งหมด ${createdCount} ห้อง`);

    // 4. สรุปผลลัพธ์
    const totalRoomTypes = await prisma.roomType.count();
    const totalRooms = await prisma.room.count();
    const totalFloorPlans = await prisma.floorPlan.count();

    console.log('\n🎉 สรุปข้อมูลในระบบ:');
    console.log(`   📋 ประเภทห้อง: ${totalRoomTypes} ประเภท`);
    console.log(`   🚪 ห้องพัก: ${totalRooms} ห้อง`);
    console.log(`   🏢 ชั้น: ${totalFloorPlans} ชั้น`);

    // แสดงรายละเอียดห้องแต่ละประเภท
    console.log('\n📊 จำนวนห้องแต่ละประเภท:');
    for (const roomType of createdRoomTypes) {
      const count = await prisma.room.count({
        where: { roomTypeId: roomType.id }
      });
      console.log(`   ${roomType.name}: ${count} ห้อง (${roomType.baseRate} บาท/คืน)`);
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างข้อมูล:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้งานฟังก์ชัน
if (require.main === module) {
  seedRoomsAndRoomTypes()
    .then(() => {
      console.log('🎯 สร้างข้อมูลทดสอบเสร็จสิ้น!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 เกิดข้อผิดพลาด:', error);
      process.exit(1);
    });
}

module.exports = { seedRoomsAndRoomTypes };
