import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { addMinutes } from 'date-fns';
import { 
  sendBookingConfirmationEmailDirect
} from './emailController';
import { BusinessNotificationService } from '../services/businessNotificationService';

import { BookingIntentStatus, BookingStatus, RoomStatus, PaymentStatus } from '@prisma/client';
const prisma = new PrismaClient();

// ============================================
// BOOKING INTENT CONTROLLER
// Handles temporary price/room locking for customer booking flow
// ============================================

// Validation schemas
const searchAvailabilitySchema = z.object({
  checkinDate: z.string().datetime(),
  checkoutDate: z.string().datetime(),
  numberOfGuests: z.coerce.number().int().min(1).max(10), // coerce string to number from query param
  roomTypeId: z.string().uuid().optional()
});

const createBookingIntentSchema = z.object({
  roomTypeId: z.string().uuid(),
  checkinDate: z.string().datetime(),
  checkoutDate: z.string().datetime(),
  numberOfGuests: z.number().int().min(1).max(10),
  priceSnapshot: z.object({
    totalPrice: z.number(),
    priceBreakdown: z.array(z.object({
      date: z.string(),
      baseRate: z.number(),
      appliedRules: z.array(z.string()).optional(),
      finalRate: z.number()
    }))
  })
});

const confirmBookingSchema = z.object({
  bookingIntentId: z.string().uuid(),
  guestInfo: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phoneNumber: z.string().min(10).max(20),
    country: z.string().min(2).max(3),
    specialRequests: z.string().max(500).optional()
  }),
  paymentInfo: z.object({
    paymentMethodId: z.string().uuid(),
    transactionToken: z.string(), // From payment gateway
    amount: z.number()
  })
});

// ============================================
// 1. PUBLIC AVAILABILITY SEARCH
// ============================================
export const searchAvailability = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { checkinDate, checkoutDate, numberOfGuests, roomTypeId } = searchAvailabilitySchema.parse(req.query);
    
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    
    // Validate date range
    if (checkin >= checkout) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    if (checkin < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Get all room types or specific room type
    const roomTypeFilter = roomTypeId ? { id: roomTypeId } : {};
    const roomTypes = await prisma.roomType.findMany({
      where: roomTypeFilter,
      include: {
        rooms: true
      }
    });

    const availabilityResults = [];

    // Loop through each room type
    for (const roomType of roomTypes) {
      try {
        const availability = await calculateRoomTypeAvailability(
          roomType,
          checkin,
          checkout,
          numberOfGuests
        );
        
        if (availability.isAvailable) {
          availabilityResults.push({
            roomTypeId: roomType.id,
            roomTypeName: roomType.name,
            description: roomType.description,
            capacity: {
              adults: roomType.capacityAdults,
              children: roomType.capacityChildren
            },
            baseRate: roomType.baseRate,
            pricing: availability.pricing,
            totalPrice: availability.totalPrice,
            priceBreakdown: availability.priceBreakdown,
            restrictions: availability.restrictions,
            amenities: roomType.amenities || [],
      images: roomType.imageUrl ? [roomType.imageUrl] : [],
            availableRooms: availability.availableRooms
          });
        }
      } catch (error) {
        console.error(`Error calculating availability for room type ${roomType.id}:`, error);
        // Continue with other room types even if one fails
      }
    }

    return res.json({
      success: true,
      data: {
        searchCriteria: {
          checkinDate: checkin.toISOString(),
          checkoutDate: checkout.toISOString(),
          numberOfGuests,
          numberOfNights: Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
        },
        availableRoomTypes: availabilityResults,
        totalOptions: availabilityResults.length
      }
    });

  } catch (error) {
    console.error('Error searching availability:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while searching availability'
    });
  }
};

// ============================================
// 2. CREATE BOOKING INTENT (Price Lock)
// ============================================
export const createBookingIntent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { roomTypeId, checkinDate, checkoutDate, numberOfGuests, priceSnapshot } = createBookingIntentSchema.parse(req.body);
    
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const expiresAt = addMinutes(new Date(), 15); // 15 minutes lock

    // Verify room type exists and can accommodate guests
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: { rooms: true }
    });

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    if (numberOfGuests > roomType.capacityAdults + roomType.capacityChildren) {
      return res.status(400).json({
        success: false,
        message: 'Number of guests exceeds room capacity'
      });
    }

    // Double-check availability
    const availability = await calculateRoomTypeAvailability(roomType, checkin, checkout, numberOfGuests);
    
    if (!availability.isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Room type is no longer available for selected dates'
      });
    }

    // Create booking intent with room lock
    const selectedRoom = availability.availableRooms[0]; // Get first available room
    
    const bookingIntent = await prisma.bookingIntent.create({
      data: {
        roomTypeId,
        roomId: selectedRoom.id,
        checkinDate: checkin,
        checkoutDate: checkout,
        numberOfGuests,
        priceSnapshot: priceSnapshot as any, // Prisma JSON field
        expiresAt,
        status: BookingIntentStatus.ACTIVE
      }
    });

    return res.json({
      success: true,
      data: {
        bookingIntentId: bookingIntent.id,
        expiresAt: expiresAt.toISOString(),
        expiresInMinutes: 15,
        lockedRoom: {
          roomId: selectedRoom.id,
          roomNumber: selectedRoom.roomNumber,
          roomTypeName: roomType.name
        },
        priceSnapshot,
        checkinDate: checkin.toISOString(),
        checkoutDate: checkout.toISOString(),
        numberOfGuests
      }
    });

  } catch (error) {
    console.error('Error creating booking intent:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking intent data',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating booking intent'
    });
  }
};

