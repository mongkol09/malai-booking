// 🔍 Database Room Types & Booking Data Checker (Updated)
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
    
    try {
      const roomTypeCount = await prisma.roomType.count();
      console.log(`📊 Total Room Types: ${roomTypeCount}`);
      
      if (roomTypeCount > 0) {
        const roomTypes = await prisma.roomType.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            baseRate: true,
            capacityAdults: true,
            capacityChildren: true,
            amenities: true,
            sizeSqm: true,
            bedType: true,
            isActive: true,
            _count: {
              select: {
                rooms: true,
                bookings: true
              }
            }
          }
        });
        
        console.log('\n📋 Available Room Types:');
        roomTypes.forEach((roomType, index) => {
          console.log(`\n${index + 1}. ${roomType.name.toUpperCase()}`);
          console.log(`   🆔 ID: ${roomType.id}`);
          console.log(`   📝 Description: ${roomType.description || 'N/A'}`);
          console.log(`   💰 Base Rate: ฿${roomType.baseRate}`);
          console.log(`   👥 Capacity: ${roomType.capacityAdults} adults, ${roomType.capacityChildren} children`);
          console.log(`   📐 Size: ${roomType.sizeSqm ? roomType.sizeSqm + ' sqm' : 'N/A'}`);
          console.log(`   🛏️  Bed Type: ${roomType.bedType || 'N/A'}`);
          console.log(`   🏠 Rooms Available: ${roomType._count.rooms}`);
          console.log(`   📋 Bookings Made: ${roomType._count.bookings}`);
          console.log(`   ✅ Active: ${roomType.isActive ? 'Yes' : 'No'}`);
          if (roomType.amenities) {
            console.log(`   🛎️  Amenities: ${JSON.stringify(roomType.amenities)}`);
          }
        });
      } else {
        console.log('⚠️  No room types found in database');
      }
    } catch (error) {
      console.log('❌ RoomType error:', error.message);
    }
    
    // ========================================
    // 2. เช็ค Rooms จริง ๆ
    // ========================================
    console.log('\n\n🏠 PHYSICAL ROOMS ANALYSIS:');
    console.log('-'.repeat(40));
    
    try {
      const roomCount = await prisma.room.count();
      console.log(`📊 Total Physical Rooms: ${roomCount}`);
      
      if (roomCount > 0) {
        // ดูจำนวน rooms ตาม status
        const roomsByStatus = await prisma.room.groupBy({
          by: ['status'],
          _count: {
            status: true
          }
        });
        
        console.log('\n📊 Rooms by Status:');
        roomsByStatus.forEach((stat) => {
          console.log(`   ${stat.status}: ${stat._count.status} rooms`);
        });
        
        // ดูตัวอย่าง rooms
        const sampleRooms = await prisma.room.findMany({
          take: 5,
          select: {
            id: true,
            roomNumber: true,
            status: true,
            roomType: {
              select: {
                name: true,
                baseRate: true
              }
            }
          }
        });
        
        console.log('\n🏠 Sample Rooms:');
        sampleRooms.forEach((room, index) => {
          console.log(`${index + 1}. Room ${room.roomNumber}`);
          console.log(`   Type: ${room.roomType.name}`);
          console.log(`   Rate: ฿${room.roomType.baseRate}`);
          console.log(`   Status: ${room.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Room error:', error.message);
    }
    
    // ========================================
    // 3. เช็คการจองล่าสุด
    // ========================================
    console.log('\n\n📋 RECENT BOOKINGS ANALYSIS:');
    console.log('-'.repeat(40));
    
    try {
      const bookingCount = await prisma.booking.count();
      console.log(`📊 Total Bookings: ${bookingCount}`);
      
      if (bookingCount > 0) {
        const recentBookings = await prisma.booking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            bookingReferenceId: true,
            checkinDate: true,
            checkoutDate: true,
            numAdults: true,
            numChildren: true,
            totalPrice: true,
            finalAmount: true,
            status: true,
            specialRequests: true,
            source: true,
            createdAt: true,
            guest: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true
              }
            },
            room: {
              select: {
                roomNumber: true
              }
            },
            roomType: {
              select: {
                name: true
              }
            }
          }
        });
        
        console.log('\n📋 5 Most Recent Bookings:');
        recentBookings.forEach((booking, index) => {
          console.log(`\n${index + 1}. ${booking.guest.firstName} ${booking.guest.lastName}`);
          console.log(`   📄 Ref: ${booking.bookingReferenceId}`);
          console.log(`   📧 Email: ${booking.guest.email}`);
          console.log(`   📱 Phone: ${booking.guest.phoneNumber || 'N/A'}`);
          console.log(`   🏠 Room: ${booking.room.roomNumber} (${booking.roomType.name})`);
          console.log(`   📅 Dates: ${booking.checkinDate.toISOString().split('T')[0]} → ${booking.checkoutDate.toISOString().split('T')[0]}`);
          console.log(`   👥 Guests: ${booking.numAdults} adults, ${booking.numChildren} children`);
          console.log(`   💰 Total: ฿${booking.totalPrice} → Final: ฿${booking.finalAmount}`);
          console.log(`   📊 Status: ${booking.status}`);
          console.log(`   📝 Requests: ${booking.specialRequests || 'None'}`);
          console.log(`   📡 Source: ${booking.source || 'N/A'}`);
          console.log(`   🕐 Created: ${booking.createdAt}`);
        });
        
        // สถิติการจองตาม Room Type
        console.log('\n\n📊 Booking Statistics by Room Type:');
        console.log('-'.repeat(40));
        
        const bookingStats = await prisma.booking.groupBy({
          by: ['roomTypeId'],
          _count: {
            roomTypeId: true
          },
          _sum: {
            finalAmount: true
          }
        });
        
        // ดึงชื่อ room type
        for (const stat of bookingStats) {
          const roomType = await prisma.roomType.findUnique({
            where: { id: stat.roomTypeId },
            select: { name: true }
          });
          console.log(`${roomType?.name || 'Unknown'}: ${stat._count.roomTypeId} bookings, ฿${stat._sum.finalAmount || 0} total`);
        }
        
      } else {
        console.log('⚠️  No bookings found in database');
      }
    } catch (error) {
      console.log('❌ Booking error:', error.message);
    }
    
    // ========================================
    // 4. เช็ค Guest ล่าสุด
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
            phoneNumber: true,
            country: true,
            createdAt: true,
            _count: {
              select: {
                bookings: true
              }
            }
          }
        });
        
        console.log('\n👥 Recent Guests:');
        recentGuests.forEach((guest, index) => {
          console.log(`${index + 1}. ${guest.firstName} ${guest.lastName}`);
          console.log(`   📧 ${guest.email}`);
          console.log(`   📱 ${guest.phoneNumber || 'N/A'}`);
          console.log(`   🌍 ${guest.country || 'N/A'}`);
          console.log(`   📋 Bookings: ${guest._count.bookings}`);
          console.log(`   🕐 ${guest.createdAt}`);
        });
      }
    } catch (error) {
      console.log('❌ Guest error:', error.message);
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
