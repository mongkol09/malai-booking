// Add more available rooms
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAvailableRooms() {
  try {
    console.log('🏠 Adding more available rooms...');
    
    // Get existing room type
    const roomType = await prisma.roomType.findFirst({
      where: { name: 'Standard Room' }
    });
    
    if (roomType) {
      // Create more rooms
      for (let i = 4; i <= 8; i++) {
        await prisma.room.create({
          data: {
            roomNumber: `10${i}`,
            roomTypeId: roomType.id,
            status: 'Available',
            notes: 'Available for customer booking'
          }
        });
      }
      
      console.log('✅ Created 5 more available rooms (104-108)');
      
      // Check totals
      const totalRooms = await prisma.room.count();
      const availableRooms = await prisma.room.count({
        where: { status: 'Available' }
      });
      
      console.log(`📊 Total rooms: ${totalRooms}`);
      console.log(`📊 Available rooms: ${availableRooms}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAvailableRooms();
