const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestBookings() {
  try {
    console.log('🔍 Checking latest bookings...');
    
    const latestBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: true,
        room: true,
        roomType: true
      }
    });
    
    console.log(`📋 Found ${latestBookings.length} latest bookings:`);
    console.log('');
    
    latestBookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking Ref: ${booking.bookingReferenceId}`);
      console.log(`   Guest: ${booking.guest?.firstName || 'N/A'} ${booking.guest?.lastName || 'N/A'}`);
      console.log(`   Email: ${booking.guest?.email || 'N/A'}`);
      console.log(`   Room: ${booking.room?.roomNumber || 'N/A'}`);
      console.log(`   Room Type: ${booking.roomType?.name || 'N/A'}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Created: ${booking.createdAt}`);
      console.log('   ---');
    });
    
    await prisma.$disconnect();
    console.log('✅ Check completed');
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

checkLatestBookings();
