// Monitor API calls to see what requests are coming in
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// This will show us incoming requests
console.log('🔍 ===== API CALL MONITOR =====');
console.log('Listening for incoming booking requests...');
console.log('');

// Check current bookings count
async function showCurrentStats() {
  try {
    const bookingCount = await prisma.booking.count();
    const latestBooking = await prisma.booking.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { guest: true }
    });
    
    console.log(`📊 Current booking count: ${bookingCount}`);
    if (latestBooking) {
      console.log(`📋 Latest booking: ${latestBooking.bookingReferenceId} by ${latestBooking.guest?.firstName} ${latestBooking.guest?.lastName}`);
    }
    console.log('');
    console.log('🎯 Now submit a booking from the frontend and watch the logs...');
    console.log('');
    
  } catch (error) {
    console.error('Error getting stats:', error);
  }
}

showCurrentStats();

// Keep the process running
setInterval(() => {
  // Check for new bookings every 5 seconds
}, 5000);
