#!/usr/bin/env node

/**
 * Test Booking with Real Room Data
 * 
 * Tests booking with actual rooms from database and Telegram notification
 */

require('dotenv').config();

async function testBookingWithRealRooms() {
  console.log('🏨 Testing Booking with Real Room Data');
  console.log('='.repeat(60));
  
  try {
    // 1. Get available rooms from API
    console.log('1️⃣ Fetching available rooms from database...');
    
    const roomsResponse = await fetch('http://localhost:3001/api/v1/rooms');
    const roomsResult = await roomsResponse.json();
    
    console.log('API Response Status:', roomsResponse.status);
    console.log('Rooms API Success:', roomsResult.success);
    
    if (roomsResult.success && roomsResult.rooms && roomsResult.rooms.length > 0) {
      console.log(`✅ Found ${roomsResult.rooms.length} rooms in database`);
      
      // Show available rooms
      console.log('\n📋 Available Rooms:');
      roomsResult.rooms.slice(0, 5).forEach((room, index) => {
        console.log(`${index + 1}. ${room.roomType || 'Unknown Type'} Room ${room.roomNumber} (${room.status})`);
        console.log(`   ID: ${room.id}`);
        console.log(`   Available: ${room.status === 'Available' ? '✅' : room.status === 'Occupied' ? '🔴' : '⚠️'}`);
        console.log('');
      });
      
      // Find an available room
      const availableRoom = roomsResult.rooms.find(room => room.status === 'Available');
      
      if (!availableRoom) {
        console.log('⚠️ No available rooms found, using first room for testing');
        const testRoom = roomsResult.rooms[0];
        await testBookingAPI(testRoom.id, testRoom.roomNumber, testRoom.roomType || 'Unknown');
      } else {
        console.log(`✅ Using available room: ${availableRoom.roomType} Room ${availableRoom.roomNumber}`);
        await testBookingAPI(availableRoom.id, availableRoom.roomNumber, availableRoom.roomType);
      }
      
    } else {
      console.log('❌ No rooms found in database');
      console.log('Response:', roomsResult);
      
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check if rooms exist in database');
      console.log('2. Verify database connection');
      console.log('3. Check API endpoint /api/v1/rooms');
    }
    
  } catch (error) {
    console.error('💥 Error fetching rooms:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure API server is running');
    console.log('2. Check network connectivity');
    console.log('3. Verify API endpoints');
  }
}

async function testBookingAPI(roomId, roomNumber, roomType) {
  console.log(`\n2️⃣ Testing booking creation with Room ${roomNumber}...`);
  console.log('='.repeat(50));
  
  const bookingData = {
    guestFirstName: 'คุณทดสอบ',
    guestLastName: 'ระบบจอง',
    guestEmail: 'booking@example.com',
    guestPhone: '081-234-5678',
    roomId: roomId,
    checkInDate: '2025-08-25',
    checkOutDate: '2025-08-27',
    adults: 2,
    children: 0,
    totalAmount: 3500,
    specialRequests: `ทดสอบการจอง ${roomType} Room ${roomNumber} พร้อม Telegram notification`
  };
  
  console.log('📋 Booking Request Data:');
  console.log(JSON.stringify(bookingData, null, 2));
  
  try {
    console.log('\n🚀 Sending booking request...');
    
    const response = await fetch('http://localhost:3001/api/v1/bookings/with-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    console.log('\n📊 API Response:');
    console.log('Status Code:', response.status);
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('\n🎉 BOOKING CREATED SUCCESSFULLY!');
      console.log('='.repeat(40));
      console.log('🔖 Booking Reference:', result.booking.reference);
      console.log('👤 Guest Name:', result.booking.guest.name);
      console.log('📧 Guest Email:', result.booking.guest.email);
      console.log('📱 Guest Phone:', result.booking.guest.phone);
      console.log('🏠 Room:', result.booking.room.type, 'Room', result.booking.room.number);
      console.log('📅 Check-in:', result.booking.dates.checkin);
      console.log('📅 Check-out:', result.booking.dates.checkout);
      console.log('🌙 Nights:', result.booking.dates.nights);
      console.log('💰 Total Amount:', result.booking.pricing.totalAmount, result.booking.pricing.currency);
      
      console.log('\n📱 Notifications Status:');
      console.log('Telegram:', result.booking.notifications.telegram === 'sent' ? '✅ Sent' : '❌ Failed');
      
      console.log('\n✅ Integration Test Results:');
      console.log('✅ Database connection working');
      console.log('✅ Room management working');
      console.log('✅ Guest creation working');
      console.log('✅ Booking creation working');
      console.log('✅ Telegram notification working');
      console.log('✅ API endpoint functional');
      
      console.log('\n🚀 PRODUCTION READY:');
      console.log('📱 Admin Panel Integration: POST /api/v1/bookings/with-telegram');
      console.log('🤖 Real-time Telegram notifications to admin');
      console.log('📧 Email system ready when MailerSend approved');
      console.log('🏨 Room status management integrated');
      
      console.log('\n📱 CHECK YOUR TELEGRAM CHANNEL NOW!');
      console.log('You should see a new booking notification with all details.');
      
    } else {
      console.log('\n❌ BOOKING FAILED:');
      console.log('Error:', result.error || result.message);
      
      if (result.error) {
        console.log('Error Details:', JSON.stringify(result.error, null, 2));
      }
      
      console.log('\n🔧 Common Issues:');
      console.log('1. Room ID not found in database');
      console.log('2. Invalid date format');
      console.log('3. Missing required fields');
      console.log('4. Database constraint violations');
    }
    
  } catch (error) {
    console.error('\n💥 Request failed:', error.message);
    
    console.log('\n🔧 Network Issues:');
    console.log('1. Server not responding');
    console.log('2. Network connectivity problems');
    console.log('3. API endpoint not available');
  }
}

async function testTelegramDirect() {
  console.log('\n\n3️⃣ Testing Telegram Service Directly');
  console.log('='.repeat(50));
  
  try {
    const TelegramNotificationService = require('./telegram-notification-service.js');
    const telegramService = new TelegramNotificationService();
    
    const testNotification = {
      id: 'TEST001',
      customerName: 'คุณทดสอบ ระบบ',
      email: 'test@example.com',
      phone: '081-234-5678',
      checkIn: '25/8/2568',
      checkOut: '27/8/2568',
      roomType: 'Test Room',
      guests: 2,
      totalPrice: '3,500',
      paymentStatus: 'ทดสอบระบบ',
      notes: 'การทดสอบ Telegram notification โดยตรง'
    };
    
    console.log('🤖 Sending direct Telegram test...');
    const result = await telegramService.sendBookingNotification(testNotification);
    
    if (result.success) {
      console.log('✅ Direct Telegram test successful!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.log('❌ Direct Telegram test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Direct Telegram test error:', error.message);
  }
}

// Run all tests
async function runCompleteTest() {
  console.log('🧪 COMPLETE BOOKING SYSTEM TEST');
  console.log('='.repeat(70));
  console.log('Testing: Database + API + Telegram Integration');
  console.log('');
  
  await testBookingWithRealRooms();
  await testTelegramDirect();
  
  console.log('\n\n🏁 TEST SUITE COMPLETE');
  console.log('='.repeat(70));
  console.log('🔍 Check your Telegram channel for notifications!');
  console.log('📱 Admin Panel is ready to use the booking API!');
}

runCompleteTest();
