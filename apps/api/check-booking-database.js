const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookingInDatabase() {
  try {
    console.log('🔍 Checking bookings in database...');
    
    // Get all bookings
    const allBookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: true,
        roomType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Total bookings found: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      console.log('\n📋 Booking details:');
      allBookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. Booking ID: ${booking.id}`);
        console.log(`   Reference: ${booking.bookingReferenceId}`);
        console.log(`   Guest: ${booking.guest.firstName} ${booking.guest.lastName} (${booking.guest.email})`);
        console.log(`   Room: ${booking.room.roomNumber} (${booking.roomType.name})`);
        console.log(`   Check-in: ${booking.checkinDate.toDateString()}`);
        console.log(`   Check-out: ${booking.checkoutDate.toDateString()}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Total: ฿${booking.totalPrice}`);
      });
      
      // Check our specific booking
      const mongkolBooking = allBookings.find(booking => 
        booking.guest.email === 'mongkol.food3@gmail.com'
      );
      
      if (mongkolBooking) {
        console.log('\n✅ Found Mongkol booking!');
        console.log('   This booking should appear in the frontend BookingList');
      } else {
        console.log('\n❌ Mongkol booking not found');
      }
    } else {
      console.log('❌ No bookings found in database');
    }
    
    // Check occupied rooms
    const occupiedRooms = await prisma.room.findMany({
      where: { status: 'Occupied' },
      include: {
        roomType: true
      }
    });
    
    console.log(`\n🏠 Occupied rooms: ${occupiedRooms.length}`);
    occupiedRooms.forEach(room => {
      console.log(`   - Room ${room.roomNumber} (${room.roomType.name}) - Status: ${room.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookingInDatabase()
  .then(() => {
    console.log('\n🎉 Database check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database check failed:', error.message);
    process.exit(1);
  });
