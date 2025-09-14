const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================
// OPTIMIZED BOOKING SERVICE WITH ARCHIVE
// ============================================

class OptimizedBookingService {
  
  // 🏎️ เร็ว: ดึง Active Bookings (ไม่ใช้ joins)
  static async getActiveBookings(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // WHERE conditions
    const where = {
      isArchived: false,
      ...filters
    };

    // ใช้ derived fields แทน joins
    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        bookingReferenceId: true,
        guestName: true,          // Fast!
        guestEmail: true,         // Fast!
        roomNumber: true,         // Fast!
        roomTypeName: true,       // Fast!
        stayNights: true,         // Fast!
        status: true,
        checkinDate: true,
        checkoutDate: true,
        finalAmount: true,
        isArchived: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.booking.count({ where });

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // 📦 Archive Booking (Auto-archive เมื่อ cancel)
  static async archiveBooking(bookingId, reason = 'AUTO_CANCELLED', userId = null) {
    try {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: reason,
          archivedBy: userId
        }
      });

      console.log(`📦 Auto-archived: ${booking.bookingReferenceId} (${reason})`);
      return booking;
    } catch (error) {
      console.error('❌ Archive failed:', error);
      throw error;
    }
  }

  // 🔄 Restore Booking
  static async restoreBooking(bookingId) {
    try {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          isArchived: false,
          archivedAt: null,
          archivedReason: null,
          archivedBy: null
        }
      });

      console.log(`🔄 Restored: ${booking.bookingReferenceId}`);
      return booking;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  // 📊 Dashboard Stats (เร็ว)
  static async getDashboardStats() {
    const [activeStats, archivedCount] = await Promise.all([
      prisma.booking.groupBy({
        by: ['status'],
        where: { isArchived: false },
        _count: { id: true }
      }),
      prisma.booking.count({ where: { isArchived: true } })
    ]);

    return {
      active: activeStats,
      archived: archivedCount
    };
  }

  // 🔍 Fast Search (ใช้ derived fields)
  static async searchBookings(searchTerm, archived = false) {
    const where = {
      isArchived: archived,
      OR: [
        { bookingReferenceId: { contains: searchTerm, mode: 'insensitive' } },
        { guestName: { contains: searchTerm, mode: 'insensitive' } },
        { guestEmail: { contains: searchTerm, mode: 'insensitive' } },
        { roomNumber: { contains: searchTerm, mode: 'insensitive' } }
      ]
    };

    return await prisma.booking.findMany({
      where,
      select: {
        id: true,
        bookingReferenceId: true,
        guestName: true,
        guestEmail: true,
        roomNumber: true,
        status: true,
        checkinDate: true,
        isArchived: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  // 🏠 ดูประวัติ Booking History
  static async getBookingHistory(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      isArchived: true,
      ...filters
    };

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        bookingReferenceId: true,
        guestName: true,
        guestEmail: true,
        roomNumber: true,
        roomTypeName: true,
        status: true,
        checkinDate: true,
        checkoutDate: true,
        finalAmount: true,
        archivedAt: true,
        archivedReason: true,
        createdAt: true
      },
      orderBy: { archivedAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.booking.count({ where });

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // 🚨 Auto-archive Old Cancelled Bookings
  static async autoArchiveOldCancelled(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.booking.updateMany({
      where: {
        status: 'Cancelled',
        isArchived: false,
        createdAt: { lt: cutoffDate }
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: `AUTO_ARCHIVED_OLD_CANCELLED_${daysOld}D`
      }
    });

    console.log(`🗄️ Auto-archived ${result.count} old cancelled bookings`);
    return result;
  }
}

module.exports = OptimizedBookingService;

// ============================================
// DEMO การใช้งาน
// ============================================

async function demo() {
  try {
    console.log('🚀 Demo Optimized Booking Service\n');

    // 1. ดึง Active Bookings (เร็ว)
    console.log('1. 🏎️ Active Bookings (Fast Query):');
    const activeBookings = await OptimizedBookingService.getActiveBookings();
    console.log(`   📊 พบ: ${activeBookings.data.length} รายการ`);
    
    for (const booking of activeBookings.data.slice(0, 2)) {
      console.log(`   📋 ${booking.bookingReferenceId}: ${booking.guestName} -> ${booking.roomNumber}`);
    }

    // 2. Search แบบเร็ว
    console.log('\n2. 🔍 Fast Search:');
    const searchResults = await OptimizedBookingService.searchBookings('BK24957122');
    console.log(`   🎯 ค้นหา "BK24957122": ${searchResults.length} ผลลัพธ์`);

    // 3. Dashboard Stats
    console.log('\n3. 📊 Dashboard Stats:');
    const stats = await OptimizedBookingService.getDashboardStats();
    console.log(`   🟢 Active: ${JSON.stringify(stats.active)}`);
    console.log(`   📦 Archived: ${stats.archived} รายการ`);

    // 4. Booking History
    console.log('\n4. 🏠 Booking History:');
    const history = await OptimizedBookingService.getBookingHistory();
    console.log(`   📚 History: ${history.data.length} รายการ`);

    console.log('\n🎉 Demo เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ Demo error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันเฉพาะเมื่อเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  demo();
}