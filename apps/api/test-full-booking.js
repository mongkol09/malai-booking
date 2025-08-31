/**
 * Full Booking Test Script
 * Tests the complete booking flow from search to confirmation email
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/v1';
const TEST_EMAIL = 'your.email@example.com'; // Change this to your email for testing

// Test data
const bookingTestData = {
  checkinDate: '2025-12-25T00:00:00.000Z',
  checkoutDate: '2025-12-27T00:00:00.000Z',
  numberOfGuests: 2,
  customerData: {
    firstName: 'ทดสอบ',
    lastName: 'การจอง',
    email: 'test@example.com', // Change this to your email for testing
    phone: '081-234-5678',
    nationality: 'TH',
    passportNumber: 'T1234567890',
    dateOfBirth: '1990-05-15',
    address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
    emergencyContact: {
      name: 'คุณมารดา',
      phone: '081-987-6543'
    }
  }
};

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, 
      error.response?.data || error.message
    );
    throw error;
  }
}

// Step 1: Search for available rooms
async function searchAvailableRooms() {
  console.log('\n🔍 Step 1: Searching for available rooms...');
  
  const searchParams = new URLSearchParams({
    checkinDate: bookingTestData.checkinDate,
    checkoutDate: bookingTestData.checkoutDate,
    numberOfGuests: bookingTestData.numberOfGuests.toString()
  });
  
  const result = await apiRequest('GET', `/public/bookings/search?${searchParams}`);
  
  console.log('✅ Available rooms found:', result.data.totalOptions);
  
  if (result.data.availableRoomTypes.length === 0) {
    throw new Error('No rooms available for selected dates');
  }
  
  // Select the first available room type
  const selectedRoom = result.data.availableRoomTypes[0];
  console.log(`📋 Selected Room: ${selectedRoom.roomTypeName}`);
  console.log(`💰 Total Price: ฿${selectedRoom.totalPrice.toLocaleString()}`);
  
  return {
    roomTypeId: selectedRoom.roomTypeId,
    priceSnapshot: {
      basePrice: selectedRoom.baseRate,
      totalPrice: selectedRoom.totalPrice,
      priceBreakdown: selectedRoom.priceBreakdown
    }
  };
}

// Step 2: Create booking intent (price lock)
async function createBookingIntent(roomSelection) {
  console.log('\n🔒 Step 2: Creating booking intent (price lock)...');
  
  const intentData = {
    roomTypeId: roomSelection.roomTypeId,
    checkinDate: bookingTestData.checkinDate,
    checkoutDate: bookingTestData.checkoutDate,
    numberOfGuests: bookingTestData.numberOfGuests,
    priceSnapshot: roomSelection.priceSnapshot
  };
  
  const result = await apiRequest('POST', '/public/bookings/intent', intentData);
  
  console.log('✅ Booking intent created:', result.data.bookingIntentId);
  console.log(`⏰ Price locked until: ${new Date(result.data.expiresAt).toLocaleString()}`);
  
  return result.data.bookingIntentId;
}

// Step 3: Complete booking with customer details
async function completeBooking(intentId) {
  console.log('\n✅ Step 3: Completing booking...');
  
  const bookingData = {
    bookingIntentId: intentId,
    guestInfo: {
      firstName: bookingTestData.customerData.firstName,
      lastName: bookingTestData.customerData.lastName,
      email: bookingTestData.customerData.email,
      phoneNumber: bookingTestData.customerData.phone,
      country: bookingTestData.customerData.nationality,
      specialRequests: 'Please prepare welcome fruit basket'
    },
    paymentInfo: {
      paymentMethodId: '4ec67f42-a259-4ba7-a2fa-9e7c2ff593e3', // Credit Card ID from seed
      transactionToken: `txn_${Date.now()}`, // Mock transaction token
      amount: 30000 // This should match the locked price
    }
  };
  
  const result = await apiRequest('POST', '/public/bookings/complete', bookingData);
  
  console.log('🎉 Booking completed successfully!');
  console.log(`📧 Booking ID: ${result.data.bookingId}`);
  console.log(`📬 Confirmation Number: ${result.data.confirmationNumber}`);
  console.log(`📧 Confirmation email sent to: ${bookingTestData.customerData.email}`);
  
  return result.data;
}

// Step 4: Verify booking details
async function verifyBooking(bookingId) {
  console.log('\n🔍 Step 4: Verifying booking details...');
  
  try {
    const result = await apiRequest('GET', `/bookings/${bookingId}`);
    
    console.log('✅ Booking verification successful:');
    console.log(`   Status: ${result.data.status}`);
    console.log(`   Guest: ${result.data.guestFirstName} ${result.data.guestLastName}`);
    console.log(`   Email: ${result.data.guestEmail}`);
    console.log(`   Check-in: ${result.data.checkinDate}`);
    console.log(`   Check-out: ${result.data.checkoutDate}`);
    
    return result.data;
  } catch (error) {
    console.warn('⚠️ Could not verify booking (endpoint might not exist)');
    return null;
  }
}

// Main test function
async function runFullBookingTest() {
  console.log('🏨 Starting Full Booking Test...');
  console.log('==========================================');
  
  try {
    // Step 1: Search availability
    const roomSelection = await searchAvailableRooms();
    
    // Step 2: Create booking intent
    const intentId = await createBookingIntent(roomSelection);
    
    // Step 3: Complete booking
    const bookingResult = await completeBooking(intentId);
    
    // Step 4: Verify booking
    await verifyBooking(bookingResult.bookingId);
    
    console.log('\n🎉 FULL BOOKING TEST COMPLETED SUCCESSFULLY! 🎉');
    console.log('==========================================');
    console.log(`📧 Please check your email (${TEST_EMAIL}) for the confirmation`);
    console.log('Check the email content to see if variables are properly populated');
    
  } catch (error) {
    console.error('\n❌ BOOKING TEST FAILED:', error.message);
    
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

// Additional utility: Test just the email sending
async function testEmailOnly() {
  console.log('\n📧 Testing email sending only...');
  
  try {
    // Mock booking data for email test
    const mockBookingData = {
      bookingId: uuidv4(),
      confirmationNumber: `MALAI${Date.now()}`,
      guestFirstName: bookingTestData.customerData.firstName,
      guestLastName: bookingTestData.customerData.lastName,
      guestEmail: bookingTestData.customerData.email,
      checkinDate: bookingTestData.checkinDate,
      checkoutDate: bookingTestData.checkoutDate,
      roomTypeName: 'Test Room Type',
      totalAmount: 5000,
      numberOfGuests: bookingTestData.numberOfGuests
    };
    
    const result = await apiRequest('POST', '/email/test-booking-confirmation', mockBookingData);
    
    console.log('✅ Test email sent successfully');
    console.log(`📧 Check your email (${TEST_EMAIL}) for the test confirmation`);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'email':
    testEmailOnly();
    break;
  case 'full':
  default:
    runFullBookingTest();
    break;
}

console.log(`
Usage:
  node test-full-booking.js          # Run full booking test
  node test-full-booking.js email    # Test email only
  
Make sure to:
1. Update TEST_EMAIL with your email address
2. Start the API server (npm run dev)
3. Have some room types in the database
`);
