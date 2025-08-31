const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupEmptyRoomTypes() {
  console.log('🧹 Cleaning up empty room types...\n');
  
  try {
    // 1. หา room types ที่ไม่มีห้อง
    const roomTypesWithRooms = await prisma.roomType.findMany({
      include: {
        rooms: true,
        _count: {
          select: { rooms: true }
        }
      }
    });
    
    console.log('📊 Current Room Types:');
    roomTypesWithRooms.forEach(type => {
      console.log(`   ${type.name} (${type.id}): ${type._count.rooms} rooms`);
      if (type.rooms.length > 0) {
        console.log(`      Rooms: ${type.rooms.map(r => r.roomNumber).join(', ')}`);
      }
    });
    
    // 2. หา room types ที่ไม่มีห้องเลย
    const emptyRoomTypes = roomTypesWithRooms.filter(type => type._count.rooms === 0);
    
    if (emptyRoomTypes.length === 0) {
      console.log('\n✅ No empty room types found. All room types have rooms.');
      return;
    }
    
    console.log(`\n🗑️  Found ${emptyRoomTypes.length} empty room types to delete:`);
    emptyRoomTypes.forEach(type => {
      console.log(`   - ${type.name} (${type.id})`);
    });
    
    // 3. ตรวจสอบว่ามี bookings ที่อ้างอิง room types เหล่านี้ไหม
    const emptyRoomTypeIds = emptyRoomTypes.map(type => type.id);
    
    const bookingsUsingEmptyTypes = await prisma.booking.findMany({
      where: {
        roomTypeId: {
          in: emptyRoomTypeIds
        }
      }
    });
    
    if (bookingsUsingEmptyTypes.length > 0) {
      console.log(`\n⚠️  Warning: Found ${bookingsUsingEmptyTypes.length} bookings using these empty room types!`);
      console.log('   Cannot delete room types that are referenced by bookings.');
      
      bookingsUsingEmptyTypes.forEach(booking => {
        console.log(`   - Booking ${booking.bookingReferenceId} uses room type ${booking.roomTypeId}`);
      });
      
      return;
    }
    
    // 4. ลบ empty room types
    console.log('\n🗑️  Deleting empty room types...');
    
    for (const roomType of emptyRoomTypes) {
      await prisma.roomType.delete({
        where: { id: roomType.id }
      });
      console.log(`   ✅ Deleted: ${roomType.name}`);
    }
    
    console.log(`\n✅ Successfully deleted ${emptyRoomTypes.length} empty room types`);
    
    // 5. แสดงผลลัพธ์หลังลบ
    console.log('\n📋 Remaining Room Types:');
    const remainingRoomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true,
        _count: {
          select: { rooms: true }
        }
      }
    });
    
    remainingRoomTypes.forEach(type => {
      console.log(`   🏠 ${type.name}: ${type._count.rooms} rooms`);
      console.log(`      Rooms: ${type.rooms.map(r => r.roomNumber).join(', ')}`);
    });
    
    console.log(`\nTotal room types: ${remainingRoomTypes.length}`);
    console.log(`Total rooms: ${remainingRoomTypes.reduce((sum, type) => sum + type._count.rooms, 0)}`);
    
  } catch (error) {
    console.error('❌ Error cleaning up room types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupEmptyRoomTypes();
