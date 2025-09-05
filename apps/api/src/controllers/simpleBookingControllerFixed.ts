import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Simple booking creation
export const createSimpleBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('🏨 Creating simple booking with database save...', req.body);

    // Extract data from request
    const {
      // Guest information (support both formats)
      customerName,
      guestFirstName,
      guestLastName,
      guestTitle = 'Mr',
      customerEmail,
      guestEmail,
      customerPhone,
      guestPhone,
      
      // Room and booking details
      roomId = 'R101',
      roomType = 'Standard',
      checkInDate = '2025-08-19',
      checkOutDate = '2025-08-20',
      guests = 1,
      adults = 1,
      children = 0,
      totalAmount = 1000,
      specialRequests = '',
      paymentStatus = 'Pending'
    } = req.body;

    // Determine guest name and email
    const finalCustomerName = customerName || 
      (guestFirstName && guestLastName ? `${guestFirstName} ${guestLastName}` : 'Guest');
    const finalCustomerEmail = customerEmail || guestEmail || 'guest@example.com';
    const finalCustomerPhone = customerPhone || guestPhone || '000-000-0000';

    // Generate booking reference ID
    const bookingReferenceId = 'BK' + Date.now().toString().slice(-8);
    const qrCode = 'QR' + Date.now().toString();

    console.log('📝 Processing booking for:', finalCustomerName, finalCustomerEmail);

    // ==================================================
    // 1. Find or create guest
    // ==================================================
    let dbGuest = await prisma.guest.findFirst({
      where: { email: finalCustomerEmail }
    });

    if (!dbGuest) {
      const nameParts = finalCustomerName.split(' ');
      dbGuest = await prisma.guest.create({
        data: {
          firstName: guestFirstName || nameParts[0] || 'Guest',
          lastName: guestLastName || nameParts.slice(1).join(' ') || 'User',
          email: finalCustomerEmail,
          phoneNumber: finalCustomerPhone,
          country: 'Thailand'
        }
      });
      console.log('👤 New guest created:', dbGuest.id);
    } else {
      console.log('👤 Existing guest found:', dbGuest.id);
    }

    // ==================================================
    // 2. Find available room
    // ==================================================
    
    // Try to find room by UUID first (if roomId looks like UUID)
    let availableRoom = null;
    
    if (roomId.length > 20 && roomId.includes('-')) {
      // This looks like a UUID, search by id
      availableRoom = await prisma.room.findFirst({
        where: {
          id: roomId,
          status: 'Available'
        },
        include: {
          roomType: true
        }
      });
    } else {
      // This looks like room number, search by roomNumber
      availableRoom = await prisma.room.findFirst({
        where: {
          roomNumber: roomId,
          status: 'Available'
        },
        include: {
          roomType: true
        }
      });
    }

    // If specific room not found, find any available room of similar type
    if (!availableRoom) {
      console.log(`🔍 Room ${roomId} not available, looking for similar type...`);
      
      availableRoom = await prisma.room.findFirst({
        where: {
          status: 'Available',
          roomType: {
            name: {
              contains: roomType.toLowerCase() === 'deluxe' ? 'Standard' :
                       roomType.toLowerCase() === 'suite' ? 'Onsen' :
                       roomType.toLowerCase() === 'standard' ? 'Standard' :
                       'Standard',
              mode: 'insensitive'
            }
          }
        },
        include: {
          roomType: true
        }
      });
    }

    if (!availableRoom) {
      console.log('❌ No available rooms found');
      return res.status(400).json({
        success: false,
        error: {
          message: 'No available rooms found for the requested type',
          requestedRoom: roomId,
          requestedType: roomType
        }
      });
    }

    console.log('🏠 Room allocated:', availableRoom.roomNumber, availableRoom.roomType.name);

    // ==================================================
    // 3. Create booking in database
    // ==================================================
    const realBooking = await prisma.booking.create({
      data: {
        bookingReferenceId: bookingReferenceId,
        guestId: dbGuest.id,
        roomId: availableRoom.id,
        roomTypeId: availableRoom.roomTypeId,
        checkinDate: new Date(checkInDate),
        checkoutDate: new Date(checkOutDate),
        numAdults: parseInt(adults) || parseInt(guests) || 1,
        numChildren: parseInt(children) || 0,
        totalPrice: totalAmount,
        finalAmount: totalAmount,
        status: 'Confirmed', // Default to Confirmed for admin bookings
        specialRequests: specialRequests,
        source: 'Admin Panel'
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

    console.log('✅ Real booking created in database:', realBooking.id);

    // ==================================================
    // 4. Update room status
    // ==================================================
    await prisma.room.update({
      where: { id: availableRoom.id },
      data: { status: 'Occupied' }
    });

    console.log('🏠 Room status updated to Occupied');

    // ==================================================
    // 5. Build response with real data
    // ==================================================
    const result = {
      success: true,
      message: 'Booking created successfully and saved to database',
      data: {
        id: realBooking.id,
        bookingReferenceId: realBooking.bookingReferenceId,
        qrCode: qrCode,
        status: realBooking.status.toLowerCase(),
        
        guest: {
          name: `${realBooking.guest.firstName} ${realBooking.guest.lastName}`,
          email: realBooking.guest.email,
          phone: realBooking.guest.phoneNumber || '000-000-0000',
          nationality: realBooking.guest.country || 'Unknown'
        },
        
        room: {
          id: realBooking.room.roomNumber,
          type: 'Standard Room', // realBooking.roomType.name, // Property not accessible
          number: realBooking.room.roomNumber,
          guests: realBooking.numAdults + realBooking.numChildren
        },
        
        dates: {
          checkin: realBooking.checkinDate.toISOString().split('T')[0],
          checkout: realBooking.checkoutDate.toISOString().split('T')[0],
          nights: Math.ceil((realBooking.checkoutDate.getTime() - realBooking.checkinDate.getTime()) / (1000 * 60 * 60 * 24))
        },
        
        pricing: {
          totalAmount: Number(realBooking.totalPrice),
          paidAmount: Number(realBooking.finalAmount),
          currency: 'THB'
        },
        
        specialRequests: realBooking.specialRequests,
        source: realBooking.source,
        paymentMethod: 'credit_card',
        createdAt: realBooking.createdAt
      }
    };

    console.log('🎉 Booking successfully processed and saved!');
    return res.status(201).json(result);

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};
