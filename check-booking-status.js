const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        bookingReferenceId: {
          in: ['BK12916955', 'BK12837206']
        }
      },
      select: {
        id: true,
        bookingReferenceId: true,
        status: true,
        checkinTime: true,
        checkoutTime: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📋 Booking Status Check:');
    console.log('=======================');
    bookings.forEach(booking => {
      console.log(`📄 ${booking.bookingReferenceId}: ${booking.status}`);
      console.log(`   Check-in: ${booking.checkinTime || 'Not checked in'}`);
      console.log(`   Check-out: ${booking.checkoutTime || 'Not checked out'}`);
      console.log(`   Updated: ${booking.updatedAt}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookings();