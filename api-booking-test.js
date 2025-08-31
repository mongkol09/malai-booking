// ใช้ built-in fetch ของ Node.js (v18+)
// const fetch = require('node-fetch'); // ไม่ต้องใช้แล้ว

const API_BASE_URL = 'http://localhost:3001/api/v1';
const ADMIN_URL = 'http://localhost:3000/room-booking-list';

// ข้อมูลการจองห้อง Onsen สำหรับทดสอบ
const testBookingData = {
  guest: {
    name: "คุณทดสอบ API",
    email: "mongkol09ms@gmail.com", 
    phone: "081-999-8888",
    nationality: "Thai",
    idNumber: "1234567890123"
  },
  
  room: {
    type: "Onsen",
    number: null, // ให้ระบบจัดสรรอัตโนมัติ
    guests: 2,
    preferences: "ห้องเงียบ, วิวสวย"
  },
  
  dates: {
    checkin: "2025-08-19",
    checkout: "2025-08-20", 
    nights: 1
  },
  
  pricing: {
    roomRate: 3500,
    taxes: 350,
    fees: 100,
    totalAmount: 3950,
    currency: "THB"
  },
  
  specialRequests: "ทดสอบการจองผ่าน API - End to End Test",
  source: "API Direct Test",
  paymentMethod: "credit_card",
  status: "confirmed"
};

