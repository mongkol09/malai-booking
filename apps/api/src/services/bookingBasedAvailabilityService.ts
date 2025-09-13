import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// BOOKING-BASED AVAILABILITY CHECK (FIXED)
// ============================================

interface AvailabilityResult {
  isAvailable: boolean;
  conflictingDates: Date[];
  message: string;
  conflictingBookings?: any[];
}

/**
 * Check room availability based on existing bookings (not daily availability table)
 * This is the CORRECT implementation that uses actual booking records
 */
export const checkRoomAvailabilityByBookings = async (
  roomId: string, 
  checkInDate: Date, 
  checkOutDate: Date
): Promise<AvailabilityResult> => {
  try {
    console.log(`🔍 [Booking-based Check] Checking room ${roomId} availability from ${checkInDate.toISOString().split('T')[0]} to ${checkOutDate.toISOString().split('T')[0]}`);

    // 1. Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return {
        isAvailable: false,
        conflictingDates: [],
        message: 'ไม่พบข้อมูลห้อง'
      };
    }

    // 2. Check room status
    if (room.status !== 'Available') {
      return {
        isAvailable: false,
        conflictingDates: [],
        message: `ห้องไม่พร้อมให้บริการ (สถานะ: ${room.status})`
      };
    }

    // 3. Find conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        status: {
          in: ['Confirmed', 'InHouse', 'CheckedIn']  // Active bookings only (not Cancelled/CheckedOut/Completed)
        },
        OR: [
          // New booking period overlaps with existing booking
          {
            checkinDate: { lte: checkOutDate },
            checkoutDate: { gt: checkInDate }
          }
        ]
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`🔍 [Booking-based Check] Found ${conflictingBookings.length} conflicting bookings`);

    if (conflictingBookings.length > 0) {
      console.log('📋 Conflicting bookings:');
      conflictingBookings.forEach(booking => {
        console.log(`   - ${booking.bookingReferenceId}: ${booking.checkinDate.toISOString().split('T')[0]} → ${booking.checkoutDate.toISOString().split('T')[0]} (${booking.status})`);
      });

      return {
        isAvailable: false,
        conflictingDates: [], // We'll use booking records instead of individual dates
        message: `ห้องไม่ว่าง มีการจองที่ทับซ้อนกัน ${conflictingBookings.length} รายการ`,
        conflictingBookings
      };
    }

    console.log('✅ [Booking-based Check] Room is available');

    return {
      isAvailable: true,
      conflictingDates: [],
      message: 'ห้องพร้อมให้บริการ'
    };

  } catch (error) {
    console.error('❌ Error in booking-based availability check:', error);
    return {
      isAvailable: false,
      conflictingDates: [],
      message: 'เกิดข้อผิดพลาดในการตรวจสอบความพร้อมของห้อง'
    };
  }
};

/**
 * Enhanced final availability check using booking records
 */
export const checkFinalAvailabilityFixed = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<{
  isAvailable: boolean;
  message: string;
  roomStatus: string;
  conflictingDates: Date[];
  canBook: boolean;
  conflictingBookings?: any[];
}> => {
  try {
    console.log(`🔍 [Enhanced Check] Checking availability for room ${roomId}`);

    // 1. Check Room Status (Control Level)
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return {
        isAvailable: false,
        message: 'ไม่พบข้อมูลห้อง',
        roomStatus: 'Unknown',
        conflictingDates: [],
        canBook: false
      };
    }

    // 2. Check Room Status (Control)
    if (room.status !== 'Available') {
      return {
        isAvailable: false,
        message: `ห้องไม่พร้อมให้บริการ (สถานะ: ${room.status})`,
        roomStatus: room.status,
        conflictingDates: [],
        canBook: false
      };
    }

    // 3. Check Booking Conflicts (Booking Level)
    const bookingAvailabilityResult = await checkRoomAvailabilityByBookings(roomId, checkInDate, checkOutDate);

    // 4. Final Decision
    const isAvailable = bookingAvailabilityResult.isAvailable;
    const canBook = isAvailable && room.status === 'Available';

    return {
      isAvailable,
      message: bookingAvailabilityResult.message,
      roomStatus: room.status,
      conflictingDates: bookingAvailabilityResult.conflictingDates,
      canBook,
      conflictingBookings: bookingAvailabilityResult.conflictingBookings
    };

  } catch (error) {
    console.error('❌ Error in enhanced final availability check:', error);
    return {
      isAvailable: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบความพร้อมของห้อง',
      roomStatus: 'Error',
      conflictingDates: [],
      canBook: false
    };
  }
};