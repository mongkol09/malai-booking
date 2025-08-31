const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetRoomStatus() {
  console.log('🔧 Resetting room status to Available...');
  
  try {
    // Get all rooms that are currently marked as Occupied
    const occupiedRooms = await prisma.room.findMany({
      where: { status: 'Occupied' },
      include: { roomType: true }
    });
    
    console.log(`📊 Found ${occupiedRooms.length} rooms marked as Occupied:`);
    occupiedRooms.forEach(room => {
      console.log(`   - ${room.roomNumber} (${room.roomType.name})`);
    });
    
    // Reset all rooms to Available
    // Room availability will be managed by date-based booking conflicts
    const result = await prisma.room.updateMany({
      where: { status: 'Occupied' },
      data: { status: 'Available' }
    });
    
    console.log(`✅ Reset ${result.count} rooms to Available status`);
    
    // Show current room inventory
    console.log('\n📋 Current Room Inventory:');
    const allRooms = await prisma.room.findMany({
      include: { roomType: true },
      orderBy: { roomNumber: 'asc' }
    });
    
    const inventory = {};
    allRooms.forEach(room => {
      if (!inventory[room.roomType.name]) {
        inventory[room.roomType.name] = { total: 0, available: 0, rooms: [] };
      }
      inventory[room.roomType.name].total++;
      if (room.status === 'Available') {
        inventory[room.roomType.name].available++;
      }
      inventory[room.roomType.name].rooms.push({
        number: room.roomNumber,
        status: room.status
      });
    });
    
    Object.keys(inventory).forEach(typeName => {
      const type = inventory[typeName];
      console.log(`\n🏠 ${typeName}:`);
      console.log(`   Total: ${type.total} rooms`);
      console.log(`   Available: ${type.available} rooms`);
      console.log(`   Rooms: ${type.rooms.map(r => `${r.number}(${r.status})`).join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error resetting room status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetRoomStatus();