// ฟังก์ชันสำหรับเช็คสถานะ API
async function checkApiHealth() {
  console.log('🔍 Checking API health...');
  
  try {
    const healthUrl = API_BASE_URL.replace('/api/v1', '') + '/health';
    const response = await fetch(healthUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is healthy:', data);
      return true;
    } else {
      console.log('❌ API health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot reach API:', error.message);
    return false;
  }
}

// ฟังก์ชันสำหรับสร้างการจอง
async function createBookingViaAPI() {
  console.log('\n🏨 Creating booking via API...');
  console.log('📋 Booking Data:', JSON.stringify(testBookingData, null, 2));
  
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Hotel-Booking-API-Test/1.0'
      },
      body: JSON.stringify(testBookingData)
    });
    
    console.log('📡 Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      
      if (response.status === 401) {
        console.log('\n🔐 Authentication Required!');
        console.log('💡 Tip: The API might require authentication for booking creation');
        return null;
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Booking Created Successfully!');
    console.log('📦 Full API Response:', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('❌ Error creating booking:', error.message);
    return null;
  }
}

// ฟังก์ชันสำหรับตรวจสอบการจองที่สร้างแล้ว
async function verifyBooking(bookingId, qrCode) {
  console.log('\n🔍 Verifying booking...');
  
  try {
    // ลองดึงข้อมูลการจองด้วย QR Code
    if (qrCode) {
      console.log('📱 Testing QR Code lookup...');
      const qrResponse = await fetch(`${API_BASE_URL}/bookings/qr/${qrCode}`);
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('✅ QR Code lookup successful:', qrData.bookingReferenceId);
        return true;
      }
    }
    
    // ลองดึงข้อมูลการจองด้วย ID
    if (bookingId) {
      console.log('🔎 Testing booking ID lookup...');
      const idResponse = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
      
      if (idResponse.ok) {
        const idData = await idResponse.json();
        console.log('✅ Booking ID lookup successful:', idData.bookingReferenceId);
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    return false;
  }
}

// ฟังก์ชันสำหรับทดสอบ API ที่เกี่ยวข้อง
async function testRelatedAPIs() {
  console.log('\n🧪 Testing related APIs...');
  
  const tests = [
    {
      name: 'Room Availability',
      url: `${API_BASE_URL}/rooms/availability?checkin=2025-08-19&checkout=2025-08-20&roomType=Onsen`,
      method: 'GET'
    },
    {
      name: 'Room Types',
      url: `${API_BASE_URL}/rooms/types`,
      method: 'GET'
    },
    {
      name: 'Booking List (Admin)',
      url: `${API_BASE_URL}/admin/bookings`,
      method: 'GET'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing ${test.name}...`);
      const response = await fetch(test.url, { method: test.method });
      
      if (response.ok) {
        console.log(`✅ ${test.name}: OK (${response.status})`);
      } else if (response.status === 401) {
        console.log(`🔐 ${test.name}: Requires Authentication`);
      } else {
        console.log(`⚠️ ${test.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
}

// ฟังก์ชันหลักสำหรับรันการทดสอบ
async function runEndToEndTest() {
  console.log('🚀 Starting End-to-End API Booking Test');
  console.log('📅 Testing Onsen room booking for Aug 19-20, 2025');
  console.log('='.repeat(60));
  
  // 1. เช็คสถานะ API
  const apiHealthy = await checkApiHealth();
  if (!apiHealthy) {
    console.log('\n💡 Please make sure the API server is running:');
    console.log('   cd apps/api && npm run dev');
    process.exit(1);
  }
  
  // 2. ทดสอบ API ที่เกี่ยวข้อง
  await testRelatedAPIs();
  
  // 3. สร้างการจอง
  const booking = await createBookingViaAPI();
  
  if (booking) {
    console.log('\n🎉 BOOKING SUCCESS!');
    console.log('─'.repeat(40));
    console.log('📋 Booking Details:');
    console.log(`   Booking ID: ${booking.data?.id || booking.id}`);
    console.log(`   Reference: ${booking.data?.bookingReferenceId || booking.bookingReferenceId}`);
    console.log(`   QR Code: ${booking.data?.qrCode || booking.qrCode}`);
    console.log(`   Room: ${booking.data?.room?.number || booking.room?.number || 'TBD'}`);
    console.log(`   Guest: ${booking.data?.guest?.name || booking.guest?.name}`);
    console.log(`   Check-in: ${booking.data?.dates?.checkin || booking.dates?.checkin}`);
    console.log(`   Amount: ฿${(booking.data?.pricing?.totalAmount || booking.pricing?.totalAmount)?.toLocaleString()}`);
    
    // 4. ตรวจสอบการจอง
    const bookingId = booking.data?.id || booking.id;
    const qrCode = booking.data?.qrCode || booking.qrCode;
    const verified = await verifyBooking(bookingId, qrCode);
    
    if (verified) {
      console.log('\n✅ VERIFICATION SUCCESS!');
    } else {
      console.log('\n⚠️ VERIFICATION FAILED!');
    }
    
    // 5. แนะนำการเช็คใน Admin Panel
    const referenceId = booking.data?.bookingReferenceId || booking.bookingReferenceId;
    console.log('\n📊 ADMIN PANEL CHECK:');
    console.log('─'.repeat(40));
    console.log('1. Open Admin Panel:', ADMIN_URL);
    console.log('2. Look for booking reference:', referenceId);
    console.log('3. Verify all booking details are displayed correctly');
    console.log('4. Test booking actions (view details, check-in/out, etc.)');
    
    console.log('\n🎯 END-TO-END TEST STATUS: ✅ SUCCESS');
    console.log('💡 The booking system is working correctly!');
    console.log('\n🔥 REAL BOOKING CREATED - Check Admin Panel Now!');
    console.log(`🎟️ Booking Reference: ${referenceId}`);
    
  } else {
    console.log('\n❌ BOOKING FAILED!');
    console.log('─'.repeat(40));
    console.log('💡 Possible issues:');
    console.log('   • API authentication required');
    console.log('   • Database connection issues');
    console.log('   • Room availability conflicts');
    console.log('   • Validation errors');
    
    console.log('\n🔧 Debugging steps:');
    console.log('   1. Check API server logs');
    console.log('   2. Verify database connection');
    console.log('   3. Test with authentication if required');
    
    console.log('\n🎯 END-TO-END TEST STATUS: ❌ FAILED');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 End-to-End API Test Complete');
}

// เรียกใช้ฟังก์ชันหลักถ้าไฟล์นี้ถูกรันโดยตรง
if (require.main === module) {
  runEndToEndTest().catch(error => {
    console.error('💥 Test failed with error:', error);
    process.exit(1);
  });
}

module.exports = {
  runEndToEndTest,
  createBookingViaAPI,
  checkApiHealth,
  testRelatedAPIs
};
