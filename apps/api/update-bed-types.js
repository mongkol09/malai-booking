// Check and update bed types for all rooms
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBedTypes() {
  console.log('🛏️  Checking room types and updating bed types...\n');
  
  try {
    // First, get all room types
    const roomTypes = await prisma.roomType.findMany({
      select: {
        id: true,
        name: true,
        bedType: true,
        rooms: {
          select: {
            roomNumber: true
          }
        }
      }
    });
    
    console.log('📋 Current room types:');
    roomTypes.forEach(roomType => {
      console.log(`ID: ${roomType.id} | Name: ${roomType.name} | Bed: ${roomType.bedType || 'NULL'}`);
    });
    
    // Update bed types by ID
    const updates = [
      { name: 'Private House', bedType: 'King Bed' },
      { name: 'Onsen Villa', bedType: 'Queen Bed' },
      { name: 'Serenity Villa', bedType: 'Standard Double' },
      { name: 'Grand Serenity', bedType: 'Queen Bed' }
    ];
    
    console.log('\n🔄 Updating bed types...');
    
    for (const update of updates) {
      const roomType = roomTypes.find(rt => rt.name === update.name);
      if (roomType) {
        await prisma.roomType.update({
          where: { id: roomType.id },
          data: { bedType: update.bedType }
        });
        console.log(`✅ Updated ${update.name} -> ${update.bedType}`);
      } else {
        console.log(`⚠️  Room type not found: ${update.name}`);
      }
    }
    
    // Verify updates
    console.log('\n📋 Updated room types:');
    const updatedRoomTypes = await prisma.roomType.findMany({
      select: {
        name: true,
        bedType: true,
        rooms: {
          select: {
            roomNumber: true
          }
        }
      }
    });
    
    updatedRoomTypes.forEach(roomType => {
      console.log(`🛏️  ${roomType.name}: ${roomType.bedType}`);
      console.log(`   Rooms: ${roomType.rooms.map(r => r.roomNumber).join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBedTypes();
