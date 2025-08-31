#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetBookingStatus() {
  try {
    console.log('🔄 Resetting booking BK35130278 status to Confirmed...');
    
    const updated = await prisma.booking.update({
      where: {
        id: 'a96320b4-e527-45a6-96da-985c95439f85'
      },
      data: {
        status: 'Confirmed',
        checkinTime: null,
        checkoutTime: null,
        checkinBy: null,
        checkoutBy: null
      }
    });

    console.log('✅ Booking status updated successfully!');
    console.log('📋 Booking ID:', updated.id);
    console.log('📋 Reference ID:', updated.bookingReferenceId);
    console.log('📊 New Status:', updated.status);
    console.log('⏰ Check-in Time:', updated.checkinTime);
    console.log('⏰ Check-out Time:', updated.checkoutTime);
    
    console.log('\n🎯 Now you can test check-in with this booking!');
    console.log('Database ID:', updated.id);
    console.log('Reference ID:', updated.bookingReferenceId);
    
  } catch (error) {
    console.error('❌ Error updating booking status:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  resetBookingStatus();
}

module.exports = { resetBookingStatus };
