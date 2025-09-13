const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookingList() {
  try {
    console.log('🔍 เช็คข้อมูล Booking List ในฐานข้อมูล...\n');

    // ดึงข้อมูล booking ทั้งหมด พร้อมข้อมูลที่เกี่ยวข้อง
    const bookings = await prisma.booking.findMany({
      include: {
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
            roomNumber: true,
            roomType: {
              select: {
                name: true,
                pricePerNight: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 พบ Booking ทั้งหมด: ${bookings.length} รายการ\n`);

    if (bookings.length === 0) {
      console.log('❌ ยังไม่มี Booking ในระบบ');
      return;
    }

    // แสดงข้อมูล booking แต่ละรายการ
    bookings.forEach((booking, index) => {
      console.log(`🏨 Booking #${index + 1}`);
      console.log(`   📋 Booking ID: ${booking.id}`);
      console.log(`   🔖 Reference: ${booking.bookingReferenceId}`);
      console.log(`   👤 Guest: ${booking.guest?.firstName} ${booking.guest?.lastName}`);
      console.log(`   📧 Email: ${booking.guest?.email}`);
      console.log(`   📱 Phone: ${booking.guest?.phoneNumber || 'ไม่ระบุ'}`);
      console.log(`   🏠 Room: ${booking.room?.roomNumber || 'ยังไม่ได้จัดสรร'}`);
      console.log(`   🛏️  Room Type: ${booking.room?.roomType?.name || 'ไม่ระบุ'}`);
      console.log(`   💰 Price/Night: ฿${booking.room?.roomType?.pricePerNight?.toLocaleString() || 'ไม่ระบุ'}`);
      console.log(`   📅 Check-in: ${new Date(booking.checkinDate).toLocaleDateString('th-TH')}`);
      console.log(`   📅 Check-out: ${new Date(booking.checkoutDate).toLocaleDateString('th-TH')}`);
      console.log(`   👥 Guests: ${booking.numAdults} ผู้ใหญ่${booking.numChildren > 0 ? `, ${booking.numChildren} เด็ก` : ''}`);
      console.log(`   📊 Status: ${booking.status}`);
      console.log(`   💳 Payment Status: ${booking.paymentStatus}`);
      console.log(`   💵 Total Amount: ฿${booking.totalAmount?.toLocaleString() || 'ไม่ระบุ'}`);
      console.log(`   📝 Special Requests: ${booking.specialRequests || 'ไม่มี'}`);
      console.log(`   🕐 Created: ${new Date(booking.createdAt).toLocaleString('th-TH')}`);
      console.log('   ' + '─'.repeat(50));
    });

    // สรุปสถิติ
    console.log('\n📈 สถิติ Booking:');
    
    const statusStats = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const paymentStats = bookings.reduce((acc, booking) => {
      acc[booking.paymentStatus] = (acc[booking.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🔸 สถานะ Booking:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} รายการ`);
    });

    console.log('\n💳 สถานะการชำระเงิน:');
    Object.entries(paymentStats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} รายการ`);
    });

    // คำนวณรายได้รวม
    const totalRevenue = bookings
      .filter(booking => booking.paymentStatus === 'PAID')
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    console.log(`\n💰 รายได้รวม (จากการจองที่ชำระแล้ว): ฿${totalRevenue.toLocaleString()}`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเช็คข้อมูล Booking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookingList();