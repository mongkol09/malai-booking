const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupCriticalData() {
  try {
    console.log('🛡️ เริ่มสำรองข้อมูลสำคัญ...\n');

    const backupDir = './backup-before-migration';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // 1. สำรองข้อมูล Bookings ทั้งหมด
    console.log('📋 กำลังสำรองข้อมูล Bookings...');
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        },
        payments: true,
        cancellations: true,
        bookingServices: true
      }
    });

    fs.writeFileSync(
      path.join(backupDir, `bookings-backup-${timestamp}.json`),
      JSON.stringify(bookings, null, 2)
    );
    console.log(`   ✅ สำรองข้อมูล ${bookings.length} bookings เรียบร้อย`);

    // 2. สำรองข้อมูล Guests
    console.log('👥 กำลังสำรองข้อมูล Guests...');
    const guests = await prisma.guest.findMany();
    fs.writeFileSync(
      path.join(backupDir, `guests-backup-${timestamp}.json`),
      JSON.stringify(guests, null, 2)
    );
    console.log(`   ✅ สำรองข้อมูล ${guests.length} guests เรียบร้อย`);

    // 3. สำรองข้อมูล Rooms
    console.log('🏠 กำลังสำรองข้อมูล Rooms...');
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true,
        floorPlan: true
      }
    });
    fs.writeFileSync(
      path.join(backupDir, `rooms-backup-${timestamp}.json`),
      JSON.stringify(rooms, null, 2)
    );
    console.log(`   ✅ สำรองข้อมูล ${rooms.length} rooms เรียบร้อย`);

    // 4. สำรองข้อมูล Room Types
    console.log('🏷️ กำลังสำรองข้อมูล Room Types...');
    const roomTypes = await prisma.roomType.findMany();
    fs.writeFileSync(
      path.join(backupDir, `room-types-backup-${timestamp}.json`),
      JSON.stringify(roomTypes, null, 2)
    );
    console.log(`   ✅ สำรองข้อมูล ${roomTypes.length} room types เรียบร้อย`);

    // 5. สำรองข้อมูล Users
    console.log('👤 กำลังสำรองข้อมูล Users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
        // ไม่เอา passwordHash เพื่อความปลอดภัย
      }
    });
    fs.writeFileSync(
      path.join(backupDir, `users-backup-${timestamp}.json`),
      JSON.stringify(users, null, 2)
    );
    console.log(`   ✅ สำรองข้อมูล ${users.length} users เรียบร้อย`);

    // 6. สำรองข้อมูล Payments
    console.log('💳 กำลังสำรองข้อมูล Payments...');
    const payments = await prisma.payment.findMany();
    fs.writeFileSync(
      path.join(backupDir, `payments-backup-${timestamp}.json`),
      JSON.stringify(payments, null, 2)
    );
    console.log(`   ✅ สำรองข้อมูล ${payments.length} payments เรียบร้อย`);

    // 7. สร้างไฟล์สรุป
    const summary = {
      backupDate: new Date().toISOString(),
      backupReason: 'Before adding archive system to bookings',
      totalRecords: {
        bookings: bookings.length,
        guests: guests.length,
        rooms: rooms.length,
        roomTypes: roomTypes.length,
        users: users.length,
        payments: payments.length
      },
      criticalBooking: {
        id: '1ca95546-d9b7-450f-b2c2-a8fbe58e8689',
        referenceId: 'BK24957122',
        status: 'Found and backed up',
        guest: bookings.find(b => b.id === '1ca95546-d9b7-450f-b2c2-a8fbe58e8689') ? 'Found' : 'NOT FOUND'
      }
    };

    fs.writeFileSync(
      path.join(backupDir, `backup-summary-${timestamp}.json`),
      JSON.stringify(summary, null, 2)
    );

    // 8. สร้าง SQL dump (สำหรับความมั่นใจ)
    console.log('\n📊 กำลังสร้างรายงานข้อมูลสำคัญ...');
    
    const criticalBooking = bookings.find(b => b.id === '1ca95546-d9b7-450f-b2c2-a8fbe58e8689');
    
    console.log('\n🎯 ข้อมูล Booking สำคัญ (BK24957122):');
    console.log('─────────────────────────────────────────────');
    if (criticalBooking) {
      console.log(`✅ พบข้อมูล: ${criticalBooking.bookingReferenceId}`);
      console.log(`   Guest: ${criticalBooking.guest.firstName} ${criticalBooking.guest.lastName}`);
      console.log(`   Email: ${criticalBooking.guest.email}`);
      console.log(`   Room: ${criticalBooking.room.roomNumber} (${criticalBooking.room.roomType.name})`);
      console.log(`   Check-in: ${criticalBooking.checkinDate.toLocaleDateString('th-TH')}`);
      console.log(`   Status: ${criticalBooking.status}`);
      console.log(`   Created: ${criticalBooking.createdAt.toLocaleString('th-TH')}`);
    } else {
      console.log('❌ ไม่พบข้อมูล booking นี้!');
    }

    console.log('\n📁 ไฟล์สำรองถูกบันทึกไว้ที่:');
    console.log(`   📂 ${path.resolve(backupDir)}/`);
    console.log('\n🛡️ การสำรองข้อมูลเสร็จสมบูรณ์!');
    console.log('\n⚠️  ขั้นตอนต่อไป:');
    console.log('   1. ตรวจสอบไฟล์สำรองที่สร้างขึ้น');
    console.log('   2. ใช้ prisma migrate แทน db push');
    console.log('   3. ทดสอบข้อมูลหลัง migration');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสำรองข้อมูล:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้ function
backupCriticalData().catch(console.error);