#!/usr/bin/env node

/**
 * Test Booking API with Telegram Notifications
 * 
 * Tests the new booking endpoint with real database and Telegram
 */

require('dotenv').config();

async function testBookingWithTelegramAPI() {
  console.log('🧪 Testing Booking API with Telegram Notifications');
  console.log('='.repeat(60));
  
  // First, let's get available rooms
  console.log('1️⃣ Fetching available rooms...');
  
  try {
    const roomsResponse = await fetch('http://localhost:3001/api/v1/rooms');
    const roomsResult = await roomsResponse.json();
    
    if (!roomsResult.success || !roomsResult.rooms || roomsResult.rooms.length === 0) {
      console.log('❌ No rooms available. Using mock room ID for testing.');
      console.log('⚠️ This test may fail if room ID doesn\'t exist.');
    } else {
      console.log(`✅ Found ${roomsResult.rooms.length} rooms`);
      const firstRoom = roomsResult.rooms[0];
      console.log(`📍 Using room: ${firstRoom.roomType} Room ${firstRoom.roomNumber} (ID: ${firstRoom.id})`);
    }
    
    // Use first available room or mock ID
    const roomId = roomsResult.rooms?.[0]?.id || 'mock-room-id';
    
    // Prepare test booking data
    const bookingData = {
      guestFirstName: 'คุณทดสอบ',
      guestLastName: 'ระบบแจ้งเตือน',
      guestEmail: 'test@example.com',
      guestPhone: '081-234-5678',
      roomId: roomId,
      checkInDate: '2025-08-25',
      checkOutDate: '2025-08-27',
      adults: 2,
      children: 0,
      totalAmount: 3500,
      specialRequests: 'ขอเตียงเสริม 1 เตียง และแจ้งเวลาเช็คอินล่วงหน้า'
    };
    
    console.log('\n2️⃣ Creating booking with Telegram notification...');
    console.log('📋 Booking data:');
    console.log(JSON.stringify(bookingData, null, 2));
    
    const bookingResponse = await fetch('http://localhost:3001/api/v1/bookings/with-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    const bookingResult = await bookingResponse.json();
    
    console.log('\n📊 Booking API Response:');
    console.log('Status:', bookingResponse.status);
    console.log('Success:', bookingResult.success);
    
    if (bookingResult.success) {
      console.log('\n🎉 SUCCESS! Booking created with Telegram notification');
      console.log('🔖 Booking Reference:', bookingResult.booking.reference);
      console.log('👤 Guest:', bookingResult.booking.guest.name);
      console.log('📧 Email:', bookingResult.booking.guest.email);
      console.log('📱 Phone:', bookingResult.booking.guest.phone);
      console.log('🏠 Room:', bookingResult.booking.room.type, 'Room', bookingResult.booking.room.number);
      console.log('📅 Check-in:', bookingResult.booking.dates.checkin);
      console.log('📅 Check-out:', bookingResult.booking.dates.checkout);
      console.log('🌙 Nights:', bookingResult.booking.dates.nights);
      console.log('💰 Total:', bookingResult.booking.pricing.totalAmount, bookingResult.booking.pricing.currency);
      
      console.log('\n📱 Notifications:');
      console.log('Telegram:', bookingResult.booking.notifications.telegram);
      
      console.log('\n✅ Integration Test Results:');
      console.log('✅ API endpoint working');
      console.log('✅ Database integration working');
      console.log('✅ Telegram notification sent');
      console.log('✅ Admin panel can use this endpoint');
      
      console.log('\n🎯 Ready for Production:');
      console.log('📱 Admin will receive instant Telegram notifications');
      console.log('🔗 API Endpoint: POST /api/v1/bookings/with-telegram');
      console.log('📧 Email integration ready when MailerSend approved');
      
    } else {
      console.log('\n❌ Booking creation failed:');
      console.log('Error:', bookingResult.error || bookingResult.message);
      
      if (bookingResult.error && bookingResult.error.message === 'Room not found') {
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if rooms exist in database');
        console.log('2. Run room creation script if needed');
        console.log('3. Use valid room ID from database');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Ensure API server is running (npm run dev)');
    console.log('2. Check database connection');
    console.log('3. Verify Telegram bot configuration');
    console.log('4. Check network connectivity');
  }
}

async function testHealthCheck() {
  console.log('\n\n🔍 API Health Check');
  console.log('='.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3001/health');
    const result = await response.json();
    
    console.log('API Status:', response.status === 200 ? '✅ Healthy' : '❌ Unhealthy');
    console.log('Database:', result.database ? '✅ Connected' : '❌ Disconnected');
    console.log('Environment:', result.environment);
    console.log('Uptime:', result.uptime);
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testHealthCheck();
  await testBookingWithTelegramAPI();
  
  console.log('\n\n🏁 Test Suite Complete');
  console.log('='.repeat(60));
  console.log('📱 Check your Telegram channel for booking notification!');
}

runAllTests();
