// ============================================
// ROOM ROUTES
// ============================================

import express from 'express';
// Removed validateApiKey import - using session-based authentication only
import { sessionAuth, requireSessionRole } from '../middleware/sessionAuth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Public endpoint - Get room status (no auth required)
router.get('/status', async (req, res) => {
  try {
    console.log('🏨 Fetching room status data...');

    // Get all rooms with their current bookings
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true,
        bookings: {
          where: {
            OR: [
              {
                AND: [
                  { checkinDate: { lte: new Date() } },
                  { checkoutDate: { gte: new Date() } },
                  { status: { in: ['Confirmed', 'CheckedIn'] } }
                ]
              },
              {
                AND: [
                  { checkinDate: { equals: new Date(new Date().setHours(0, 0, 0, 0)) } },
                  { status: 'Confirmed' }
                ]
              }
            ]
          },
          include: {
            guest: true
          },
          orderBy: {
            checkinDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: [
        { roomType: { name: 'asc' } },
        { roomNumber: 'asc' }
      ]
    });

    // Transform data for frontend
    const roomsWithStatus = rooms.map(room => {
      const currentBooking = room.bookings[0];
      let status = 'Available';
      let guestInfo = null;
      let bookingInfo = null;

      if (currentBooking) {
        const today = new Date();
        const checkinDate = new Date(currentBooking.checkinDate);
        const checkoutDate = new Date(currentBooking.checkoutDate);

        if (currentBooking.status === 'CheckedIn') {
          status = 'Occupied';
        } else if (
          currentBooking.status === 'Confirmed' && 
          checkinDate <= today && 
          checkoutDate >= today
        ) {
          status = 'Pending Check-in';
        }

        guestInfo = {
          firstName: currentBooking.guest.firstName,
          lastName: currentBooking.guest.lastName,
          email: currentBooking.guest.email,
          phoneNumber: currentBooking.guest.phoneNumber
        };

        bookingInfo = {
          id: currentBooking.id,
          bookingReferenceId: currentBooking.bookingReferenceId,
          checkinDate: currentBooking.checkinDate,
          checkoutDate: currentBooking.checkoutDate,
          numAdults: currentBooking.numAdults,
          numChildren: currentBooking.numChildren,
          totalPrice: currentBooking.totalPrice,
          finalAmount: currentBooking.finalAmount,
          status: currentBooking.status,
          outstandingAmount: parseFloat(currentBooking.finalAmount.toString())
        };
      }

      // Override with room status if set
      if (room.status && room.status !== 'Available') {
        status = room.status;
      }

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        roomType: {
          id: room.roomType.id,
          name: room.roomType.name,
          basePrice: room.roomType.baseRate,
          capacity: room.roomType.capacityAdults + room.roomType.capacityChildren
        },
        status: status,
        floor: 'Ground',
        currentBooking: bookingInfo,
        guest: guestInfo,
        lastCleaned: room.lastCleanedAt,
        maintenanceNotes: room.notes,
        canCheckin: status === 'Pending Check-in',
        canAssign: status === 'Available'
      };
    });

    console.log(`✅ Found ${roomsWithStatus.length} rooms`);

    res.json({
      success: true,
      data: roomsWithStatus,
      summary: {
        total: roomsWithStatus.length,
        available: roomsWithStatus.filter(r => r.status === 'Available').length,
        occupied: roomsWithStatus.filter(r => r.status === 'Occupied').length,
        pendingCheckin: roomsWithStatus.filter(r => r.status === 'Pending Check-in').length,
        cleaning: roomsWithStatus.filter(r => r.status === 'Cleaning').length,
        maintenance: roomsWithStatus.filter(r => r.status === 'Maintenance').length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching room status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch room status',
        code: 'ROOM_STATUS_ERROR'
      }
    });
  }
});

