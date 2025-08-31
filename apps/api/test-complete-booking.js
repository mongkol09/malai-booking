require('dotenv').config();

// Test complete booking flow with new simple email
async function testBookingWithSimpleEmail() {
  try {
    console.log('🧪 Testing complete booking flow with simple email...');
    
    const response = await fetch('http://localhost:3001/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guestInfo: {
          firstName: 'สมชาย',
          lastName: 'ใจดี',
          email: 'ruuk@malaikhaoyai.com', // Using admin email for testing
          phone: '+66-81-234-5678',
          country: 'Thailand'
        },
        bookingDetails: {
          roomTypeId: 'rm_deluxe_garden_view',
          checkinDate: '2024-02-15',
          checkoutDate: '2024-02-17',
          numAdults: 2,
          numChildren: 0,
          specialRequests: 'ทดสอบการส่งอีเมลด้วย template ใหม่'
        },
        paymentInfo: {
          method: 'CREDIT_CARD',
          amount: 4500
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Booking created successfully!');
      console.log('📧 Email should be sent with simple template');
      console.log('📬 Check email inbox for: ruuk@malaikhaoyai.com');
      console.log('🔍 Booking Reference:', result.data?.booking?.bookingReferenceId);
    } else {
      console.error('❌ Booking failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test sending email directly with simple function
async function testDirectSimpleEmail() {
  try {
    console.log('🧪 Testing direct simple email function...');
    
    // Import the function
    const { sendBookingConfirmationEmailSimple } = await import('./dist/controllers/emailController.js');
    
    // Mock data
    const mockBooking = {
      id: 'test-' + Date.now(),
      bookingReferenceId: 'MKR-' + Date.now(),
      checkinDate: new Date('2024-02-15'),
      checkoutDate: new Date('2024-02-17'),
      numAdults: 2,
      numChildren: 0,
      finalAmount: 4500,
      totalPrice: 4500,
      status: 'CONFIRMED'
    };
    
    const mockGuest = {
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      email: 'ruuk@malaikhaoyai.com',
      phone: '+66-81-234-5678',
      country: 'Thailand'
    };
    
    const mockRoomType = {
      name: 'Deluxe Garden View',
      id: 'room-type-1'
    };
    
    console.log('📧 Sending test email...');
    await sendBookingConfirmationEmailSimple(mockBooking, mockGuest, mockRoomType);
    
    console.log('✅ Simple email sent successfully!');
    console.log('📬 Check email inbox for: ruuk@malaikhaoyai.com');
    
  } catch (error) {
    console.error('❌ Direct email test failed:', error);
  }
}

// Choose which test to run
const testType = process.argv[2] || 'email';

if (testType === 'booking') {
  testBookingWithSimpleEmail();
} else {
  testDirectSimpleEmail();
}

console.log('💡 Usage:');
console.log('  node test-complete-booking.js email    - Test email sending only');
console.log('  node test-complete-booking.js booking  - Test complete booking flow');
