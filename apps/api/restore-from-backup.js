const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreFromBackup() {
  try {
    console.log('🔄 เริ่มการกู้คืนข้อมูลจาก backup...\n');

    const backupDir = './backup-before-migration';
    const timestamp = '2025-09-13T16-24-17-251Z'; // backup ที่มีข้อมูลครบ

    // 1. อ่านข้อมูลจาก backup files
    console.log('📖 อ่านข้อมูลจาก backup files...');
    
    const bookingsData = JSON.parse(fs.readFileSync(
      path.join(backupDir, `bookings-backup-${timestamp}.json`), 'utf8'
    ));
    
    const guestsData = JSON.parse(fs.readFileSync(
      path.join(backupDir, `guests-backup-${timestamp}.json`), 'utf8'
    ));
    
    const roomsData = JSON.parse(fs.readFileSync(
      path.join(backupDir, `rooms-backup-${timestamp}.json`), 'utf8'
    ));
    
    const roomTypesData = JSON.parse(fs.readFileSync(
      path.join(backupDir, `room-types-backup-${timestamp}.json`), 'utf8'
    ));
    
    const usersData = JSON.parse(fs.readFileSync(
      path.join(backupDir, `users-backup-${timestamp}.json`), 'utf8'
    ));

    console.log(`   ✅ อ่านข้อมูล ${bookingsData.length} bookings`);
    console.log(`   ✅ อ่านข้อมูล ${guestsData.length} guests`);
    console.log(`   ✅ อ่านข้อมูล ${roomsData.length} rooms`);
    console.log(`   ✅ อ่านข้อมูล ${roomTypesData.length} room types`);
    console.log(`   ✅ อ่านข้อมูล ${usersData.length} users`);

    // 2. เช็คข้อมูล critical booking
    const criticalBooking = bookingsData.find(b => b.id === '1ca95546-d9b7-450f-b2c2-a8fbe58e8689');
    if (criticalBooking) {
      console.log('\n🎯 พบข้อมูล Critical Booking:');
      console.log(`   📋 Booking: ${criticalBooking.bookingReferenceId}`);
      console.log(`   👤 Guest: ${criticalBooking.guest.firstName} ${criticalBooking.guest.lastName}`);
      console.log(`   📧 Email: ${criticalBooking.guest.email}`);
      console.log(`   🏠 Room: ${criticalBooking.room.roomNumber} (${criticalBooking.room.roomType.name})`);
      console.log(`   📅 Check-in: ${new Date(criticalBooking.checkinDate).toLocaleDateString('th-TH')}`);
    } else {
      console.log('\n❌ ไม่พบ Critical Booking ใน backup!');
      throw new Error('Critical booking not found in backup');
    }

    // 3. Clear existing data (careful!)
    console.log('\n🗑️ ลบข้อมูลเดิมออกก่อน restore...');
    await prisma.booking.deleteMany({});
    await prisma.guest.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.roomType.deleteMany({});
    console.log('   ✅ ลบข้อมูลเดิมเรียบร้อย');

    // 4. Restore Room Types ก่อน (เพราะ Room จะ reference ไป)
    console.log('\n🏷️ กู้คืนข้อมูล Room Types...');
    for (const roomType of roomTypesData) {
      await prisma.roomType.create({
        data: {
          id: roomType.id,
          name: roomType.name,
          description: roomType.description,
          baseRate: roomType.baseRate,
          capacityAdults: roomType.capacityAdults,
          capacityChildren: roomType.capacityChildren,
          imageUrl: roomType.imageUrl,
          amenities: roomType.amenities,
          isActive: roomType.isActive,
          createdAt: new Date(roomType.createdAt),
          updatedAt: new Date(roomType.updatedAt)
        }
      });
    }
    console.log(`   ✅ กู้คืน ${roomTypesData.length} room types`);

    // 5. Restore Rooms
    console.log('\n🏠 กู้คืนข้อมูล Rooms...');
    for (const room of roomsData) {
      await prisma.room.create({
        data: {
          id: room.id,
          roomNumber: room.roomNumber,
          roomTypeId: room.roomTypeId,
          floorPlanId: room.floorPlanId,
          status: room.status,
          lastCheckoutDate: room.lastCheckoutDate ? new Date(room.lastCheckoutDate) : null,
          notes: room.notes,
          currentBookingId: room.currentBookingId,
          lastAssignedAt: room.lastAssignedAt ? new Date(room.lastAssignedAt) : null,
          lastCleanedAt: room.lastCleanedAt ? new Date(room.lastCleanedAt) : null,
          maintenanceNotes: room.maintenanceNotes,
          housekeepingStatus: room.housekeepingStatus,
          createdAt: new Date(room.createdAt),
          updatedAt: new Date(room.updatedAt)
        }
      });
    }
    console.log(`   ✅ กู้คืน ${roomsData.length} rooms`);

    // 6. Restore Guests
    console.log('\n👥 กู้คืนข้อมูล Guests...');
    for (const guest of guestsData) {
      await prisma.guest.create({
        data: {
          id: guest.id,
          userId: guest.userId,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phoneNumber: guest.phoneNumber,
          country: guest.country,
          idNumber: guest.idNumber,
          dateOfBirth: guest.dateOfBirth ? new Date(guest.dateOfBirth) : null,
          gender: guest.gender,
          notes: guest.notes,
          createdAt: new Date(guest.createdAt),
          updatedAt: new Date(guest.updatedAt),
          title: guest.title,
          father_name: guest.father_name,
          occupation: guest.occupation,
          anniversary: guest.anniversary ? new Date(guest.anniversary) : null,
          nationality: guest.nationality,
          is_vip: guest.is_vip,
          customer_image_url: guest.customer_image_url
        }
      });
    }
    console.log(`   ✅ กู้คืน ${guestsData.length} guests`);

    // 7. Restore Users
    console.log('\n👤 กู้คืนข้อมูล Users...');
    for (const user of usersData) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          passwordHash: 'temp_password_need_reset' // temporary password
        }
      });
    }
    console.log(`   ✅ กู้คืน ${usersData.length} users (ต้องตั้ง password ใหม่)`);

    // 8. Restore Bookings
    console.log('\n📋 กู้คืนข้อมูล Bookings...');
    for (const booking of bookingsData) {
      await prisma.booking.create({
        data: {
          id: booking.id,
          bookingReferenceId: booking.bookingReferenceId,
          guestId: booking.guestId,
          roomId: booking.roomId,
          roomTypeId: booking.roomTypeId,
          bookingTypeId: booking.bookingTypeId,
          checkinDate: new Date(booking.checkinDate),
          checkoutDate: new Date(booking.checkoutDate),
          numAdults: booking.numAdults,
          numChildren: booking.numChildren,
          totalPrice: booking.totalPrice,
          discountAmount: booking.discountAmount,
          taxAmount: booking.taxAmount,
          finalAmount: booking.finalAmount,
          baseAmount: booking.baseAmount,
          discountType: booking.discountType,
          serviceChargeAmount: booking.serviceChargeAmount,
          serviceChargeType: booking.serviceChargeType,
          commissionAmount: booking.commissionAmount,
          commissionType: booking.commissionType,
          extraChargesAmount: booking.extraChargesAmount,
          extraChargesType: booking.extraChargesType,
          status: booking.status,
          cancellationPolicyId: booking.cancellationPolicyId,
          specialRequests: booking.specialRequests,
          source: booking.source,
          confirmationEmailSentAt: booking.confirmationEmailSentAt ? new Date(booking.confirmationEmailSentAt) : null,
          createdAt: new Date(booking.createdAt),
          updatedAt: new Date(booking.updatedAt),
          arrival_from: booking.arrival_from,
          purpose_of_visit: booking.purpose_of_visit,
          booking_remarks: booking.booking_remarks,
          actualRoomId: booking.actualRoomId,
          checkinTime: booking.checkinTime ? new Date(booking.checkinTime) : null,
          checkoutTime: booking.checkoutTime ? new Date(booking.checkoutTime) : null,
          assignedBy: booking.assignedBy,
          checkinBy: booking.checkinBy,
          checkoutBy: booking.checkoutBy,
          specialRequestsCheckin: booking.specialRequestsCheckin,
          earlyCheckinTime: booking.earlyCheckinTime ? new Date(booking.earlyCheckinTime) : null,
          lateCheckoutTime: booking.lateCheckoutTime ? new Date(booking.lateCheckoutTime) : null,
          roomAssignedAt: booking.roomAssignedAt ? new Date(booking.roomAssignedAt) : null,
          walkInGuest: booking.walkInGuest
        }
      });
    }
    console.log(`   ✅ กู้คืน ${bookingsData.length} bookings`);

    // 9. ตรวจสอบข้อมูลหลัง restore
    console.log('\n🔍 ตรวจสอบข้อมูลหลัง restore...');
    const restoredBookings = await prisma.booking.count();
    const restoredGuests = await prisma.guest.count();
    const restoredRooms = await prisma.room.count();
    const criticalBookingRestored = await prisma.booking.findUnique({
      where: { id: '1ca95546-d9b7-450f-b2c2-a8fbe58e8689' },
      include: { guest: true, room: { include: { roomType: true } } }
    });

    console.log(`   📊 Bookings: ${restoredBookings}`);
    console.log(`   📊 Guests: ${restoredGuests}`);
    console.log(`   📊 Rooms: ${restoredRooms}`);
    
    if (criticalBookingRestored) {
      console.log('\n🎉 Critical Booking กู้คืนสำเร็จ:');
      console.log(`   📋 ${criticalBookingRestored.bookingReferenceId}`);
      console.log(`   👤 ${criticalBookingRestored.guest.firstName} ${criticalBookingRestored.guest.lastName}`);
      console.log(`   📧 ${criticalBookingRestored.guest.email}`);
      console.log(`   🏠 ${criticalBookingRestored.room.roomNumber} (${criticalBookingRestored.room.roomType.name})`);
    } else {
      console.log('\n❌ Critical Booking ยังไม่กู้คืน!');
    }

    console.log('\n✅ การกู้คืนข้อมูลเสร็จสมบูรณ์!');
    console.log('\n⚠️  สิ่งที่ต้องทำต่อไป:');
    console.log('   1. ตั้ง password ใหม่สำหรับ admin users');
    console.log('   2. ทดสอบ API endpoints');
    console.log('   3. ตรวจสอบ booking list ใน admin panel');

  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาดในการกู้คืนข้อมูล:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้ function
restoreFromBackup().catch(console.error);