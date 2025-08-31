/**
 * Simple Booking Complete Test for Debugging
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testBookingComplete() {
  console.log('🔍 Testing Booking Complete Endpoint...');
  
  try {
    // Use a known booking intent ID from previous test
    const testData = {
      bookingIntentId: 'c58dd61d-5d65-4f60-802e-c5c50e78a49d', // From previous test
      guestInfo: {
        firstName: 'ทดสอบ',
        lastName: 'การจอง',
        email: 'test@example.com',
        phoneNumber: '081-234-5678',
        country: 'TH',
        specialRequests: 'Welcome fruit basket'
      },
      paymentInfo: {
        paymentMethodId: '4ec67f42-a259-4ba7-a2fa-9e7c2ff593e3', // Credit Card
        transactionToken: `txn_${Date.now()}`,
        amount: 16000
      }
    };
    
    console.log('📤 Sending booking complete request...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/public/bookings/complete`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Booking completed successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.statusText);
    console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 500) {
      console.log('\n🔧 Debugging 500 error...');
      console.log('This suggests an internal server error in the confirmBooking function');
      console.log('Common causes:');
      console.log('1. Database constraint violation');
      console.log('2. Missing required fields');
      console.log('3. Email sending failure');
      console.log('4. QR code generation failure');
    }
  }
}

testBookingComplete();
