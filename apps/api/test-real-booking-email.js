/**
 * Test Email with Real Booking Data
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testEmailWithRealBooking() {
  console.log('📧 Testing Email with Real Booking Data...');
  
  try {
    // Use the actual booking data from our successful booking
    const mockBookingData = {
      bookingId: 'c5a7ff37-7874-4248-bdb4-7fc86ce1226f',
      confirmationNumber: 'B-636376728',
      guestFirstName: 'ทดสอบ',
      guestLastName: 'การจอง',
      guestEmail: 'test@example.com',
      checkinDate: '2025-12-25T00:00:00.000Z',
      checkoutDate: '2025-12-27T00:00:00.000Z',
      roomTypeName: 'Onsen Villa',
      totalAmount: 16000,
      numberOfGuests: 2
    };
    
    console.log('📤 Sending test email...');
    console.log(`📧 To: ${mockBookingData.guestEmail}`);
    console.log(`🎫 Booking: ${mockBookingData.confirmationNumber}`);
    
    const response = await axios.post(`${API_BASE_URL}/email/test-booking-confirmation`, mockBookingData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Email sent successfully!');
      console.log('🔍 Please check your email and verify:');
      console.log('  1. Name shows: "ทดสอบ การจอง" (not {{name}})');
      console.log('  2. Booking ID shows: "B-636376728" (not {{booking_id}})');
      console.log('  3. Check-in date is properly formatted');
      console.log('  4. Room type shows: "Onsen Villa"');
      console.log('  5. Total amount shows: "16,000 บาท"');
      
      console.log('\n📋 If you still see {{variables}}, the issue is:');
      console.log('  • Template ID mismatch');
      console.log('  • Variable naming mismatch');
      console.log('  • MailerSend template configuration error');
      
    } else {
      console.error('❌ Email failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEmailWithRealBooking();