// Get all rooms (Admin/Staff/DEV)
router.get('/', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), async (req, res) => {
  try {
    console.log('🏠 GET /rooms - Getting rooms from database');
    
    // Get filter parameters
    const { status } = req.query;
    
    const whereClause: any = {};
    if (status) {
      whereClause.status = status.toString().toUpperCase();
    }
    
    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        roomType: true,
        bookings: {
          where: {
            status: 'InHouse'
          },
          include: {
            guest: true
          },
          take: 1
        }
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    console.log(`📊 Total rooms found: ${rooms.length}`);
    
    // Format rooms data for frontend compatibility
    const formattedRooms = rooms.map((room: any) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      number: room.roomNumber,
      type: room.roomType.name,
      price: Number(room.roomType.baseRate),
      capacity: room.roomType.capacityAdults,
      capacityChildren: room.roomType.capacityChildren || 0,
      size: room.roomType.sizeSqm ? `${room.roomType.sizeSqm} sqm` : 'Standard',
      bedType: room.roomType.bedType || 'Unknown',
      bedCount: 1, // Default bed count
      status: room.status.toLowerCase(),
      extraBedCharge: 0, // Default extra bed charge
      description: room.roomType.description || `${room.roomType.name} - ${room.roomNumber}`,
      amenities: room.roomType.amenities ? (Array.isArray(room.roomType.amenities) ? room.roomType.amenities : []) : [],
      roomType: room.roomType,
      activeBooking: room.bookings[0] || null,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString()
    }));
    
    console.log(`📋 Formatted rooms sample:`, formattedRooms.length > 0 ? formattedRooms[0] : 'None');
    
    // Send as wrapped object for consistency with other APIs
    res.json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: {
        rooms: formattedRooms,
        total: formattedRooms.length,
        summary: {
          available: formattedRooms.filter(r => r.status === 'available').length,
          occupied: formattedRooms.filter(r => r.status === 'occupied').length,
          maintenance: formattedRooms.filter(r => r.status === 'maintenance').length,
          cleaning: formattedRooms.filter(r => r.status === 'cleaning').length,
          total: formattedRooms.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve rooms',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get room status overview (Admin/Staff/DEV)
router.get('/status', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), async (req, res) => {
  try {
    console.log('🏠 GET /rooms/status - Getting room status overview');
    
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true,
        bookings: {
          where: {
            AND: [
              {
                checkinDate: {
                  lte: new Date()
                }
              },
              {
                checkoutDate: {
                  gte: new Date()
                }
              }
            ]
          },
          include: {
            guest: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    console.log(`📊 Total rooms for status overview: ${rooms.length}`);
    
    // Format rooms with status information
    const roomStatuses = rooms.map((room: any) => {
      const currentBooking = room.bookings[0]; // Get current booking if any
      
      return {
        id: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType.name,
        status: room.status.toLowerCase(),
        isOccupied: !!currentBooking,
        currentGuest: currentBooking ? {
          name: `${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`,
          email: currentBooking.guest.email,
          checkIn: currentBooking.checkinDate,
          checkOut: currentBooking.checkoutDate
        } : null,
        housekeepingStatus: 'clean', // Default status - can be extended
        lastCleaned: new Date().toISOString(),
        notes: ''
      };
    });
    
    // Group by status for summary
    const statusSummary = {
      available: roomStatuses.filter(r => r.status === 'available').length,
      occupied: roomStatuses.filter(r => r.status === 'occupied').length,
      maintenance: roomStatuses.filter(r => r.status === 'maintenance').length,
      cleaning: roomStatuses.filter(r => r.status === 'cleaning').length,
      total: roomStatuses.length
    };
    
    res.json({
      success: true,
      message: 'Room status overview retrieved successfully',
      data: {
        rooms: roomStatuses,
        summary: statusSummary
      }
    });
  } catch (error) {
    console.error('❌ Error getting room status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve room status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available rooms
router.get('/available', async (req, res) => {
  try {
    console.log('🚪 GET /rooms/available - Getting available rooms');
    
    const { roomTypeId, checkInDate, checkOutDate } = req.query;
    
    let whereClause = {
      status: 'Available'
    };
    
    // Filter by room type if provided
    if (roomTypeId) {
      // whereClause.roomTypeId = roomTypeId; // Property not in schema
    }
    
    const availableRooms = await prisma.room.findMany({
      where: whereClause as any,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            baseRate: true,
            capacityAdults: true,
            capacityChildren: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${availableRooms.length} available rooms`);
    
    res.json({
      success: true,
      message: 'Available rooms',
              data: { 
          rooms: availableRooms.map(room => ({
            id: room.id,
            roomNumber: room.roomNumber,
            status: room.status,
            // roomType: room.roomType // Property not in schema
          }))
        }
    });
  } catch (error) {
    console.error('❌ Error getting available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available rooms',
      error: error.message
    });
  }
});

// Get room types (Public endpoint - no auth required)
router.get('/types', async (req, res) => {
  try {
    console.log('🏠 GET /rooms/types - Getting room types from database');
    
    const roomTypes = await prisma.roomType.findMany({
      where: {
        isActive: true
      },
      include: {
        rooms: {
          where: {
            status: 'Available'
          },
          select: {
            id: true,
            roomNumber: true,
            status: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Total room types found: ${roomTypes.length}`);
    
    console.log(`📋 Room types sample:`, roomTypes.length > 0 ? roomTypes[0].name : 'None');
    
    // Send as direct array for frontend compatibility
    res.json(roomTypes);
  } catch (error) {
    console.error('❌ Error fetching room types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room types',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available rooms for a room type (Public endpoint - no auth required)
router.get('/type/:roomTypeId', async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const { checkIn, checkOut } = req.query;

    console.log(`🚪 GET /rooms/type/${roomTypeId} - Getting available rooms`);
    
    let whereClause: any = {
      roomTypeId: roomTypeId,
      status: 'Available'
    };

    // If dates provided, check for conflicts
    if (checkIn && checkOut) {
      console.log(`📅 Checking availability for dates: ${checkIn} to ${checkOut}`);
      console.log(`📅 Date types: checkIn=${typeof checkIn}, checkOut=${typeof checkOut}`);
      
      // Function to parse date and handle multiple formats
      const parseDate = (dateStr) => {
        // Handle YYYYMMDD format
        if (typeof dateStr === 'string' && dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          return `${year}-${month}-${day}`;
        }
        // Return as-is for YYYY-MM-DD format
        return dateStr;
      };
      
      const checkInDateStr = parseDate(checkIn);
      const checkOutDateStr = parseDate(checkOut);
      
      console.log(`📅 Formatted dates: ${checkInDateStr} to ${checkOutDateStr}`);
      
      // Parse dates properly and add time components
      const checkInDate = new Date(`${checkInDateStr}T00:00:00.000Z`);
      const checkOutDate = new Date(`${checkOutDateStr}T23:59:59.999Z`);
      
      console.log(`📅 Raw parsed: checkInDate=${checkInDate}, checkOutDate=${checkOutDate}`);
      console.log(`📅 isNaN check: checkIn=${isNaN(checkInDate.getTime())}, checkOut=${isNaN(checkOutDate.getTime())}`);
      
      // Validate parsed dates
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        console.log('❌ Invalid date format provided');
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD or YYYYMMDD format.',
          debug: {
            checkIn: checkIn,
            checkOut: checkOut,
            checkInDateStr: checkInDateStr,
            checkOutDateStr: checkOutDateStr,
            checkInDate: checkInDate.toString(),
            checkOutDate: checkOutDate.toString()
          }
        });
      }
      
      console.log(`📅 Parsed dates: ${checkInDate.toISOString()} to ${checkOutDate.toISOString()}`);
      
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  // Booking starts before checkOut and ends after checkIn
                  AND: [
                    { checkinDate: { lt: checkOutDate } },
                    { checkoutDate: { gt: checkInDate } }
                  ]
                }
              ]
            },
            {
              status: {
                in: ['Confirmed', 'InHouse'] as any[]
              }
            }
          ]
        },
        select: {
          roomId: true,
          checkinDate: true,
          checkoutDate: true,
          bookingReferenceId: true
        }
      });

      console.log(`🚫 Found ${conflictingBookings.length} conflicting bookings`);
      
      const unavailableRoomIds = conflictingBookings.map(b => b.roomId);
      
      if (unavailableRoomIds.length > 0) {
        whereClause.id = {
          notIn: unavailableRoomIds
        };
      }
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        roomType: true
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    console.log(`📊 Available rooms found: ${rooms.length}`);
    
    res.json({
      success: true,
      message: 'Available rooms retrieved successfully',
      data: rooms
    });
  } catch (error) {
    console.error('❌ Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get room by ID
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Room details',
    data: { room: `room ${req.params.id}` }
  });
});

// Admin/Staff: Create new room
router.post('/', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), async (req, res) => {
  console.log('🏠 POST /rooms - Creating new room');
  console.log('📝 Room data received:', req.body);
  
  const {
    number,
    type,
    price,
    capacity,
    size,
    bedType,
    bedCount,
    extraCapability,
    bedCharge,
    description,
    condition,
    amenities
  } = req.body;

  // Basic validation
  if (!number || !type || !price) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: number, type, price',
      errors: {
        number: !number ? 'Room number is required' : null,
        type: !type ? 'Room type is required' : null,
        price: !price ? 'Room price is required' : null
      }
    });
  }

  try {
    // Check if room number already exists
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber: number }
    });
    
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: 'Room number already exists',
        errors: {
          number: 'Room number must be unique'
        }
      });
    }

    // Find or create room type
    let roomType = await prisma.roomType.findFirst({
      where: { name: type }
    });

    if (!roomType) {
      // Create new room type
      roomType = await prisma.roomType.create({
        data: {
          name: type,
          description: description || `${type} room`,
          baseRate: parseFloat(price),
          capacityAdults: parseInt(capacity) || 2,
          capacityChildren: parseInt(extraCapability) || 0,
          bedType: bedType || 'Standard Bed',
          amenities: amenities || []
        }
      });
    }

    // Create new room
    const newRoom = await prisma.room.create({
      data: {
        roomNumber: number,
        roomTypeId: roomType.id,
        status: 'Available',
        notes: condition || null
      },
      include: {
        roomType: true
      }
    });

    console.log('✅ Room created and stored successfully:', newRoom);

    // Format response for frontend compatibility
    const formattedRoom = {
      id: newRoom.id,
      number: newRoom.roomNumber,
      type: newRoom.roomType.name,
      price: Number(newRoom.roomType.baseRate),
      capacity: newRoom.roomType.capacityAdults,
      capacityChildren: newRoom.roomType.capacityChildren,
      size: newRoom.roomType.sizeSqm ? `${newRoom.roomType.sizeSqm} sqm` : size || 'Standard',
      bedType: newRoom.roomType.bedType || 'Standard Bed',
      bedCount: parseInt(bedCount) || 1,
      status: newRoom.status.toLowerCase(),
      extraBedCharge: parseFloat(bedCharge) || 0,
      description: newRoom.roomType.description || '',
      condition: newRoom.notes || '',
      amenities: Array.isArray(newRoom.roomType.amenities) ? newRoom.roomType.amenities : [],
      createdAt: newRoom.createdAt.toISOString(),
      updatedAt: newRoom.updatedAt.toISOString()
    };

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: formattedRoom
    });
  } catch (error) {
    console.error('❌ Error creating room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/:id', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), (req, res) => {
  res.json({
    success: true,
    message: 'Room updated',
  });
});

