const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateExistingBookingData() {
  try {
    console.log('🔄 กำลังอัปเดตข้อมูล booking ที่มีอยู่แล้ว...\n');

    // 1. อัปเดต derived fields สำหรับ booking ที่มีอยู่
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { guestName: null },
          { guestEmail: null },
          { roomNumber: null }
        ]
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        }
      }
    });

    console.log(`📊 พบ booking ที่ต้องอัปเดต: ${bookings.length} รายการ`);

    let updatedCount = 0;
    
    for (const booking of bookings) {
      try {
        const stayNights = Math.ceil((booking.checkoutDate - booking.checkinDate) / (1000 * 60 * 60 * 24));
        
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            guestEmail: booking.guest.email,
            guestPhone: booking.guest.phoneNumber,
            roomNumber: booking.room.roomNumber,
            roomTypeName: booking.room.roomType.name,
            stayNights: stayNights
          }
        });
        
        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`   ✅ อัปเดตแล้ว ${updatedCount}/${bookings.length} รายการ`);
        }
      } catch (error) {
        console.error(`❌ Error updating booking ${booking.bookingReferenceId}:`, error.message);
      }
    }

    console.log(`\n✅ อัปเดต derived fields เสร็จสิ้น: ${updatedCount} รายการ\n`);

    // 2. Auto-archive cancelled bookings เก่า
    const oldCancelledBookings = await prisma.booking.updateMany({
      where: {
        status: 'Cancelled',
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 วันที่แล้ว
        },
        isArchived: false
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: 'AUTO_ARCHIVED_OLD_CANCELLED'
      }
    });

    console.log(`📦 Auto-archive cancelled bookings เก่า: ${oldCancelledBookings.count} รายการ\n`);

    // 3. แสดงสถิติหลังการอัปเดต
    const stats = await prisma.booking.groupBy({
      by: ['isArchived', 'status'],
      _count: {
        id: true
      }
    });

    console.log('📈 สถิติ Booking หลังการอัปเดต:');
    console.log('─────────────────────────────────────');
    
    for (const stat of stats) {
      const label = stat.isArchived ? 'Archived' : 'Active';
      console.log(`   ${label} ${stat.status}: ${stat._count.id} รายการ`);
    }

    console.log('\n🎉 การอัปเดตเสร็จสมบูรณ์!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingBookingData();