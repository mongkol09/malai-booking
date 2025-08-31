import { Request, Response } from 'express';
import { PrismaClient, RoomStatus, BookingStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// SIMPLIFIED CHECK-IN SYSTEM CONTROLLER
// ============================================
// Basic implementation that works with current schema

/**
 * Get bookings ready for check-in
 * Returns confirmed bookings that can be checked in today
 */
export const getBookingsForCheckin = async (req: Request, res: Response) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    const selectedDate = new Date(date as string);

    const bookings = await prisma.booking.findMany({
      where: {
        checkinDate: {
          lte: selectedDate
        },
        status: {
          in: ['Confirmed', 'InHouse']
        }
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            idNumber: true
          }
        },
        room: {
          select: {
            roomNumber: true,
            status: true
          }
        },
        roomType: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        checkinDate: 'asc'
      }
    });

    // Calculate outstanding amounts for each booking
    const bookingsWithPayments = await Promise.all(
      bookings.map(async (booking) => {
        const payments = await prisma.payment.findMany({
          where: { 
            bookingId: booking.id,
            status: 'COMPLETED'
          },
          select: { amount: true }
        });

        const totalPaid = payments.reduce(
          (sum, p) => sum + parseFloat(p.amount.toString()), 
          0
        );
        const outstandingAmount = parseFloat(booking.finalAmount.toString()) - totalPaid;

        return {
          id: booking.id,
          bookingReference: booking.bookingReferenceId,
          guest: {
            name: `${booking.guest.firstName} ${booking.guest.lastName}`,
            email: booking.guest.email,
            phone: booking.guest.phoneNumber,
            idNumber: booking.guest.idNumber
          },
          room: {
            number: booking.room.roomNumber,
            status: booking.room.status
          },
          roomType: booking.roomType.name,
          checkinDate: booking.checkinDate,
          checkoutDate: booking.checkoutDate,
          totalAmount: parseFloat(booking.finalAmount.toString()),
          paidAmount: totalPaid,
          outstandingAmount: Math.max(0, outstandingAmount),
          status: booking.status,
          specialRequests: booking.specialRequests,
          canCheckin: booking.room.status === 'Available' && outstandingAmount <= 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: bookingsWithPayments,
      count: bookingsWithPayments.length
    });

  } catch (error) {
    console.error('Error fetching check-in bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings for check-in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Basic check-in process
 * Updates booking and room status for check-in
 */
export const performCheckin = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { 
      roomId, 
      checkinNotes,
      paymentAmount,
      paymentMethod = 'Cash'
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Validate booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: true,
        roomType: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in booking with status: ${booking.status}`
      });
    }

    // Validate room
    const targetRoomId = roomId || booking.roomId;
    const room = await prisma.room.findUnique({
      where: { id: targetRoomId }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is not available. Current status: ${room.status}`
      });
    }

    // Store guest information for response
    const guestInfo = {
      firstName: booking.guest.firstName,
      lastName: booking.guest.lastName
    };

    // Perform check-in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'InHouse',
          checkinTime: new Date(),
          actualRoomId: targetRoomId,
          ...(checkinNotes && { booking_remarks: checkinNotes })
        }
      });

      // Update room status
      await tx.room.update({
        where: { id: targetRoomId },
        data: {
          status: 'Occupied'
        }
      });

      // Record payment if provided
      if (paymentAmount && paymentAmount > 0) {
        await tx.payment.create({
          data: {
            bookingId: bookingId,
            amount: parseFloat(paymentAmount.toString()),
            paymentMethod: paymentMethod,
            status: 'COMPLETED',
            processedAt: new Date()
          }
        });
      }

      return updatedBooking;
    });

    return res.status(200).json({
      success: true,
      message: 'Check-in completed successfully',
      data: {
        bookingId: result.id,
        bookingReference: result.bookingReferenceId,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        roomNumber: room.roomNumber,
        checkinTime: new Date(),
        status: result.status
      }
    });

  } catch (error) {
    console.error('Error performing check-in:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform check-in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Assign room to booking
 * Changes the room assignment for a booking
 */
export const assignRoom = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { roomId, reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    // Validate booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate new room
    const newRoom = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!newRoom) {
      return res.status(404).json({
        success: false,
        message: 'New room not found'
      });
    }

    if (newRoom.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        message: `Room ${newRoom.roomNumber} is already occupied`
      });
    }

    // Store guest and room info for response
    const guestInfo = {
      firstName: booking.guest.firstName,
      lastName: booking.guest.lastName
    };
    const oldRoomNumber = booking.room.roomNumber;

    // Perform room assignment transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update booking with new room
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          roomId: roomId,
          actualRoomId: roomId,
          roomAssignedAt: new Date()
        }
      });

      // Update new room status
      await tx.room.update({
        where: { id: roomId },
        data: {
          status: booking.status === 'InHouse' ? 'Occupied' : 'Reserved'
        }
      });

      // Free up old room if different
      if (booking.roomId !== roomId) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: {
            status: 'Available'
          }
        });
      }

      return updatedBooking;
    });

    return res.status(200).json({
      success: true,
      message: 'Room assigned successfully',
      data: {
        bookingId: result.id,
        bookingReference: result.bookingReferenceId,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        oldRoom: oldRoomNumber,
        newRoom: newRoom.roomNumber,
        reason: reason || 'Room reassignment',
        assignedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error assigning room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign room',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get available rooms for check-in
 * Returns rooms that are available for assignment
 */
export const getAvailableRooms = async (req: Request, res: Response) => {
  try {
    const { date = new Date().toISOString().split('T')[0], roomTypeId } = req.query;
    const selectedDate = new Date(date as string);

    const whereClause: any = {
      status: {
        in: ['Available', 'Clean']
      }
    };

    if (roomTypeId) {
      whereClause.roomTypeId = roomTypeId as string;
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        roomType: {
          select: {
            name: true,
            basePrice: true
          }
        }
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: rooms.map(room => ({
        id: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType.name,
        basePrice: room.roomType.basePrice,
        status: room.status,
        notes: room.notes
      })),
      count: rooms.length
    });

  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get booking details for check-in
 * Returns detailed booking information for check-in process
 */
export const getBookingForCheckin = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: true,
        roomType: true,
        payments: {
          where: {
            status: 'COMPLETED'
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

    const totalPaid = booking.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()), 
      0
    );
    const outstandingAmount = parseFloat(booking.finalAmount.toString()) - totalPaid;

    return res.status(200).json({
      success: true,
      data: {
        id: booking.id,
        bookingReference: booking.bookingReferenceId,
        guest: {
          id: booking.guest.id,
          firstName: booking.guest.firstName,
          lastName: booking.guest.lastName,
          email: booking.guest.email,
          phoneNumber: booking.guest.phoneNumber,
          idNumber: booking.guest.idNumber
        },
        room: {
          id: booking.room.id,
          roomNumber: booking.room.roomNumber,
          status: booking.room.status
        },
        roomType: {
          id: booking.roomType.id,
          name: booking.roomType.name,
          basePrice: booking.roomType.basePrice
        },
        checkinDate: booking.checkinDate,
        checkoutDate: booking.checkoutDate,
        numAdults: booking.numAdults,
        numChildren: booking.numChildren,
        totalAmount: parseFloat(booking.finalAmount.toString()),
        paidAmount: totalPaid,
        outstandingAmount: Math.max(0, outstandingAmount),
        status: booking.status,
        specialRequests: booking.specialRequests,
        bookingRemarks: booking.booking_remarks,
        canCheckin: booking.room.status === 'Available' && outstandingAmount <= 0
      }
    });

  } catch (error) {
    console.error('Error fetching booking for check-in:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
