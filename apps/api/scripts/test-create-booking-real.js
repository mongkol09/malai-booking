const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';
// Use environment variable - no hardcoded secrets
const API_KEY = process.env.API_KEY || (() => {
  console.error('❌ API_KEY not found in environment variables');
  console.log('💡 Set API_KEY in your .env file or run: export API_KEY="your-api-key"');
  process.exit(1);
})();

async function testCreateBookingReal() {
  try {
    console.log('🧪 Testing booking creation with real guest data...');
    
    const bookingData = {
      guestData: {
        name: 'Mr.Beam eimp', // Real name from user
        email: 'beam.eimp@example.com',
        phone: '+66812345678',
        nationality: 'Thai'
      },
      roomData: {
        type: 'bbfb9e6e-2154-4a16-9124-18f4267cfc75', // Grand Serenity room type ID
        number: 'F2' // available room
      },
      dates: {
        checkIn: '2025-09-01',
        checkOut: '2025-09-02'
      },
      pricing: {
        total: 2500,
        currency: 'THB'
      },
      specialRequests: 'Test booking for Mr.Beam eimp',
      source: 'Manual Test',
      paymentMethod: 'cash',
      status: 'confirmed'
    };
    
    console.log('📝 Sending booking data:', JSON.stringify(bookingData, null, 2));
    
    const response = await axios.post(`${API_BASE}/bookings`, bookingData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });
    
    console.log('✅ Booking created successfully!');
    console.log('📋 Response:', response.data);
    
    if (response.data.success) {
      console.log('🎯 New booking reference:', response.data.data.bookingReferenceId);
      console.log('👤 Guest name in response:', response.data.data.guestName);
    }
    
  } catch (error) {
    console.error('❌ Error creating booking:', error.response?.data || error.message);
  }
}

testCreateBookingReal();
