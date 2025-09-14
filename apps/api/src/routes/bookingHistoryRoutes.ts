import express from 'express';
import { Request, Response } from 'express';
import BookingHistoryService, { 
  BookingHistoryFilters, 
  PaginationOptions 
} from '../services/bookingHistoryService';
import { requireAdmin, requireStaff } from '../middleware/enhancedAuth';

const router = express.Router();

// ============================================
// TYPES & INTERFACES
// ============================================

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: string;
  };
}

// Permission helper function
function getBookingHistoryPermissions(userType: string): string[] {
  const permissionMap: { [key: string]: string[] } = {
    'ADMIN': [
      'view_history',
      'manage_archive', 
      'view_analytics',
      'export_data',
      'restore_bookings',
      'bulk_operations',
      'system_settings'
    ],
    'DEV': [
      'view_history',
      'manage_archive',
      'view_analytics', 
      'export_data',
      'restore_bookings',
      'bulk_operations',
      'system_settings',
      'debug_operations'
    ],
    'MANAGER': [
      'view_history',
      'view_analytics',
      'export_data'
    ],
    'STAFF': [
      'view_history'
    ]
  };

  return permissionMap[userType] || [];
}

// Permission checker middleware
function requirePermission(action: string) {
  return (req: AuthenticatedRequest, res: Response, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const permissions = getBookingHistoryPermissions(req.user.userType);
    
    if (!permissions.includes(action)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Action '${action}' requires appropriate role`,
        required_action: action,
        user_type: req.user.userType,
        available_permissions: permissions
      });
    }

    next();
  };
}

// ============================================
// MIDDLEWARE - All routes require authentication
// ============================================
// Note: Authentication is handled by validateApiKey middleware in app.ts

// ============================================
// HEALTH & INFO ENDPOINTS (Must come before /:id route!)
// ============================================

/**
 * GET /health
 * Health check for booking history system
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Simple health check without database query
    res.json({
      success: true,
      message: 'Booking History System is operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: 'healthy'
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Booking History System is experiencing issues',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /permissions
 * Get current user's permissions for booking history system
 */
router.get('/permissions', async (req: AuthenticatedRequest, res: Response) => {
  const permissions = getBookingHistoryPermissions(req.user!.userType);
  
  res.json({
    success: true,
    data: {
      user_type: req.user!.userType,
      permissions: permissions,
      available_actions: permissions.map(p => ({
        action: p,
        description: getPermissionDescription(p)
      }))
    }
  });
});

// Helper function for permission descriptions
function getPermissionDescription(permission: string): string {
  const descriptions: { [key: string]: string } = {
    'view_history': 'View booking history records',
    'manage_archive': 'Archive and restore bookings',
    'view_analytics': 'View booking analytics and statistics',
    'export_data': 'Export booking data to CSV/Excel',
    'restore_bookings': 'Restore archived bookings',
    'bulk_operations': 'Perform bulk operations on bookings',
    'system_settings': 'Manage booking history system settings',
    'debug_operations': 'Access debug and development tools'
  };
  return descriptions[permission] || permission;
}

// ============================================
// QUERY & RETRIEVAL ENDPOINTS
// ============================================

/**
 * GET /history
 * Get booking history with filters and pagination
 * Required Permission: view_history
 */
router.get('/', requirePermission('view_history'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters: BookingHistoryFilters = {};
    const pagination: PaginationOptions = {};

    // Extract filters from query params
    if (req.query.guest_name) filters.guest_name = req.query.guest_name as string;
    if (req.query.guest_email) filters.guest_email = req.query.guest_email as string;
    if (req.query.booking_reference) filters.booking_reference = req.query.booking_reference as string;
    if (req.query.booking_status) filters.booking_status = req.query.booking_status as string;
    if (req.query.archive_reason) filters.archive_reason = req.query.archive_reason as string;
    if (req.query.room_type) filters.room_type = req.query.room_type as string;
    if (req.query.room_number) filters.room_number = req.query.room_number as string;
    if (req.query.source) filters.source = req.query.source as string;

    // Date filters
    if (req.query.check_in_date_from) {
      filters.check_in_date_from = new Date(req.query.check_in_date_from as string);
    }
    if (req.query.check_in_date_to) {
      filters.check_in_date_to = new Date(req.query.check_in_date_to as string);
    }
    if (req.query.check_out_date_from) {
      filters.check_out_date_from = new Date(req.query.check_out_date_from as string);
    }
    if (req.query.check_out_date_to) {
      filters.check_out_date_to = new Date(req.query.check_out_date_to as string);
    }
    if (req.query.archived_date_from) {
      filters.archived_date_from = new Date(req.query.archived_date_from as string);
    }
    if (req.query.archived_date_to) {
      filters.archived_date_to = new Date(req.query.archived_date_to as string);
    }

    // Amount filters
    if (req.query.min_amount) {
      filters.min_amount = parseFloat(req.query.min_amount as string);
    }
    if (req.query.max_amount) {
      filters.max_amount = parseFloat(req.query.max_amount as string);
    }

    // Pagination
    if (req.query.page) pagination.page = parseInt(req.query.page as string);
    if (req.query.limit) pagination.limit = parseInt(req.query.limit as string);
    if (req.query.sort_by) pagination.sort_by = req.query.sort_by as string;
    if (req.query.sort_order) pagination.sort_order = req.query.sort_order as 'asc' | 'desc';

    const result = await BookingHistoryService.getHistory(filters, pagination);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters_applied: filters
    });

  } catch (error) {
    console.error('Error in GET /history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve booking history',
      message: error.message
    });
  }
});

/**
 * GET /history/:id
 * Get specific booking history record by ID
 * Required Permission: view_history
 */
router.get('/:id', requirePermission('view_history'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id; // Keep as string for UUID
    
    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking history ID'
      });
    }

    const record = await BookingHistoryService.getHistoryById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Booking history record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('Error in GET /history/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve booking history record',
      message: error.message
    });
  }
});

// ============================================
// ARCHIVE MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /archive/candidates
 * Get bookings that are candidates for archiving
 * Required Permission: manage_archive
 */
router.get('/archive/candidates', requirePermission('manage_archive'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ruleId = req.query.rule_id ? parseInt(req.query.rule_id as string) : undefined;
    
    const candidates = await BookingHistoryService.getArchiveCandidates(ruleId);

    res.json({
      success: true,
      data: candidates,
      count: candidates.length
    });

  } catch (error) {
    console.error('Error in GET /archive/candidates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get archive candidates',
      message: error.message
    });
  }
});

/**
 * POST /archive/single
 * Archive a single booking
 * Required Permission: manage_archive
 */
router.post('/archive/single', requirePermission('manage_archive'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { booking_id, archive_reason, notes } = req.body;

    if (!booking_id || !archive_reason) {
      return res.status(400).json({
        success: false,
        error: 'booking_id and archive_reason are required'
      });
    }

    const result = await BookingHistoryService.archiveBooking(
      booking_id,
      archive_reason,
      parseInt(req.user!.userId),
      notes
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Booking archived successfully',
        history_id: result.historyId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to archive booking'
      });
    }

  } catch (error) {
    console.error('Error in POST /archive/single:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive booking',
      message: error.message
    });
  }
});

/**
 * POST /archive/bulk
 * Archive multiple bookings at once
 * Required Permission: manage_archive
 */
router.post('/archive/bulk', requirePermission('manage_archive'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { booking_ids, archive_reason, notes } = req.body;

    if (!booking_ids || !Array.isArray(booking_ids) || booking_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'booking_ids must be a non-empty array'
      });
    }

    if (!archive_reason) {
      return res.status(400).json({
        success: false,
        error: 'archive_reason is required'
      });
    }

    if (booking_ids.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Cannot archive more than 100 bookings at once'
      });
    }

    const result = await BookingHistoryService.bulkArchive(
      booking_ids,
      archive_reason,
      parseInt(req.user!.userId),
      notes
    );

    res.json({
      success: result.success,
      message: `Bulk archive completed: ${result.archived_count} success, ${result.failed_count} failed`,
      data: {
        archived_count: result.archived_count,
        failed_count: result.failed_count,
        errors: result.errors,
        processing_time_ms: result.processing_time_ms
      }
    });

  } catch (error) {
    console.error('Error in POST /archive/bulk:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk archive',
      message: error.message
    });
  }
});

// ============================================
// ANALYTICS & REPORTING ENDPOINTS
// ============================================

/**
 * GET /analytics/statistics
 * Get archive statistics and trends
 * Required Permission: view_analytics
 */
router.get('/analytics/statistics', requirePermission('view_analytics'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (req.query.start_date) {
      startDate = new Date(req.query.start_date as string);
    }
    if (req.query.end_date) {
      endDate = new Date(req.query.end_date as string);
    }

    const statistics = await BookingHistoryService.getArchiveStatistics(startDate, endDate);

    res.json({
      success: true,
      data: statistics,
      period: {
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error in GET /analytics/statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get archive statistics',
      message: error.message
    });
  }
});

// ============================================
// EXPORT ENDPOINTS
// ============================================

/**
 * GET /export/csv
 * Export booking history to CSV
 * Required Permission: export_data
 */
router.get('/export/csv', requirePermission('export_data'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters: BookingHistoryFilters = {};

    // Extract filters (same as main history endpoint)
    if (req.query.guest_name) filters.guest_name = req.query.guest_name as string;
    if (req.query.guest_email) filters.guest_email = req.query.guest_email as string;
    if (req.query.booking_reference) filters.booking_reference = req.query.booking_reference as string;
    if (req.query.booking_status) filters.booking_status = req.query.booking_status as string;
    if (req.query.archive_reason) filters.archive_reason = req.query.archive_reason as string;
    if (req.query.room_type) filters.room_type = req.query.room_type as string;
    if (req.query.room_number) filters.room_number = req.query.room_number as string;
    if (req.query.source) filters.source = req.query.source as string;

    // Date filters
    if (req.query.check_in_date_from) {
      filters.check_in_date_from = new Date(req.query.check_in_date_from as string);
    }
    if (req.query.check_in_date_to) {
      filters.check_in_date_to = new Date(req.query.check_in_date_to as string);
    }
    if (req.query.archived_date_from) {
      filters.archived_date_from = new Date(req.query.archived_date_from as string);
    }
    if (req.query.archived_date_to) {
      filters.archived_date_to = new Date(req.query.archived_date_to as string);
    }

    // Amount filters
    if (req.query.min_amount) {
      filters.min_amount = parseFloat(req.query.min_amount as string);
    }
    if (req.query.max_amount) {
      filters.max_amount = parseFloat(req.query.max_amount as string);
    }

    const csvContent = await BookingHistoryService.exportToCSV(filters, parseInt(req.user!.userId));

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `booking_history_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(csvContent);

  } catch (error) {
    console.error('Error in GET /export/csv:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export booking history',
      message: error.message
    });
  }
});

export default router;