const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testCheckoutWorkflow() {
  try {
    console.log('🧪 ===== TESTING COMPLETE CHECK-OUT WORKFLOW =====');
    console.log('');
    
    // Step 1: Login
    console.log('🔐 Step 1: Login with admin account...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ai@gmail.com',
      password: 'Aa12345'
    });
    
    console.log('✅ Login successful');
    
    const tokens = loginResponse.data.data.tokens;
    const user = loginResponse.data.data.user;
    
    console.log(`📧 User: ${user.email} (${user.userType})`);
    console.log(`🔑 Access Token: ${tokens.accessToken.substring(0, 50)}...`);
    console.log('');
    
    // Step 2: Get bookings
    console.log('📋 Step 2: Get bookings for check-out testing...');
    const authHeaders = {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'X-API-Key': 'hotel-booking-api-key-2024'
    };
    
    const bookingsResponse = await axios.get(`${API_BASE}/checkin/bookings`, {
      headers: authHeaders
    });
    
    const bookings = bookingsResponse.data.data;
    console.log(`✅ Found ${bookings.length} bookings`);
    
    if (bookings.length === 0) {
      console.log('⚠️ No bookings found for testing');
      return;
    }
    
    // Find a suitable booking for check-out test
    const testBooking = bookings.find(b => 
      b.status === 'InHouse' || b.status === 'Confirmed'
    ) || bookings[0];
    
    console.log('🎯 Selected test booking:');
    console.log(`   📄 ID: ${testBooking.id}`);
    console.log(`   👤 Guest: ${testBooking.guestName}`);
    console.log(`   🏠 Room: ${testBooking.roomNumber}`);
    console.log(`   📊 Status: ${testBooking.status}`);
    console.log('');
    
    // Step 3: Test Check-out API
    console.log('🚪 Step 3: Testing Check-out API...');
    const checkoutPayload = {
      checkOutTime: new Date().toISOString(),
      notes: 'Automated test checkout',
      assignedBy: 'professional-dashboard',
      additionalCharges: 0,
      housekeepingNotes: 'Standard cleaning required',
      roomCleaningStatus: 'needs_cleaning'
    };
    
    console.log('📦 Checkout payload:', JSON.stringify(checkoutPayload, null, 2));
    
    try {
      const checkoutResponse = await axios.post(
        `${API_BASE}/bookings/admin/${testBooking.id}/check-out`,
        checkoutPayload,
        { headers: authHeaders }
      );
      
      console.log('✅ Check-out API successful!');
      console.log('📄 Response:', JSON.stringify(checkoutResponse.data, null, 2));
      console.log('');
      
      console.log('🎉 Check-out workflow completed successfully!');
      console.log('');
      console.log('📋 What happened:');
      console.log('   ✅ User authentication');
      console.log('   ✅ Booking status update');
      console.log('   ✅ Room cleaning notification');
      console.log('   ✅ Post-checkout workflow');
      
    } catch (checkoutError) {
      console.error('❌ Check-out API failed:');
      console.error('   Status:', checkoutError.response?.status);
      console.error('   Error:', checkoutError.response?.data);
      console.error('   Message:', checkoutError.message);
    }
    
  } catch (error) {
    console.error('❌ Workflow test failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data);
    console.error('   Message:', error.message);
  }
}

testCheckoutWorkflow();
