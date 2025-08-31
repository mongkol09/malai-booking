const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Generate booking reference number
function generateBookingRef() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `BK${year}${month}${day}${random}`;
}

// GET /api/v1/booking/room-types - Get all room types
router.get('/room-types', async (req, res) => {
  try {
    const roomTypes = await prisma.roomType.findMany({
      where: {
        isActive: true
      },
      include: {
        rooms: {
          where: {
            status: 'Available'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: roomTypes
    });
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room types'
    });
  }
});

// GET /api/v1/booking/rooms/:roomTypeId - Get available rooms for a room type
router.get('/rooms/:roomTypeId', async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const { checkIn, checkOut } = req.query;

    let whereClause = {
      roomTypeId: roomTypeId,
      status: 'Available'
    };

    // If dates provided, check for conflicts
    if (checkIn && checkOut) {
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  checkInDate: {
                    lte: new Date(checkOut)
                  },
                  checkOutDate: {
                    gte: new Date(checkIn)
                  }
                }
              ]
            },
            {
              status: {
                in: ['Confirmed', 'CheckedIn']
              }
            }
          ]
        },
        select: {
          roomId: true
        }
      });

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

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms'
    });
  }
});

// GET /api/v1/booking/generate-ref - Generate new booking reference
router.get('/generate-ref', async (req, res) => {
  try {
    let bookingRef;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure unique booking reference
    while (!isUnique && attempts < maxAttempts) {
      bookingRef = generateBookingRef();
      const existing = await prisma.booking.findUnique({
        where: { bookingReference: bookingRef }
      });
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique booking reference'
      });
    }

    res.json({
      success: true,
      data: {
        bookingReference: bookingRef
      }
    });
  } catch (error) {
    console.error('Error generating booking reference:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate booking reference'
    });
  }
});

// POST /api/v1/booking/create - Create new booking
router.post('/create', async (req, res) => {
  try {
    const {
      // Reservation Details
      checkInDate,
      checkOutDate,
      arrivalFrom,
      bookingType,
      bookingReference,
      purposeOfVisit,
      remarks,
      
      // Room Details
      roomTypeId,
      roomId,
      adults,
      children,
      
      // Guest Details
      guestTitle,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      guestCountryCode,
      guestAddress,
      guestCity,
      guestCountry,
      guestZipCode,
      guestIdType,
      guestIdNumber,
      guestDateOfBirth,
      guestNationality,
      
      // Company Details (optional)
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyGST,
      
      // Payment Details
      totalAmount,
      paymentMethod,
      paymentStatus
    } = req.body;

    // Validate required fields
    if (!checkInDate || !checkOutDate || !roomId || !guestFirstName || !guestLastName || !guestEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate booking reference if not provided
    let finalBookingRef = bookingReference;
    if (!finalBookingRef) {
      finalBookingRef = generateBookingRef();
      
      // Ensure it's unique
      const existing = await prisma.booking.findUnique({
        where: { bookingReference: finalBookingRef }
      });
      
      if (existing) {
        finalBookingRef = generateBookingRef() + Math.floor(Math.random() * 100);
      }
    }

    // Check room availability
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true }
    });

    if (!room || room.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available'
      });
    }

    // Check for booking conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: roomId,
        AND: [
          {
            checkInDate: {
              lte: new Date(checkOutDate)
            }
          },
          {
            checkOutDate: {
              gte: new Date(checkInDate)
            }
          }
        ],
        status: {
          in: ['Confirmed', 'CheckedIn']
        }
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for the selected dates'
      });
    }

    // Calculate nights and total if not provided
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const calculatedTotal = totalAmount || (parseFloat(room.roomType.baseRate) * nights);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingReference: finalBookingRef,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        adults: parseInt(adults) || 1,
        children: parseInt(children) || 0,
        totalAmount: calculatedTotal.toString(),
        status: 'Confirmed',
        paymentStatus: paymentStatus || 'Pending',
        paymentMethod: paymentMethod || 'Cash',
        
        // Guest details
        guestTitle: guestTitle || 'Mr',
        guestFirstName,
        guestLastName,
        guestEmail,
        guestPhone,
        guestCountryCode: guestCountryCode || '+66',
        guestAddress,
        guestCity,
        guestCountry: guestCountry || 'Thailand',
        guestZipCode,
        guestIdType,
        guestIdNumber,
        guestDateOfBirth: guestDateOfBirth ? new Date(guestDateOfBirth) : null,
        guestNationality: guestNationality || 'Thai',
        
        // Additional details
        arrivalFrom,
        bookingType,
        purposeOfVisit,
        remarks,
        
        // Company details
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyGST,
        
        // Relations
        roomId,
        userId: req.user?.id // If user is logged in
      },
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// GET /api/v1/booking/list - Get all bookings
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        {
          bookingReference: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          guestFirstName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          guestLastName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          guestEmail: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          room: {
            include: {
              roomType: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.booking.count({
        where: whereClause
      })
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// GET /api/v1/booking/:id - Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

module.exports = router;
