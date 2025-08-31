const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addRoomTypes() {
  try {
    console.log('🏨 Adding Room Types and Rooms...');

    // Create Room Types
    const roomTypes = [
      {
        name: 'Private House',
        description: 'Luxury private house with 3 King size beds, perfect for families',
        baseRate: 35000,
        capacityAdults: 6,
        capacityChildren: 0,
        sizeSqm: 200, // ประมาณ 200 ตร.ม.
        bedType: 'King Size',
        isActive: true
      },
      {
        name: 'Onsen Villa',
        description: 'Private villa with Onsen hot spring and King size bed',
        baseRate: 18000,
        capacityAdults: 2,
        capacityChildren: 0,
        sizeSqm: 80, // ประมาณ 80 ตร.ม.
        bedType: 'King Size',
        isActive: true
      },
      {
        name: 'Serenity Villa',
        description: 'Peaceful villa with King size bed and garden view',
        baseRate: 8000,
        capacityAdults: 2,
        capacityChildren: 0,
        sizeSqm: 60, // ประมาณ 60 ตร.ม.
        bedType: 'King Size',
        isActive: true
      },
      {
        name: 'Grand Serenity',
        description: 'Premium Serenity villa with enhanced amenities and King size bed',
        baseRate: 8500,
        capacityAdults: 2,
        capacityChildren: 0,
        sizeSqm: 65, // ประมาณ 65 ตร.ม.
        bedType: 'King Size',
        isActive: true
      }
    ];

    // Insert Room Types
    const createdRoomTypes = {};
    for (const roomType of roomTypes) {
      try {
        const created = await prisma.roomType.create({
          data: roomType
        });
        createdRoomTypes[roomType.name] = created;
        console.log(`✅ Created room type: ${roomType.name} (ID: ${created.id})`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Room type ${roomType.name} already exists, fetching existing...`);
          const existing = await prisma.roomType.findFirst({
            where: { name: roomType.name }
          });
          createdRoomTypes[roomType.name] = existing;
        } else {
          throw error;
        }
      }
    }

    // Create Rooms
    const rooms = [
      // Private House
      {
        roomNumber: 'PH-1',
        roomTypeId: createdRoomTypes['Private House'].id,
        status: 'Available',
        notes: 'Luxury private house with 3 King size beds and private amenities'
      },
      
      // Onsen Villas
      {
        roomNumber: 'B1',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        notes: 'Private villa with Onsen hot spring'
      },
      {
        roomNumber: 'B2',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        notes: 'Private villa with Onsen hot spring'
      },
      {
        roomNumber: 'C1',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        notes: 'Private villa with Onsen hot spring'
      },
      {
        roomNumber: 'C2',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        notes: 'Private villa with Onsen hot spring'
      },
      {
        roomNumber: 'D1',
        roomTypeId: createdRoomTypes['Onsen Villa'].id,
        status: 'Available',
        notes: 'Private villa with Onsen hot spring'
      },
      
      // Serenity Villas
      {
        roomNumber: 'E1',
        roomTypeId: createdRoomTypes['Serenity Villa'].id,
        status: 'Available',
        notes: 'Peaceful villa with garden view'
      },
      {
        roomNumber: 'E2',
        roomTypeId: createdRoomTypes['Serenity Villa'].id,
        status: 'Available',
        notes: 'Peaceful villa with garden view'
      },
      {
        roomNumber: 'E3',
        roomTypeId: createdRoomTypes['Serenity Villa'].id,
        status: 'Available',
        notes: 'Peaceful villa with garden view'
      },
      
      // Grand Serenity Villas
      {
        roomNumber: 'F1',
        roomTypeId: createdRoomTypes['Grand Serenity'].id,
        status: 'Available',
        notes: 'Premium Serenity villa with enhanced amenities'
      },
      {
        roomNumber: 'F2',
        roomTypeId: createdRoomTypes['Grand Serenity'].id,
        status: 'Available',
        notes: 'Premium Serenity villa with enhanced amenities'
      },
      {
        roomNumber: 'F3',
        roomTypeId: createdRoomTypes['Grand Serenity'].id,
        status: 'Available',
        notes: 'Premium Serenity villa with enhanced amenities'
      }
    ];

    // Insert Rooms
    for (const room of rooms) {
      try {
        const created = await prisma.room.create({
          data: room
        });
        console.log(`✅ Created room: ${room.roomNumber} (ID: ${created.id})`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Room ${room.roomNumber} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n🎉 Room setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('🏨 Room Types Created:');
    console.log('   • Private House (1 room) - ฿35,000/night');
    console.log('   • Onsen Villa (5 rooms) - ฿18,000/night');
    console.log('   • Serenity Villa (3 rooms) - ฿8,000/night');
    console.log('   • Grand Serenity (3 rooms) - ฿8,500/night');
    console.log('\n🛏️ Total Rooms: 12 rooms');

  } catch (error) {
    console.error('❌ Error adding room types and rooms:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addRoomTypes();
