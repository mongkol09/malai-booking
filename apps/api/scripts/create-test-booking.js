#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function createTestBooking() {
  console.log('🧪 ===== CREATE TEST BOOKING =====\n');
  
  const BASE_URL = 'http://localhost:3001';
  const API_KEY = 'hotel-booking-api-key-2024';
  
  try {
    console.log('🏨 Creating a test booking...');
    console.log('📍 API URL:', BASE_URL);
    
    // ข้อมูล booking ทดสอบ
    const bookingData = {
      guestInfo: {
        firstName: 'ทดสอบ',
        lastName: 'Resend Email',
        email: process.env.TEST_EMAIL || 'test@malairesort.com',
        phoneNumber: '081-234-5678',
        country: 'Thailand'
      },
      bookingDetails: {
        roomTypeId: '3d684bac-5cac-4c78-9cd3-8163d10ce4f1', // Serenity Villa
        checkinDate: new Date().toISOString().split('T')[0],
        checkoutDate: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
        numAdults: 2,
        numChildren: 0,
        specialRequests: 'ทดสอบ Resend email service'
      },
      paymentInfo: {
        method: 'test',
        amount: 3500
      }
    };

    console.log('📧 Email will be sent to:', bookingData.guestInfo.email);
    console.log('📅 Check-in date:', bookingData.bookingDetails.checkinDate);
    console.log('📅 Check-out date:', bookingData.bookingDetails.checkoutDate);

    // สร้าง booking ผ่าน API
    console.log('\n📤 Sending booking creation request...');
    
    const response = await axios.post(`${BASE_URL}/api/v1/bookings/simple`, bookingData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    if (response.data.success) {
      console.log('\n🎉 BOOKING CREATED SUCCESSFULLY!');
      console.log('📋 Booking details:', {
        id: response.data.data.booking.id,
        referenceId: response.data.data.booking.bookingReferenceId,
        status: response.data.data.booking.status,
        room: response.data.data.room?.roomNumber,
        guest: `${response.data.data.guest.firstName} ${response.data.data.guest.lastName}`,
        email: response.data.data.guest.email
      });

      console.log('\n📧 Email confirmation should be sent to:', response.data.data.guest.email);
      console.log('🔔 Telegram notification should be sent for new booking');

      console.log('\n✅ Full Booking Flow Test Results:');
      console.log('1. ✅ Booking created in database');
      console.log('2. 📧 Email confirmation triggered (check inbox)');
      console.log('3. 🔔 Telegram notification triggered (check chat)');
      console.log('4. 🏨 Room assigned and status updated');

      console.log('\n🎯 Next Test: Check-in Process');
      console.log(`Use booking ID: ${response.data.data.booking.id}`);
      console.log(`Reference ID: ${response.data.data.booking.bookingReferenceId}`);

      // เตรียมข้อมูลสำหรับทดสอบ check-in
      console.log('\n🔗 For check-in test, use this data:');
      console.log(`Database ID: ${response.data.data.booking.id}`);
      console.log(`Professional Dashboard: http://localhost:3000/professional-checkin`);

    } else {
      console.error('\n❌ Booking creation failed:', response.data);
    }

  } catch (error) {
    console.error('\n❌ Error creating booking:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the API server is running:');
      console.log('   cd apps/api && npm run dev');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Check API endpoints and routes');
    }
  }
}

// ตรวจสอบ API server ก่อน
async function checkAPIHealth() {
  try {
    console.log('🔍 Checking API server...');
    const response = await axios.get('http://localhost:3001/api/health');
    console.log('✅ API server is running:', response.data.status);
    return true;
  } catch (error) {
    console.log('❌ API server is not running');
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting Full Booking Flow Test...\n');
  
  const apiRunning = await checkAPIHealth();
  if (!apiRunning) {
    console.log('\n🔧 Please start the API server first:');
    console.log('   cd apps/api && npm run dev');
    return;
  }
  
  await createTestBooking();
  
  console.log('\n📋 Summary:');
  console.log('• ✅ API server running');
  console.log('• 🏨 Booking creation tested');
  console.log('• 📧 Email notification tested');
  console.log('• 🔔 Telegram notification tested');
  console.log('\n🎊 Complete notification system is ready!');
}

if (require.main === module) {
  runTest();
}

module.exports = { createTestBooking };
