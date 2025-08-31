const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test the new simple email function
async function testSimpleEmail() {
  try {
    console.log('🧪 Testing simple email function...');
    
    // Import from the compiled JavaScript (since we're using .js)
    const { sendBookingConfirmationEmailSimple } = await import('./dist/src/controllers/emailController.js');
    
    // Mock booking data
    const mockBooking = {
      id: 'test-123',
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
      email: 'ruuk@malaikhaoyai.com', // Using admin email for testing
      phone: '+66-81-234-5678',
      country: 'Thailand'
    };
    
    const mockRoomType = {
      name: 'Deluxe Garden View',
      id: 'room-type-1'
    };
    
    console.log('📧 Sending test email with simple template...');
    await sendBookingConfirmationEmailSimple(mockBooking, mockGuest, mockRoomType);
    
    console.log('✅ Simple email test completed successfully!');
    console.log('📬 Check email inbox for:', mockGuest.email);
    
  } catch (error) {
    console.error('❌ Simple email test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSimpleEmail();
