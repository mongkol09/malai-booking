const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoomF3Type() {
  const roomF3 = await prisma.room.findFirst({
    where: { roomNumber: 'F3' },
    include: { roomType: true }
  });
  
  if (roomF3) {
    console.log('Room F3 details:', {
      id: roomF3.id,
      roomNumber: roomF3.roomNumber,
      status: roomF3.status,
      roomTypeId: roomF3.roomTypeId,
      roomTypeName: roomF3.roomType?.name
    });
    
    // Check what other rooms belong to this room type
    console.log('\nOther rooms of same type:');
    const sameTypeRooms = await prisma.room.findMany({
      where: { roomTypeId: roomF3.roomTypeId },
      include: { roomType: true }
    });
    
    console.log(sameTypeRooms.map(r => ({
      id: r.id,
      roomNumber: r.roomNumber,
      status: r.status
    })));
  }
  
  await prisma.$disconnect();
}

checkRoomF3Type().catch(console.error);
