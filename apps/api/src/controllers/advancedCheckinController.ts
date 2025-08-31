import { Request, Response } from 'express';
import { PrismaClient, RoomStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import { getNotificationService } from '../services/notificationService';

const prisma = new PrismaClient();
const notificationService = getNotificationService();

// ============================================
// ADVANCED CHECK-IN SYSTEM CONTROLLER
// ============================================
// Implementation of the professional-grade check-in system

/**
 * Start a new check-in session
 * Creates a comprehensive check-in record with all required tracking
 */
export const startCheckinSession = async (req: Request, res: Response) => {
  try {
    const {
      bookingId,
      roomId,
      guestId,
      assignedBy,
      specialRequests,
      earlyCheckinTime
    } = req.body;

    // Validate booking exists and is eligible for check-in
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

    // Check if booking is in correct status
    if (!['Confirmed', 'InHouse'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in booking with status: ${booking.status}`
      });
    }

    // Validate room availability
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { currentBooking: true }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.status !== 'Available' && room.status !== 'Reserved') {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is not available. Current status: ${room.status}`
      });
    }

    // Check for existing active check-in session
    const existingSession = await prisma.checkinSession.findFirst({
      where: {
        bookingId,
        status: 'IN_PROGRESS'
      }
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Check-in session already in progress',
        sessionId: existingSession.id
      });
    }

    // Calculate outstanding amount
    const payments = await prisma.payment.findMany({
      where: { bookingId },
      select: {
        amount: true,
        status: true
      }
    });

    const totalPaid = payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    
    const outstandingAmount = parseFloat(booking.finalAmount.toString()) - totalPaid;

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create check-in session
      const checkinSession = await tx.checkinSession.create({
        data: {
          bookingId,
          roomId,
          guestId,
          assignedBy,
          checkinStartTime: new Date(),
          outstandingAmount,
          specialRequests,
          status: 'IN_PROGRESS'
        },
        include: {
          booking: {
            include: {
              guest: true,
              roomType: true
            }
          },
          room: true,
          assignedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Update room status to checking-in
      await tx.room.update({
        where: { id: roomId },
        data: {
          status: 'CheckingIn',
          currentBookingId: bookingId,
          lastAssignedAt: new Date()
        }
      });

      // Update booking if room assignment changed
      if (booking.roomId !== roomId) {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            actualRoomId: roomId,
            roomAssignedAt: new Date(),
            assignedBy
          }
        });
      }

      // Log room status change
      await tx.roomStatusHistory.create({
        data: {
          roomId,
          previousStatus: room.status,
          newStatus: 'CheckingIn',
          changedBy: assignedBy,
          reason: 'Check-in started',
          bookingId,
          notes: `Check-in session started for booking ${booking.bookingReferenceId}`
        }
      });

      return checkinSession;
    });

    res.status(201).json({
      success: true,
      message: 'Check-in session started successfully',
      data: {
        sessionId: result.id,
        bookingReference: booking.bookingReferenceId,
        guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        roomNumber: room.roomNumber,
        outstandingAmount,
        assignedBy: `${result.assignedByUser.firstName} ${result.assignedByUser.lastName}`,
        checkinStartTime: result.checkinStartTime
      }
    });

  } catch (error) {
    console.error('Error starting check-in session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start check-in session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Complete check-in process
 * Finalizes the check-in with payment, ID verification, and key card issuance
 */
export const completeCheckin = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const {
      idVerified,
      idNumber,
      idType,
      paidAmount,
      paymentMethod,
      keyCardIssued,
      checkinNotes,
      checkinBy
    } = req.body;

    // Get check-in session
    const session = await prisma.checkinSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: {
            guest: true,
            roomType: true
          }
        },
        room: true
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Check-in session not found'
      });
    }

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: `Check-in session is not in progress. Current status: ${session.status}`
      });
    }

    // Calculate change amount
    const changeAmount = Math.max(0, paidAmount - parseFloat(session.outstandingAmount.toString()));

    // Complete check-in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update check-in session
      const updatedSession = await tx.checkinSession.update({
        where: { id: sessionId },
        data: {
          checkinCompleteTime: new Date(),
          idVerified,
          idNumber,
          idType,
          paidAmount,
          paymentMethod,
          changeAmount,
          keyCardIssued,
          checkinNotes,
          status: 'COMPLETED'
        }
      });

      // Update booking status and check-in time
      await tx.booking.update({
        where: { id: session.bookingId },
        data: {
          status: 'CheckedIn',
          checkinTime: new Date(),
          checkinBy,
          specialRequestsCheckin: session.specialRequests
        }
      });

      // Update room status to occupied
      await tx.room.update({
        where: { id: session.roomId },
        data: {
          status: 'Occupied',
          housekeepingStatus: 'Dirty'
        }
      });

      // Record payment if amount was paid
      if (paidAmount > 0) {
        await tx.payment.create({
          data: {
            bookingId: session.bookingId,
            amount: paidAmount,
            paymentMethod: paymentMethod || 'Cash',
            status: 'Completed',
            processedAt: new Date(),
            notes: `Check-in payment - Session ID: ${sessionId}`
          }
        });
      }

      // Log room status change to occupied
      await tx.roomStatusHistory.create({
        data: {
          roomId: session.roomId,
          previousStatus: 'CheckingIn',
          newStatus: 'Occupied',
          changedBy: checkinBy,
          reason: 'Check-in completed',
          bookingId: session.bookingId,
          notes: `Guest checked in successfully`
        }
      });

      return updatedSession;
    });

    // 📢 ส่งการแจ้งเตือน Check-in (Advanced System)
    try {
      const fullBooking = await prisma.booking.findUnique({
        where: { id: session.bookingId },
        include: {
          guest: true,
          room: true,
          payments: {
            where: { status: 'Completed' }
          }
        }
      });

      if (fullBooking && notificationService) {
        // คำนวณยอดรวมที่ชำระแล้ว
        const totalPaid = fullBooking.payments.reduce((sum, payment) => 
          sum + parseFloat(payment.amount.toString()), 0
        );

        await notificationService.notifyGuestCheckIn({
          bookingId: fullBooking.bookingReferenceId || fullBooking.id,
          guestName: `${fullBooking.guest?.firstName || ''} ${fullBooking.guest?.lastName || ''}`.trim() || 'ไม่ระบุชื่อ',
          roomNumber: session.room.roomNumber || 'ไม่ระบุ',
          phoneNumber: fullBooking.guest?.phone || 'ไม่ระบุ',
          email: fullBooking.guest?.email || 'ไม่ระบุ',
          checkinDate: fullBooking.checkinDate?.toLocaleDateString('th-TH') || 'วันนี้',
          checkoutDate: fullBooking.checkoutDate?.toLocaleDateString('th-TH') || 'ไม่ระบุ',
          guestCount: fullBooking.adults || 1,
          totalAmount: parseFloat(fullBooking.finalAmount.toString()),
          paymentStatus: totalPaid >= parseFloat(fullBooking.finalAmount.toString()) ? 'ชำระครบแล้ว' : `ค้างชำระ ${parseFloat(fullBooking.finalAmount.toString()) - totalPaid} บาท`,
          checkInTime: result.checkinCompleteTime?.toLocaleString('th-TH'),
          checkedInBy: checkinBy || 'Advanced Check-in System'
        });
        console.log('✅ Advanced check-in notification sent successfully');
      }
    } catch (notifyError) {
      console.error('⚠️ Failed to send advanced check-in notification:', notifyError);
      // ไม่ให้ notification error ทำให้ check-in ล้มเหลว
    }

    res.status(200).json({
      success: true,
      message: 'Check-in completed successfully',
      data: {
        sessionId: result.id,
        bookingReference: session.booking.bookingReferenceId,
        guestName: `${session.booking.guest.firstName} ${session.booking.guest.lastName}`,
        roomNumber: session.room.roomNumber,
        checkinTime: result.checkinCompleteTime,
        paidAmount,
        changeAmount,
        keyCardIssued,
        outstandingBalance: Math.max(0, parseFloat(session.outstandingAmount.toString()) - paidAmount)
      }
    });

  } catch (error) {
    console.error('Error completing check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete check-in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get available rooms for assignment
 * Returns rooms that can be assigned for check-in
 */
export const getAvailableRooms = async (req: Request, res: Response) => {
  try {
    const { roomTypeId, checkinDate, checkoutDate } = req.query;

    const rooms = await prisma.room.findMany({
      where: {
        ...(roomTypeId && { roomTypeId: roomTypeId as string }),
        status: {
          in: ['Available', 'Clean']
        },
        // Check for conflicts with existing bookings
        NOT: {
          bookings: {
            some: {
              AND: [
                {
                  OR: [
                    { status: 'Confirmed' },
                    { status: 'InHouse' },
                    { status: 'CheckedIn' }
                  ]
                },
                {
                  checkinDate: {
                    lt: new Date(checkoutDate as string)
                  }
                },
                {
                  checkoutDate: {
                    gt: new Date(checkinDate as string)
                  }
                }
              ]
            }
          }
        }
      },
      include: {
        roomType: {
          select: {
            name: true,
            baseRate: true
          }
        },
        currentBooking: {
          select: {
            bookingReferenceId: true,
            guest: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: rooms.map(room => ({
        id: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType.name,
        status: room.status,
        housekeepingStatus: room.housekeepingStatus,
        lastCleanedAt: room.lastCleanedAt,
        currentGuest: room.currentBooking ? 
          `${room.currentBooking.guest.firstName} ${room.currentBooking.guest.lastName}` : null
      }))
    });

  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

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
        },
        actualRoom: {
          select: {
            roomNumber: true,
            status: true
          }
        },
        checkinSessions: {
          where: {
            status: 'IN_PROGRESS'
          },
          select: {
            id: true,
            checkinStartTime: true,
            assignedByUser: {
              select: {
                firstName: true,
                lastName: true
              }
            }
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
            status: 'Completed'
          },
          select: { amount: true }
        });

        const totalPaid = payments.reduce(
          (sum, p) => sum + parseFloat(p.amount.toString()), 
          0
        );
        
        const outstandingAmount = parseFloat(booking.finalAmount.toString()) - totalPaid;

        return {
          ...booking,
          outstandingAmount,
          isOverdue: booking.checkinDate < selectedDate,
          hasActiveCheckinSession: booking.checkinSessions.length > 0,
          activeSession: booking.checkinSessions[0] || null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: bookingsWithPayments
    });

  } catch (error) {
    console.error('Error fetching bookings for check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings for check-in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create walk-in guest booking
 * Handles walk-in guests who don't have advance reservations
 */
export const createWalkInGuest = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      idNumber,
      idType,
      nationality,
      roomTypeRequested,
      numberOfNights,
      numberOfAdults,
      numberOfChildren,
      quotedRate,
      handledBy
    } = req.body;

    // Validate room type availability
    const availableRooms = await prisma.room.count({
      where: {
        roomType: {
          name: roomTypeRequested
        },
        status: 'Available'
      }
    });

    if (availableRooms === 0) {
      return res.status(400).json({
        success: false,
        message: `No available rooms of type: ${roomTypeRequested}`
      });
    }

    const totalAmount = quotedRate * numberOfNights;

    const walkInGuest = await prisma.walkInGuest.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        idNumber,
        idType,
        nationality,
        roomTypeRequested,
        numberOfNights,
        numberOfAdults,
        numberOfChildren,
        quotedRate,
        totalAmount,
        handledBy,
        status: 'QUOTED'
      },
      include: {
        handledByUser: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in guest record created successfully',
      data: {
        walkInId: walkInGuest.id,
        guestName: `${walkInGuest.firstName} ${walkInGuest.lastName}`,
        roomType: walkInGuest.roomTypeRequested,
        totalAmount: walkInGuest.totalAmount,
        handledBy: `${walkInGuest.handledByUser.firstName} ${walkInGuest.handledByUser.lastName}`,
        status: walkInGuest.status
      }
    });

  } catch (error) {
    console.error('Error creating walk-in guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create walk-in guest record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Convert walk-in guest to booking
 * Creates a full booking from walk-in guest record
 */
export const convertWalkInToBooking = async (req: Request, res: Response) => {
  try {
    const { walkInId } = req.params;
    const { roomId, checkinDate, checkoutDate } = req.body;

    const walkInGuest = await prisma.walkInGuest.findUnique({
      where: { id: walkInId }
    });

    if (!walkInGuest) {
      return res.status(404).json({
        success: false,
        message: 'Walk-in guest record not found'
      });
    }

    if (walkInGuest.status !== 'QUOTED') {
      return res.status(400).json({
        success: false,
        message: 'Walk-in guest has already been processed'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create guest record
      const guest = await tx.guest.create({
        data: {
          firstName: walkInGuest.firstName,
          lastName: walkInGuest.lastName,
          email: walkInGuest.email || '',
          phoneNumber: walkInGuest.phoneNumber,
          idNumber: walkInGuest.idNumber,
          nationality: walkInGuest.nationality
        }
      });

      // Get room info
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: { roomType: true }
      });

      if (!room) {
        throw new Error('Room not found');
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          bookingReferenceId: `WI-${Date.now()}`,
          guestId: guest.id,
          roomId: roomId,
          roomTypeId: room.roomTypeId,
          checkinDate: new Date(checkinDate),
          checkoutDate: new Date(checkoutDate),
          numAdults: walkInGuest.numberOfAdults,
          numChildren: walkInGuest.numberOfChildren,
          totalPrice: walkInGuest.totalAmount,
          finalAmount: walkInGuest.totalAmount,
          status: 'Confirmed',
          walkInGuest: true,
          source: 'Walk-in'
        }
      });

      // Update walk-in record
      await tx.walkInGuest.update({
        where: { id: walkInId },
        data: {
          status: 'CONFIRMED',
          convertedBookingId: booking.id
        }
      });

      return { booking, guest, room };
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in guest converted to booking successfully',
      data: {
        bookingId: result.booking.id,
        bookingReference: result.booking.bookingReferenceId,
        guestName: `${result.guest.firstName} ${result.guest.lastName}`,
        roomNumber: result.room.roomNumber,
        status: result.booking.status
      }
    });

  } catch (error) {
    console.error('Error converting walk-in to booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert walk-in guest to booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  startCheckinSession,
  completeCheckin,
  getAvailableRooms,
  getBookingsForCheckin,
  createWalkInGuest,
  convertWalkInToBooking
};
