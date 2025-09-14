const { PrismaClient } = require('@prisma/client');
const OptimizedBookingService = require('./optimized-booking-service');

const prisma = new PrismaClient();

// ============================================
// ENHANCED BOOKING CANCELLATION WITH AUTO-ARCHIVE
// ============================================

class EnhancedBookingCancellationController {

  // 🚫 Cancel Booking พร้อม Auto-Archive
  static async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { reason, shouldArchive = true } = req.body;
      const userId = req.user?.id; // จาก auth middleware

      console.log(`🚫 Cancelling booking: ${bookingId}`);

      // 1. อัพเดต status เป็น Cancelled
      const cancelledBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'Cancelled',
          updatedAt: new Date()
        },
        include: {
          guest: true,
          room: {
            include: { roomType: true }
          }
        }
      });

      console.log(`✅ Status updated: ${cancelledBooking.bookingReferenceId}`);

      // 2. Auto-Archive ถ้าต้องการ
      if (shouldArchive) {
        await OptimizedBookingService.archiveBooking(
          bookingId, 
          reason || 'USER_CANCELLED',
          userId
        );
        console.log(`📦 Auto-archived: ${cancelledBooking.bookingReferenceId}`);
      }

      // 3. อัพเดต Room Status (ถ้าจำเป็น)
      await this.updateRoomStatusAfterCancellation(cancelledBooking);

      // 4. Response
      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: {
          bookingId: cancelledBooking.id,
          bookingReferenceId: cancelledBooking.bookingReferenceId,
          status: 'Cancelled',
          archived: shouldArchive,
          guestName: cancelledBooking.guest.firstName + ' ' + cancelledBooking.guest.lastName
        }
      });

    } catch (error) {
      console.error('❌ Cancellation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      });
    }
  }

  // 🔄 Restore Archived Booking
  static async restoreBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user?.id;

      console.log(`🔄 Restoring booking: ${bookingId}`);

      // 1. Restore จาก archive
      const restoredBooking = await OptimizedBookingService.restoreBooking(bookingId);

      // 2. อัพเดต status กลับเป็น Confirmed (หรือตาม business logic)
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'Confirmed', // หรือ status ที่เหมาะสม
          updatedAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Booking restored successfully',
        data: {
          bookingId: restoredBooking.id,
          bookingReferenceId: restoredBooking.bookingReferenceId,
          status: 'Restored'
        }
      });

    } catch (error) {
      console.error('❌ Restore error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to restore booking',
        error: error.message
      });
    }
  }

  // 📋 Get Active Bookings (Fast)
  static async getActiveBookings(req, res) {
    try {
      const { page = 1, limit = 20, status, search } = req.query;

      let filters = {};
      if (status) filters.status = status;

      // Fast search ถ้ามี search term
      if (search) {
        const searchResults = await OptimizedBookingService.searchBookings(search, false);
        return res.status(200).json({
          success: true,
          data: searchResults,
          isSearchResult: true
        });
      }

      // Normal pagination
      const result = await OptimizedBookingService.getActiveBookings(
        filters, 
        { page: parseInt(page), limit: parseInt(limit) }
      );

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Get active bookings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get active bookings',
        error: error.message
      });
    }
  }

  // 📚 Get Booking History (Archived)
  static async getBookingHistory(req, res) {
    try {
      const { page = 1, limit = 20, reason, search } = req.query;

      let filters = {};
      if (reason) filters.archivedReason = { contains: reason };

      // Search in archive
      if (search) {
        const searchResults = await OptimizedBookingService.searchBookings(search, true);
        return res.status(200).json({
          success: true,
          data: searchResults,
          isSearchResult: true
        });
      }

      const result = await OptimizedBookingService.getBookingHistory(
        filters,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Get booking history error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get booking history',
        error: error.message
      });
    }
  }

  // 📊 Dashboard Statistics
  static async getDashboardStats(req, res) {
    try {
      const stats = await OptimizedBookingService.getDashboardStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get dashboard stats',
        error: error.message
      });
    }
  }

  // 🏠 Helper: อัพเดต Room Status หลัง Cancellation
  static async updateRoomStatusAfterCancellation(booking) {
    try {
      // ตรวจสอบว่ามี booking อื่นในห้องนี้ในช่วงเดียวกันไหม
      const today = new Date();
      const overlappingBookings = await prisma.booking.count({
        where: {
          roomId: booking.roomId,
          id: { not: booking.id },
          status: { in: ['Confirmed', 'CheckedIn'] },
          isArchived: false,
          checkinDate: { lte: today },
          checkoutDate: { gte: today }
        }
      });

      // ถ้าไม่มี booking อื่น ให้เปลี่ยน status เป็น Available
      if (overlappingBookings === 0) {
        await prisma.room.update({
          where: { id: booking.roomId },
          data: { status: 'Available' }
        });
        console.log(`🏠 Room ${booking.room.roomNumber} set to Available`);
      }

    } catch (error) {
      console.error('❌ Room status update error:', error);
      // ไม่ throw error เพราะไม่อยากให้กระทบกับ main cancellation
    }
  }

  // 🗄️ Auto-Archive Old Cancelled Bookings (Cron Job)
  static async autoArchiveOldBookings(req, res) {
    try {
      const { daysOld = 30 } = req.query;
      
      const result = await OptimizedBookingService.autoArchiveOldCancelled(parseInt(daysOld));
      
      return res.status(200).json({
        success: true,
        message: `Auto-archived ${result.count} old cancelled bookings`,
        data: { count: result.count, daysOld }
      });

    } catch (error) {
      console.error('❌ Auto-archive error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to auto-archive old bookings',
        error: error.message
      });
    }
  }
}

module.exports = EnhancedBookingCancellationController;

// ============================================
// DEMO CONTROLLER
// ============================================

async function demoController() {
  try {
    console.log('🎮 Demo Enhanced Booking Controller\n');

    // Mock req, res objects
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`📤 Response ${code}:`, JSON.stringify(data, null, 2));
          return data;
        }
      })
    };

    // 1. Dashboard Stats
    console.log('1. 📊 Dashboard Stats:');
    await EnhancedBookingCancellationController.getDashboardStats({}, mockRes);

    // 2. Active Bookings
    console.log('\n2. 📋 Active Bookings:');
    await EnhancedBookingCancellationController.getActiveBookings(
      { query: { page: 1, limit: 5 } }, 
      mockRes
    );

    // 3. Booking History
    console.log('\n3. 📚 Booking History:');
    await EnhancedBookingCancellationController.getBookingHistory(
      { query: { page: 1, limit: 5 } }, 
      mockRes
    );

    console.log('\n🎉 Controller Demo เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ Controller demo error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันเฉพาะเมื่อเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  demoController();
}