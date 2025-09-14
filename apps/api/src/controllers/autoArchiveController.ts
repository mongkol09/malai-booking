// ============================================
// AUTO-ARCHIVE CONTROLLER
// ============================================

import { Request, Response } from 'express';
import AutoArchiveService from '../services/AutoArchiveService';

const autoArchiveService = new AutoArchiveService();

/**
 * Get archive statistics
 */
export const getArchiveStats = async (req: Request, res: Response) => {
  try {
    console.log('📊 Fetching archive statistics...');
    
    const stats = await autoArchiveService.getArchiveStats();

    res.json({
      success: true,
      message: 'Archive statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching archive stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch archive statistics',
        code: 'ARCHIVE_STATS_ERROR'
      }
    });
  }
};

/**
 * Run auto-archive manually
 */
export const runAutoArchive = async (req: Request, res: Response) => {
  try {
    console.log('🚀 Manual auto-archive triggered...');
    
    await autoArchiveService.runAutoArchive();

    res.json({
      success: true,
      message: 'Auto-archive completed successfully',
      data: {
        runTime: new Date(),
        type: 'manual'
      }
    });

  } catch (error) {
    console.error('❌ Error running auto-archive:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to run auto-archive',
        code: 'AUTO_ARCHIVE_ERROR'
      }
    });
  }
};

/**
 * Archive specific booking manually
 */
export const manualArchiveBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.userId || 'unknown';

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID'
        }
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Reason is required',
          code: 'MISSING_REASON'
        }
      });
    }

    console.log(`📁 Manual archive request for booking: ${bookingId} by user: ${userId}`);
    
    const result = await autoArchiveService.manualArchive(bookingId, reason, userId);

    res.json({
      success: true,
      message: 'Booking archived successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error archiving booking:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to archive booking',
        code: 'MANUAL_ARCHIVE_ERROR'
      }
    });
  }
};

/**
 * Restore archived booking
 */
export const restoreArchivedBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.userId || 'unknown';

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID'
        }
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Reason is required',
          code: 'MISSING_REASON'
        }
      });
    }

    console.log(`🔄 Restore archive request for booking: ${bookingId} by user: ${userId}`);
    
    const result = await autoArchiveService.restoreArchive(bookingId, reason, userId);

    res.json({
      success: true,
      message: 'Booking restored successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error restoring booking:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to restore booking',
        code: 'RESTORE_ARCHIVE_ERROR'
      }
    });
  }
};

/**
 * Start auto-archive service
 */
export const startAutoArchiveService = async (req: Request, res: Response) => {
  try {
    console.log('▶️ Starting auto-archive service...');
    
    autoArchiveService.start();

    res.json({
      success: true,
      message: 'Auto-archive service started successfully',
      data: {
        status: 'running',
        schedule: 'Daily at 2:00 AM (Bangkok time)',
        startTime: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error starting auto-archive service:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to start auto-archive service',
        code: 'SERVICE_START_ERROR'
      }
    });
  }
};

/**
 * Stop auto-archive service
 */
export const stopAutoArchiveService = async (req: Request, res: Response) => {
  try {
    console.log('⏹️ Stopping auto-archive service...');
    
    autoArchiveService.stop();

    res.json({
      success: true,
      message: 'Auto-archive service stopped successfully',
      data: {
        status: 'stopped',
        stopTime: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error stopping auto-archive service:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to stop auto-archive service',
        code: 'SERVICE_STOP_ERROR'
      }
    });
  }
};