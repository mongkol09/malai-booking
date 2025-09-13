// ============================================
// ADD MISSING ROOM TYPE A AND CREATE ALL ROOMS
// ============================================

const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function createMissingRoomTypeAndRooms() {
  console.log('🏠 Adding missing Room Type A and creating all rooms...\n');

  try {
    // First, add the missing Room Type A (Private House)
    console.log('🔧 Creating Room Type A (Private House)...');
    
    const existingTypeA = await prisma.roomType.findFirst({
      where: { 
        OR: [
          { name: { contains: 'Private House' } },
          { description: { contains: 'Type: A' } }
        ]
      }
    });

    let roomTypeA;
    if (existingTypeA) {
      console.log(`⚠️  Room type Private House (A) already exists`);
      roomTypeA = existingTypeA;
    } else {
      roomTypeA = await prisma.roomType.create({
        data: {
          name: 'Private House',
          description: 'Luxury private house with exclusive amenities and privacy (Type: A)',
          baseRate: 28000,
          capacityAdults: 4,
          capacityChildren: 2,
          sizeSqm: 120,
          bedType: 'King Bed + Sofa Bed',
          amenities: [
            'Private Kitchen',
            'Living Room',
            'Private Garden',
            'Air Conditioning',
            'Free WiFi',
            'Smart TV',
            'Mini Bar',
            'Safe Box',
            'Private Parking',
            'Luxury Bathroom',
            'Balcony/Terrace'
          ],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Created room type: Private House (A)`);
      console.log(`   - ID: ${roomTypeA.id}`);
      console.log(`   - Base Rate: ฿28,000`);
      console.log(`   - Capacity: 4 adults + 2 children`);
      console.log(`   - Size: 120 sqm`);
      console.log('');
    }

    // Get all room types for creating rooms
    console.log('📋 Getting all room types...');
    const allRoomTypes = await prisma.roomType.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        baseRate: true
      }
    });

    // Extract type codes and create rooms mapping
    const roomsToCreate = [];
    
    for (const roomType of allRoomTypes) {
      const typeCode = roomType.description?.match(/\(Type: ([^)]+)\)/)?.[1];
      
      if (!typeCode) continue;

      switch (typeCode) {
        case 'A':
          roomsToCreate.push({
            roomNumber: 'PH1',
            roomTypeId: roomType.id,
            typeName: roomType.name,
            typeCode: 'A'
          });
          break;
        
        case 'C1':
          roomsToCreate.push({
            roomNumber: 'C101',
            roomTypeId: roomType.id,
            typeName: roomType.name,
            typeCode: 'C1'
          });
          break;
        
        case 'B1':
          roomsToCreate.push({
            roomNumber: 'B101',
            roomTypeId: roomType.id,
            typeName: roomType.name,
            typeCode: 'B1'
          });
          break;
        
        case 'C2':
          roomsToCreate.push({
            roomNumber: 'C201',
            roomTypeId: roomType.id,
            typeName: roomType.name,
            typeCode: 'C2'
          });
          break;
        
        case 'D1':
          roomsToCreate.push({
            roomNumber: 'D101',
            roomTypeId: roomType.id,
            typeName: roomType.name,
            typeCode: 'D1'
          });
          break;
        
        case 'B2':
          roomsToCreate.push({
            roomNumber: 'B201',
            roomTypeId: roomType.id,
            typeName: roomType.name,
            typeCode: 'B2'
          });
          break;
        
        case 'E':
          // 3 rooms for Ginger (E1, E2, E3)
          roomsToCreate.push(
            {
              roomNumber: 'E101',
              roomTypeId: roomType.id,
              typeName: roomType.name,
              typeCode: 'E1'
            },
            {
              roomNumber: 'E102',
              roomTypeId: roomType.id,
              typeName: roomType.name,
              typeCode: 'E2'
            },
            {
              roomNumber: 'E103',
              roomTypeId: roomType.id,
              typeName: roomType.name,
              typeCode: 'E3'
            }
          );
          break;
        
        case 'F':
          // 3 rooms for Lemongrass (F1, F2, F3)
          roomsToCreate.push(
            {
              roomNumber: 'F101',
              roomTypeId: roomType.id,
              typeName: roomType.name,
              typeCode: 'F1'
            },
            {
              roomNumber: 'F102',
              roomTypeId: roomType.id,
              typeName: roomType.name,
              typeCode: 'F2'
            },
            {
              roomNumber: 'F103',
              roomTypeId: roomType.id,
              typeName: roomType.name,
              typeCode: 'F3'
            }
          );
          break;
      }
    }

    // Create rooms
    console.log(`🔨 Creating ${roomsToCreate.length} rooms...`);
    
    for (const roomData of roomsToCreate) {
      try {
        // Check if room already exists
        const existingRoom = await prisma.room.findUnique({
          where: { roomNumber: roomData.roomNumber }
        });

        if (existingRoom) {
          console.log(`⚠️  Room ${roomData.roomNumber} already exists, skipping...`);
          continue;
        }

        // Create room
        const newRoom = await prisma.room.create({
          data: {
            roomNumber: roomData.roomNumber,
            roomTypeId: roomData.roomTypeId,
            status: 'Available',
            lastCheckoutDate: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`✅ Created room: ${roomData.roomNumber} (${roomData.typeName} - ${roomData.typeCode})`);

      } catch (roomError) {
        console.error(`❌ Failed to create room ${roomData.roomNumber}:`, roomError.message);
      }
    }

    // Display summary
    console.log('\n📊 ROOM CREATION SUMMARY:');
    console.log('='.repeat(60));
    
    const roomsByType = await prisma.room.findMany({
      include: {
        roomType: {
          select: {
            name: true,
            description: true,
            baseRate: true
          }
        }
      },
      orderBy: [
        { roomType: { baseRate: 'desc' } },
        { roomNumber: 'asc' }
      ]
    });

    if (roomsByType.length === 0) {
      console.log('   No rooms found');
    } else {
      let currentType = '';
      roomsByType.forEach((room) => {
        const typeCode = room.roomType?.description?.match(/\(Type: ([^)]+)\)/)?.[1] || 'N/A';
        const typeName = `${room.roomType?.name} (${typeCode})`;
        
        if (typeName !== currentType) {
          console.log(`\n🏠 ${typeName} - ฿${room.roomType?.baseRate}`);
          currentType = typeName;
        }
        
        console.log(`   ${room.roomNumber} - ${room.status}`);
      });
    }

    console.log('\n🎉 Room setup completed!');

  } catch (error) {
    console.error('❌ Room setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
module.exports = {
  createMissingRoomTypeAndRooms
};

// Run if called directly
if (require.main === module) {
  createMissingRoomTypeAndRooms()
    .then(() => {
      console.log('\n✅ Complete room setup finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Complete room setup failed:', error.message);
      process.exit(1);
    });
}
