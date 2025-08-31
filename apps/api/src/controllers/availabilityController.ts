import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { addDays, startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

const prisma = new PrismaClient();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const monthlyAvailabilitySchema = z.object({
  roomTypeId: z.string().uuid().optional(),
  year: z.coerce.number().int().min(2024).max(2030),
  month: z.coerce.number().int().min(1).max(12)
});

const dateDetailSchema = z.object({
  date: z.string().datetime(),
  roomTypeId: z.string().uuid().optional()
});

const quickSearchSchema = z.object({
  checkinDate: z.string().datetime(),
  checkoutDate: z.string().datetime(),
  numberOfGuests: z.coerce.number().int().min(1).max(10),
  roomTypeId: z.string().uuid().optional()
});

const walkInBookingSchema = z.object({
  roomId: z.string().uuid(),
  checkinDate: z.string().datetime(),
  checkoutDate: z.string().datetime(),
  guestInfo: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phoneNumber: z.string().min(10).max(20),
    country: z.string().min(2).max(3).default('TH'),
    specialRequests: z.string().max(500).optional()
  }),
  totalAmount: z.number().positive(),
  source: z.string().default('walk-in'),
  createdBy: z.string().optional()
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate room availability for a specific date and room type
 */
async function calculateDateAvailability(roomTypeId: string, date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Get room type with rooms
  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { 
      rooms: {
        where: {
          status: 'Available' // Only include available rooms
        }
      }
    }
  });

  if (!roomType) {
    throw new Error('Room type not found');
  }

  // Count booked rooms for this date
  const bookedRoomsCount = await prisma.booking.count({
    where: {
      roomType: { id: roomTypeId },
      status: { in: ['Confirmed', 'InHouse'] },
      checkinDate: { lte: date },
      checkoutDate: { gt: date }
    }
  });

  // Get blocked rooms for this date (maintenance, etc.)
  const blockedRoomsCount = await prisma.room.count({
    where: {
      roomTypeId: roomTypeId,
      status: { in: ['Maintenance', 'OutOfOrder'] }
    }
  });

  const totalRooms = roomType.rooms.length;
  const unavailableRooms = bookedRoomsCount + blockedRoomsCount;
  const availableRooms = Math.max(0, totalRooms - unavailableRooms);

  return {
    date: dateStr,
    roomTypeId,
    roomTypeName: roomType.name,
    totalRooms,
    bookedRooms: bookedRoomsCount,
    blockedRooms: blockedRoomsCount,
    availableRooms,
    occupancyRate: totalRooms > 0 ? Math.round((unavailableRooms / totalRooms) * 100) : 0,
    baseRate: roomType.baseRate,
    // Add pricing calculation later
    currentRate: roomType.baseRate
  };
}

/**
 * Get available room numbers for a specific date and room type
 */
