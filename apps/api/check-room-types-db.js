const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoomTypes() {
  console.log('🔍 Checking room types and their rooms...');
  
  const roomTypes = await prisma.roomType.findMany({
    include: {
      rooms: true
    }
  });
  
  roomTypes.forEach(type => {
    console.log(`\n🏠 ${type.name} (ID: ${type.id}):`);
    console.log(`   Rooms: ${type.rooms.map(r => `${r.roomNumber}(${r.status})`).join(', ')}`);
  });
  
  await prisma.$disconnect();
}

checkRoomTypes().catch(console.error);
