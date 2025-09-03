import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES & INTERFACES
// ============================================

interface AvailabilityCheck {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
}

interface AvailabilityResult {
  isAvailable: boolean;
  conflictingDates: Date[];
  message: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate locked nights based on check-in and check-out dates
 * Night-based Logic: Lock all nights from check-in to check-out-1
 */
export const calculateLockedNights = (checkInDate: Date, checkOutDate: Date): Date[] => {
  const nights: Date[] = [];
  const current = new Date(checkInDate);
  
  // Lock all nights from check-in to check-out-1
  while (current < checkOutDate) {
    nights.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return nights;
};

/**
 * Check if a room is available for the given date range
 */
export const checkRoomAvailability = async (
  roomId: string, 
  checkInDate: Date, 
  checkOutDate: Date
): Promise<AvailabilityResult> => {
  try {
    // 1. Check if room exists and is available
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

    // 2. Check room status (Control level)
    if (room.status !== 'Available') {
      return {
        isAvailable: false,
        conflictingDates: [],
        message: `ห้องไม่พร้อมให้บริการ (สถานะ: ${room.status})`
      };
    }

    // 3. Calculate locked nights
    const lockedNights = calculateLockedNights(checkInDate, checkOutDate);

    // 4. Check daily availability for each night
    const conflictingDates: Date[] = [];
    
    for (const night of lockedNights) {
      const dailyAvailability = await prisma.dailyAvailability.findUnique({
        where: {
          roomId_date: {
            roomId: roomId,
            date: night
          }
        }
      });

      if (dailyAvailability && dailyAvailability.status !== 'Available') {
        conflictingDates.push(night);
      }
    }

    const isAvailable = conflictingDates.length === 0;

    return {
      isAvailable,
      conflictingDates,
      message: isAvailable 
        ? 'ห้องพร้อมให้บริการ' 
        : `ห้องไม่ว่างในวันที่: ${conflictingDates.map(d => d.toLocaleDateString('th-TH')).join(', ')}`
    };

  } catch (error) {
    console.error('❌ Error checking room availability:', error);
    return {
      isAvailable: false,
      conflictingDates: [],
      message: 'เกิดข้อผิดพลาดในการตรวจสอบความพร้อมของห้อง'
    };
  }
};

/**
 * Lock room for booking (create daily availability records)
 */
export const lockRoomForBooking = async (
  roomId: string,
  bookingId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<boolean> => {
  try {
    console.log(`🔒 [Availability] Locking room ${roomId} for booking ${bookingId}`);

    // Calculate locked nights
    const lockedNights = calculateLockedNights(checkInDate, checkOutDate);

    // Create or update daily availability records
    for (const night of lockedNights) {
      await prisma.dailyAvailability.upsert({
        where: {
          roomId_date: {
            roomId: roomId,
            date: night
          }
        },
        update: {
          status: 'Booked',
          bookingId: bookingId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          updatedAt: new Date()
        },
        create: {
          roomId: roomId,
          date: night,
          status: 'Booked',
          bookingId: bookingId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate
        }
      });
    }

    console.log(`✅ [Availability] Room ${roomId} locked for ${lockedNights.length} nights`);
    return true;

  } catch (error) {
    console.error('❌ Error locking room for booking:', error);
    return false;
  }
};

/**
 * Unlock room after cancellation
 */
export const unlockRoomAfterCancellation = async (
  roomId: string,
  bookingId: string
): Promise<boolean> => {
  try {
    console.log(`🔓 [Availability] Unlocking room ${roomId} after cancellation`);

    // Update all daily availability records for this booking
    const updatedRecords = await prisma.dailyAvailability.updateMany({
      where: {
        roomId: roomId,
        bookingId: bookingId
      },
      data: {
        status: 'Available',
        bookingId: null,
        checkInDate: null,
        checkOutDate: null,
        updatedAt: new Date()
      }
    });

    console.log(`✅ [Availability] Unlocked ${updatedRecords.count} daily availability records`);
    return true;

  } catch (error) {
    console.error('❌ Error unlocking room after cancellation:', error);
    return false;
  }
};

/**
 * Initialize daily availability for a room
 */
export const initializeDailyAvailability = async (
  roomId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  try {
    console.log(`📅 [Availability] Initializing daily availability for room ${roomId}`);

    const current = new Date(startDate);
    const records = [];

    while (current <= endDate) {
      records.push({
        roomId: roomId,
        date: new Date(current),
        status: 'Available'
      });
      current.setDate(current.getDate() + 1);
    }

    // Use upsert to avoid duplicates
    for (const record of records) {
      await prisma.dailyAvailability.upsert({
        where: {
          roomId_date: {
            roomId: record.roomId,
            date: record.date
          }
        },
        update: {
          status: record.status,
          updatedAt: new Date()
        },
        create: record
      });
    }

    console.log(`✅ [Availability] Initialized ${records.length} daily availability records`);
    return true;

  } catch (error) {
    console.error('❌ Error initializing daily availability:', error);
    return false;
  }
};

/**
 * Get room availability for a date range
 */
export const getRoomAvailability = async (
  roomId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const availability = await prisma.dailyAvailability.findMany({
      where: {
        roomId: roomId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return availability;

  } catch (error) {
    console.error('❌ Error getting room availability:', error);
    return [];
  }
};
