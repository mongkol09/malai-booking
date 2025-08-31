const fetch = require('node-fetch');

async function checkInHouseBookings() {
  console.log('🏨 Checking In-House bookings...');
  
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMzYxYjc4MC0wMmU1LTRjNTQtYmE2Zi0wNjJkODciZDZmN2EiLCJlbWFpbCI6ImFpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiQURNSU4iLCJzZXNzaW9uSWQiOiI3NjIyOWQ2Ni1iYjM4LTRlOTItYTE0ZC0zMTFhMzAxZjk4YzUiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU1OTUyMjQyLCJleHAiOjE3NTU5NTMxNDIsImF1ZCI6ImhvdGVsLWJvb2tpbmctY2xpZW50IiwiaXNzIjoiaG90ZWwtYm9va2luZy1hcGkifQ.TM7iCjNBZpMMSfXl27CG1m3VOxD7cw2S4YOnjAXRSxE';
  
  try {
    const response = await fetch('http://localhost:3001/api/v1/bookings/admin/all', {
      method: 'GET',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json' 
      }
    });
    
    const data = await response.json();
    
    if (data.bookings) {
      console.log('📊 Total bookings:', data.bookings.length);
      
      // Count by status
      const statusCount = {};
      data.bookings.forEach(booking => {
        const status = booking.status || 'unknown';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      console.log('📈 Status breakdown:', statusCount);
      
      // Find In-House bookings
      const inHouseBookings = data.bookings.filter(booking => {
        const status = booking.status?.toLowerCase();
        return status === 'inhouse' || status === 'in-house';
      });
      
      console.log('🏨 In-House bookings:', inHouseBookings.length);
      
      if (inHouseBookings.length > 0) {
        console.log('✅ Available for checkout:');
        inHouseBookings.forEach((booking, index) => {
          console.log(`${index + 1}. ${booking.customerName || booking.guestName || 'Guest'} - Room ${booking.roomNumber || booking.roomType} (Ref: ${booking.bookingReferenceId})`);
        });
      } else {
        console.log('ℹ️ No guests currently checked in');
        console.log('💡 To test checkout, you need to check in a guest first');
        
        // Show confirmed bookings that could be checked in
        const confirmedBookings = data.bookings.filter(booking => {
          const status = booking.status?.toLowerCase();
          return status === 'confirmed';
        });
        
        if (confirmedBookings.length > 0) {
          console.log('');
          console.log('📋 Confirmed bookings (can be checked in):');
          confirmedBookings.slice(0, 3).forEach((booking, index) => {
            console.log(`${index + 1}. ${booking.customerName || booking.guestName || 'Guest'} - Room ${booking.roomNumber || booking.roomType} (Ref: ${booking.bookingReferenceId})`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkInHouseBookings();
