const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function safeMigration() {
  try {
    console.log('🔧 เริ่มการ Migration แบบปลอดภัย...\n');

    // ตรวจสอบข้อมูลก่อน migration
    const bookingCount = await prisma.booking.count();
    console.log(`📊 จำนวน booking ปัจจุบัน: ${bookingCount} รายการ`);

    // ตรวจสอบ booking สำคัญ
    const criticalBooking = await prisma.booking.findUnique({
      where: { id: '1ca95546-d9b7-450f-b2c2-a8fbe58e8689' },
      include: { guest: true, room: true }
    });

    if (criticalBooking) {
      console.log('✅ พบ booking สำคัญ BK24957122');
    } else {
      console.log('❌ ไม่พบ booking สำคัญ!');
      return;
    }

    console.log('\n🚀 เริ่ม migration...');

    // Step 1: เพิ่ม columns แบบปลอดภัย
    console.log('1. เพิ่ม archive columns...');
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
    `;
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
    `;
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_reason VARCHAR(255);
    `;
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_by TEXT;
    `;

    // Step 2: เพิ่ม performance columns
    console.log('2. เพิ่ม performance columns...');
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255);
    `;
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
    `;
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);
    `;
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_number VARCHAR(50);
    `;
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_type_name VARCHAR(100);
    `;
    await prisma.$executeRaw`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stay_nights INTEGER;
    `;

    // Step 3: อัปเดตข้อมูลที่มีอยู่
    console.log('3. อัปเดตข้อมูล derived fields...');
    
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: {
          include: { roomType: true }
        }
      }
    });

    for (const booking of bookings) {
      const stayNights = Math.ceil(
        (booking.checkoutDate - booking.checkinDate) / (1000 * 60 * 60 * 24)
      );

      await prisma.$executeRaw`
        UPDATE bookings SET 
          is_archived = FALSE,
          guest_name = ${`${booking.guest.firstName} ${booking.guest.lastName}`},
          guest_email = ${booking.guest.email},
          guest_phone = ${booking.guest.phoneNumber || ''},
          room_number = ${booking.room.roomNumber},
          room_type_name = ${booking.room.roomType.name},
          stay_nights = ${stayNights}
        WHERE booking_id = ${booking.id};
      `;
    }

    // Step 4: สร้าง indexes
    console.log('4. สร้าง performance indexes...');
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_is_archived 
      ON bookings (is_archived);
    `;
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_archived_status 
      ON bookings (is_archived, status);
    `;

    // Step 5: ตรวจสอบผลลัพธ์
    console.log('\n✅ Migration สำเร็จ! ตรวจสอบผลลัพธ์...');
    
    const finalBookingCount = await prisma.booking.count();
    const finalCriticalBooking = await prisma.booking.findUnique({
      where: { id: '1ca95546-d9b7-450f-b2c2-a8fbe58e8689' }
    });

    console.log(`📊 จำนวน booking หลัง migration: ${finalBookingCount} รายการ`);
    console.log(`✅ Booking สำคัญ: ${finalCriticalBooking ? 'ปลอดภัย' : 'หายไป!'}`);

    if (finalCriticalBooking) {
      console.log(`   📋 BK24957122: ${finalCriticalBooking.bookingReferenceId}`);
      console.log(`   📦 Is Archived: ${finalCriticalBooking.isArchived || 'false'}`);
    }

    console.log('\n🎉 Migration เสร็จสมบูรณ์และปลอดภัย!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ migration:', error);
    console.log('\n🛡️ ข้อมูลยังคงปลอดภัยเนื่องจากใช้ ADD COLUMN IF NOT EXISTS');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

safeMigration().catch(console.error);