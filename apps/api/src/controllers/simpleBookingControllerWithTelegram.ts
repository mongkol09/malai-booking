import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendBookingConfirmationEmailDirect } from './emailController';
import { BusinessNotificationService } from '../services/businessNotificationService';

const prisma = new PrismaClient();

// Import Telegram notification service
const TelegramNotificationService = require('../../telegram-notification-service.js');
const telegramService = new TelegramNotificationService();

// Simplified booking creation for admin panel
export const createSimpleBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('🏨 Creating booking from admin panel...', req.body);

    // Extract data from request with proper mapping
    const {
      // Guest information 
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      
      // Room and booking details
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
          required: ['guestFirstName', 'guestLastName', 'roomId', 'checkInDate', 'checkOutDate'],
          received: {
            guestFirstName: !!guestFirstName,
            guestLastName: !!guestLastName,
            guestEmail: !!guestEmail,
            roomId: !!roomId,
            checkInDate: !!checkInDate,
            checkOutDate: !!checkOutDate
          }
        }
      });
    }

    // Generate booking reference
    const bookingReferenceId = 'BK' + Date.now().toString().slice(-8);

    // Convert dates to proper format
    const checkin = new Date(checkInDate);
    const checkout = new Date(checkOutDate);

    // Validate dates
    if (checkin >= checkout) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Check-out date must be after check-in date',
          dates: { checkin: checkInDate, checkout: checkOutDate }
        }
      });
    }

    // Get room with type information
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        status: {
          in: ['Available', 'Occupied', 'OutOfOrder'] // Allow booking even if occupied (admin override)
        }
      },
      include: {
        roomType: true
      }
    });

    if (!room) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Room not found or not available',
          requestedRoom: roomId
        }
      });
    }

    // 🚨 NEW: Check for date conflicts with existing bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId: room.id,
        status: {
          in: ['Confirmed', 'InHouse']
        },
        OR: [
          {
            AND: [
              { checkinDate: { lt: checkout } },
              { checkoutDate: { gt: checkin } }
            ]
          }
        ]
      },
      include: {
        guest: true
      }
    });

    if (conflictingBookings.length > 0) {
      console.log(`🚫 Room ${room.roomNumber} has ${conflictingBookings.length} conflicting bookings for ${checkInDate} - ${checkOutDate}`);
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Room is already booked for the selected dates',
          conflictDetails: {
            roomNumber: room.roomNumber,
            roomType: room.roomType.name,
            requestedDates: {
              checkin: checkInDate,
              checkout: checkOutDate
            },
            conflicts: conflictingBookings.map((booking: any) => ({
              bookingRef: booking.bookingReferenceId,
              guest: `${booking.guest.firstName} ${booking.guest.lastName}`,
              dates: {
                checkin: booking.checkinDate.toISOString().split('T')[0],
                checkout: booking.checkoutDate.toISOString().split('T')[0]
              },
              status: booking.status
            }))
          }
        }
      });
    }

    // Create guest record first
    const guest = await prisma.guest.create({
      data: {
        firstName: guestFirstName,
        lastName: guestLastName,
        email: guestEmail || null,
        phone: guestPhone || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Guest created:', guest.id);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingReferenceId,
        guestId: guest.id,
        roomId: room.id,
        checkinDate: checkin,
        checkoutDate: checkout,
        adults: parseInt(adults.toString()),
        children: parseInt(children.toString()),
        totalPrice: parseFloat(totalAmount.toString()),
        status: 'Confirmed',
        paymentStatus: 'Pending',
        specialRequests: specialRequests || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        }
      }
    });

    console.log('✅ Booking created successfully:', booking.id);

    // 📧 SEND BOOKING CONFIRMATION EMAIL
    try {
      console.log('📧 Sending booking confirmation email...');
      await sendBookingConfirmationEmailDirect(
        booking, 
        booking.guest, 
        booking.room.roomType
      );
      console.log('✅ Booking confirmation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails - just log the error
      console.log('⚠️ Booking was created successfully but email failed to send');
    }

    // 🤖 SEND TELEGRAM NOTIFICATION
    try {
      console.log('🤖 Sending Telegram booking notification...');
      
      // Prepare booking data for Telegram
      const telegramBookingData = {
        id: booking.bookingReferenceId,
        customerName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        email: booking.guest.email || 'ไม่ระบุ',
        phone: booking.guest.phone || 'ไม่ระบุ',
        checkIn: booking.checkinDate.toLocaleDateString('th-TH'),
        checkOut: booking.checkoutDate.toLocaleDateString('th-TH'),
        roomType: booking.room.roomType.name,
        guests: booking.adults + (booking.children || 0),
        totalPrice: booking.totalPrice?.toLocaleString('th-TH') || 'ไม่ระบุ',
        paymentStatus: booking.paymentStatus || 'รอการยืนยัน',
        notes: booking.specialRequests || 'ไม่มี'
      };
      
      const telegramResult = await telegramService.sendBookingNotification(telegramBookingData);
      
      if (telegramResult.success) {
        console.log('✅ Telegram notification sent successfully');
      } else {
        console.error('❌ Failed to send Telegram notification:', telegramResult.error);
      }
      
    } catch (telegramError) {
      console.error('❌ Failed to send Telegram notification:', telegramError);
      // Don't fail the booking if Telegram fails - just log the error
      console.log('⚠️ Booking was created successfully but Telegram notification failed');
    }

    // 📢 ส่งการแจ้งเตือน CEO Level (Business Notification)
    try {
      await BusinessNotificationService.notifyNewBooking({
        bookingId: booking.bookingReferenceId,
        roomNumber: booking.room.roomNumber,
        roomTypeName: booking.room.roomType.name,
        guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        checkinDate: booking.checkinDate.toISOString().split('T')[0],
        checkoutDate: booking.checkoutDate.toISOString().split('T')[0],
        totalPrice: Number(booking.totalPrice || 0),
        status: booking.status
      });
      console.log('✅ CEO Level booking notification sent successfully');
    } catch (ceoNotificationError) {
      console.error('⚠️ Failed to send CEO level booking notification:', ceoNotificationError);
      // ไม่ให้ notification error ทำให้ booking ล้มเหลว
    }

    // 🏨 AUTO-UPDATE ROOM STATUS BASED ON BOOKING DATES
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkinDateCheck = new Date(checkInDate);
    checkinDateCheck.setHours(0, 0, 0, 0);
    const checkoutDateCheck = new Date(checkOutDate);
    checkoutDateCheck.setHours(0, 0, 0, 0);
    
    // If check-in is today or has already passed, and check-out is in the future
    if (checkinDateCheck <= today && checkoutDateCheck > today) {
      console.log('🔄 Updating room status to Occupied (guest should be in-house)');
      try {
        await prisma.room.update({
          where: { id: roomId },
          data: { 
            status: 'Occupied',
            updatedAt: new Date()
          }
        });
        console.log(`✅ Room ${room.roomNumber} status updated to Occupied`);
      } catch (statusError) {
        console.error('❌ Failed to update room status:', statusError);
      }
    } else if (checkoutDateCheck <= today) {
      // If checkout date has passed, mark as available
      console.log('🔄 Updating room status to Available (checkout date has passed)');
      try {
        await prisma.room.update({
          where: { id: roomId },
          data: { 
            status: 'Available',
            updatedAt: new Date()
          }
        });
        console.log(`✅ Room ${room.roomNumber} status updated to Available`);
      } catch (statusError) {
        console.error('❌ Failed to update room status:', statusError);
      }
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        reference: booking.bookingReferenceId,
        
        guest: {
          name: `${booking.guest.firstName} ${booking.guest.lastName}`,
          email: booking.guest.email,
          phone: booking.guest.phone
        },
        
        room: {
          id: booking.room.roomNumber,
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
        
        specialRequests: booking.specialRequests,
        createdAt: booking.createdAt.toISOString(),
        
        notifications: {
          email: 'attempted',
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
