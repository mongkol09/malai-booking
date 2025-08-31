// 🔍 Database Room Types & Booking Data Checker
// ตรวจสอบข้อมูล RoomType และการจองล่าสุดในฐานข้อมูล

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('🏨 DATABASE DATA ANALYSIS');
    console.log('='.repeat(60));
    
    // ========================================
    // 1. เช็ค Room Types ที่มีในระบบ
    // ========================================
    console.log('\n🏠 ROOM TYPES ANALYSIS:');
    console.log('-'.repeat(40));
    
    // เช็คว่ามี Table Room หรือไม่
    try {
      const roomCount = await prisma.room.count();
      console.log(`📊 Total Rooms: ${roomCount}`);
      
      if (roomCount > 0) {
        // ดู Room Types ที่มี
        const roomTypes = await prisma.room.groupBy({
          by: ['type'],
          _count: {
            type: true
          }
        });
        
        console.log('\n📋 Room Types Available:');
        roomTypes.forEach((roomType, index) => {
          console.log(`${index + 1}. ${roomType.type}: ${roomType._count.type} rooms`);
        });
        
        // ดูตอวอย่าง Room แต่ละประเภท
        console.log('\n🏠 Sample Rooms by Type:');
        for (const roomType of roomTypes) {
          const sampleRoom = await prisma.room.findFirst({
            where: { type: roomType.type },
            select: {
              id: true,
              number: true,
              type: true,
              price: true,
              capacity: true,
              status: true,
              amenities: true
            }
          });
          
          if (sampleRoom) {
            console.log(`\n📍 ${roomType.type.toUpperCase()}:`);
            console.log(`   ID: ${sampleRoom.id}`);
            console.log(`   Number: ${sampleRoom.number || 'N/A'}`);
            console.log(`   Price: ฿${sampleRoom.price || 'N/A'}`);
            console.log(`   Capacity: ${sampleRoom.capacity || 'N/A'} guests`);
            console.log(`   Status: ${sampleRoom.status || 'N/A'}`);
            console.log(`   Amenities: ${sampleRoom.amenities || 'N/A'}`);
          }
        }
      } else {
        console.log('⚠️  No rooms found in database');
      }
    } catch (error) {
      console.log('❌ Room table not found or error:', error.message);
    }
    
    // ========================================
    // 2. เช็คการจองล่าสุด
    // ========================================
    console.log('\n\n📋 RECENT BOOKINGS ANALYSIS:');
    console.log('-'.repeat(40));
    
    const bookingCount = await prisma.booking.count();
    console.log(`📊 Total Bookings: ${bookingCount}`);
    
    if (bookingCount > 0) {
      // ดูการจอง 5 รายการล่าสุด
      const recentBookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          bookingReferenceId: true,
          customerName: true,
          customerEmail: true,
          roomId: true,
          roomType: true,
          checkInDate: true,
          checkOutDate: true,
          totalAmount: true,
          status: true,
          specialRequests: true,
          createdAt: true
        }
      });
      
      console.log('\n📋 5 Most Recent Bookings:');
      recentBookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. ${booking.customerName || 'Unknown Customer'}`);
        console.log(`   📄 Ref: ${booking.bookingReferenceId || booking.id}`);
        console.log(`   📧 Email: ${booking.customerEmail || 'N/A'}`);
        console.log(`   🏠 Room: ${booking.roomId} (${booking.roomType || 'Unknown type'})`);
        console.log(`   📅 Dates: ${booking.checkInDate} → ${booking.checkOutDate}`);
        console.log(`   💰 Amount: ฿${booking.totalAmount || 0}`);
        console.log(`   📊 Status: ${booking.status || 'N/A'}`);
        console.log(`   📝 Requests: ${booking.specialRequests || 'None'}`);
        console.log(`   🕐 Created: ${booking.createdAt}`);
      });
      
      // สถิติการจองตาม Room Type
      console.log('\n\n📊 Booking Statistics by Room Type:');
      console.log('-'.repeat(40));
      
      const bookingStats = await prisma.booking.groupBy({
        by: ['roomType'],
        _count: {
          roomType: true
        },
        _sum: {
          totalAmount: true
        }
      });
      
      bookingStats.forEach((stat, index) => {
        console.log(`${index + 1}. ${stat.roomType || 'Unknown'}: ${stat._count.roomType} bookings, ฿${stat._sum.totalAmount || 0} total`);
      });
      
    } else {
      console.log('⚠️  No bookings found in database');
    }
    
    // ========================================
    // 3. เช็ค Guest ล่าสุด
    // ========================================
    console.log('\n\n👥 GUEST ANALYSIS:');
    console.log('-'.repeat(40));
    
    try {
      const guestCount = await prisma.guest.count();
      console.log(`📊 Total Guests: ${guestCount}`);
      
      if (guestCount > 0) {
        const recentGuests = await prisma.guest.findMany({
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            nationality: true,
            createdAt: true
          }
        });
        
        console.log('\n👥 Recent Guests:');
        recentGuests.forEach((guest, index) => {
          console.log(`${index + 1}. ${guest.firstName} ${guest.lastName}`);
          console.log(`   📧 ${guest.email}`);
          console.log(`   📱 ${guest.phone || 'N/A'}`);
          console.log(`   🌍 ${guest.nationality || 'N/A'}`);
          console.log(`   🕐 ${guest.createdAt}`);
        });
      }
    } catch (error) {
      console.log('⚠️  Guest table not found or error:', error.message);
    }
    
    // ========================================
    // 4. Database Schema Info
    // ========================================
    console.log('\n\n🗄️  DATABASE SCHEMA INFO:');
    console.log('-'.repeat(40));
    
    // แสดงตารางที่มีในระบบ
    const tableQueries = [
      'SELECT COUNT(*) as count FROM "Booking"',
      'SELECT COUNT(*) as count FROM "Guest"',
      'SELECT COUNT(*) as count FROM "Room"',
      'SELECT COUNT(*) as count FROM "Payment"',
      'SELECT COUNT(*) as count FROM "User"'
    ];
    
    const tableNames = ['Booking', 'Guest', 'Room', 'Payment', 'User'];
    
    for (let i = 0; i < tableQueries.length; i++) {
      try {
        const result = await prisma.$queryRawUnsafe(tableQueries[i]);
        console.log(`📊 ${tableNames[i]}: ${result[0].count} records`);
      } catch (error) {
        console.log(`❌ ${tableNames[i]}: Table not found or error`);
      }
    }
    
    console.log('\n🎯 Analysis Complete!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('💥 Error analyzing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันการวิเคราะห์
checkDatabaseData();
