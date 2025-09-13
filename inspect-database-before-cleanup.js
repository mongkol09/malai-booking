// ============================================
// PRE-CLEANUP INSPECTION SCRIPT
// ============================================

const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function inspectDatabaseBeforeCleanup() {
  console.log('🔍 Inspecting database before cleanup...\n');

  try {
    // Check bookings
    console.log('📋 BOOKING DATA:');
    const bookings = await prisma.booking.findMany({
      take: 5,
      include: {
        guest: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    const totalBookings = await prisma.booking.count();
    console.log(`   Total bookings: ${totalBookings}`);
    
    if (bookings.length > 0) {
      console.log('   Sample bookings:');
      bookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ID: ${booking.bookingId}, Guest: ${booking.guest?.email || 'No guest'}, Status: ${booking.status}`);
      });
    }

    // Check room types
    console.log('\n🏠 ROOM TYPE DATA:');
    const roomTypes = await prisma.roomType.findMany({
      take: 10
    });
    
    console.log(`   Total room types: ${roomTypes.length}`);
    
    if (roomTypes.length > 0) {
      console.log('   Room types:');
      roomTypes.forEach((roomType, index) => {
        console.log(`   ${index + 1}. ${roomType.name} - ฿${roomType.baseRate} (${roomType.capacityAdults} adults)`);
      });
    }

    // Check rooms and their relationships
    console.log('\n🏨 ROOM DATA:');
    const rooms = await prisma.room.findMany({
      take: 5,
      include: {
        roomType: {
          select: {
            name: true,
            baseRate: true
          }
        }
      }
    });
    
    const totalRooms = await prisma.room.count();
    console.log(`   Total rooms: ${totalRooms}`);
    
    if (rooms.length > 0) {
      console.log('   Sample rooms:');
      rooms.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room.roomNumber} - Type: ${room.roomType?.name || 'No type'}, Status: ${room.status}`);
      });
    }

    // Check related tables
    console.log('\n🔗 RELATED DATA:');
    
    try {
      const guestCount = await prisma.guest.count();
      console.log(`   Guests: ${guestCount}`);
    } catch (error) {
      console.log('   Guests: Table not found');
    }

    try {
      const paymentCount = await prisma.payment.count();
      console.log(`   Payments: ${paymentCount}`);
    } catch (error) {
      console.log('   Payments: Table not found');
    }

    try {
      const bookingHistoryCount = await prisma.bookingHistory.count();
      console.log(`   Booking History: ${bookingHistoryCount}`);
    } catch (error) {
      console.log('   Booking History: Table not found');
    }

    // Check users (should be preserved)
    console.log('\n👥 USER DATA (WILL BE PRESERVED):');
    const userCount = await prisma.user.count();
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: {
        email: true,
        userType: true,
        isActive: true
      }
    });
    
    console.log(`   Total users: ${userCount}`);
    console.log('   Sample users:');
    sampleUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.userType}) - Active: ${user.isActive}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY:');
    console.log('='.repeat(60));
    console.log(`🗑️  Will DELETE: ${totalBookings} bookings, ${roomTypes.length} room types`);
    console.log(`✅ Will PRESERVE: ${userCount} users, ${totalRooms} rooms`);
    console.log('💡 Rooms will lose their room type associations but remain in database');

  } catch (error) {
    console.error('❌ Inspection failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
module.exports = {
  inspectDatabaseBeforeCleanup
};

// Run if called directly
if (require.main === module) {
  inspectDatabaseBeforeCleanup()
    .then(() => {
      console.log('\n✅ Database inspection completed!');
      console.log('💡 Run "node cleanup-bookings-roomtypes.js" to proceed with cleanup');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database inspection failed:', error.message);
      process.exit(1);
    });
}
