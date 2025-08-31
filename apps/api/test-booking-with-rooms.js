#!/usr/bin/env node

/**
 * Test Booking with Available Rooms and Telegram Notification
 * 
 * Uses existing available rooms from the system
 */

require('dotenv').config();

async function testBookingWithExistingRooms() {
  console.log('🏨 Testing Booking with Available Rooms');
  console.log('='.repeat(60));
  
  // List of available rooms from the system
  const availableRooms = [
    { id: '98f087f1-45e4-4335-aef1-f3445695b0ad', name: 'E1 - Serenity Villa' },
    { id: '3b76585c-2524-49a8-8c43-dc32a88d1451', name: 'E2 - Serenity Villa' },
    { id: '0cfad288-a460-4b42-a47b-15feb8ebl0a3', name: 'E3 - Serenity Villa' },
    { id: 'd89f9eb8-feb2-451b-b7ed-9ecb897ac68f', name: 'F1 - Grand Serenity' },
    { id: '7d63ffec-4d13-4343-aad7-7ad5d2495796', name: 'F2 - Grand Serenity' }
  ];
  
  console.log('📋 Available Rooms:');
  availableRooms.forEach((room, index) => {
    console.log(`${index + 1}. ${room.name} (ID: ${room.id})`);
  });
  
  // Use first available room (E1 - Serenity Villa)
  const selectedRoom = availableRooms[0];
  console.log(`\n🎯 Selected Room: ${selectedRoom.name}`);
  
  const bookingData = {
    guestFirstName: 'คุณทดสอบ',
    guestLastName: 'ระบบจอง',
    guestEmail: 'test@example.com',
    guestPhone: '081-234-5678',
    roomId: selectedRoom.id,
    checkInDate: '2025-08-25',
    checkOutDate: '2025-08-27',
    adults: 2,
    children: 0,
    totalAmount: 3500,
    specialRequests: 'ขอเตียงเสริม 1 เตียง และวิวสวน'
  };
  
  console.log('\n📝 Booking Data:');
  console.log(JSON.stringify(bookingData, null, 2));
  
  try {
    console.log('\n🚀 Making booking request...');
    
    const response = await fetch('http://localhost:3001/api/v1/bookings/with-telegram', {
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
      console.log('\n🎉 BOOKING SUCCESSFUL!');
      console.log('🔖 Booking Reference:', result.booking.reference);
      console.log('👤 Guest:', result.booking.guest.name);
      console.log('🏠 Room:', result.booking.room.type, 'Room', result.booking.room.number);
      console.log('📅 Check-in:', result.booking.dates.checkin);
      console.log('📅 Check-out:', result.booking.dates.checkout);
      console.log('🌙 Nights:', result.booking.dates.nights);
      console.log('💰 Total:', result.booking.pricing.totalAmount, result.booking.pricing.currency);
      
      console.log('\n📱 Notifications:');
      console.log('Telegram:', result.booking.notifications.telegram);
      
      console.log('\n✅ Expected Results:');
      console.log('1. ✅ Booking created in database');
      console.log('2. ✅ Guest record created');
      console.log('3. 🤖 Telegram notification sent to admin');
      console.log('4. 📱 Check your Telegram channel for booking alert!');
      
    } else {
      console.log('\n❌ BOOKING FAILED:');
      console.log('Error:', result.error || result.message);
      
      if (result.error && result.error.message) {
        console.log('Details:', result.error.message);
      }
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Server not running. Please start the server:');
      console.log('cd apps/api && npm run dev');
    } else {
      console.log('\n🔧 Possible issues:');
      console.log('1. Check API server is running');
      console.log('2. Verify database connection');
      console.log('3. Check room ID exists');
    }
  }
}

async function testTelegramFirst() {
  console.log('\n\n🤖 Testing Telegram Service First');
  console.log('='.repeat(50));
  
  try {
    // Import and test Telegram service
    const TelegramNotificationService = require('./telegram-notification-service.js');
    const telegramService = new TelegramNotificationService();
    
    const testResult = await telegramService.sendSystemNotification(
      'ทดสอบก่อนการจอง',
      'กำลังทดสอบระบบการจองห้องพัก\n\nห้องที่เลือก: E1 - Serenity Villa\nเวลา: ' + new Date().toLocaleString('th-TH'),
      'info'
    );
    
    if (testResult.success) {
      console.log('✅ Telegram service working');
      return true;
    } else {
      console.log('❌ Telegram service failed:', testResult.error);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Telegram test error:', error.message);
    return false;
  }
}

// Main execution
async function runFullTest() {
  console.log('🚀 Full Hotel Booking Test with Telegram');
  console.log('='.repeat(70));
  
  // Test Telegram first
  const telegramWorking = await testTelegramFirst();
  
  if (!telegramWorking) {
    console.log('\n⚠️ Telegram not working, but continuing with booking test...');
  }
  
  // Run booking test
  await testBookingWithExistingRooms();
  
  console.log('\n🏁 Test Complete');
  console.log('='.repeat(70));
  console.log('📱 Check your Telegram channel for notifications!');
}

runFullTest();
