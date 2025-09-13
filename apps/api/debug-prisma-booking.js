const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrismaBooking() {
  try {
    console.log('🔍 Testing Prisma booking query...');
    
    // Simple count query
    const count = await prisma.booking.count();
    console.log('✅ Booking count:', count);
    
    // Simple findMany query without includes
    console.log('\n📋 Testing basic findMany...');
    const bookings = await prisma.booking.findMany({
      take: 2
    });
    console.log('✅ Basic findMany successful, found:', bookings.length);
    console.log('Sample booking ID:', bookings[0]?.id);
    
    // Test with includes
    console.log('\n📋 Testing with includes...');
    const bookingsWithIncludes = await prisma.booking.findMany({
      include: {
        guest: true,
        room: true,
        roomType: true
      },
      take: 1
    });
    console.log('✅ Query with includes successful');
    console.log('Sample data:', JSON.stringify(bookingsWithIncludes[0], null, 2));
    
  } catch (error) {
    console.error('❌ Prisma error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaBooking();