import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update room cleaning status
 */
export const updateRoomCleaningStatus = async (req: Request, res: Response) => {
  try {
    console.log('🧹 ===== ROOM STATUS UPDATE REQUEST =====');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User:', (req as any).user);
    
    const { roomNumber, status, notes = '' } = req.body;
    const staffId = (req as any).user?.id;
    
    console.log('🧹 Extracted data:', { roomNumber, status, notes, staffId });
    
    // Find the room
    const room = await prisma.room.findFirst({
      where: { roomNumber }
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: { message: `Room ${roomNumber} not found` }
      });
    }
    
    // Valid statuses from Prisma Schema
    const validRoomStatuses = ['Available', 'Occupied', 'Reserved', 'Dirty', 'Cleaning'];
    const validHousekeepingStatuses = ['Clean', 'Dirty', 'InProgress', 'OutOfOrder', 'Maintenance'];
    
    console.log('🔧 Received status:', status);
    console.log('🔧 Valid room statuses:', validRoomStatuses);
    console.log('🔧 Valid housekeeping statuses:', validHousekeepingStatuses);
    
    // Map common status names to proper Prisma enum values
    let roomStatus = status;
    let housekeepingStatus = null;
    
    // Status mapping for room checkout
    if (status === 'Available' || status === 'available') {
      roomStatus = 'Available';
      housekeepingStatus = 'Dirty'; // Room available but needs cleaning
    } else if (status === 'need_cleaning') {
      roomStatus = 'Available'; 
      housekeepingStatus = 'Dirty';
    } else if (status === 'cleaning_in_progress') {
      roomStatus = 'Cleaning';
      housekeepingStatus = 'InProgress';
    } else if (!validRoomStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { 
          message: 'Invalid status',
          received: status,
          validRoomStatuses,
          validHousekeepingStatuses
        }
      });
    }
    
    // Update room status
    console.log('🔧 Updating room with:', { roomStatus, housekeepingStatus });
    
    const updateData: any = {
      status: roomStatus,
      updatedAt: new Date()
    };
    
    // Update housekeeping status if provided
    if (housekeepingStatus) {
      updateData.housekeepingStatus = housekeepingStatus;
    }
    
    // Set lastCleanedAt if room is marked as clean
    if (housekeepingStatus === 'Clean') {
      updateData.lastCleanedAt = new Date();
    }
    
    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: updateData
    });
    
    // Create housekeeping task record
    const housekeepingTask = await prisma.housekeepingTask.create({
      data: {
        roomId: room.id,
        assignedStaffId: staffId || null,
        taskType: 'CheckoutClean', // From HousekeepingTaskType enum
        priority: 'Normal',
        status: 'Pending', // From HousekeepingTaskStatus enum
        notes: notes,
        estimatedDurationMinutes: 45,
        createdAt: new Date()
      }
    });
    
    console.log('✅ Housekeeping task created:', housekeepingTask.id);
    
    // Log for ML data collection (optional)
    try {
      console.log('📊 Logging room status change for ML...');
      // await logRoomStatusChange(roomNumber, status, staffId, notes);
      console.log('✅ ML logging skipped (function not implemented)');
    } catch (logError) {
      console.warn('⚠️ ML logging failed (non-critical):', logError);
    }
    
    res.json({
      success: true,
      message: 'Room status updated successfully',
      data: {
        roomNumber,
        roomId: room.id,
        status,
        previousStatus: room.status,
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ ===== ROOM STATUS UPDATE ERROR =====');
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Full error:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update room status',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Get room status
 */
export const getRoomStatus = async (req: Request, res: Response) => {
  try {
    const { roomNumber } = req.params;
    
    console.log('🏠 Getting room status for:', roomNumber);
    
    const room = await prisma.room.findFirst({
      where: { roomNumber },
      include: {
        roomType: true,
        housekeeping: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            staff: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: { message: `Room ${roomNumber} not found` }
      });
    }
    
    res.json({
      success: true,
      data: {
        room: {
          id: room.id,
          roomNumber: room.roomNumber,
          status: room.status,
          roomType: room.roomType?.name,
          lastCleanedAt: room.lastCleanedAt,
          updatedAt: room.updatedAt
        },
        housekeepingHistory: room.housekeeping.map(h => ({
          id: h.id,
          status: h.status,
          notes: h.notes,
          createdAt: h.createdAt,
          staffName: h.staff ? `${h.staff.firstName} ${h.staff.lastName}` : 'System'
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting room status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get room status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Get all rooms that need cleaning
 */
export const getRoomsNeedCleaning = async (req: Request, res: Response) => {
  try {
    console.log('🧹 Getting rooms that need cleaning...');
    
    const rooms = await prisma.room.findMany({
      where: {
        status: {
          in: ['need_cleaning', 'cleaning_in_progress']
        }
      },
      include: {
        roomType: true,
        housekeeping: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { status: 'asc' }, // need_cleaning first, then cleaning_in_progress
        { updatedAt: 'asc' } // oldest first
      ]
    });
    
    const roomsData = rooms.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      status: room.status,
      roomType: room.roomType?.name,
      lastCleanedAt: room.lastCleanedAt,
      updatedAt: room.updatedAt,
      priority: calculateCleaningPriority(room),
      waitingTime: room.updatedAt ? Math.round((Date.now() - room.updatedAt.getTime()) / (1000 * 60)) : 0 // minutes
    }));
    
    res.json({
      success: true,
      data: {
        total: roomsData.length,
        needCleaning: roomsData.filter(r => r.status === 'need_cleaning').length,
        cleaningInProgress: roomsData.filter(r => r.status === 'cleaning_in_progress').length,
        rooms: roomsData
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting rooms needing cleaning:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get rooms needing cleaning',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Calculate cleaning priority based on various factors
 */
function calculateCleaningPriority(room: any): 'high' | 'medium' | 'normal' {
  const now = Date.now();
  const updatedTime = room.updatedAt ? room.updatedAt.getTime() : now;
  const waitingMinutes = (now - updatedTime) / (1000 * 60);
  
  // High priority: waited more than 2 hours or VIP room types
  if (waitingMinutes > 120 || room.roomType?.name?.includes('Villa') || room.roomType?.name?.includes('Suite')) {
    return 'high';
  }
  
  // Medium priority: waited more than 1 hour
  if (waitingMinutes > 60) {
    return 'medium';
  }
  
  return 'normal';
}

/**
 * Log room status changes for ML analysis
 */
async function logRoomStatusChange(roomNumber: string, status: string, staffId?: string, notes?: string) {
  try {
    await prisma.mlDataCollection.create({
      data: {
        eventType: 'room_status_change',
        staffId: staffId || null,
        eventData: {
          roomNumber,
          status,
          notes,
          timestamp: new Date().toISOString()
        },
        createdAt: new Date()
      }
    });
    
    console.log('📊 ML data logged for room status change');
  } catch (error) {
    console.error('⚠️ Failed to log ML data:', error);
    // Don't throw error - this is optional logging
  }
}