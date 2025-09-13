const { PrismaClient } = require('./apps/api/node_modules/.prisma/client');

async function checkDatabaseTables() {
    const prisma = new PrismaClient();
    
    try {
        console.log('=== Checking Database Tables ===\n');
        
        // Check Users table
        console.log('1. Users Table:');
        const userCount = await prisma.user.count();
        console.log(`   Total users: ${userCount}`);
        
        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });
            console.log('   Users:', users);
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
                    capacity: true,
                    basePrice: true
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
                            capacity: true,
                            basePrice: true
                        }
                    }
                }
            });
            console.log('   First 5 Rooms:', JSON.stringify(rooms, null, 2));
        }
        console.log('');
        
        // Check Bookings table
        console.log('4. Bookings Table:');
        const bookingCount = await prisma.booking.count();
        console.log(`   Total bookings: ${bookingCount}`);
        console.log('');
        
        // Check all tables exist by trying to query them
        console.log('5. Table Existence Check:');
        const tables = [
            'user', 'roomType', 'room', 'booking', 
            'bookingRoom', 'promotion', 'invoice', 'payment'
        ];
        
        for (const table of tables) {
            try {
                const count = await prisma[table].count();
                console.log(`   ✓ ${table}: ${count} records`);
            } catch (error) {
                console.log(`   ✗ ${table}: Error - ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabaseTables();
