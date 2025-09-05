import { Request, Response } from 'express';
import { PrismaClient, BookingStatus, RoomStatus } from '@prisma/client';
import { getNotificationService } from '../services/notificationService';

const prisma = new PrismaClient();
const notificationService = getNotificationService();

// ============================================
// CHECK-IN / CHECK-OUT CONTROLLER
// ============================================
// Implements the Check-in and Check-out flow
// as defined in project_requirement/Check_in_and_out_flow

/**
 * Search for bookings by various criteria
 * Used by admin to find bookings for check-in/check-out
 */
export const searchBooking = async (req: Request, res: Response) => {
  try {
    const { 
      query,
      bookingReferenceId,
      guestName,
      roomNumber,
      status,
      startDate,
      endDate 
    } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          {
            bookingReferenceId: {
              contains: query as string,
              mode: 'insensitive'
            }
          },
          {
            guest: {
              OR: [
                {
                  firstName: {
                    contains: query as string,
                    mode: 'insensitive'
                  }
                },
                {
                  lastName: {
                    contains: query as string,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          },
          {
            room: {
              roomNumber: {
                contains: query as string,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        },
        payments: true
      },
      orderBy: {
        checkinDate: 'desc'
      },
      take: 10 // Limit results
    });

    return res.json({
      success: true,
      message: 'Booking search results',
      data: {
        bookings: bookings.map(booking => ({
          id: booking.id,
          bookingReferenceId: booking.bookingReferenceId,
          status: booking.status,
          guest: {
            name: `${booking.guest.firstName} ${booking.guest.lastName}`,
            email: booking.guest.email,
            phone: booking.guest.phoneNumber
          },
          room: {
            number: booking.room?.roomNumber,
            type: booking.room?.roomType?.name
          },
          dates: {
            checkin: booking.checkinDate,
            checkout: booking.checkoutDate
          },
          paymentStatus: booking.payments.length > 0 ? 'PAID' : 'PENDING',
          canCheckIn: booking.status === 'Confirmed' && new Date() >= new Date(booking.checkinDate),
          canCheckOut: booking.status === 'InHouse'
        })),
        total: bookings.length
      }
    });

  } catch (error) {
    console.error('Search booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get booking details by QR code / booking reference ID
 * Used when scanning QR code for quick check-in/check-out
 */
export const getBookingByQR = async (req: Request, res: Response) => {
  try {
    const { bookingReferenceId } = req.params;

    if (!bookingReferenceId) {
      return res.status(400).json({
        success: false,
        message: 'Booking reference ID is required'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingReferenceId },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        },
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const response = {
      id: booking.id,
      bookingReferenceId: booking.bookingReferenceId,
      status: booking.status,
      guest: {
        name: `${booking.guest.firstName} ${booking.guest.lastName}`,
        email: booking.guest.email,
        phone: booking.guest.phoneNumber,
        country: booking.guest.country
      },
      room: {
        number: booking.room?.roomNumber,
        type: booking.room?.roomType?.name
      },
      dates: {
        checkin: booking.checkinDate,
        checkout: booking.checkoutDate
      },
      guests: {
        adults: booking.numAdults,
        children: booking.numChildren
      },
      pricing: {
        totalAmount: booking.totalPrice,
        finalAmount: booking.finalAmount,
        paidAmount: booking.payments.reduce((sum: number, payment: any) => 
          sum + Number(payment.amount), 0
        )
      },
      canCheckIn: booking.status === 'Confirmed' && new Date() >= new Date(booking.checkinDate),
      canCheckOut: booking.status === 'InHouse'
    };

    return res.json({
      success: true,
      message: 'Booking details retrieved',
      data: { booking: response }
    });

  } catch (error) {
    console.error('Get booking by QR error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Process check-in for a booking
 * Updates booking status and room status
 */
export const processCheckIn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      notes,
      specialRequests,
      depositAmount,
      staffId
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Start transaction for check-in process
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current booking with full details
      const booking = await tx.booking.findUnique({
        where: { id },
        include: {
          guest: true,
          room: true,
          payments: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // 2. Validate booking can be checked in
      console.log(`🔍 Check-in status validation: ${booking.status}`);
      
      const validCheckinStatuses = ['Confirmed', 'Pending'];
      if (!validCheckinStatuses.includes(booking.status)) {
        console.log(`⚠️ Invalid status for check-in: ${booking.status}`);
        throw new Error(`Cannot check in booking with status: ${booking.status}. Valid statuses: ${validCheckinStatuses.join(', ')}`);
      }
      
      console.log(`✅ Check-in status validation passed: ${booking.status}`);

      // 3. Update booking status to checked in
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'InHouse' as BookingStatus,
          specialRequests: specialRequests || booking.specialRequests,
          updatedAt: new Date()
        }
      });

      // 4. Update room status to occupied
      await tx.room.update({
        where: { id: booking.roomId },
        data: {
          status: 'Occupied' as RoomStatus
        }
      });

      return { booking: updatedBooking };
    });

    // 📢 ส่งการแจ้งเตือน Check-in
    console.log('🔔 [CHECK-IN] Starting notification process...');
    console.log('🔔 [CHECK-IN] notificationService exists:', !!notificationService);
    try {
      console.log('🔍 [CHECK-IN] Finding booking for notification...');
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          guest: true,
          room: true,
          payments: {
            where: { status: 'COMPLETED' }
          }
        }
      });

      if (booking && notificationService) {
        console.log('✅ [CHECK-IN] Booking found, preparing notification data...');
        console.log('🔍 [CHECK-IN] Booking details:', {
          id: booking.id,
          refId: booking.bookingReferenceId,
          // guestName: `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.trim(), // Removed - not in schema
          // roomNumber: booking.room?.roomNumber // Removed - not in schema
        });
        
        // คำนวณยอดรวมที่ชำระแล้ว
        const totalPaid = booking.payments.reduce((sum, payment) => 
          sum + parseFloat(payment.amount.toString()), 0
        );

        console.log('📞 [CHECK-IN] Calling notificationService.notifyGuestCheckIn...');
        await notificationService.notifyGuestCheckIn({
          bookingId: booking.bookingReferenceId || booking.id,
          guestName: `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.trim() || 'ไม่ระบุชื่อ',
          roomNumber: booking.room?.roomNumber || 'ไม่ระบุ',
          // phoneNumber: booking.guest?.phone || 'ไม่ระบุ', // Removed - not in schema
          // email: booking.guest?.email || 'ไม่ระบุ', // Removed - not in schema
          // checkinDate: booking.checkinDate?.toLocaleDateString('th-TH') || 'วันนี้', // Removed - not in schema
          // checkoutDate: booking.checkoutDate?.toLocaleDateString('th-TH') || 'ไม่ระบุ', // Removed - not in schema
          // guestCount: booking.adults || 1, // Removed - not in schema
          // totalAmount: parseFloat(booking.finalAmount.toString()), // Removed - not in schema
          // paymentStatus: totalPaid >= parseFloat(booking.finalAmount.toString()) ? 'ชำระครบแล้ว' : `ค้างชำระ ${parseFloat(booking.finalAmount.toString()) - totalPaid} บาท`, // Removed - not in schema
          checkInTime: new Date().toLocaleString('th-TH'),
          // checkedInBy: `Staff ID: ${staffId || 'System'}` // Removed - not in schema
        });
        console.log('✅ Check-in notification sent successfully');
      } else {
        console.log('⚠️ [CHECK-IN] No booking found or notification service unavailable');
      }
    } catch (notifyError) {
      console.error('⚠️ Failed to send check-in notification:', notifyError);
      // ไม่ให้ notification error ทำให้ check-in ล้มเหลว
    }

    // 🚨 BACKUP: Direct Telegram notification (เพิ่มเพื่อให้แน่ใจว่าได้ notification)
    try {
      const axios = require('axios');
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { guest: true, room: true }
      });

      if (booking) {
        const message = `🏨 แจ้งเตือน: ผู้เข้าพักเช็คอิน
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ผู้เข้าพัก: ${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}
🏨 หมายเลขห้อง: ${booking.room?.roomNumber || 'ไม่ระบุ'}
📋 เลขที่การจอง: ${booking.bookingReferenceId || booking.id}
📞 เบอร์โทร: ${booking.guest?.phoneNumber || 'ไม่ระบุ'}
✉️ อีเมล: ${booking.guest?.email || 'ไม่ระบุ'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 วันที่เช็คอิน: ${booking.checkinDate?.toLocaleDateString('th-TH') || 'วันนี้'}
📅 วันที่เช็คเอาท์: ${booking.checkoutDate?.toLocaleDateString('th-TH') || 'ไม่ระบุ'}
👥 จำนวนผู้เข้าพัก: ${booking.numAdults || 1} คน
💰 ยอดเงินรวม: ${parseFloat(booking.finalAmount.toString()).toLocaleString()} บาท
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ เวลาเช็คอิน: ${new Date().toLocaleString('th-TH')}
👨‍💼 ดำเนินการโดย: Staff ID: ${staffId || 'System'}`;

        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message
        });

        console.log('✅ [BACKUP] Direct Telegram check-in notification sent successfully!');
      }
    } catch (backupError) {
      console.error('⚠️ [BACKUP] Direct Telegram notification failed:', backupError.message);
    }

    return res.json({
      success: true,
      message: 'Check-in completed successfully',
      data: {
        booking: {
          id: result.booking.id,
          status: result.booking.status,
          checkedInAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({
      success: false,
      message: 'Check-in failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Process check-out for a booking
 * Updates booking status, room status, and handles final billing
 */
export const processCheckOut = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      additionalCharges = [],
      notes,
      depositRefund = 0,
      staffId
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Start transaction for check-out process
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current booking
      const booking = await tx.booking.findUnique({
        where: { id },
        include: {
          guest: true,
          room: true,
          payments: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // 2. Validate booking can be checked out
      console.log(`🔍 Booking status check: ${booking.status}`);
      
      // Allow check-out for these statuses
      const validCheckoutStatuses = ['InHouse', 'Confirmed', 'Arrived'];
      if (!validCheckoutStatuses.includes(booking.status)) {
        console.log(`⚠️ Invalid status for checkout: ${booking.status}`);
        throw new Error(`Cannot check out booking with status: ${booking.status}. Valid statuses: ${validCheckoutStatuses.join(', ')}`);
      }
      
      console.log(`✅ Status validation passed: ${booking.status}`);

      // 3. Update booking status to checked out
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'CheckedOut' as BookingStatus,
          checkoutTime: new Date(),
          updatedAt: new Date()
        }
      });

      // 4. Update room status to dirty (needs cleaning)
      await tx.room.update({
        where: { id: booking.roomId },
        data: {
          status: 'Dirty' as RoomStatus,
          lastCheckoutDate: new Date()
        }
      });

      // 5. Create housekeeping task for room cleaning
      await tx.housekeepingTask.create({
        data: {
          roomId: booking.roomId,
          taskType: 'CheckoutClean',
          priority: 'Normal',
          status: 'Pending',
          notes: `Check-out cleaning for room ${booking.room?.roomNumber}`
        }
      });

      return { 
        booking: updatedBooking, 
        room: booking.room,
        guest: booking.guest
      };
    });

    // 📢 ส่งการแจ้งเตือน Check-out
    try {
      if (notificationService) {
        await notificationService.notifyAll('GuestCheckOut', {
          bookingId: result.booking.bookingReferenceId || result.booking.id,
          guestName: `${result.guest?.firstName || ''} ${result.guest?.lastName || ''}`.trim() || 'ไม่ระบุชื่อ',
          roomNumber: result.room?.roomNumber || 'ไม่ระบุ',
          additionalCharges: Number(additionalCharges) || 0,
          finalBill: result.booking.finalAmount || 0,
          checkOutTime: new Date().toLocaleString('th-TH'),
          checkedOutBy: staffId || 'ระบบ'
        });
        console.log('✅ Check-out notification sent successfully');
      }
    } catch (notifyError) {
      console.error('⚠️ Failed to send check-out notification:', notifyError);
      // ไม่ให้ notification error ทำให้ check-out ล้มเหลว
    }

    return res.json({
      success: true,
      message: 'Check-out completed successfully',
      data: {
        booking: {
          id: result.booking.id,
          status: result.booking.status,
          checkedOutAt: new Date().toISOString()
        },
        finalBill: {
          totalCharges: Array.isArray(additionalCharges) 
            ? additionalCharges.reduce((sum: number, charge: any) => 
                sum + Number(charge.amount || 0), 0
              )
            : Number(additionalCharges) || 0
        }
      }
    });

  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({
      success: false,
      message: 'Check-out failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get today's expected arrivals
 * Used by front desk to prepare for incoming guests
 */
export const getTodaysArrivals = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const arrivals = await prisma.booking.findMany({
      where: {
        checkinDate: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['Confirmed', 'InHouse']
        }
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        },
        payments: true
      },
      orderBy: {
        checkinDate: 'asc'
      }
    });

    return res.json({
      success: true,
      message: "Today's arrivals retrieved",
      data: {
        arrivals: arrivals.map(booking => ({
          id: booking.id,
          bookingReferenceId: booking.bookingReferenceId,
          guest: {
            name: `${booking.guest.firstName} ${booking.guest.lastName}`,
            email: booking.guest.email,
            phone: booking.guest.phoneNumber
          },
          room: {
            number: booking.room?.roomNumber,
            type: booking.room?.roomType?.name
          },
          checkinTime: booking.checkinDate,
          status: booking.status,
          isCheckedIn: booking.status === 'InHouse'
        })),
        total: arrivals.length
      }
    });

  } catch (error) {
    console.error("Get today's arrivals error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get today's arrivals",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get today's expected departures
 * Used by front desk to prepare for guest check-outs
 */
export const getTodaysDepartures = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const departures = await prisma.booking.findMany({
      where: {
        checkoutDate: {
          gte: today,
          lt: tomorrow
        },
        status: 'InHouse'
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        }
      },
      orderBy: {
        checkoutDate: 'asc'
      }
    });

    return res.json({
      success: true,
      message: "Today's departures retrieved",
      data: {
        departures: departures.map(booking => ({
          id: booking.id,
          bookingReferenceId: booking.bookingReferenceId,
          guest: {
            name: `${booking.guest.firstName} ${booking.guest.lastName}`,
            email: booking.guest.email,
            phone: booking.guest.phoneNumber
          },
          room: {
            number: booking.room?.roomNumber,
            type: booking.room?.roomType?.name
          },
          checkoutTime: booking.checkoutDate,
          status: booking.status
        })),
        total: departures.length
      }
    });

  } catch (error) {
    console.error("Get today's departures error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get today's departures",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update room status manually
 * Used by housekeeping and maintenance staff
 */
export const updateRoomStatus = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { status, notes } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    if (!status || !Object.values(RoomStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid room status is required'
      });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        status: status as RoomStatus,
        notes: notes || null,
        updatedAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'Room status updated successfully',
      data: {
        room: {
          id: updatedRoom.id,
          roomNumber: updatedRoom.roomNumber,
          status: updatedRoom.status,
          notes: updatedRoom.notes
        }
      }
    });

  } catch (error) {
    console.error('Update room status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update room status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get active booking for a specific room
 * Used to check room occupancy status
 */
export const getActiveBookingByRoom = async (req: Request, res: Response) => {
  try {
    const { roomNumber } = req.query;

    if (!roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Room number is required'
      });
    }

    const room = await prisma.room.findUnique({
      where: { roomNumber: roomNumber as string },
      include: {
        bookings: {
          where: {
            OR: [
              { status: 'InHouse' },
              { status: 'Confirmed' }
            ]
          },
          include: {
            guest: true
          },
          orderBy: {
            checkinDate: 'desc'
          },
          take: 1
        },
        roomType: true
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const activeBooking = room.bookings[0] || null;

    return res.json({
      success: true,
      message: 'Room status retrieved',
      data: {
        room: {
          id: room.id,
          roomNumber: room.roomNumber,
          status: room.status,
          type: room.roomType.name
        },
        activeBooking: activeBooking ? {
          id: activeBooking.id,
          bookingReferenceId: activeBooking.bookingReferenceId,
          guest: {
            name: `${activeBooking.guest.firstName} ${activeBooking.guest.lastName}`,
            email: activeBooking.guest.email
          },
          checkinDate: activeBooking.checkinDate,
          checkoutDate: activeBooking.checkoutDate,
          status: activeBooking.status
        } : null
      }
    });

  } catch (error) {
    console.error('Get active booking by room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get room status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export all functions as default object as well
export default {
  searchBooking,
  getBookingByQR,
  processCheckIn,
  processCheckOut,
  getTodaysArrivals,
  getTodaysDepartures,
  updateRoomStatus,
  getActiveBookingByRoom
};
