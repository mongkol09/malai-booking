import { PrismaClient } from '@prisma/client';
import { checkRoomAvailability } from './dailyAvailabilityService';

const prisma = new PrismaClient();

// ============================================
// TYPES & INTERFACES
// ============================================

interface AvailabilityCheckRequest {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
}

interface AvailabilityCheckResponse {
  isAvailable: boolean;
  message: string;
  roomStatus: string;
  conflictingDates: Date[];
  canBook: boolean;
}

// ============================================
// AVAILABILITY CHECK LOGIC
// ============================================

/**
 * Final availability check combining Room Status (Control) + Daily Availability (Booking)
 * Room Status (Control) + Daily Availability (Booking) = Final Availability
 */
export const checkFinalAvailability = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<AvailabilityCheckResponse> => {
  try {
    console.log(`🔍 [Availability Check] Checking availability for room ${roomId}`);

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

    // 3. Check Daily Availability (Booking Level)
    const dailyAvailabilityResult = await checkRoomAvailability(roomId, checkInDate, checkOutDate);

    // 4. Final Decision
    const isAvailable = dailyAvailabilityResult.isAvailable;
    const canBook = isAvailable && room.status === 'Available';

    return {
      isAvailable,
      message: dailyAvailabilityResult.message,
      roomStatus: room.status,
      conflictingDates: dailyAvailabilityResult.conflictingDates,
      canBook
    };

  } catch (error) {
    console.error('❌ Error in final availability check:', error);
    return {
      isAvailable: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบความพร้อมของห้อง',
      roomStatus: 'Error',
      conflictingDates: [],
      canBook: false
    };
  }
};

/**
 * Check availability for multiple rooms
 */
export const checkMultipleRoomsAvailability = async (
  roomIds: string[],
  checkInDate: Date,
  checkOutDate: Date
) => {
  const results = [];

  for (const roomId of roomIds) {
    const result = await checkFinalAvailability(roomId, checkInDate, checkOutDate);
    results.push({
      roomId,
      ...result
    });
  }

  return results;
};

/**
 * Get available rooms for a date range
 */
export const getAvailableRooms = async (
  checkInDate: Date,
  checkOutDate: Date,
  roomTypeId?: string
) => {
  try {
    // 1. Get all rooms (filter by room type if specified)
    const whereClause: any = {
      status: 'Available' // Only available rooms
    };

    if (roomTypeId) {
      whereClause.roomTypeId = roomTypeId;
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        roomType: true
      }
    });

    // 2. Check availability for each room
    const availableRooms = [];

    for (const room of rooms) {
      const availability = await checkFinalAvailability(room.id, checkInDate, checkOutDate);
      
      if (availability.canBook) {
        availableRooms.push({
          room,
          availability
        });
      }
    }

    return availableRooms;

  } catch (error) {
    console.error('❌ Error getting available rooms:', error);
    return [];
  }
};

/**
 * Update room status (Control level)
 */
export const updateRoomStatus = async (
  roomId: string,
  status: RoomStatus,
  reason?: string,
  updatedBy?: string
) => {
  try {
    console.log(`🔄 [Room Status] Updating room ${roomId} status to ${status}`);

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        status: status,
        notes: reason || null,
        updatedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'ROOM_STATUS_UPDATED',
        resourceType: 'Room',
        resourceId: roomId,
        userId: updatedBy || 'system',
        oldValues: {},
        newValues: {
          status: status,
          reason: reason
        },
        ipAddress: 'system',
        userAgent: 'system'
      }
    });

    console.log(`✅ [Room Status] Room ${roomId} status updated to ${status}`);
    return updatedRoom;

  } catch (error) {
    console.error('❌ Error updating room status:', error);
    throw error;
  }
};

/**
 * Get room status history
 */
export const getRoomStatusHistory = async (roomId: string) => {
  try {
    const history = await prisma.roomStatusHistory.findMany({
      where: { roomId: roomId },
      orderBy: { updatedAt: 'desc' },
      include: {
        room: true
      }
    });

    return history;

  } catch (error) {
    console.error('❌ Error getting room status history:', error);
    return [];
  }
};

/**
 * Check if room can be booked (simplified check)
 */
export const canRoomBeBooked = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<boolean> => {
  try {
    const result = await checkFinalAvailability(roomId, checkInDate, checkOutDate);
    return result.canBook;
  } catch (error) {
    console.error('❌ Error checking if room can be booked:', error);
    return false;
  }
};
