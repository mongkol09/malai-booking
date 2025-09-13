// ============================================
// DEBUG BOOKING CANCELLATION ROOM UNLOCK
// ============================================

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugBookingRoomUnlock() {
  console.log('🔍 === DEBUGGING BOOKING ROOM UNLOCK ===\n');

  try {
    // 1. Check cancelled bookings
    console.log('1. 🔍 Checking cancelled bookings...');
    const cancelledBookings = await prisma.booking.findMany({
      where: {
        bookingStatus: 'cancelled'
      },
      include: {
        room: true,
        roomType: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`Found ${cancelledBookings.length} cancelled bookings:`);
    
    for (const booking of cancelledBookings) {
      console.log(`\n📋 Booking: ${booking.bookingReferenceId}`);
      console.log(`   - Status: ${booking.bookingStatus}`);
      console.log(`   - Room ID: ${booking.roomId}`);
      console.log(`   - Actual Room ID: ${booking.actualRoomId || 'NULL'}`);
      console.log(`   - Room Number: ${booking.room?.roomNumber || 'Unknown'}`);
      console.log(`   - Dates: ${booking.checkinDate} → ${booking.checkoutDate}`);
      
      // Check daily availability for this room and dates
      if (booking.roomId) {
        console.log(`\n🔍 Checking daily availability for room ${booking.roomId}:`);
        
        const startDate = new Date(booking.checkinDate);
        const endDate = new Date(booking.checkoutDate);
        
        const dailyAvailability = await prisma.dailyAvailability.findMany({
          where: {
            roomId: booking.roomId,
            date: {
              gte: startDate,
              lt: endDate // Check in to check out (night-based)
            }
          },
          orderBy: {
            date: 'asc'
          }
        });
        
        console.log(`   Found ${dailyAvailability.length} daily availability records:`);
        
        for (const da of dailyAvailability) {
          console.log(`   📅 ${da.date.toISOString().split('T')[0]}: ${da.status} (Booking: ${da.bookingId || 'None'})`);
        }
        
        // Check if any are still "Booked"
        const stillBooked = dailyAvailability.filter(da => da.status === 'Booked');
        if (stillBooked.length > 0) {
          console.log(`   ⚠️ WARNING: ${stillBooked.length} dates still marked as "Booked" for cancelled booking!`);
        }
      }
    }

    // 2. Check specific date (2025-09-12 to 2025-09-13)
    console.log('\n\n2. 🔍 Checking specific date range (2025-09-12 to 2025-09-13)...');
    
    const specificAvailability = await prisma.dailyAvailability.findMany({
      where: {
        date: {
          gte: new Date('2025-09-12'),
          lt: new Date('2025-09-13')
        }
      },
      include: {
        room: true
      },
      orderBy: [
        { roomId: 'asc' },
        { date: 'asc' }
      ]
    });

    console.log(`Found ${specificAvailability.length} daily availability records for 2025-09-12:`);
    
    for (const da of specificAvailability) {
      console.log(`📅 Room ${da.room?.roomNumber || da.roomId}: ${da.status} (Booking: ${da.bookingId || 'None'})`);
    }

    // 3. Manual unlock test (if any still booked)
    const bookedRecords = specificAvailability.filter(da => da.status === 'Booked');
    if (bookedRecords.length > 0) {
      console.log('\n3. 🔧 Found booked records that should be unlocked...');
      
      for (const record of bookedRecords) {
        if (record.bookingId) {
          // Check if booking is cancelled
          const booking = await prisma.booking.findUnique({
            where: { id: record.bookingId }
          });
          
          if (booking && booking.bookingStatus === 'cancelled') {
            console.log(`\n🔓 Unlocking room ${record.roomId} for cancelled booking ${record.bookingId}...`);
            
            const updated = await prisma.dailyAvailability.updateMany({
              where: {
                roomId: record.roomId,
                bookingId: record.bookingId,
                status: 'Booked'
              },
              data: {
                status: 'Available',
                bookingId: null,
                checkInDate: null,
                checkOutDate: null,
                updatedAt: new Date()
              }
            });
            
            console.log(`   ✅ Unlocked ${updated.count} daily availability records`);
          }
        }
      }
    }

    console.log('\n🎯 === DEBUG COMPLETED ===');

  } catch (error) {
    console.error('\n❌ === DEBUG FAILED ===');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugBookingRoomUnlock().then(() => {
  console.log('\n🏁 Debug script completed');
}).catch(error => {
  console.error('Debug script failed:', error.message);
});