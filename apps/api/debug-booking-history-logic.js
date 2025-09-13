const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBookingHistoryQuery() {
  try {
    console.log('🔍 Testing BookingHistory service logic...');
    
    // Mimic the exact logic from getHistory method
    const filters = {};
    const pagination = { page: 1, limit: 20, sort_by: 'created_at', sort_order: 'desc' };
    
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    // Build Prisma where conditions
    const where = {};

    // Build orderBy
    const orderBy = {};
    if (sort_by === 'guest_name') {
      orderBy.guest = { firstName: sort_order };
    } else if (sort_by === 'booking_reference_id') {
      orderBy.bookingReferenceId = sort_order;
    } else {
      orderBy[sort_by] = sort_order;
    }

    console.log('Where clause:', JSON.stringify(where, null, 2));
    console.log('OrderBy clause:', JSON.stringify(orderBy, null, 2));
    console.log('Skip:', skip, 'Take:', limit);

    // Test the actual query
    console.log('\n📋 Testing Prisma query...');
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        guest: true,
        room: true,
        roomType: true
      },
      orderBy,
      skip,
      take: limit
    });

    console.log('✅ Query successful, found:', bookings.length);

    // Test the transformation
    console.log('\n🔄 Testing data transformation...');
    const data = bookings.map(booking => {
      try {
        const checkInDate = booking.checkinDate || new Date();
        const checkOutDate = booking.checkoutDate || new Date();
        const stayDuration = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        return {
          id: booking.id, // Keep as string (UUID)
          original_booking_id: booking.id, // Keep as string (UUID)
          booking_reference: booking.bookingReferenceId || '',
          guest_name: `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.trim(),
          guest_email: booking.guest?.email || '',
          guest_phone: booking.guest?.phoneNumber || '',
          room_type_name: booking.roomType?.name || '',
          room_number: booking.room?.roomNumber || '',
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          booking_date: booking.createdAt,
          stay_duration: stayDuration,
          total_amount: Number(booking.finalAmount || 0),
          paid_amount: 0,
          due_amount: Number(booking.finalAmount || 0),
          payment_status: 'Pending',
          booking_status: booking.status || 'Unknown',
          archive_reason: booking.status === 'Cancelled' ? 'User Cancellation' : 'Active',
          special_requests: booking.specialRequests || '',
          notes: '',
          cancellation_reason: '',
          refund_amount: 0,
          penalty_amount: 0,
          source: booking.source || 'Direct',
          is_anonymized: false,
          archived_at: booking.createdAt,
          archived_by: 0
        };
      } catch (transformError) {
        console.error('Error transforming booking record:', transformError, booking);
        throw transformError;
      }
    });

    console.log('✅ Transformation successful, first record:');
    console.log(JSON.stringify(data[0], null, 2));
    
    // Test count query
    const total = await prisma.booking.count({ where });
    console.log('\n📊 Total count:', total);

    console.log('\n✅ All tests passed! The logic should work.');
    
  } catch (error) {
    console.error('❌ Error in test:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  } finally {
    await prisma.$disconnect();
  }
}

testBookingHistoryQuery();