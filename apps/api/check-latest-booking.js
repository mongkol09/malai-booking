const { PrismaClient } = require('@prisma/client');

async function checkLatestBooking() {
    const prisma = new PrismaClient();
    
    try {
        // Find the latest booking by the reference ID from our test
        const booking = await prisma.booking.findMany({
            where: {
                bookingReferenceId: 'BK17234108'
            },
            include: {
                guest: true,
                room: true
            }
        });
        
        console.log('✅ Latest test booking:', JSON.stringify(booking, null, 2));
        
        // Also check the last 3 bookings to see the pattern
        const lastBookings = await prisma.booking.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 3,
            include: {
                guest: true,
                room: true
            }
        });
        
        console.log('\n📋 Last 3 bookings in database:');
        lastBookings.forEach((booking, index) => {
            console.log(`${index + 1}. ID: ${booking.id}`);
            console.log(`   Ref: ${booking.bookingReferenceId}`);
            console.log(`   Status: ${booking.status}`);
            console.log(`   Guest: ${booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'No guest'}`);
            console.log(`   Room: ${booking.room ? booking.room.roomNumber : 'No room'}`);
            console.log(`   Check-in: ${booking.checkInDate}`);
            console.log(`   Check-out: ${booking.checkOutDate}`);
            console.log(`   Total: ${booking.totalAmount}`);
            console.log(`   Created: ${booking.createdAt}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatestBooking();
