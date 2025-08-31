const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRooms() {
  console.log('🏨 Available rooms:');
  const rooms = await prisma.room.findMany({
    where: { status: 'Available' },
    include: { roomType: true },
    orderBy: { roomNumber: 'asc' }
  });
  
  console.log('Available rooms:', rooms.map(r => ({
    id: r.id,
    roomNumber: r.roomNumber,
    status: r.status,
    type: r.roomType?.name
  })));
  
  console.log('\n🔍 Checking room F3 specifically:');
  const roomF3 = await prisma.room.findFirst({
    where: { 
      OR: [
        { id: 'F3' },
        { roomNumber: 'F3' }
      ]
    },
    include: { roomType: true }
  });
  
  if (roomF3) {
    console.log('Room F3 found:', {
      id: roomF3.id,
      roomNumber: roomF3.roomNumber,
      status: roomF3.status,
      type: roomF3.roomType?.name
    });
  } else {
    console.log('Room F3 not found');
  }
  
  await prisma.$disconnect();
}

checkRooms().catch(console.error);
