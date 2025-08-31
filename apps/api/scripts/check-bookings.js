const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookingsData() {
  try {
    console.log('🔍 ตรวจสอบข้อมูล Booking ในฐานข้อมูล...');
    
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: true,
        roomType: true
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 พบ ${bookings.length} bookings ในฐานข้อมูล:`);
    console.log('');

    bookings.forEach((booking, index) => {
      console.log(`=== Booking ${index + 1} ===`);
      console.log(`ID: ${booking.id}`);
      console.log(`Reference: ${booking.bookingReferenceId}`);
      console.log(`Guest Name: ${booking.guest.firstName} ${booking.guest.lastName}`);
      console.log(`Guest Email: ${booking.guest.email}`);
      console.log(`Room Type: ${booking.roomType.name}`);
      console.log(`Room Number: ${booking.room.roomNumber}`);
      console.log(`Check-in: ${booking.checkinDate.toISOString().split('T')[0]}`);
      console.log(`Check-out: ${booking.checkoutDate.toISOString().split('T')[0]}`);
      console.log(`Status: ${booking.status}`);
      console.log(`Total Price: ฿${booking.totalPrice}`);
      console.log(`Source: ${booking.source}`);
      console.log(`Created: ${booking.createdAt.toISOString()}`);
      console.log('');
    });

    // Check for any "Test Guest" issues
    const testGuestBookings = bookings.filter(b => 
      b.guest.firstName === 'Test' || 
      b.guest.lastName === 'Guest' ||
      b.guest.firstName === 'Guest'
    );

    if (testGuestBookings.length > 0) {
      console.log('⚠️ พบ Bookings ที่มีชื่อ "Test Guest":');
      testGuestBookings.forEach(b => {
        console.log(`  - ${b.bookingReferenceId}: ${b.guest.firstName} ${b.guest.lastName} (${b.guest.email})`);
      });
    } else {
      console.log('✅ ไม่พบ Bookings ที่มีชื่อ "Test Guest"');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookingsData();