async function getAvailableRoomNumbers(roomTypeId: string, date: Date) {
  // Get all rooms of this type
  const allRooms = await prisma.room.findMany({
    where: {
      roomTypeId: roomTypeId,
      status: 'Available'
    },
    select: {
      id: true,
      roomNumber: true
    }
  });

  // Get booked room IDs for this date
  const bookedRoomIds = await prisma.booking.findMany({
    where: {
      roomType: { id: roomTypeId },
      status: { in: ['Confirmed', 'InHouse'] },
      checkinDate: { lte: date },
      checkoutDate: { gt: date }
    },
    select: {
      roomId: true
    }
  });

  const bookedIds = bookedRoomIds.map(b => b.roomId).filter(id => id !== null);
  
  // Filter out booked rooms
  const availableRooms = allRooms.filter(room => !bookedIds.includes(room.id));

  return availableRooms.map(room => ({
    id: room.id,
    roomNumber: room.roomNumber
  }));
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/admin/availability/monthly
 * Get monthly room availability overview
 */
export const getMonthlyAvailability = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { roomTypeId, year, month } = monthlyAvailabilitySchema.parse(req.query);
    
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    
    // Get all room types if no specific type requested
    const roomTypes = roomTypeId 
      ? [await prisma.roomType.findUnique({ where: { id: roomTypeId } })]
      : await prisma.roomType.findMany({
          orderBy: { baseRate: 'asc' }
        });

    if (!roomTypes[0]) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    const dailyAvailability: any[] = [];
    
    // Loop through each day of the month
    for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
      const dayData: any = {
        date: format(date, 'yyyy-MM-dd'),
        dayOfWeek: format(date, 'EEEE'),
        roomTypes: []
      };

      // Calculate availability for each room type
      for (const roomType of roomTypes) {
        if (roomType) {
          const availability = await calculateDateAvailability(roomType.id, date);
          dayData.roomTypes.push(availability);
        }
      }

      dailyAvailability.push(dayData);
    }

    return res.json({
      success: true,
      data: {
        month: `${year}-${month.toString().padStart(2, '0')}`,
        totalDays: dailyAvailability.length,
        dailyAvailability
      }
    });

  } catch (error) {
    console.error('Error getting monthly availability:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET /api/admin/availability/date-detail
 * Get detailed room availability for a specific date
 */
export const getDateDetail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { date, roomTypeId } = dateDetailSchema.parse(req.query);
    const targetDate = parseISO(date);
    
    // If no roomTypeId provided, get all room types
    if (!roomTypeId) {
      const roomTypes = await prisma.roomType.findMany({
        orderBy: { baseRate: 'asc' }
      });
      
      const allAvailability = await Promise.all(
        roomTypes.map(async (roomType) => {
          const availability = await calculateDateAvailability(roomType.id, targetDate);
          return {
            ...availability,
            roomTypeId: roomType.id,
            roomTypeName: roomType.name
          };
        })
      );
      
      return res.json({
        success: true,
        data: {
          date: format(targetDate, 'yyyy-MM-dd'),
          roomTypes: allAvailability
        }
      });
    }
    
    // Single room type detail
    const availability = await calculateDateAvailability(roomTypeId, targetDate);
    const availableRooms = await getAvailableRoomNumbers(roomTypeId, targetDate);
    
    // Get alternative suggestions if no rooms available
    let alternatives = [];
    if (availability.availableRooms === 0) {
      // Check previous and next days
      for (let offset of [-1, 1, -2, 2]) {
        const altDate = addDays(targetDate, offset);
        const altAvailability = await calculateDateAvailability(roomTypeId, altDate);
        if (altAvailability.availableRooms > 0) {
          alternatives.push({
            date: format(altDate, 'yyyy-MM-dd'),
            availableRooms: altAvailability.availableRooms,
            rate: altAvailability.currentRate
          });
        }
        if (alternatives.length >= 3) break;
      }
      
      // Check other room types for same date
      const otherRoomTypes = await prisma.roomType.findMany({
        where: { id: { not: roomTypeId } },
        orderBy: { baseRate: 'asc' }
      });
      
      for (const otherType of otherRoomTypes) {
        const otherAvailability = await calculateDateAvailability(otherType.id, targetDate);
        if (otherAvailability.availableRooms > 0) {
          alternatives.push({
            date: format(targetDate, 'yyyy-MM-dd'),
            roomTypeName: otherType.name,
            availableRooms: otherAvailability.availableRooms,
            rate: otherAvailability.currentRate
          });
        }
        if (alternatives.length >= 6) break;
      }
    }

    return res.json({
      success: true,
      data: {
        ...availability,
        availableRooms: availableRooms,
        alternatives
      }
    });

  } catch (error) {
    console.error('Error getting date detail:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET /api/admin/availability/quick-search
 * Quick search for available rooms
 */
export const quickSearch = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { checkinDate, checkoutDate, numberOfGuests, roomTypeId } = quickSearchSchema.parse(req.query);
    
    const checkin = parseISO(checkinDate);
    const checkout = parseISO(checkoutDate);
    
    // Validate date range
    if (checkin >= checkout) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Get room types to search
    const roomTypes = roomTypeId 
      ? [await prisma.roomType.findUnique({ where: { id: roomTypeId } })]
      : await prisma.roomType.findMany({
          where: {
            capacityAdults: { gte: numberOfGuests }
          },
          orderBy: { baseRate: 'asc' }
        });

    const results = [];
    const numberOfNights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));

    for (const roomType of roomTypes) {
      if (!roomType) continue;

      // Check availability for all nights
      let isAvailable = true;
      let minAvailableRooms = Infinity;
      
      for (let date = new Date(checkin); date < checkout; date = addDays(date, 1)) {
        const availability = await calculateDateAvailability(roomType.id, date);
        if (availability.availableRooms === 0) {
          isAvailable = false;
          break;
        }
        minAvailableRooms = Math.min(minAvailableRooms, availability.availableRooms);
      }

      if (isAvailable) {
        const totalPrice = Number(roomType.baseRate) * numberOfNights;
        
        results.push({
          roomTypeId: roomType.id,
          roomTypeName: roomType.name,
          description: roomType.description,
          capacity: {
            adults: roomType.capacityAdults,
            children: roomType.capacityChildren
          },
          baseRate: roomType.baseRate,
          numberOfNights,
          totalPrice,
          availableRooms: minAvailableRooms,
          canBook: true
        });
      }
    }

    return res.json({
      success: true,
      data: {
        searchCriteria: {
          checkinDate,
          checkoutDate,
          numberOfGuests,
          numberOfNights
        },
        totalOptions: results.length,
        availableRoomTypes: results
      }
    });

  } catch (error) {
    console.error('Error in quick search:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * POST /api/admin/availability/walk-in-booking
 * Create walk-in booking directly
 */
export const createWalkInBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const bookingData = walkInBookingSchema.parse(req.body);
    
    const checkin = parseISO(bookingData.checkinDate);
    const checkout = parseISO(bookingData.checkoutDate);
    
    // Verify room availability
    const room = await prisma.room.findUnique({
      where: { id: bookingData.roomId },
      include: { roomType: true }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is available for the selected dates
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: bookingData.roomId,
        status: { in: ['Confirmed', 'InHouse'] },
        AND: [
          { checkinDate: { lt: checkout } },
          { checkoutDate: { gt: checkin } }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Room is not available for selected dates'
      });
    }

    // Generate booking reference
    const bookingRef = `WI${Date.now().toString().slice(-6)}`;
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingReferenceId: bookingRef,
        roomId: bookingData.roomId,
        roomTypeId: room.roomTypeId,
        checkinDate: checkin,
        checkoutDate: checkout,
        numAdults: 1, // Default for walk-in
        guestId: "", // Will be created separately if needed
        totalPrice: bookingData.totalAmount,
        finalAmount: bookingData.totalAmount,
        status: 'Confirmed',
        specialRequests: bookingData.guestInfo.specialRequests || null,
        source: bookingData.source
      },
      include: {
        room: true,
        roomType: true
      }
    });

    // Get room and room type data separately for response
    const roomData = await prisma.room.findUnique({
      where: { id: booking.roomId }
    });
    
    const roomTypeData = await prisma.roomType.findUnique({
      where: { id: booking.roomTypeId }
    });

    return res.status(201).json({
      success: true,
      message: 'Walk-in booking created successfully',
      data: {
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReferenceId,
          roomNumber: roomData?.roomNumber,
          roomType: roomTypeData?.name,
          guestName: `${bookingData.guestInfo.firstName} ${bookingData.guestInfo.lastName}`,
          checkinDate: booking.checkinDate,
          checkoutDate: booking.checkoutDate,
          totalAmount: booking.totalPrice,
          status: booking.status
        }
      }
    });

  } catch (error) {
    console.error('Error creating walk-in booking:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET /api/admin/availability/room-types
 * Get all room types with pricing for selection
 */
export const getRoomTypesForSelection = async (req: Request, res: Response): Promise<Response> => {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: {
          where: {
            status: 'Available'
          }
        },
        _count: {
          select: {
            rooms: true
          }
        }
      },
      orderBy: { baseRate: 'asc' }
    });

    const roomTypesData = roomTypes.map(roomType => ({
      id: roomType.id,
      name: roomType.name,
      description: roomType.description,
      baseRate: roomType.baseRate,
      capacity: {
        adults: roomType.capacityAdults,
        children: roomType.capacityChildren
      },
      totalRooms: roomType._count.rooms,
      availableRooms: roomType.rooms.length,
      amenities: roomType.amenities || [],
      imageUrl: roomType.imageUrl
    }));

    return res.json({
      success: true,
      data: roomTypesData
    });

  } catch (error) {
    console.error('Error getting room types:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
