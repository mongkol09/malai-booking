/**
 * Test Full Booking Flow Again to Test Email Variables
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3001/api/v1';

const bookingTestData = {
  checkinDate: '2025-12-28T00:00:00.000Z', // Different dates to avoid conflicts
  checkoutDate: '2025-12-30T00:00:00.000Z',
  numberOfGuests: 2,
  customerData: {
    firstName: 'สมพร',
    lastName: 'ทดสอบเมล',
    email: 'test@example.com',
    phone: '081-999-8888',
    nationality: 'TH'
  }
};

async function apiRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) config.data = data;
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error.response?.data || error.message);
    throw error;
  }
}

async function runEmailVariableTest() {
  console.log('📧 Full Booking Test - Email Variable Verification');
  console.log('=================================================');
  
  try {
    // Step 1: Search availability
    console.log('\n🔍 Step 1: Searching availability...');
    const searchParams = new URLSearchParams({
      checkinDate: bookingTestData.checkinDate,
      checkoutDate: bookingTestData.checkoutDate,
      numberOfGuests: bookingTestData.numberOfGuests.toString()
    });
    
    const availability = await apiRequest('GET', `/public/bookings/search?${searchParams}`);
    console.log(`✅ Found ${availability.data.totalOptions} room types`);
    
    const selectedRoom = availability.data.availableRoomTypes[0];
    console.log(`📋 Selected: ${selectedRoom.roomTypeName} - ฿${selectedRoom.totalPrice.toLocaleString()}`);
    
    // Step 2: Create booking intent
    console.log('\n🔒 Step 2: Creating booking intent...');
    const intentData = {
      roomTypeId: selectedRoom.roomTypeId,
      checkinDate: bookingTestData.checkinDate,
      checkoutDate: bookingTestData.checkoutDate,
      numberOfGuests: bookingTestData.numberOfGuests,
      priceSnapshot: {
        basePrice: selectedRoom.baseRate,
        totalPrice: selectedRoom.totalPrice,
        priceBreakdown: selectedRoom.priceBreakdown
      }
    };
    
    const intent = await apiRequest('POST', '/public/bookings/intent', intentData);
    console.log(`✅ Intent created: ${intent.data.bookingIntentId}`);
    
    // Step 3: Complete booking
    console.log('\n✅ Step 3: Completing booking...');
    const bookingData = {
      bookingIntentId: intent.data.bookingIntentId,
      guestInfo: {
        firstName: bookingTestData.customerData.firstName,
        lastName: bookingTestData.customerData.lastName,
        email: bookingTestData.customerData.email,
        phoneNumber: bookingTestData.customerData.phone,
        country: bookingTestData.customerData.nationality,
        specialRequests: 'Please test email variables - ทดสอบตัวแปรอีเมล'
      },
      paymentInfo: {
        paymentMethodId: '4ec67f42-a259-4ba7-a2fa-9e7c2ff593e3',
        transactionToken: `txn_email_test_${Date.now()}`,
        amount: selectedRoom.totalPrice
      }
    };
    
    const booking = await apiRequest('POST', '/public/bookings/complete', bookingData);
    
    console.log('🎉 Booking completed successfully!');
    console.log(`📧 Booking ID: ${booking.data.bookingId}`);
    console.log(`📬 Reference: ${booking.data.bookingReference}`);
    console.log(`📧 Email sent: ${booking.data.confirmationEmailSent}`);
    
    console.log('\n📧 EMAIL VERIFICATION CHECKLIST:');
    console.log('================================');
    console.log(`📮 Check email at: ${bookingTestData.customerData.email}`);
    console.log('');
    console.log('✅ Verify these variables are replaced (not showing as {{variable}}):');
    console.log(`  • Name: Should show "${bookingTestData.customerData.firstName} ${bookingTestData.customerData.lastName}"`);
    console.log(`  • Booking ID: Should show "${booking.data.bookingReference}"`);
    console.log(`  • Room Type: Should show "${selectedRoom.roomTypeName}"`);
    console.log(`  • Check-in: Should show formatted date (not {{check.in.date.time}})`);
    console.log(`  • Check-out: Should show formatted date (not {{Check.out.date.time}})`);
    console.log(`  • Total: Should show "฿${selectedRoom.totalPrice.toLocaleString()}" (not {{price.included.tax}})`);
    console.log('');
    console.log('❌ If you still see {{variables}}, please let me know!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runEmailVariableTest();
