const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function updateBookingStatus() {
  try {
    const bookingIds = ['BK12916955', 'BK12837206'];
    
    console.log('🔄 Updating booking status to Completed...');
    
    for (const bookingId of bookingIds) {
      const updated = await prisma.booking.update({
        where: {
          bookingReferenceId: bookingId
        },
        data: {
          status: 'Completed',
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ ${bookingId}: ${updated.status}`);
    }
    
    console.log('\n📋 Verifying status...');
    const bookings = await prisma.booking.findMany({
      where: {
        bookingReferenceId: {
          in: bookingIds
        }
      },
      select: {
        bookingReferenceId: true,
        status: true,
        updatedAt: true
      }
    });
    
    bookings.forEach(booking => {
      console.log(`📄 ${booking.bookingReferenceId}: ${booking.status} (${booking.updatedAt})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateBookingStatus();