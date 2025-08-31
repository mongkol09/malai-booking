import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

/**
 * Get all bookings for admin (from real database)
 */
export const getAllBookingsAdmin = async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching all bookings from database for admin...');
    
    // Get all bookings with related data
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: true,
        roomType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${bookings.length} bookings in database`);

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingReferenceId: booking.bookingReferenceId,
      customerName: `${booking.guest.firstName} ${booking.guest.lastName}`,
      customerEmail: booking.guest.email,
      customerPhone: booking.guest.phoneNumber,
      roomId: booking.room.roomNumber,
      roomType: booking.roomType.name,
      checkInDate: booking.checkinDate.toISOString().split('T')[0],
      checkOutDate: booking.checkoutDate.toISOString().split('T')[0],
      status: booking.status.toLowerCase(),
      totalAmount: Number(booking.totalPrice),
      paidAmount: Number(booking.finalAmount),
      specialRequests: booking.specialRequests,
      source: booking.source,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }));

    res.json({
      success: true,
      message: 'All bookings retrieved successfully',
      data: {
        bookings: formattedBookings,
        total: formattedBookings.length,
        sessionUser: (req as any).user?.email,
        sessionId: (req as any).user?.sessionId
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin bookings:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch bookings',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Get booking statistics for admin dashboard
 */
export const getBookingStatsAdmin = async (req: Request, res: Response) => {
  try {
    console.log('📊 Fetching booking statistics for admin...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get various statistics  
    const [
      totalBookings,
      confirmedBookings,
      todaysCheckIns,
      todaysCheckOuts,
      occupiedRooms
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'Confirmed' } }),
      prisma.booking.count({ 
        where: { 
          checkinDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.booking.count({ 
        where: { 
          checkoutDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.room.count({ where: { status: 'Occupied' } })
    ]);

    // Calculate total revenue
    const revenueResult = await prisma.booking.aggregate({
      _sum: {
        finalAmount: true
      },
      where: {
        status: 'Confirmed'
      }
    });

    const totalRevenue = Number(revenueResult._sum.finalAmount || 0);

    res.json({
      success: true,
      message: 'Booking statistics retrieved successfully',
      data: {
        totalBookings,
        confirmedBookings,
        pendingBookings: 0, // Will be calculated separately if needed
        cancelledBookings: 0, // Will be calculated separately if needed
        todaysCheckIns,
        todaysCheckOuts,
        occupiedRooms,
        totalRevenue,
        occupancyRate: Math.round((occupiedRooms / Math.max(1, totalBookings)) * 100),
        sessionUser: (req as any).user?.email,
        sessionId: (req as any).user?.sessionId,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error fetching booking statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch booking statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};
