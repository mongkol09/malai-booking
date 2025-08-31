import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { BusinessNotificationService } from '../services/businessNotificationService';

const prisma = new PrismaClient();

// Import Telegram notification service
const TelegramNotificationService = require('../../telegram-notification-service.js');
const telegramService = new TelegramNotificationService();

// Simple booking creation for testing (no authentication required)
export const createSimpleBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('🏨 ===== SIMPLE BOOKING CREATION =====');
    console.log('📥 Full Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 Guest data received:');
    console.log('  - guestData:', req.body.guestData);
    console.log('  - guestData.name:', req.body.guestData?.name);
    console.log('  - guestData.email:', req.body.guestData?.email);

    const {
      guestData,
      roomData,
      dates,
      pricing,
      specialRequests,
      source,
      paymentMethod,
      status
    } = req.body;

    // Extract data from nested structures for backward compatibility
    const guestInfo = guestData || {};
    const roomInfo = roomData || {};
    const dateInfo = dates || {};

    // Validate required guest information
    const guestName = guestInfo?.name?.trim() || '';
    if (!guestName || guestName === '' || guestName === 'Guest User') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Guest name is required',
          details: 'Please provide valid guest first and last name'
        }
      });
    }

    if (!guestInfo?.email || guestInfo.email.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Guest email is required',
          details: 'Please provide a valid guest email address'
        }
      });
    }

    // Generate booking reference ID
    const bookingReferenceId = 'BK' + Date.now().toString().slice(-8);
    const qrCode = 'QR' + Date.now().toString();

    // Create booking data
    console.log('🔧 Creating booking with guest name:', guestName);
    console.log('🔧 Original guestInfo.name:', guestInfo.name);
    console.log('🔧 Final guestName used:', guestName);
    
    const bookingData = {
      id: uuidv4(),
      bookingReferenceId,
      qrCode,
      status: status || 'confirmed',
      
      // Guest information (Required fields validated above)
      guestName: guestName, // Use validated name
      guestEmail: guestInfo.email,
      guestPhone: guestInfo.phone || null,
      guestNationality: guestInfo?.nationality || 'Thai',
      
      // Room information
      roomType: roomInfo?.type || 'Standard',
      roomNumber: roomInfo?.number || null,
      numberOfGuests: roomInfo?.guests || 1,
      roomPreferences: roomInfo?.preferences || '',
      
      // Date information
      checkinDate: new Date(dateInfo?.checkIn || dateInfo?.checkin || '2025-08-19'),
      checkoutDate: new Date(dateInfo?.checkOut || dateInfo?.checkout || '2025-08-20'),
      numberOfNights: dateInfo?.nights || 1,
      
      // Pricing information
      totalAmount: pricing?.total || pricing?.totalAmount || 1000,
      paidAmount: pricing?.total || pricing?.totalAmount || 1000,
      currency: pricing?.currency || 'THB',
      
      // Additional information
      specialRequests: specialRequests || '',
      bookingSource: source || 'API Test',
      paymentMethod: paymentMethod || 'credit_card',
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 Booking data prepared:', bookingReferenceId);

    // ==================================================
    // SAVE TO REAL DATABASE
    // ==================================================
    
    // 1. Find or create guest
    let guestRecord = await prisma.guest.findFirst({
      where: { email: bookingData.guestEmail }
    });

    // Split guest name properly for both create and update
    const nameParts = bookingData.guestName.split(' ').filter(part => part.trim() !== '');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    console.log('👤 ===== GUEST CREATION/UPDATE DEBUG =====');
    console.log('👤 Original guestName from bookingData:', bookingData.guestName);
    console.log('👤 Name parts after split:', nameParts);
    console.log('👤 Extracted firstName:', firstName);
    console.log('👤 Extracted lastName:', lastName);
    console.log('👤 Email from bookingData:', bookingData.guestEmail);
    
    if (!guestRecord) {
      console.log('👤 Creating NEW guest with:', { firstName, lastName, email: bookingData.guestEmail });
      
      guestRecord = await prisma.guest.create({
        data: {
          firstName,
          lastName,
          email: bookingData.guestEmail,
          phoneNumber: bookingData.guestPhone,
          country: bookingData.guestNationality
        }
      });
      console.log('👤 Guest created:', guestRecord.id);
    } else {
      console.log('👤 Found existing guest:', guestRecord.id);
      console.log('👤 Current name:', guestRecord.firstName, guestRecord.lastName);
      console.log('👤 New name:', firstName, lastName);
      
      // Check if name has changed - if so, update the record
      if (guestRecord.firstName !== firstName || guestRecord.lastName !== lastName) {
        console.log('👤 Name has changed - UPDATING guest record');
        
        guestRecord = await prisma.guest.update({
          where: { id: guestRecord.id },
          data: {
            firstName,
            lastName,
            phoneNumber: bookingData.guestPhone || guestRecord.phoneNumber,
            country: bookingData.guestNationality || guestRecord.country,
            updatedAt: new Date()
          }
        });
        console.log('👤 Guest updated with new name:', firstName, lastName);
      } else {
        console.log('👤 Name unchanged - using existing guest record');
      }
    }

    // 2. Find room by ID or by type
    let roomRecord;
    
    // If roomNumber (ID) is provided, find specific room
    if (roomInfo?.number && roomInfo.number.length > 10) { // Assume UUID format
      roomRecord = await prisma.room.findFirst({
        where: {
          id: roomInfo.number,
          status: 'Available'
        },
        include: {
          roomType: true
        }
      });
    } else if (roomInfo?.type && roomInfo.type.length > 10) { // Assume roomTypeId
      roomRecord = await prisma.room.findFirst({
        where: {
          status: 'Available',
          roomTypeId: roomInfo.type
        },
        include: {
          roomType: true
        }
      });
    } else {
      // Fallback: search by room type name
      roomRecord = await prisma.room.findFirst({
        where: {
          status: 'Available',
          roomType: {
            name: {
              contains: bookingData.roomType || roomInfo?.type || 'Standard',
              mode: 'insensitive'
            }
          }
        },
        include: {
          roomType: true
        }
      });
    }

    if (!roomRecord) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No available rooms found for the requested type',
          requestedType: bookingData.roomType
        }
      });
    }

    console.log('🏠 Room found:', roomRecord.roomNumber, roomRecord.roomType.name);

    // 3. Create actual booking in database
    const realBooking = await prisma.booking.create({
      data: {
        bookingReferenceId: bookingData.bookingReferenceId,
        guestId: guestRecord.id,
        roomId: roomRecord.id,
        roomTypeId: roomRecord.roomTypeId,
        checkinDate: bookingData.checkinDate,
        checkoutDate: bookingData.checkoutDate,
        numAdults: bookingData.numberOfGuests,
        numChildren: 0,
        totalPrice: bookingData.totalAmount,
        finalAmount: bookingData.paidAmount,
        status: 'Confirmed',
        specialRequests: bookingData.specialRequests,
        source: bookingData.bookingSource
      },
      include: {
        guest: true,
        room: true,
        roomType: true
      }
    });

    console.log('✅ Real booking created in database:', realBooking.id);

    // 4. Update room status to occupied
    await prisma.room.update({
      where: { id: roomRecord.id },
      data: { status: 'Occupied' }
    });

    console.log('🏠 Room status updated to Occupied');

    // 📢 ส่งการแจ้งเตือน Booking สำเร็จ
    try {
      await BusinessNotificationService.notifyNewBooking({
        bookingId: realBooking.bookingReferenceId,
        roomNumber: roomRecord.roomNumber,
        roomTypeName: roomRecord.roomType.name,
        guestName: bookingData.guestName,
        checkinDate: bookingData.checkinDate.toISOString().split('T')[0],
        checkoutDate: bookingData.checkoutDate.toISOString().split('T')[0],
        totalPrice: Number(bookingData.totalAmount),
        status: realBooking.status
      });
      console.log('✅ Booking notification sent successfully');
    } catch (notificationError) {
      console.error('⚠️ Failed to send booking notification:', notificationError);
      // ไม่ให้ notification error ทำให้ booking ล้มเหลว
    }

    // Build response with real database data
    const result = {
      success: true,
      message: 'Booking created successfully',
      data: {
        id: realBooking.id,
        bookingReferenceId: realBooking.bookingReferenceId,
        qrCode: bookingData.qrCode,
        status: realBooking.status,
        
        guest: {
          name: bookingData.guestName,
          email: bookingData.guestEmail,
          phone: bookingData.guestPhone,
          nationality: bookingData.guestNationality
        },
        
        room: {
          type: bookingData.roomType,
          number: bookingData.roomNumber,
          guests: bookingData.numberOfGuests
        },
        
        dates: {
          checkin: bookingData.checkinDate.toISOString().split('T')[0],
          checkout: bookingData.checkoutDate.toISOString().split('T')[0],
          nights: bookingData.numberOfNights
        },
        
        pricing: {
          totalAmount: bookingData.totalAmount,
          paidAmount: bookingData.paidAmount,
          currency: bookingData.currency
        },
        
        specialRequests: bookingData.specialRequests,
        source: bookingData.bookingSource,
        paymentMethod: bookingData.paymentMethod,
        createdAt: bookingData.createdAt
      }
    };

    console.log('✅ Simple booking created:', bookingReferenceId);
    return res.status(201).json(result);

  } catch (error) {
    console.error('❌ Error creating simple booking:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};