// ============================================
// 3. CONFIRM BOOKING (Final Confirmation)
// ============================================
export const confirmBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { bookingIntentId, guestInfo, paymentInfo } = confirmBookingSchema.parse(req.body);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify booking intent is valid and not expired
      const bookingIntent = await tx.bookingIntent.findUnique({
        where: { 
          id: bookingIntentId,
          status: BookingIntentStatus.ACTIVE
        },
        include: {
          roomType: true,
          room: true
        }
      });

      if (!bookingIntent) {
        throw new Error('Invalid or expired booking intent');
      }

      if (new Date() > bookingIntent.expiresAt) {
        // Mark as expired
        await tx.bookingIntent.update({
          where: { id: bookingIntentId },
          data: { status: BookingIntentStatus.EXPIRED }
        });
        throw new Error('Booking intent has expired');
      }

      // 2. Verify payment amount matches
      const expectedAmount = (bookingIntent.priceSnapshot as any).totalPrice;
      if (Math.abs(paymentInfo.amount - expectedAmount) > 0.01) {
        throw new Error('Payment amount does not match expected price');
      }

      // 3. Create or find guest
      let guest = await tx.guest.findFirst({
        where: { email: guestInfo.email }
      });

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            firstName: guestInfo.firstName,
            lastName: guestInfo.lastName,
            email: guestInfo.email,
            phoneNumber: guestInfo.phoneNumber,
            country: guestInfo.country,
            notes: guestInfo.specialRequests || null
          }
        });
      }

      // 4. Generate booking reference
      const bookingReference = await generateBookingReference(tx);

      // 5. Create booking
      const booking = await tx.booking.create({
        data: {
          bookingReferenceId: bookingReference,
          guestId: guest.id,
          roomId: bookingIntent.roomId,
          roomTypeId: bookingIntent.roomTypeId,
          checkinDate: bookingIntent.checkinDate,
          checkoutDate: bookingIntent.checkoutDate,
          numAdults: bookingIntent.numberOfGuests,
          numChildren: 0, // TODO: Split adults/children
          totalPrice: expectedAmount,
          finalAmount: expectedAmount,
          status: BookingStatus.Confirmed,
          specialRequests: guestInfo.specialRequests || null,
          createdAt: new Date()
        }
      });

      // 6. Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: paymentInfo.amount,
          paymentMethodId: paymentInfo.paymentMethodId,
          transactionToken: paymentInfo.transactionToken,
          status: PaymentStatus.COMPLETED,
          processedAt: new Date()
        }
      });

      // 7. Update room inventory/daily rates
      await updateRoomInventory(tx, bookingIntent.roomId, bookingIntent.checkinDate, bookingIntent.checkoutDate);

      // 8. Mark booking intent as completed
      await tx.bookingIntent.update({
        where: { id: bookingIntentId },
        data: { status: BookingIntentStatus.COMPLETED }
      });

      return {
        booking,
        guest,
        payment,
        roomType: bookingIntent.roomType,
        room: bookingIntent.room
      };
    });

    // 9. Send confirmation email (outside transaction)
    try {
      // Use refactored email service
      await sendBookingConfirmationEmailDirect(result.booking, result.guest, result.roomType);
      console.log('✅ Confirmation email sent using refactored email service');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
      
      // Fallback (for legacy compatibility)
      try {
        await sendBookingConfirmationEmailDirect(result.booking, result.guest, result.roomType);
        console.log('✅ Confirmation email sent using MailerSend template');
      } catch (fallbackError) {
        console.error('❌ Failed to send confirmation email with both methods:', fallbackError);
        // Don't fail the booking if email fails
      }
    }

    // 10. Send admin notification about new booking
    try {
      await BusinessNotificationService.notifyNewBooking({
        bookingId: result.booking.bookingReferenceId,
        roomNumber: result.room.roomNumber,
        roomTypeName: result.roomType.name,
        guestName: `${result.guest.firstName} ${result.guest.lastName}`,
        checkinDate: result.booking.checkinDate?.toISOString().split('T')[0] || 'N/A',
        checkoutDate: result.booking.checkoutDate?.toISOString().split('T')[0] || 'N/A',
        totalPrice: Number(result.booking.totalPrice),
        status: result.booking.status
      });
      console.log('✅ Admin notification sent for new booking');
    } catch (notificationError) {
      console.error('❌ Failed to send admin notification:', notificationError);
      // Don't fail the booking if notification fails
    }

    return res.json({
      success: true,
      data: {
        bookingId: result.booking.id,
        bookingReference: result.booking.bookingReferenceId,
        status: result.booking.status,
        guest: {
          firstName: result.guest.firstName,
          lastName: result.guest.lastName,
          email: result.guest.email
        },
        room: {
          roomNumber: result.room.roomNumber,
          roomType: result.roomType.name
        },
        dates: {
          checkinDate: result.booking.checkinDate.toISOString(),
          checkoutDate: result.booking.checkoutDate.toISOString()
        },
        totalPrice: result.booking.totalPrice,
        paymentStatus: result.payment.status,
        confirmationEmailSent: true
      }
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking confirmation data',
        errors: error.errors
      });
    }
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
      if ((error as any).message.includes('expired') || (error as any).message.includes('Invalid')) {
        return res.status(409).json({
          success: false,
          message: (error as any).message
        });
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error while confirming booking'
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

interface RoomAvailability {
  isAvailable: boolean;
  availableRooms: any[];
  pricing: any;
  totalPrice: number;
  priceBreakdown: any[];
  restrictions: any;
}

async function calculateRoomTypeAvailability(
  roomType: any,
  checkinDate: Date,
  checkoutDate: Date,
  numberOfGuests: number
): Promise<RoomAvailability> {
  
  // Check capacity
  if (numberOfGuests > roomType.capacityAdults + roomType.capacityChildren) {
    return {
      isAvailable: false,
      availableRooms: [],
      pricing: null,
      totalPrice: 0,
      priceBreakdown: [],
      restrictions: {}
    };
  }

  // Find available rooms
  const availableRooms = await findAvailableRooms(roomType.id, checkinDate, checkoutDate);
  
  if (availableRooms.length === 0) {
    return {
      isAvailable: false,
      availableRooms: [],
      pricing: null,
      totalPrice: 0,
      priceBreakdown: [],
      restrictions: {}
    };
  }

  // Calculate pricing using dynamic pricing engine
  try {
    const pricingCalculation = await calculateDynamicPricing(roomType.id, checkinDate, checkoutDate, numberOfGuests);
    
    return {
      isAvailable: true,
      availableRooms,
      pricing: pricingCalculation.pricing,
      totalPrice: pricingCalculation.totalPrice,
      priceBreakdown: pricingCalculation.priceBreakdown,
      restrictions: pricingCalculation.restrictions || {}
    };
  } catch (pricingError) {
    console.error('Pricing calculation failed:', pricingError);
    // Fallback to base pricing
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = roomType.baseRate * nights;
    
    return {
      isAvailable: true,
      availableRooms,
      pricing: { baseRate: roomType.baseRate },
      totalPrice,
      priceBreakdown: [],
      restrictions: {}
    };
  }
}

async function findAvailableRooms(roomTypeId: string, checkinDate: Date, checkoutDate: Date) {
  // Find rooms of this type that are not booked for the date range
  const bookedRooms = await prisma.booking.findMany({
    where: {
      roomTypeId,
      status: {
        in: [BookingStatus.Confirmed, BookingStatus.InHouse]
      },
      OR: [
        {
          AND: [
            { checkinDate: { lt: checkoutDate } },
            { checkoutDate: { gt: checkinDate } }
          ]
        }
      ]
    },
    select: { roomId: true }
  });

  const bookedRoomIds = bookedRooms.map(b => b.roomId);

  const availableRooms = await prisma.room.findMany({
    where: {
      roomTypeId,
  status: RoomStatus.Available,
      id: {
        notIn: bookedRoomIds
      }
    }
  });

  return availableRooms;
}

async function calculateDynamicPricing(roomTypeId: string, checkinDate: Date, checkoutDate: Date, numberOfGuests: number) {
  // This would integrate with the existing dynamic pricing controller
  // For now, we'll use a simplified version
  const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  // Ensure baseRate is number
  const baseRate = typeof roomType?.baseRate === 'object' ? Number(roomType.baseRate) : (roomType?.baseRate || 1000);
  const totalPrice = baseRate * nights;
  const priceBreakdown = [];
  for (let i = 0; i < nights; i++) {
    const date = new Date(checkinDate);
    date.setDate(date.getDate() + i);
    priceBreakdown.push({
      date: date.toISOString().split('T')[0],
      baseRate,
      appliedRules: [],
      finalRate: baseRate
    });
  }
  return {
    pricing: { baseRate },
    totalPrice,
    priceBreakdown,
    restrictions: {}
  };
}

async function generateBookingReference(tx: any): Promise<string> {
  const prefix = 'B';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
}

async function updateRoomInventory(tx: any, roomId: string, checkinDate: Date, checkoutDate: Date) {
  // Update daily room rates or inventory table
  // This is a simplified version
  console.log(`Updating inventory for room ${roomId} from ${checkinDate.toISOString()} to ${checkoutDate.toISOString()}`);
  // TODO: Implement actual inventory update logic
}

async function sendBookingConfirmationEmail(booking: any, guest: any, roomType: any) {
  // This will be implemented with the email service
  console.log(`Sending confirmation email to ${guest.email} for booking ${booking.bookingReferenceId}`);
  // TODO: Implement with MailerSend integration
}
