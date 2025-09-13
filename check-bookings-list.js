const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookingsList() {
  try {
    console.log('🔍 กำลังตรวจสอบข้อมูล Booking ในฐานข้อมูล...\n');

    // ดึงข้อมูล Booking ทั้งหมด พร้อมความสัมพันธ์
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
        },
        payment: {
          select: {
            amount: true,
            paymentStatus: true,
            paymentMethod: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 พบ Booking ทั้งหมด: ${bookings.length} รายการ\n`);

    if (bookings.length === 0) {
      console.log('❌ ไม่พบข้อมูล Booking ในฐานข้อมูล');
      return;
    }

    // แสดงข้อมูล Booking แต่ละรายการ
    bookings.forEach((booking, index) => {
      console.log(`📋 Booking #${index + 1}`);
      console.log(`   🆔 Booking ID: ${booking.id}`);
      console.log(`   📝 Reference ID: ${booking.bookingReferenceId}`);
      console.log(`   👤 ลูกค้า: ${booking.guest?.firstName} ${booking.guest?.lastName}`);
      console.log(`   📧 Email: ${booking.guest?.email}`);
      console.log(`   📱 เบอร์โทร: ${booking.guest?.phoneNumber || 'ไม่ระบุ'}`);
      console.log(`   🏠 ห้อง: ${booking.room?.roomNumber || 'ยังไม่ได้กำหนด'}`);
      console.log(`   🏨 ประเภทห้อง: ${booking.room?.roomType?.name || 'ไม่ระบุ'}`);
      console.log(`   💰 ราคาต่อคืน: ฿${booking.room?.roomType?.pricePerNight?.toLocaleString() || 'ไม่ระบุ'}`);
      console.log(`   📅 Check-in: ${new Date(booking.checkinDate).toLocaleDateString('th-TH')}`);
      console.log(`   📅 Check-out: ${new Date(booking.checkoutDate).toLocaleDateString('th-TH')}`);
      console.log(`   👥 ผู้ใหญ่: ${booking.numAdults} คน, เด็ก: ${booking.numChildren} คน`);
      console.log(`   📊 สถานะ: ${booking.status}`);
      console.log(`   💳 ยอดชำระ: ฿${booking.payment?.amount?.toLocaleString() || 'ไม่ระบุ'}`);
      console.log(`   💳 สถานะการชำระ: ${booking.payment?.paymentStatus || 'ไม่ระบุ'}`);
      console.log(`   💳 วิธีชำระ: ${booking.payment?.paymentMethod || 'ไม่ระบุ'}`);
      console.log(`   🕐 วันที่สร้าง: ${new Date(booking.createdAt).toLocaleString('th-TH')}`);
      console.log(`   🔄 อัปเดตล่าสุด: ${new Date(booking.updatedAt).toLocaleString('th-TH')}`);
      console.log('   ' + '─'.repeat(50));
    });

    // สถิติโดยรวม
    console.log('\n📈 สถิติโดยรวม:');
    
    const statusCount = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    console.log('   📊 จำนวนตามสถานะ:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`      - ${status}: ${count} รายการ`);
    });

    const totalAmount = bookings.reduce((sum, booking) => {
      return sum + (booking.payment?.amount || 0);
    }, 0);

    console.log(`   💰 ยอดรวมทั้งหมด: ฿${totalAmount.toLocaleString()}`);

    // Booking ล่าสุด
    if (bookings.length > 0) {
      const latestBooking = bookings[0];
      console.log('\n🆕 Booking ล่าสุด:');
      console.log(`   📝 ${latestBooking.bookingReferenceId} - ${latestBooking.guest?.firstName} ${latestBooking.guest?.lastName}`);
      console.log(`   📅 ${new Date(latestBooking.checkinDate).toLocaleDateString('th-TH')} - ${new Date(latestBooking.checkoutDate).toLocaleDateString('th-TH')}`);
      console.log(`   🏨 ${latestBooking.room?.roomType?.name || 'ไม่ระบุประเภทห้อง'}`);
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบข้อมูล Booking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันฟังก์ชัน
checkBookingsList();