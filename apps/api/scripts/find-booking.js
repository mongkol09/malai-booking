#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBooking() {
  try {
    console.log('🔍 Searching for booking BK35130278...');
    
    // ค้นหาด้วย bookingReferenceId
    const booking = await prisma.booking.findFirst({
      where: {
        bookingReferenceId: 'BK35130278'
      },
      include: {
        guest: true,
        room: true,
        payments: true
      }
    });

    if (booking) {
      console.log('✅ Found booking!');
      console.log('📋 Database ID:', booking.id);
      console.log('📋 Reference ID:', booking.bookingReferenceId);
      console.log('👤 Guest:', booking.guest?.firstName, booking.guest?.lastName);
      console.log('🏨 Room:', booking.room?.roomNumber);
      console.log('📊 Status:', booking.status);
      console.log('📅 Check-in Date:', booking.checkinDate);
      console.log('📅 Check-out Date:', booking.checkoutDate);
      console.log('💰 Final Amount:', booking.finalAmount);
      console.log('');
      
      // แสดง full object สำหรับ debug
      console.log('🔍 Full booking object:');
      console.log(JSON.stringify(booking, null, 2));
      
      return booking;
    } else {
      console.log('❌ Booking not found with reference ID: BK35130278');
      
      // ลองค้นหา booking ล่าสุดเผื่อชื่อผิด
      console.log('🔍 Searching for recent bookings...');
      const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: true,
          room: true
        }
      });
      
      console.log('📋 Recent bookings:');
      recentBookings.forEach(booking => {
        console.log(`- ID: ${booking.id}, Ref: ${booking.bookingReferenceId}, Guest: ${booking.guest?.firstName} ${booking.guest?.lastName}, Room: ${booking.room?.roomNumber}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error searching booking:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  findBooking();
}

module.exports = { findBooking };
