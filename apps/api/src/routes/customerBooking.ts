// ============================================
// SIMPLIFIED CUSTOMER BOOKING ROUTES
// ============================================

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { BookingStatus, PaymentStatus } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Simple direct booking for customer app (no booking intent flow)
router.post('/direct', async (req, res) => {
  try {
    console.log('📝 Direct booking request:', req.body);
    
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      customerInfo,
      paymentMethod,
      specialRequests,
      subtotal,
      vat,
      total
    } = req.body;

    // Validate required fields
    if (!customerInfo?.firstName || !customerInfo?.email || !customerInfo?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required customer information',
        required: ['customerInfo.firstName', 'customerInfo.email', 'customerInfo.phone']
      });
    }

    if (!checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information',
        required: ['checkIn', 'checkOut', 'guests']
      });
    }

    // Get room type info (use first available if roomId not provided)
    let selectedRoomType;
    if (roomId) {
      selectedRoomType = await prisma.roomType.findUnique({
        where: { id: roomId },
        include: {
          rooms: {
            where: { status: 'Available' },
            take: 1
          }
        }
      });
    } else {
      // Get first available room type
      selectedRoomType = await prisma.roomType.findFirst({
        where: { isActive: true },
        include: {
          rooms: {
            where: { status: 'Available' },
            take: 1
          }
        }
      });
    }

    if (!selectedRoomType || selectedRoomType.rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No available rooms found',
        error: 'ROOM_NOT_AVAILABLE'
      });
    }

    const selectedRoom = selectedRoomType.rooms[0];
    
    if (!selectedRoom) {
      return res.status(400).json({
        success: false,
        message: 'No available rooms found',
        error: 'ROOM_NOT_AVAILABLE'
      });
    }

    // Create or find guest record
    let guest = await prisma.guest.findFirst({
      where: { email: customerInfo.email }
    });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName || '',
          email: customerInfo.email,
          phoneNumber: customerInfo.phone,
          idNumber: customerInfo.idCard,
          country: 'TH'
        }
      });
    }

    // Create booking in database  
    const booking = await prisma.booking.create({
      data: {
        bookingReferenceId: `BK${Date.now()}`, // Generate unique reference
        guestId: guest.id,
        roomTypeId: selectedRoomType.id,
        roomId: selectedRoom.id,
        checkinDate: new Date(checkIn),
        checkoutDate: new Date(checkOut),
        numAdults: Math.min(parseInt(guests) || 1, 10),
        numChildren: 0,
        totalPrice: parseFloat(subtotal) || selectedRoomType.baseRate,
        taxAmount: parseFloat(vat) || 0,
        finalAmount: parseFloat(total) || parseFloat(subtotal) || selectedRoomType.baseRate,
        status: BookingStatus.Confirmed,
        specialRequests: specialRequests || null,
        source: 'CUSTOMER_APP'
      },
      include: {
        roomType: true,
        room: true
      }
    });

    // Update room status to occupied
    await prisma.room.update({
      where: { id: selectedRoom.id },
      data: { status: 'Occupied' }
    });

    console.log('✅ Booking created successfully:', booking.id);

    res.json({
      success: true,
      bookingId: booking.id,
      status: 'confirmed',
      message: 'การจองได้รับการยืนยันเรียบร้อยแล้ว',
      booking: {
        id: booking.id,
        roomName: selectedRoomType.name,
        roomNumber: selectedRoom.roomNumber,
        checkIn: booking.checkinDate,
        checkOut: booking.checkoutDate,
        guests: booking.numAdults + booking.numChildren,
        totalAmount: booking.finalAmount,
        status: booking.status
      }
    });

  } catch (error: any) {
    console.error('❌ Direct booking error:', error);
    res.status(500).json({
      success: false,
      message: 'การจองล้มเหลว กรุณาลองใหม่อีกครั้ง',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;
