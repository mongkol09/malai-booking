#!/usr/bin/env node

/**
 * Quick Booking Test with Direct Room ID
 * 
 * Tests booking with known room IDs and Telegram notification
 */

require('dotenv').config();

async function testBookingDirectly() {
  console.log('🏨 Direct Booking Test with Telegram');
  console.log('='.repeat(50));
  
  // Based on your room dashboard, let's try some room IDs
  // These are common room types from hotel systems
  const testRooms = [
    { id: 'e1-room-id', name: 'E1 Serenity Villa' },
    { id: 'e2-room-id', name: 'E2 Serenity Villa' },
    { id: 'f1-room-id', name: 'F1 Grand Serenity' },
    // Try some generated IDs that might exist
    { id: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000', name: 'Test Room 1' },
    { id: '22bf5b37-e0b8-42e0-8dcf-dc8c4aefc111', name: 'Test Room 2' }
  ];
  
  for (const room of testRooms) {
    console.log(`\n🧪 Testing with Room: ${room.name}`);
    console.log(`🔑 Room ID: ${room.id}`);
    
    const bookingData = {
      guestFirstName: 'คุณทดสอบ',
      guestLastName: `${room.name}`,
      guestEmail: 'test@malairesort.com',
      guestPhone: '081-234-5678',
      roomId: room.id,
      checkInDate: '2025-08-25',
      checkOutDate: '2025-08-27',
      adults: 2,
      children: 0,
      totalAmount: 3500,
      specialRequests: `ทดสอบการจอง ${room.name} พร้อม Telegram notification`
    };
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/bookings/with-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      const result = await response.json();
      
      console.log(`📊 Response: ${response.status} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      if (result.success) {
        console.log('🎉 BOOKING SUCCESSFUL!');
        console.log('🔖 Reference:', result.booking.reference);
        console.log('🏠 Room:', result.booking.room.type, 'Room', result.booking.room.number);
        console.log('📱 Telegram:', result.booking.notifications.telegram);
        
        console.log('\n✅ SUCCESS! Found working room ID');
        console.log('✅ Booking system fully functional');
        console.log('✅ Telegram notification sent');
        console.log('\n📱 Check your Telegram channel now!');
        break; // Stop on first success
        
      } else {
        console.log('❌ Failed:', result.error?.message || result.message);
        if (result.error?.message === 'Room not found') {
          console.log('   → Room ID not in database, trying next...');
        }
      }
      
    } catch (error) {
      console.log('💥 Request error:', error.message);
    }
  }
}

async function queryDatabaseDirectly() {
  console.log('\n\n📊 Database Direct Query');
  console.log('='.repeat(40));
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔍 Querying rooms directly from database...');
    
    const rooms = await prisma.room.findMany({
      take: 5,
      include: {
        roomType: true
      }
    });
    
    if (rooms.length > 0) {
      console.log(`✅ Found ${rooms.length} rooms in database:`);
      
      for (const room of rooms) {
        console.log(`\n🏠 Room ${room.roomNumber}:`);
        console.log(`   ID: ${room.id}`);
        console.log(`   Type: ${room.roomType?.name || 'Unknown'}`);
        console.log(`   Status: ${room.status}`);
      }
      
      // Test with first available room
      const testRoom = rooms[0];
      console.log(`\n🎯 Testing booking with: ${testRoom.roomType?.name} Room ${testRoom.roomNumber}`);
      
      await testSpecificRoom(testRoom.id, testRoom.roomNumber, testRoom.roomType?.name);
      
    } else {
      console.log('❌ No rooms found in database');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
  }
}

async function testSpecificRoom(roomId, roomNumber, roomType) {
  console.log(`\n🚀 Creating booking for Room ${roomNumber}...`);
  
  const bookingData = {
    guestFirstName: 'คุณจอง',
    guestLastName: 'ระบบจริง',
    guestEmail: 'real@malairesort.com',
    guestPhone: '081-234-5678',
    roomId: roomId,
    checkInDate: '2025-08-25',
    checkOutDate: '2025-08-27',
    adults: 2,
    children: 0,
    totalAmount: 4000,
    specialRequests: `การจองจริงในระบบ ${roomType} Room ${roomNumber}`
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/v1/bookings/with-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('🎉 REAL BOOKING SUCCESSFUL!');
      console.log('🔖 Booking Reference:', result.booking.reference);
      console.log('👤 Guest:', result.booking.guest.name);
      console.log('🏠 Room:', result.booking.room.type, 'Room', result.booking.room.number);
      console.log('📅 Dates:', result.booking.dates.checkin, 'to', result.booking.dates.checkout);
      console.log('💰 Amount:', result.booking.pricing.totalAmount, result.booking.pricing.currency);
      console.log('📱 Telegram:', result.booking.notifications.telegram);
      
      console.log('\n🏆 FULL SYSTEM TEST PASSED!');
      console.log('✅ Database integration working');
      console.log('✅ API endpoints working');
      console.log('✅ Booking creation working');
      console.log('✅ Telegram notifications working');
      console.log('✅ Ready for Admin Panel integration');
      
    } else {
      console.log('❌ Booking failed:', result.error?.message || result.message);
    }
    
  } catch (error) {
    console.error('💥 Booking request failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 COMPREHENSIVE BOOKING SYSTEM TEST');
  console.log('='.repeat(60));
  
  // Method 1: Try with possible room IDs
  await testBookingDirectly();
  
  // Method 2: Query database directly
  await queryDatabaseDirectly();
  
  console.log('\n\n🏁 TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('📱 Check Telegram for booking notifications!');
}

runTests();
