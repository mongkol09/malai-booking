// 🔍 CHECK ALL DATABASE DATA
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllDatabaseData() {
  console.log('🔍 === COMPREHENSIVE DATABASE CHECK ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 1. Check Users
    console.log('👥 1. USERS TABLE:');
    console.log('='.repeat(40));
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found!');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Type: ${user.userType}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Created: ${user.createdAt.toLocaleString('th-TH')}`);
        console.log('');
      });
    }
    
    // 2. Check Guests
    console.log('\n🏨 2. GUESTS TABLE:');
    console.log('='.repeat(40));
    const guests = await prisma.guest.findMany({
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (guests.length === 0) {
      console.log('❌ No guests found!');
    } else {
      guests.forEach((guest, index) => {
        console.log(`${index + 1}. ${guest.firstName} ${guest.lastName}`);
        console.log(`   Email: ${guest.email}`);
        console.log(`   Phone: ${guest.phoneNumber || 'N/A'}`);
        console.log(`   User ID: ${guest.userId || 'No linked user'}`);
        console.log(`   Created: ${guest.createdAt.toLocaleString('th-TH')}`);
        console.log('');
      });
    }
    
    // 3. Check Room Types
    console.log('\n🏠 3. ROOM TYPES TABLE:');
    console.log('='.repeat(40));
    const roomTypes = await prisma.roomType.findMany({
      orderBy: { baseRate: 'asc' }
    });
    
    if (roomTypes.length === 0) {
      console.log('❌ No room types found!');
    } else {
      roomTypes.forEach((roomType, index) => {
        console.log(`${index + 1}. ${roomType.name}`);
        console.log(`   Base Rate: ฿${Number(roomType.baseRate).toLocaleString('th-TH')}`);
        console.log(`   Capacity: ${roomType.capacityAdults} adults, ${roomType.capacityChildren} children`);
        console.log(`   Size: ${roomType.sizeSqm} sqm`);
        console.log(`   Created: ${roomType.createdAt.toLocaleString('th-TH')}`);
        console.log('');
      });
    }
    
    // 4. Check Rooms
    console.log('\n🚪 4. ROOMS TABLE:');
    console.log('='.repeat(40));
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true
      },
      orderBy: { roomNumber: 'asc' }
    });
    
    if (rooms.length === 0) {
      console.log('❌ No rooms found!');
    } else {
      rooms.forEach((room, index) => {
        console.log(`${index + 1}. Room ${room.roomNumber}`);
        console.log(`   Type: ${room.roomType.name}`);
        console.log(`   Status: ${room.status}`);
        console.log(`   Rate: ฿${Number(room.roomType.baseRate).toLocaleString('th-TH')}/night`);
        console.log('');
      });
    }
    
    // 5. Check System Settings
    console.log('\n⚙️ 5. SYSTEM SETTINGS TABLE:');
    console.log('='.repeat(40));
    const settings = await prisma.systemSetting.findMany({
      orderBy: { settingKey: 'asc' }
    });
    
    if (settings.length === 0) {
      console.log('❌ No system settings found!');
    } else {
      settings.forEach((setting, index) => {
        console.log(`${index + 1}. ${setting.settingKey}: ${setting.settingValue}`);
        console.log(`   Type: ${setting.dataType}`);
        console.log(`   Description: ${setting.description}`);
        console.log('');
      });
    }
    
    // 6. Check Bookings
    console.log('\n📋 6. BOOKINGS TABLE:');
    console.log('='.repeat(40));
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found!');
    } else {
      bookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.bookingReferenceId}`);
        console.log(`   Guest: ${booking.guest.firstName} ${booking.guest.lastName}`);
        console.log(`   Room: ${booking.room.roomType.name} (${booking.room.roomNumber})`);
        console.log(`   Dates: ${booking.checkinDate.toLocaleDateString('th-TH')} - ${booking.checkoutDate.toLocaleDateString('th-TH')}`);
        console.log(`   Total: ฿${Number(booking.finalAmount).toLocaleString('th-TH')}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Created: ${booking.createdAt.toLocaleString('th-TH')}`);
        console.log('');
      });
    }
    
    // 7. Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(40));
    console.log(`Users: ${users.length} records`);
    console.log(`Guests: ${guests.length} records`);
    console.log(`Room Types: ${roomTypes.length} records`);
    console.log(`Rooms: ${rooms.length} records`);
    console.log(`System Settings: ${settings.length} records`);
    console.log(`Bookings: ${bookings.length} records`);
    
    // 8. Check for specific dev user
    console.log('\n🔍 8. LOOKING FOR DEV USERS:');
    console.log('='.repeat(40));
    const devUsers = users.filter(user => 
      user.userType === 'ADMIN' || 
      user.email.includes('dev') || 
      user.email.includes('admin') ||
      user.firstName.includes('Dev') ||
      user.firstName.includes('Admin')
    );
    
    if (devUsers.length === 0) {
      console.log('❌ No dev/admin users found!');
    } else {
      devUsers.forEach(user => {
        console.log(`✅ Found: ${user.firstName} ${user.lastName} (${user.email}) - ${user.userType}`);
      });
    }
    
    // 9. Check database connection and tables
    console.log('\n🗄️ 9. DATABASE HEALTH CHECK:');
    console.log('='.repeat(40));
    
    try {
      // Test if tables exist by running simple queries
      await prisma.user.findFirst();
      console.log('✅ Users table accessible');
      
      await prisma.guest.findFirst();
      console.log('✅ Guests table accessible');
      
      await prisma.roomType.findFirst();
      console.log('✅ RoomTypes table accessible');
      
      await prisma.room.findFirst();
      console.log('✅ Rooms table accessible');
      
      await prisma.systemSetting.findFirst();
      console.log('✅ SystemSettings table accessible');
      
      await prisma.booking.findFirst();
      console.log('✅ Bookings table accessible');
      
    } catch (error) {
      console.log('❌ Database access error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('DATABASE CHECK COMPLETE');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkAllDatabaseData();
