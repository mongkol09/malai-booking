const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllBookings() {
  try {
    console.log('🔍 กำลังเช็คข้อมูล Booking ทั้งหมดในฐานข้อมูล...\n');

    // ดึงข้อมูล Booking ทั้งหมด พร้อม relations
    const bookings = await prisma.booking.findMany({
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: {
              select: {
                id: true,
                name: true,
                pricePerNight: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (bookings.length === 0) {
      console.log('❌ ไม่พบข้อมูล Booking ในฐานข้อมูล');
      return;
    }

    console.log(`✅ พบข้อมูล Booking ทั้งหมด: ${bookings.length} รายการ\n`);
    console.log('=' .repeat(80));

    bookings.forEach((booking, index) => {
      console.log(`📋 Booking #${index + 1}`);
      console.log(`   ID: ${booking.id}`);
      console.log(`   Booking Reference: ${booking.bookingReferenceId || 'ไม่มี'}`);
      console.log(`   สถานะ: ${booking.status}`);
      console.log(`   Check-in: ${booking.checkinDate ? new Date(booking.checkinDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}`);
      console.log(`   Check-out: ${booking.checkoutDate ? new Date(booking.checkoutDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}`);
      console.log(`   ผู้ใหญ่: ${booking.numAdults || 0} คน`);
      console.log(`   เด็ก: ${booking.numChildren || 0} คน`);
      console.log(`   ยอดรวม: ฿${booking.totalAmount ? Number(booking.totalAmount).toLocaleString() : '0'}`);
      
      // ข้อมูลแขก
      if (booking.guest) {
        console.log(`   👤 แขก: ${booking.guest.firstName} ${booking.guest.lastName}`);
        console.log(`      Email: ${booking.guest.email}`);
        console.log(`      เบอร์โทร: ${booking.guest.phoneNumber || 'ไม่ระบุ'}`);
      } else {
        console.log(`   👤 แขก: ไม่มีข้อมูล`);
      }

      // ข้อมูลห้อง
      if (booking.room) {
        console.log(`   🏨 ห้อง: ${booking.room.roomNumber}`);
        if (booking.room.roomType) {
          console.log(`      ประเภท: ${booking.room.roomType.name}`);
          console.log(`      ราคา/คืน: ฿${Number(booking.room.roomType.pricePerNight).toLocaleString()}`);
        }
      } else {
        console.log(`   🏨 ห้อง: ไม่ได้ระบุ`);
      }

      // ผู้สร้าง Booking
      if (booking.createdBy) {
        console.log(`   👨‍💼 สร้างโดย: ${booking.createdBy.email}`);
      }

      console.log(`   📅 สร้างเมื่อ: ${new Date(booking.createdAt).toLocaleString('th-TH')}`);
      console.log(`   🔄 อัปเดตล่าสุด: ${new Date(booking.updatedAt).toLocaleString('th-TH')}`);
      console.log('-'.repeat(80));
    });

    // สรุปสถิติ
    console.log('\n📊 สรุปสถิติ Booking:');
    const statusCount = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} รายการ`);
    });

    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (Number(booking.totalAmount) || 0);
    }, 0);

    console.log(`\n💰 รายได้รวม: ฿${totalRevenue.toLocaleString()}`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเช็คข้อมูล Booking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllBookings();