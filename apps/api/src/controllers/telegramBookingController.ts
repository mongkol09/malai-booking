import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import Telegram notification service
const TelegramNotificationService = require('../../telegram-notification-service.js');
const telegramService = new TelegramNotificationService();

// Enhanced booking creation with Telegram notifications
export const createBookingWithTelegram = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('🏨 Creating booking with Telegram notification...', req.body);

    // Extract data from request
    const {
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      roomId,
      checkInDate,
      checkOutDate,
      adults = 1,
      children = 0,
      totalAmount = 0,
      specialRequests = ''
    } = req.body;

    // Validate required fields
    if (!guestFirstName || !guestLastName || !roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          required: ['guestFirstName', 'guestLastName', 'roomId', 'checkInDate', 'checkOutDate']
        }
      });
    }

    // Generate booking reference
    const bookingReferenceId = 'BK' + Date.now().toString().slice(-8);

    // Convert dates
    const checkin = new Date(checkInDate);
    const checkout = new Date(checkOutDate);

    // Validate dates
    if (checkin >= checkout) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Check-out date must be after check-in date'
        }
      });
    }

    // Get room information
    const room = await prisma.room.findFirst({
      where: { id: roomId },
      include: { roomType: true }
    });

    if (!room) {
      return res.status(400).json({
        success: false,
        error: { message: 'Room not found' }
      });
    }

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        firstName: guestFirstName,
        lastName: guestLastName,
        email: guestEmail || '',
        phoneNumber: guestPhone || null
      }
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingReferenceId,
        guestId: guest.id,
        roomId: room.id,
        roomTypeId: room.roomTypeId,
        checkinDate: checkin,
        checkoutDate: checkout,
        numAdults: parseInt(adults.toString()),
        numChildren: parseInt(children.toString()),
        totalPrice: parseFloat(totalAmount.toString()),
        finalAmount: parseFloat(totalAmount.toString()),
        status: 'Confirmed',
        specialRequests: specialRequests || null
      },
      include: {
        guest: true,
        room: { include: { roomType: true } }
      }
    });

    console.log('✅ Booking created:', booking.id);

    // 🤖 SEND TELEGRAM NOTIFICATION
    try {
      console.log('🤖 Sending Telegram notification...');
      
      const telegramData = {
        id: booking.bookingReferenceId,
        customerName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        email: booking.guest.email || 'ไม่ระบุ',
        phone: booking.guest.phoneNumber || 'ไม่ระบุ',
        checkIn: booking.checkinDate.toLocaleDateString('th-TH'),
        checkOut: booking.checkoutDate.toLocaleDateString('th-TH'),
        roomType: booking.room.roomType.name,
        guests: booking.numAdults + booking.numChildren,
        totalPrice: booking.totalPrice?.toString() || 'ไม่ระบุ',
        paymentStatus: 'รอการยืนยัน',
        notes: booking.specialRequests || 'ไม่มี'
      };
      
      const telegramResult = await telegramService.sendBookingNotification(telegramData);
      
      if (telegramResult.success) {
        console.log('✅ Telegram notification sent successfully');
      } else {
        console.error('❌ Telegram notification failed:', telegramResult.error);
      }
      
    } catch (telegramError) {
      console.error('❌ Telegram notification error:', telegramError);
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully with Telegram notification',
      booking: {
        id: booking.id,
        reference: booking.bookingReferenceId,
        guest: {
          name: `${booking.guest.firstName} ${booking.guest.lastName}`,
          email: booking.guest.email,
          phone: booking.guest.phoneNumber
        },
        room: {
          type: booking.room.roomType.name,
          number: booking.room.roomNumber
        },
        dates: {
          checkin: booking.checkinDate.toISOString().split('T')[0],
          checkout: booking.checkoutDate.toISOString().split('T')[0],
          nights: Math.ceil((booking.checkoutDate.getTime() - booking.checkinDate.getTime()) / (1000 * 60 * 60 * 24))
        },
        pricing: {
          totalAmount: booking.totalPrice,
          currency: 'THB'
        },
        notifications: {
          telegram: 'sent'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
