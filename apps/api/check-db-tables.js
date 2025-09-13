const { PrismaClient } = require('@prisma/client');

async function checkDatabaseTables() {
    const prisma = new PrismaClient();
    
    try {
        console.log('=== Database Tables Check ===\n');
        
        // Check Users table
        console.log('1. Users Table:');
        const userCount = await prisma.user.count();
        console.log(`   Total users: ${userCount}`);
        
        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    userType: true
                }
            });
            console.log('   Users:', users.map(u => `${u.email} (${u.userType})`));
        }
        console.log('');
        
        // Check RoomTypes table
        console.log('2. RoomTypes Table:');
        const roomTypeCount = await prisma.roomType.count();
        console.log(`   Total room types: ${roomTypeCount}`);
        
        if (roomTypeCount > 0) {
            const roomTypes = await prisma.roomType.findMany({
                select: {
                    id: true,
                    name: true,
                    capacityAdults: true,
                    baseRate: true
                }
            });
            console.log('   Room Types:', roomTypes);
        }
        console.log('');
        
        // Check Rooms table
        console.log('3. Rooms Table:');
        const roomCount = await prisma.room.count();
        console.log(`   Total rooms: ${roomCount}`);
        
        if (roomCount > 0) {
            const rooms = await prisma.room.findMany({
                take: 5,
                select: {
                    id: true,
                    roomNumber: true,
                    roomTypeId: true,
                    status: true,
                    roomType: {
                        select: {
                            name: true,
                            capacityAdults: true,
                            baseRate: true
                        }
                    }
                }
            });
            console.log('   Sample rooms:');
            rooms.forEach(room => {
                console.log(`   - Room ${room.roomNumber}: ${room.roomType.name} (${room.status})`);
            });
        }
        console.log('');
        
        // Check Bookings table
        console.log('4. Bookings Table:');
        const bookingCount = await prisma.booking.count();
        console.log(`   Total bookings: ${bookingCount}`);
        console.log('');
        
        // Check schema/table existence
        console.log('5. All Tables Check:');
        const allTableCounts = {
            users: await prisma.user.count(),
            roomTypes: await prisma.roomType.count(), 
            rooms: await prisma.room.count(),
            bookings: await prisma.booking.count()
        };
        
        console.log('   Table counts:', allTableCounts);
        
        // Total summary
        console.log('\n=== Summary ===');
        console.log(`Database has ${allTableCounts.users} users, ${allTableCounts.roomTypes} room types, ${allTableCounts.rooms} rooms, ${allTableCounts.bookings} bookings`);
        
        if (allTableCounts.rooms === 0) {
            console.log('\n⚠️  WARNING: No rooms found in database!');
            console.log('   This explains why the Room List page shows "Showing 0 to 0 of 0 entries"');
        } else {
            console.log('\n✅ Rooms exist in database. Frontend issue may be API or component related.');
        }
        
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabaseTables();
