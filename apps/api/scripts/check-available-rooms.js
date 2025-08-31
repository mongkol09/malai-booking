const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAvailableRooms() {
  try {
    console.log('🏠 Checking available rooms...');
    
    const availableRooms = await prisma.room.findMany({
      where: {
        status: 'Available'
      },
      include: {
        roomType: true
      },
      take: 10
    });
    
    console.log(`📋 Found ${availableRooms.length} available rooms:`);
    console.log('');
    
    availableRooms.forEach((room, index) => {
      console.log(`${index + 1}. Room: ${room.roomNumber}`);
      console.log(`   Type: ${room.roomType?.name || 'N/A'}`);
      console.log(`   Type ID: ${room.roomTypeId}`);
      console.log(`   Status: ${room.status}`);
      console.log('   ---');
    });
    
    // Also check room types
    console.log('🏷️ All room types:');
    const roomTypes = await prisma.roomType.findMany();
    roomTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type.name} (ID: ${type.id})`);
    });
    
    await prisma.$disconnect();
    console.log('✅ Check completed');
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

checkAvailableRooms();
