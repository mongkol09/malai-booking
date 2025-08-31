#!/usr/bin/env node

/**
 * Test Booking Creation with Telegram Notifications
 * 
 * Tests the booking creation process with automatic Telegram notifications
 */

require('dotenv').config();

async function testBookingWithTelegram() {
  console.log('🧪 Testing Booking Creation with Telegram Notifications');
  console.log('='.repeat(60));
  
  const bookingData = {
    guestFirstName: 'คุณทดสอบ',
    guestLastName: 'ระบบจอง',
    guestEmail: 'test@example.com',
    guestPhone: '081-234-5678',
    roomId: 'your-room-id', // You'll need to replace this with actual room ID
    checkInDate: '2025-08-25',
    checkOutDate: '2025-08-27',
    adults: 2,
    children: 0,
    totalAmount: 3500,
    specialRequests: 'ขอเตียงเสริม 1 เตียง และ ขอผ้าเช็ดตัวเพิ่ม'
  };
  
  console.log('📋 Test Booking Data:');
  console.log(JSON.stringify(bookingData, null, 2));
  
  try {
    console.log('\n🚀 Making booking request...');
    
    const response = await fetch('http://localhost:3001/api/v1/booking/create-simple-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    console.log('\n📊 Booking Response:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('\n✅ Booking created successfully!');
      console.log('🔖 Booking Reference:', result.booking.reference);
      console.log('👤 Guest:', result.booking.guest.name);
      console.log('🏠 Room:', result.booking.room.type, 'Room', result.booking.room.number);
      console.log('📅 Dates:', result.booking.dates.checkin, 'to', result.booking.dates.checkout);
      console.log('💰 Total:', result.booking.pricing.totalAmount, result.booking.pricing.currency);
      
      console.log('\n📧 Notifications Status:');
      console.log('Email:', result.booking.notifications.email);
      console.log('Telegram:', result.booking.notifications.telegram);
      
      console.log('\n🎯 Expected Results:');
      console.log('1. ✅ Booking should be created in database');
      console.log('2. 📧 Email confirmation attempt (may fail if MailerSend not approved)');
      console.log('3. 🤖 Telegram notification sent to admin channel');
      console.log('4. 🏨 Room status updated if applicable');
      
    } else {
      console.log('\n❌ Booking failed:');
      console.log('Error:', result.error || result.message);
      
      if (result.error && result.error.conflictDetails) {
        console.log('\n🚫 Room Conflict Details:');
        console.log('Room:', result.error.conflictDetails.roomType, result.error.conflictDetails.roomNumber);
        console.log('Requested dates:', result.error.conflictDetails.requestedDates.checkin, 'to', result.error.conflictDetails.requestedDates.checkout);
        console.log('Conflicts:');
        result.error.conflictDetails.conflicts.forEach((conflict) => {
          console.log(`  - ${conflict.guest}: ${conflict.dates.checkin} to ${conflict.dates.checkout} (${conflict.status})`);
        });
      }
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure API server is running (npm run dev)');
    console.log('2. Check database connection');
    console.log('3. Verify room ID exists in database');
    console.log('4. Check Telegram bot configuration');
  }
}

// Helper function to get available rooms
async function getAvailableRooms() {
  console.log('\n🏠 Fetching available rooms...');
  
  try {
    const response = await fetch('http://localhost:3001/api/v1/rooms');
    const result = await response.json();
    
    if (result.success && result.rooms.length > 0) {
      console.log('\n📋 Available Rooms:');
      result.rooms.slice(0, 5).forEach((room) => {
        console.log(`- ${room.roomType} Room ${room.roomNumber} (${room.status}) - ID: ${room.id}`);
      });
      
      console.log('\n💡 Copy one of the room IDs above and update the test script');
      return result.rooms[0].id; // Return first available room ID
    } else {
      console.log('❌ No rooms found or API error');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch rooms:', error.message);
    return null;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Hotel Booking with Telegram Test Suite');
  console.log('='.repeat(70));
  
  // First, get available rooms
  const roomId = await getAvailableRooms();
  
  if (roomId) {
    console.log(`\n✅ Using room ID: ${roomId}`);
    
    // Update the booking data with actual room ID
    await testBookingWithTelegram();
    
  } else {
    console.log('\n⚠️ Skipping booking test - no rooms available');
    console.log('Please ensure rooms exist in the database first');
  }
  
  console.log('\n🏁 Test Suite Complete');
}

runTests();
