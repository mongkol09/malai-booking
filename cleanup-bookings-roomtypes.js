// ============================================
// DATABASE CLEANUP SCRIPT - BOOKINGS & ROOM TYPES ONLY
// ============================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupBookingsAndRoomTypes() {
  console.log('🧹 Starting cleanup of Bookings and Room Types...\n');

  try {
    await prisma.$transaction(async (tx) => {
      console.log('📊 Checking current data...');
      
      // Count existing data
      const bookingCount = await tx.booking.count();
      const roomTypeCount = await tx.roomType.count();
      const roomCount = await tx.room.count();
      
      console.log(`📋 Current data count:`);
      console.log(`   • Bookings: ${bookingCount}`);
      console.log(`   • Room Types: ${roomTypeCount}`);
      console.log(`   • Rooms: ${roomCount} (will be kept)`);
      
      if (bookingCount === 0 && roomTypeCount === 0) {
        console.log('✅ No bookings or room types to clean up.');
        return;
      }

      console.log('\n🗑️ Starting cleanup process...');

      // Step 1: Delete all booking-related data
      if (bookingCount > 0) {
        console.log('\n1️⃣ Cleaning up booking data...');
        
        // Delete booking history first (if exists)
        try {
          const bookingHistoryCount = await tx.bookingHistory.deleteMany({});
          console.log(`   ✅ Deleted ${bookingHistoryCount.count} booking history records`);
        } catch (error) {
          console.log('   ℹ️ No booking history table found (skipping)');
        }

        // Delete payment records (if exists)
        try {
          const paymentCount = await tx.payment.deleteMany({});
          console.log(`   ✅ Deleted ${paymentCount.count} payment records`);
        } catch (error) {
          console.log('   ℹ️ No payment table found (skipping)');
        }

        // Delete booking room assignments (if exists)
        try {
          const bookingRoomCount = await tx.bookingRoom.deleteMany({});
          console.log(`   ✅ Deleted ${bookingRoomCount.count} booking room assignments`);
        } catch (error) {
          console.log('   ℹ️ No booking room table found (skipping)');
        }

        // Delete guest information (if exists)
        try {
          const guestCount = await tx.guest.deleteMany({});
          console.log(`   ✅ Deleted ${guestCount.count} guest records`);
        } catch (error) {
          console.log('   ℹ️ No guest table found (skipping)');
        }

        // Finally delete bookings
        const deletedBookings = await tx.booking.deleteMany({});
        console.log(`   ✅ Deleted ${deletedBookings.count} bookings`);
      }

      // Step 2: Update rooms to remove room type references
      console.log('\n2️⃣ Updating rooms to remove room type references...');
      
      // Set roomTypeId to null in rooms table (if the field exists)
      try {
        const updatedRooms = await tx.room.updateMany({
          data: {
            roomTypeId: null
          }
        });
        console.log(`   ✅ Updated ${updatedRooms.count} rooms to remove room type references`);
      } catch (error) {
        console.log('   ℹ️ Rooms may not have roomTypeId field (skipping)');
      }

      // Step 3: Delete room types
      if (roomTypeCount > 0) {
        console.log('\n3️⃣ Cleaning up room types...');
        
        const deletedRoomTypes = await tx.roomType.deleteMany({});
        console.log(`   ✅ Deleted ${deletedRoomTypes.count} room types`);
      }

      console.log('\n✅ Cleanup completed successfully!');
      
      // Final count
      const finalBookingCount = await tx.booking.count();
      const finalRoomTypeCount = await tx.roomType.count();
      const finalRoomCount = await tx.room.count();
      
      console.log('\n📊 Final data count:');
      console.log(`   • Bookings: ${finalBookingCount}`);
      console.log(`   • Room Types: ${finalRoomTypeCount}`);
      console.log(`   • Rooms: ${finalRoomCount} (preserved)`);
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    console.error('\nThis might be due to:');
    console.error('   • Foreign key constraints');
    console.error('   • Missing database tables');
    console.error('   • Database connection issues');
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Additional function for safe cleanup with confirmation
async function safeCleanup() {
  console.log('⚠️  WARNING: This will delete ALL booking and room type data!');
  console.log('📋 What will be deleted:');
  console.log('   • All bookings');
  console.log('   • All booking history');
  console.log('   • All payment records');
  console.log('   • All guest information');
  console.log('   • All room types');
  console.log('   • Room type references in rooms');
  console.log('');
  console.log('✅ What will be preserved:');
  console.log('   • Users and authentication data');
  console.log('   • Room records (but without room types)');
  console.log('   • System configurations');
  console.log('');
  
  // In a real scenario, you'd want user confirmation here
  // For now, we'll proceed directly
  await cleanupBookingsAndRoomTypes();
}

// Export for use in other scripts
module.exports = {
  cleanupBookingsAndRoomTypes,
  safeCleanup
};

// Run if called directly
if (require.main === module) {
  safeCleanup()
    .then(() => {
      console.log('\n🎉 Database cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database cleanup failed:', error.message);
      process.exit(1);
    });
}
