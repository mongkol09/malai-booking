// ============================================
// SIMPLE DATABASE CHECK FOR ROOM UNLOCK
// ============================================

require('dotenv').config();

async function checkCancelledBookings() {
  console.log('🔍 === CHECKING DATABASE FOR ROOM UNLOCK ISSUE ===\n');

  // Use direct database query script that exists
  const { execSync } = require('child_process');
  
  try {
    console.log('1. Checking cancelled bookings...');
    
    // Query cancelled bookings
    const result = execSync(`cd "d:\\Hotel_Version\\hotel_v2\\apps\\api" && npx prisma db execute --sql "
      SELECT 
        b.id,
        b.bookingReferenceId,
        b.bookingStatus,
        b.roomId,
        b.actualRoomId,
        b.checkinDate,
        b.checkoutDate,
        r.roomNumber
      FROM booking b
      LEFT JOIN room r ON b.roomId = r.id
      WHERE b.bookingStatus = 'cancelled'
      ORDER BY b.createdAt DESC
      LIMIT 5;
    "`, { encoding: 'utf8' });
    
    console.log('Cancelled Bookings Result:');
    console.log(result);
    
    console.log('\n2. Checking daily availability for 2025-09-12...');
    
    // Query daily availability for the problematic date
    const dailyResult = execSync(`cd "d:\\Hotel_Version\\hotel_v2\\apps\\api" && npx prisma db execute --sql "
      SELECT 
        da.roomId,
        da.date,
        da.status,
        da.bookingId,
        r.roomNumber
      FROM dailyAvailability da
      LEFT JOIN room r ON da.roomId = r.id
      WHERE da.date = '2025-09-12'
      ORDER BY r.roomNumber;
    "`, { encoding: 'utf8' });
    
    console.log('Daily Availability Result:');
    console.log(dailyResult);
    
  } catch (error) {
    console.error('❌ Error running queries:', error.message);
    
    // Fallback: try to use existing scripts
    console.log('\n📋 Trying alternative approach...');
    
    try {
      const checkResult = execSync(`cd "d:\\Hotel_Version\\hotel_v2\\apps\\api" && node scripts/check-bookings.js`, { encoding: 'utf8' });
      console.log('Check Bookings Result:');
      console.log(checkResult);
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
    }
  }
}

checkCancelledBookings();