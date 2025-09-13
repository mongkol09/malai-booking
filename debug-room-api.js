// ============================================
// DEBUG ROOM API ISSUE
// ============================================

const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function debugRoomAPI() {
  console.log('🔍 Debugging Room API Issue...\n');

  try {
    // Step 1: Direct query like API does
    console.log('1️⃣ Testing direct room query...');
    
    const whereClause = {};
    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        roomType: true,
        bookings: {
          where: {
            status: 'InHouse'
          },
          include: {
            guest: true
          },
          take: 1
        }
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    console.log(`📊 Direct query result: ${rooms.length} rooms`);
    
    if (rooms.length > 0) {
      console.log('\n   First room details:');
      const room = rooms[0];
      console.log(`   - ID: ${room.id}`);
      console.log(`   - Room Number: ${room.roomNumber}`);
      console.log(`   - Status: ${room.status}`);
      console.log(`   - Room Type: ${room.roomType?.name}`);
      console.log(`   - Base Rate: ${room.roomType?.baseRate}`);
    }

    // Step 2: Test different booking status
    console.log('\n2️⃣ Testing without booking filter...');
    
    const roomsSimple = await prisma.room.findMany({
      include: {
        roomType: true
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    console.log(`📊 Simple query result: ${roomsSimple.length} rooms`);

    // Step 3: Check room types separately
    console.log('\n3️⃣ Testing room types query...');
    
    const roomTypes = await prisma.roomType.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Room types result: ${roomTypes.length} room types`);
    
    if (roomTypes.length > 0) {
      console.log('\n   Room types:');
      roomTypes.forEach((rt, index) => {
        console.log(`   ${index + 1}. ${rt.name} - ฿${rt.baseRate}`);
      });
    }

    // Step 4: Test formatted data like API
    console.log('\n4️⃣ Testing API formatting...');
    
    const formattedRooms = roomsSimple.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      number: room.roomNumber,
      type: room.roomType.name,
      price: Number(room.roomType.baseRate),
      capacity: room.roomType.capacityAdults,
      capacityChildren: room.roomType.capacityChildren || 0,
      status: room.status?.toLowerCase() || 'available',
      roomType: room.roomType,
    }));

    console.log(`📊 Formatted result: ${formattedRooms.length} rooms`);
    
    if (formattedRooms.length > 0) {
      console.log('\n   Sample formatted room:');
      const sample = formattedRooms[0];
      console.log(`   - Room: ${sample.roomNumber} (${sample.type})`);
      console.log(`   - Price: ฿${sample.price}`);
      console.log(`   - Status: ${sample.status}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  debugRoomAPI()
    .then(() => {
      console.log('\n✅ Room API debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Room API debug failed:', error.message);
      process.exit(1);
    });
}
