// Update hotel room data to match real accommodation
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRealRoomData() {
  console.log('🏨 Updating hotel room data to match real accommodation...\n');
  
  try {
    // 1. Clear existing data (in correct order to avoid foreign key constraints)
    console.log('🧹 Clearing existing room data...');
    await prisma.booking.deleteMany({});
    await prisma.guest.deleteMany({});
    await prisma.housekeepingTask.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.roomType.deleteMany({});
    console.log('✅ Cleared existing data');
    
    // 2. Create real room types
    console.log('\n🏠 Creating real room types...');
    
    // Private House
    const privateHouse = await prisma.roomType.create({
      data: {
        name: 'Private House',
        description: 'บ้านส่วนตัว 3 ห้องนอน เตียง King size 3 เตียง รองรับได้ถึง 6 คน',
        baseRate: 30000.00,
        capacityAdults: 6,
        capacityChildren: 2,
        amenities: ['3 ห้องนอน', 'เตียง King size 3 เตียง', 'WiFi', 'แอร์', 'ครัว', 'ห้องนั่งเล่น'],
        sizeSqm: 150.00,
        isActive: true
      }
    });
    console.log('✅ Created Private House room type');
    
    // Onsen Villa
    const onsenVilla = await prisma.roomType.create({
      data: {
        name: 'Onsen Villa',
        description: 'วิลล่าพร้อมบ่อออนเซ็นส่วนตัว สำหรับการพักผ่อนแบบพรีเมียม',
        baseRate: 18000.00,
        capacityAdults: 4,
        capacityChildren: 2,
        amenities: ['บ่อออนเซ็นส่วนตัว', 'WiFi', 'แอร์', 'ทีวี', 'มินิบาร์', 'ระเบียง'],
        sizeSqm: 80.00,
        isActive: true
      }
    });
    console.log('✅ Created Onsen Villa room type');
    
    // Serenity Villa
    const serenityVilla = await prisma.roomType.create({
      data: {
        name: 'Serenity Villa',
        description: 'วิลล่าสงบ เหมาะสำหรับการพักผ่อนในบรรยากาศเงียบสงบ',
        baseRate: 8000.00,
        capacityAdults: 3,
        capacityChildren: 1,
        amenities: ['WiFi', 'แอร์', 'ทีวี', 'ตู้เซฟ', 'ระเบียง', 'วิวธรรมชาติ'],
        sizeSqm: 50.00,
        isActive: true
      }
    });
    console.log('✅ Created Serenity Villa room type');
    
    // Grand Serenity
    const grandSerenity = await prisma.roomType.create({
      data: {
        name: 'Grand Serenity',
        description: 'วิลล่าขนาดใหญ่ในบรรยากาศเงียบสงบ พร้อมสิ่งอำนวยความสะดวกครบครัน',
        baseRate: 8500.00,
        capacityAdults: 3,
        capacityChildren: 1,
        amenities: ['WiFi', 'แอร์', 'ทีวี', 'ตู้เซฟ', 'มินิบาร์', 'ระเบียง', 'วิวธรรมชาติ'],
        sizeSqm: 60.00,
        isActive: true
      }
    });
    console.log('✅ Created Grand Serenity room type');
    
    // 3. Create actual rooms
    console.log('\n🏗️  Creating actual room units...');
    
    // Private House - PH01
    await prisma.room.create({
      data: {
        roomNumber: 'PH01',
        roomTypeId: privateHouse.id,
        status: 'Available',
        notes: 'บ้านส่วนตัว 1 หลัง 3 ห้องนอน'
      }
    });
    console.log('✅ Created PH01');
    
    // Onsen Villas - B1, B2, C1, C2, D1
    const onsenRooms = ['B1', 'B2', 'C1', 'C2', 'D1'];
    for (const roomNumber of onsenRooms) {
      await prisma.room.create({
        data: {
          roomNumber: roomNumber,
          roomTypeId: onsenVilla.id,
          status: 'Available',
          notes: 'วิลล่าพร้อมบ่อออนเซ็นส่วนตัว'
        }
      });
    }
    console.log('✅ Created Onsen Villas: B1, B2, C1, C2, D1');
    
    // Serenity Villas - E1, E2, E3
    const serenityRooms = ['E1', 'E2', 'E3'];
    for (const roomNumber of serenityRooms) {
      await prisma.room.create({
        data: {
          roomNumber: roomNumber,
          roomTypeId: serenityVilla.id,
          status: 'Available',
          notes: 'วิลล่าสงบ'
        }
      });
    }
    console.log('✅ Created Serenity Villas: E1, E2, E3');
    
    // Grand Serenity - F1, F2, F3
    const grandSerenityRooms = ['F1', 'F2', 'F3'];
    for (const roomNumber of grandSerenityRooms) {
      await prisma.room.create({
        data: {
          roomNumber: roomNumber,
          roomTypeId: grandSerenity.id,
          status: 'Available',
          notes: 'วิลล่าขนาดใหญ่สงบ'
        }
      });
    }
    console.log('✅ Created Grand Serenity Villas: F1, F2, F3');
    
    // 4. Summary
    console.log('\n📊 Summary of real accommodation data:');
    
    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true
      }
    });
    
    roomTypes.forEach(roomType => {
      console.log(`🏨 ${roomType.name}:`);
      console.log(`   💰 Price: ฿${roomType.baseRate.toLocaleString()}`);
      console.log(`   👥 Capacity: ${roomType.capacityAdults} adults + ${roomType.capacityChildren} children`);
      console.log(`   🏠 Units: ${roomType.rooms.map(r => r.roomNumber).join(', ')}`);
      console.log(`   📏 Size: ${roomType.sizeSqm} sqm`);
      console.log('');
    });
    
    const totalRooms = await prisma.room.count();
    console.log(`🎉 Total accommodation units: ${totalRooms}`);
    console.log('✅ Real hotel data updated successfully!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRealRoomData();
