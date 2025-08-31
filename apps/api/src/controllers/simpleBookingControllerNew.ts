import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Simple booking creation for testing (no authentication required)
export const createSimpleBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('🏨 Creating simple booking...', req.body);

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

    // Generate booking reference ID
    const bookingReferenceId = 'BK' + Date.now().toString().slice(-8);
    const qrCode = 'QR' + Date.now().toString();

    // Create booking data
    const bookingData = {
      id: uuidv4(),
      bookingReferenceId,
      qrCode,
      status: status || 'confirmed',
      
      // Guest information
      guestName: guestData?.name || 'Test Guest',
      guestEmail: guestData?.email || 'test@example.com',
      guestPhone: guestData?.phone || '000-000-0000',
      guestNationality: guestData?.nationality || 'Unknown',
      
      // Room information
      roomType: roomData?.type || 'Standard',
      roomNumber: roomData?.number || null,
      numberOfGuests: roomData?.guests || 1,
      roomPreferences: roomData?.preferences || '',
      
      // Date information
      checkinDate: new Date(dates?.checkin || '2025-08-19'),
      checkoutDate: new Date(dates?.checkout || '2025-08-20'),
      numberOfNights: dates?.nights || 1,
      
      // Pricing information
      totalAmount: pricing?.totalAmount || 1000,
      paidAmount: pricing?.totalAmount || 1000,
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
    let guest = await prisma.guest.findFirst({
      where: { email: bookingData.guestEmail }
    });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          firstName: bookingData.guestName.split(' ')[0] || 'Guest',
          lastName: bookingData.guestName.split(' ').slice(1).join(' ') || 'User',
          email: bookingData.guestEmail,
          phoneNumber: bookingData.guestPhone,
          country: bookingData.guestNationality
        }
      });
      console.log('👤 Guest created:', guest.id);
    } else {
      console.log('👤 Existing guest found:', guest.id);
    }

    // 2. Find available room of requested type
    const room = await prisma.room.findFirst({
      where: {
        status: 'Available',
        roomType: {
          name: {
            contains: bookingData.roomType,
            mode: 'insensitive'
          }
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
          message: 'No available rooms found for the requested type',
          requestedType: bookingData.roomType
        }
      });
    }

    console.log('🏠 Room found:', room.roomNumber, room.roomType.name);

    // 3. Create actual booking in database
    const realBooking = await prisma.booking.create({
      data: {
        bookingReferenceId: bookingData.bookingReferenceId,
        guestId: guest.id,
        roomId: room.id,
        roomTypeId: room.roomTypeId,
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
      where: { id: room.id },
      data: { status: 'Occupied' }
    });

    console.log('🏠 Room status updated to Occupied');

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