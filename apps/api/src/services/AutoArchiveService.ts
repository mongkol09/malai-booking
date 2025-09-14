// ============================================
// AUTO-ARCHIVE SERVICE
// ============================================

import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

class AutoArchiveService {
  private isRunning = false;
  private cronJob: any = null;

  constructor() {
    console.log('🤖 Auto-Archive Service initialized');
  }

  /**
   * Start the auto-archive service with cron job
   */
  start() {
    if (this.cronJob) {
      console.log('⚠️  Auto-archive service already running');
      return;
    }

    // Run every day at 2:00 AM
    this.cronJob = cron.schedule('0 2 * * *', async () => {
      await this.runAutoArchive();
    }, {
      timezone: 'Asia/Bangkok'
    });

    console.log('✅ Auto-archive service started - runs daily at 2:00 AM (Bangkok time)');
  }

  /**
   * Stop the auto-archive service
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
      console.log('🛑 Auto-archive service stopped');
    }
  }

  /**
   * Run auto-archive process manually
   */
  async runAutoArchive() {
    if (this.isRunning) {
      console.log('⚠️  Auto-archive already running, skipping...');
      return;
    }

    try {
      this.isRunning = true;
      console.log('🚀 Starting auto-archive process...');

      // Get active archive configurations
      const configs = await prisma.archiveConfig.findMany({
        where: {
          isActive: true,
          autoArchiveEnabled: true
        }
      });

      if (configs.length === 0) {
        console.log('📋 No active auto-archive configurations found');
        return;
      }

      let totalProcessed = 0;
      let totalArchived = 0;

      // Process each configuration
      for (const config of configs) {
        const result = await this.processConfigArchive(config);
        totalProcessed += result.processed;
        totalArchived += result.archived;
      }

      console.log(`✅ Auto-archive completed: ${totalArchived}/${totalProcessed} bookings archived`);

      // Log the run
      await this.logArchiveRun(totalProcessed, totalArchived);

    } catch (error) {
      console.error('❌ Auto-archive failed:', error);
      await this.logArchiveError(error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process archive for a specific configuration
   */
  private async processConfigArchive(config: any) {
    try {
      console.log(`🔍 Processing config for status: ${config.status}`);

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.archiveAfterDays);

      // Find bookings that match the criteria
      const candidateBookings = await prisma.booking.findMany({
        where: {
          status: config.status,
          isArchived: false,
          updatedAt: {
            lte: cutoffDate
          }
        },
        include: {
          guest: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          room: {
            select: {
              roomNumber: true
            }
          }
        }
      });

      console.log(`   📊 Found ${candidateBookings.length} candidates for ${config.status}`);

      let archivedCount = 0;

      // Archive each booking
      for (const booking of candidateBookings) {
        try {
          // Update booking to archived
          await prisma.booking.update({
            where: { id: booking.id },
            data: { 
              isArchived: true,
              archivedAt: new Date()
            }
          });

          // Create archive log entry
          await prisma.archiveLog.create({
            data: {
              bookingId: booking.id,
              action: 'ARCHIVED',
              reason: `AUTO_ARCHIVE_${config.status}_${config.archiveAfterDays}DAYS`,
              performedBy: 'system',
              metadata: {
                configId: config.id,
                originalStatus: booking.status,
                archiveAfterDays: config.archiveAfterDays,
                guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
                roomNumber: booking.room?.roomNumber,
                bookingRef: booking.bookingReferenceId
              }
            }
          });

          archivedCount++;
          console.log(`   ✅ Archived booking: ${booking.bookingReferenceId} (${booking.guest.firstName} ${booking.guest.lastName})`);

        } catch (error) {
          console.error(`   ❌ Failed to archive booking ${booking.bookingReferenceId}:`, error);
        }
      }

      console.log(`   📁 Archived ${archivedCount}/${candidateBookings.length} bookings for ${config.status}`);

      return {
        processed: candidateBookings.length,
        archived: archivedCount
      };

    } catch (error) {
      console.error(`❌ Error processing config ${config.status}:`, error);
      return { processed: 0, archived: 0 };
    }
  }

  /**
   * Log successful archive run
   */
  private async logArchiveRun(processed: number, archived: number) {
    try {
      await prisma.archiveLog.create({
        data: {
          bookingId: null,
          action: 'AUTO_ARCHIVE_RUN',
          reason: 'SCHEDULED_AUTO_ARCHIVE',
          performedBy: 'system',
          metadata: {
            totalProcessed: processed,
            totalArchived: archived,
            runTime: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log archive run:', error);
    }
  }

  /**
   * Log archive error
   */
  private async logArchiveError(error: any) {
    try {
      await prisma.archiveLog.create({
        data: {
          bookingId: null,
          action: 'AUTO_ARCHIVE_ERROR',
          reason: 'SCHEDULED_AUTO_ARCHIVE_FAILED',
          performedBy: 'system',
          metadata: {
            error: error.message,
            stack: error.stack,
            runTime: new Date().toISOString()
          }
        }
      });
    } catch (logError) {
      console.error('Failed to log archive error:', logError);
    }
  }

  /**
   * Get archive statistics
   */
  async getArchiveStats() {
    try {
      const [totalBookings, archivedBookings, recentArchives, archiveConfigs] = await Promise.all([
        prisma.booking.count(),
        prisma.booking.count({ where: { isArchived: true } }),
        prisma.archiveLog.count({
          where: {
            action: 'ARCHIVED',
            performedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        }),
        prisma.archiveConfig.count({ where: { isActive: true, autoArchiveEnabled: true } })
      ]);

      return {
        totalBookings,
        archivedBookings,
        activeBookings: totalBookings - archivedBookings,
        recentArchives,
        activeConfigs: archiveConfigs,
        archivePercentage: totalBookings > 0 ? ((archivedBookings / totalBookings) * 100).toFixed(1) : '0'
      };
    } catch (error) {
      console.error('Error getting archive stats:', error);
      throw error;
    }
  }

  /**
   * Manual archive for specific booking
   */
  async manualArchive(bookingId: string, reason: string, userId: string) {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          guest: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          room: {
            select: {
              roomNumber: true
            }
          }
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.isArchived) {
        throw new Error('Booking is already archived');
      }

      // Archive the booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          isArchived: true,
          archivedAt: new Date()
        }
      });

      // Create archive log
      await prisma.archiveLog.create({
        data: {
          bookingId: booking.id,
          action: 'ARCHIVED',
          reason: `MANUAL_${reason}`,
          performedBy: userId,
          metadata: {
            originalStatus: booking.status,
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            roomNumber: booking.room?.roomNumber,
            bookingRef: booking.bookingReferenceId,
            manualReason: reason
          }
        }
      });

      console.log(`📁 Manually archived booking: ${booking.bookingReferenceId} by user: ${userId}`);
      
      return {
        success: true,
        booking: {
          id: booking.id,
          referenceId: booking.bookingReferenceId,
          guestName: `${booking.guest.firstName} ${booking.guest.lastName}`
        }
      };

    } catch (error) {
      console.error('Manual archive failed:', error);
      throw error;
    }
  }

  /**
   * Restore archived booking
   */
  async restoreArchive(bookingId: string, reason: string, userId: string) {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          guest: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (!booking.isArchived) {
        throw new Error('Booking is not archived');
      }

      // Restore the booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          isArchived: false,
          archivedAt: null
        }
      });

      // Create restore log
      await prisma.archiveLog.create({
        data: {
          bookingId: booking.id,
          action: 'RESTORED',
          reason: `MANUAL_${reason}`,
          performedBy: userId,
          metadata: {
            originalStatus: booking.status,
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            bookingRef: booking.bookingReferenceId,
            restoreReason: reason
          }
        }
      });

      console.log(`🔄 Restored archived booking: ${booking.bookingReferenceId} by user: ${userId}`);
      
      return {
        success: true,
        booking: {
          id: booking.id,
          referenceId: booking.bookingReferenceId,
          guestName: `${booking.guest.firstName} ${booking.guest.lastName}`
        }
      };

    } catch (error) {
      console.error('Archive restore failed:', error);
      throw error;
    }
  }
}

export default AutoArchiveService;