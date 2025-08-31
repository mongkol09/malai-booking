import { Request, Response } from 'express';
import { PrismaClient, RoomStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import { getNotificationService } from '../services/notificationService';

const prisma = new PrismaClient();
const notificationService = getNotificationService();

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
          ...booking,
          outstandingAmount,
          isOverdue: booking.checkinDate < selectedDate
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
 * Get available rooms for assignment
 * Returns rooms that can be assigned for check-in
 */
export const getAvailableRooms = async (req: Request, res: Response) => {
  try {
    const { roomTypeId, checkinDate, checkoutDate } = req.query;

    const rooms = await prisma.room.findMany({
      where: {
        ...(roomTypeId && { roomTypeId: roomTypeId as string }),
        status: 'Available'
      },
      include: {
        roomType: {
          select: {
            name: true,
            baseRate: true
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
        baseRate: room.roomType.baseRate
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

    // Input validation
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Validate booking with complete relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
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
      }
    }) as any; // Type assertion for compatibility

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
    const room = await prisma.room.findUnique({
      where: { id: roomId || booking.roomId }
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

    // Store guest information for response (ensure include is properly loaded)
    if (!booking.guest) {
      return res.status(500).json({
        success: false,
        message: 'Guest information not loaded properly'
      });
    }

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
          ...(checkinNotes && { booking_remarks: checkinNotes })
        }
      });

      // Update room status
      await tx.room.update({
        where: { id: roomId || booking.roomId },
        data: {
          status: 'Occupied'
        }
      });

      // Record payment if provided
      if (paymentAmount && paymentAmount > 0) {
        // Find or create payment method
        let paymentMethodRecord = await tx.paymentMethod.findFirst({
          where: { name: paymentMethod.toString() }
        });
        
        if (!paymentMethodRecord) {
          paymentMethodRecord = await tx.paymentMethod.create({
            data: {
              name: paymentMethod.toString(),
              code: paymentMethod.toString().toUpperCase()
            }
          });
        }

        await tx.payment.create({
          data: {
            bookingId: bookingId,
            amount: parseFloat(paymentAmount.toString()),
            paymentMethodId: paymentMethodRecord.id,
            status: 'COMPLETED',
            processedAt: new Date()
          }
        });
      }

      return updatedBooking;
    });

    // 📢 ส่งการแจ้งเตือน Check-in
    try {
      if (notificationService) {
        await notificationService.notifyGuestCheckIn({
          bookingId: result.bookingReferenceId || result.id,
          guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
          roomNumber: room.roomNumber,
          phoneNumber: booking.guest?.phoneNumber || 'ไม่ระบุ',
          email: booking.guest?.email || 'ไม่ระบุ',
          checkinDate: booking.checkinDate?.toLocaleDateString('th-TH') || 'วันนี้',
          checkoutDate: booking.checkoutDate?.toLocaleDateString('th-TH') || 'ไม่ระบุ',
          guestCount: booking.adults || 1,
          totalAmount: parseFloat(booking.finalAmount?.toString() || '0'),
          paymentStatus: 'ชำระแล้ว',
          checkInTime: new Date().toLocaleString('th-TH'),
          checkedInBy: 'Professional Check-in System'
        });
        console.log('✅ Check-in notification sent successfully');
      }
    } catch (notifyError) {
      console.error('⚠️ Failed to send check-in notification:', notifyError);
      // ไม่ให้ notification error ทำให้ check-in ล้มเหลว
    }

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

    // Input validation
    if (!bookingId || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and Room ID are required'
      });
    }

    // Validate booking with proper include
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        room: {
          select: {
            roomNumber: true,
            status: true
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

    // Validate new room
    const newRoom = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!newRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (newRoom.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Room ${newRoom.roomNumber} is not available`
      });
    }

    // Store booking information for response
    const bookingInfo = {
      guest: {
        firstName: booking.guest.firstName,
        lastName: booking.guest.lastName
      },
      room: {
        roomNumber: booking.room.roomNumber,
        status: booking.room.status
      }
    };

    // Update room assignment
    const result = await prisma.$transaction(async (tx) => {
      // Update booking with new room
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          roomId: roomId
        }
      });

      // Free up old room if it was occupied
      if (bookingInfo.room.status === 'Occupied') {
        await tx.room.update({
          where: { id: booking.roomId },
          data: {
            status: 'Cleaning'
          }
        });
      }

      // Reserve new room  
      await tx.room.update({
        where: { id: roomId },
        data: {
          status: booking.status === 'InHouse' ? 'Occupied' : 'Available'
        }
      });

      return updatedBooking;
    });

    return res.status(200).json({
      success: true,
      message: 'Room assigned successfully',
      data: {
        bookingId: result.id,
        bookingReference: result.bookingReferenceId,
        guestName: `${bookingInfo.guest.firstName} ${bookingInfo.guest.lastName}`,
        oldRoom: bookingInfo.room.roomNumber,
        newRoom: newRoom.roomNumber,
        reason,
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
 * Get check-in dashboard data
 * Returns overview data for check-in management
 */
export const getCheckinDashboard = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's check-ins
    const todayCheckins = await prisma.booking.count({
      where: {
        checkinDate: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['Confirmed', 'InHouse']
        }
      }
    });

    // Get pending check-ins (overdue)
    const pendingCheckins = await prisma.booking.count({
      where: {
        checkinDate: {
          lt: today
        },
        status: 'Confirmed'
      }
    });

    // Get completed check-ins today
    const completedCheckins = await prisma.booking.count({
      where: {
        checkinDate: {
          gte: today,
          lt: tomorrow
        },
        status: 'InHouse'
      }
    });

    // Get available rooms
    const availableRooms = await prisma.room.count({
      where: {
        status: 'Available'
      }
    });

    // Get rooms needing cleaning
    const roomsCleaning = await prisma.room.count({
      where: {
        status: 'Cleaning'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        todayCheckins,
        pendingCheckins,
        completedCheckins,
        availableRooms,
        roomsCleaning,
        date: today
      }
    });

  } catch (error) {
    console.error('Error fetching check-in dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  getBookingsForCheckin,
  getAvailableRooms,
  performCheckin,
  assignRoom,
  getCheckinDashboard
};
