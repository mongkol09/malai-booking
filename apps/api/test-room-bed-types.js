const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRoomData() {
  console.log('🏠 Testing room data with bed types...\n');
  
  try {
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true
      },
      orderBy: {
        roomNumber: 'asc'
      },
      take: 5
    });
    
    console.log('📊 Sample rooms with bed types:');
    rooms.forEach(room => {
      console.log(`Room ${room.roomNumber}: ${room.roomType.name} - ${room.roomType.bedType} - ฿${room.roomType.baseRate.toLocaleString()}/night`);
    });
    
    console.log('\n🔍 All room bed types:');
    const roomTypes = await prisma.roomType.findMany({
      select: {
        name: true,
        bedType: true,
        baseRate: true,
        _count: {
          select: {
            rooms: true
          }
        }
      }
    });
    
    roomTypes.forEach(roomType => {
      console.log(`${roomType.name}: ${roomType.bedType} - ${roomType._count.rooms} rooms`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoomData();