// Update room status
router.post('/:id/status', sessionAuth, requireSessionRole(['DEV', 'ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, updated_by } = req.body;
    
    console.log(`🔄 POST /rooms/${id}/status - Updating room status`);
    console.log('📝 Status data received:', { status, notes, updated_by });
    
    // Validate room ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required',
        error: 'MISSING_ROOM_ID'
      });
    }
    
    // Validate status and map to Prisma enum values
    const statusMapping: { [key: string]: string } = {
      'available': 'Available',
      'occupied': 'Occupied', 
      'dirty': 'Dirty',
      'cleaning': 'Cleaning',
      'maintenance': 'Maintenance',
      'out-of-order': 'OutOfOrder'
    };
    
    const validStatuses = Object.keys(statusMapping);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        error: 'INVALID_STATUS'
      });
    }
    
    // Update room status in database  
    const updatedRoom = await prisma.room.update({
      where: { id: id },
      data: {
        status: statusMapping[status] as any,
        updatedAt: new Date()
      },
      include: {
        roomType: true
      }
    });
    
    console.log('✅ Room status updated successfully:', updatedRoom.roomNumber, '->', status);
    
    // Format response
    const formattedRoom = {
      id: updatedRoom.id,
      number: updatedRoom.roomNumber,
      type: updatedRoom.roomType?.name || 'Unknown',
      status: updatedRoom.status.toLowerCase(),
      updatedAt: updatedRoom.updatedAt.toISOString(),
      updated_by: updated_by || 'admin'
    };
    
    return res.json({
      success: true,
      message: `Room ${updatedRoom.roomNumber} status updated to ${status}`,
      data: formattedRoom
    });
    
  } catch (error: any) {
    console.error('❌ Error updating room status:', error);
    
    if (error?.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
        error: 'ROOM_NOT_FOUND'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update room status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
