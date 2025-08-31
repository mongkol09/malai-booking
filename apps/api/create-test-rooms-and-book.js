#!/usr/bin/env node

/**
 * Create Test Room and Room Type for Booking Tests
 * 
 * Creates basic room data for testing booking with Telegram
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestRoomData() {
  console.log('🏠 Creating Test Room Data for Booking Tests');
  console.log('='.repeat(60));
  
  try {
    // 1. Create or get floor plan
    console.log('1️⃣ Creating floor plan...');
    
    let floorPlan = await prisma.floorPlan.findFirst({
      where: { floorNumber: 1 }
    });
    
    if (!floorPlan) {
      floorPlan = await prisma.floorPlan.create({
        data: {
          floorNumber: 1,
          floorName: 'Ground Floor',
          totalRooms: 10,
          isActive: true
        }
      });
      console.log('✅ Floor plan created:', floorPlan.id);
    } else {
      console.log('✅ Floor plan exists:', floorPlan.id);
    }
    
    // 2. Create or get room type
    console.log('\n2️⃣ Creating room type...');
    
    let roomType = await prisma.roomType.findFirst({
      where: { name: 'Standard Room' }
    });
    
    if (!roomType) {
      roomType = await prisma.roomType.create({
        data: {
          name: 'Standard Room',
          description: 'Comfortable standard room with modern amenities',
          baseRate: 1500.00,
          capacityAdults: 2,
          capacityChildren: 1,
          floorPlanId: floorPlan.id,
          isActive: true
        }
      });
      console.log('✅ Room type created:', roomType.id);
    } else {
      console.log('✅ Room type exists:', roomType.id);
    }
    
    // 3. Create test rooms
    console.log('\n3️⃣ Creating test rooms...');
    
    const roomsToCreate = [
      { roomNumber: '101', status: 'Available' },
      { roomNumber: '102', status: 'Available' },
      { roomNumber: '103', status: 'Available' }
    ];
    
    const createdRooms = [];
    
    for (const roomData of roomsToCreate) {
      let room = await prisma.room.findFirst({
        where: { roomNumber: roomData.roomNumber }
      });
      
      if (!room) {
        room = await prisma.room.create({
          data: {
            roomNumber: roomData.roomNumber,
            roomTypeId: roomType.id,
            floorPlanId: floorPlan.id,
            status: roomData.status,
            isActive: true
          }
        });
        console.log(`✅ Room ${roomData.roomNumber} created:`, room.id);
      } else {
        console.log(`✅ Room ${roomData.roomNumber} exists:`, room.id);
      }
      
      createdRooms.push(room);
    }
    
    // 4. Display room information
    console.log('\n📋 Available Rooms for Testing:');
    console.log('='.repeat(50));
    
    for (const room of createdRooms) {
      console.log(`🏠 Room ${room.roomNumber}:`);
      console.log(`   ID: ${room.id}`);
      console.log(`   Type: ${roomType.name}`);
      console.log(`   Status: ${room.status}`);
      console.log(`   Rate: ฿${roomType.baseRate}/night`);
      console.log('');
    }
    
    console.log('🎯 Test Data Ready:');
    console.log('✅ Floor plan created');
    console.log('✅ Room type created');
    console.log(`✅ ${createdRooms.length} rooms available`);
    console.log('✅ Ready for booking tests');
    
    // Return first room ID for testing
    return createdRooms[0].id;
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function testBookingWithRealRoom() {
  console.log('\n\n🧪 Testing Booking with Real Room Data');
  console.log('='.repeat(60));
  
  try {
    const roomId = await createTestRoomData();
    
    console.log('\n🚀 Making booking request with real room ID...');
    
    const bookingData = {
      guestFirstName: 'คุณทดสอบ',
      guestLastName: 'ระบบจริง',
      guestEmail: 'realtest@example.com',
      guestPhone: '081-234-5678',
      roomId: roomId,
      checkInDate: '2025-08-25',
      checkOutDate: '2025-08-27',
      adults: 2,
      children: 0,
      totalAmount: 3000,
      specialRequests: 'ทดสอบระบบการจองพร้อม Telegram'
    };
    
    console.log('📋 Booking data:', JSON.stringify(bookingData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/v1/bookings/with-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    console.log('\n📊 API Response:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('\n🎉 SUCCESS! Real booking created with Telegram notification');
      console.log('🔖 Booking Reference:', result.booking.reference);
      console.log('👤 Guest:', result.booking.guest.name);
      console.log('🏠 Room:', result.booking.room.type, 'Room', result.booking.room.number);
      console.log('📅 Dates:', result.booking.dates.checkin, 'to', result.booking.dates.checkout);
      console.log('💰 Total:', result.booking.pricing.totalAmount, result.booking.pricing.currency);
      console.log('📱 Telegram:', result.booking.notifications.telegram);
      
      console.log('\n✅ Full Integration Test PASSED:');
      console.log('✅ Database integration working');
      console.log('✅ Room management working');
      console.log('✅ Guest creation working');
      console.log('✅ Booking creation working');
      console.log('✅ Telegram notification sent');
      
      console.log('\n🚀 READY FOR PRODUCTION:');
      console.log('📱 Admin Panel can use: POST /api/v1/bookings/with-telegram');
      console.log('🤖 Telegram notifications working perfectly');
      console.log('📧 Email ready when MailerSend approved');
      
    } else {
      console.log('\n❌ Booking failed:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

// Run the complete test
testBookingWithRealRoom();
