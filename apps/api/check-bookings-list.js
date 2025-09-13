const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookingsList() {
  try {
    console.log('🔍 กำลังเช็คข้อมูล Booking ในฐานข้อมูล...\n');

    // ดึงข้อมูล Booking ทั้งหมด พร้อม relation
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        },
        roomType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 จำนวน Booking ทั้งหมด: ${bookings.length} รายการ\n`);

    if (bookings.length === 0) {
      console.log('❌ ไม่มีข้อมูล Booking ในฐานข้อมูล');
      return;
    }

    // แสดงข้อมูล Booking แต่ละรายการ
    bookings.forEach((booking, index) => {
      console.log(`📋 Booking #${index + 1}:`);
      console.log(`   - ID: ${booking.id}`);
      console.log(`   - Reference ID: ${booking.bookingReferenceId}`);
      console.log(`   - Status: ${booking.status}`);
      console.log(`   - Guest: ${booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'N/A'}`);
      console.log(`   - Phone: ${booking.guest?.phoneNumber || 'N/A'}`);
      console.log(`   - Email: ${booking.guest?.email || 'N/A'}`);
      console.log(`   - Room: ${booking.room ? `${booking.room.roomNumber} (${booking.room.roomType?.name || 'N/A'})` : 'N/A'}`);
      console.log(`   - Room Type: ${booking.roomType?.name || 'N/A'}`);
      console.log(`   - Check-in: ${booking.checkinDate ? new Date(booking.checkinDate).toLocaleDateString('th-TH') : 'N/A'}`);
      console.log(`   - Check-out: ${booking.checkoutDate ? new Date(booking.checkoutDate).toLocaleDateString('th-TH') : 'N/A'}`);
      console.log(`   - Adults: ${booking.numAdults}`);
      console.log(`   - Children: ${booking.numChildren}`);
      console.log(`   - Total Amount: ฿${booking.totalAmount ? booking.totalAmount.toLocaleString() : 'N/A'}`);
      console.log(`   - Payment Status: ${booking.paymentStatus || 'N/A'}`);
      console.log(`   - Created: ${new Date(booking.createdAt).toLocaleString('th-TH')}`);
      console.log('   ' + '─'.repeat(60));
    });

    // แสดงสถิติสรุป
    console.log('\n📈 สถิติสรุป:');
    
    const statusStats = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   สถานะ Booking:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} รายการ`);
    });

    const paymentStats = bookings.reduce((acc, booking) => {
      const status = booking.paymentStatus || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   สถานะการชำระเงิน:');
    Object.entries(paymentStats).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} รายการ`);
    });

    const totalRevenue = bookings
      .filter(b => b.totalAmount)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    console.log(`   💰 รายได้รวม: ฿${totalRevenue.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error checking bookings:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookingsList();