// ============================================
// ARCHIVE CONFIGURATION CONTROLLER
// ============================================

import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

/**
 * Get all archive configurations
 */
export const getArchiveConfigs = async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching archive configurations...');
    
    const configs = await prisma.archiveConfig.findMany({
      include: {
        createdByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { status: 'asc' }
      ]
    });

    console.log(`📊 Found ${configs.length} archive configurations`);

    res.json({
      success: true,
      message: 'Archive configurations retrieved successfully',
      data: {
        configs: configs,
        total: configs.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching archive configurations:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch archive configurations',
        code: 'ARCHIVE_CONFIG_FETCH_ERROR'
      }
    });
  }
};

/**
 * Create or update archive configuration
 */
export const upsertArchiveConfig = async (req: Request, res: Response) => {
  try {
    const { status, hideFromActiveList, archiveAfterDays, autoArchiveEnabled, description } = req.body;
    const userId = (req as any).user?.userId || 'system';

    console.log('🔧 Upserting archive config for status:', status);

    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status is required',
          code: 'MISSING_STATUS'
        }
      });
    }

    // Validate status values
    const validStatuses = ['Cancelled', 'CheckedOut', 'NoShow', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        }
      });
    }

    const configData = {
      status,
      hideFromActiveList: hideFromActiveList !== undefined ? hideFromActiveList : true,
      archiveAfterDays: archiveAfterDays !== undefined ? archiveAfterDays : 7,
      autoArchiveEnabled: autoArchiveEnabled !== undefined ? autoArchiveEnabled : false,
      description: description || `Auto-generated config for ${status} bookings`,
      createdBy: userId
    };

    // Upsert configuration
    const config = await prisma.archiveConfig.upsert({
      where: { status },
      update: {
        ...configData,
        updatedAt: new Date()
      },
      create: configData,
      include: {
        createdByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('✅ Archive config upserted successfully:', config.id);

    res.json({
      success: true,
      message: `Archive configuration for ${status} bookings updated successfully`,
      data: { config }
    });

  } catch (error) {
    console.error('❌ Error upserting archive configuration:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update archive configuration',
        code: 'ARCHIVE_CONFIG_UPSERT_ERROR'
      }
    });
  }
};

/**
 * Delete archive configuration
 */
export const deleteArchiveConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting archive config:', id);

    const config = await prisma.archiveConfig.findUnique({
      where: { id }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Archive configuration not found',
          code: 'CONFIG_NOT_FOUND'
        }
      });
    }

    await prisma.archiveConfig.delete({
      where: { id }
    });

    console.log('✅ Archive config deleted successfully');

    res.json({
      success: true,
      message: 'Archive configuration deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting archive configuration:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete archive configuration',
        code: 'ARCHIVE_CONFIG_DELETE_ERROR'
      }
    });
  }
};

/**
 * Initialize default archive configurations
 */
export const initializeDefaultConfigs = async (req: Request, res: Response) => {
  try {
    console.log('🔧 Initializing default archive configurations...');

    const defaultConfigs = [
      {
        status: 'Cancelled',
        hideFromActiveList: true,
        archiveAfterDays: 7,
        autoArchiveEnabled: false,
        description: 'Hide cancelled bookings immediately, archive after 7 days'
      },
      {
        status: 'NoShow',
        hideFromActiveList: true,
        archiveAfterDays: 3,
        autoArchiveEnabled: false,
        description: 'Hide no-show bookings immediately, archive after 3 days'
      },
      {
        status: 'CheckedOut',
        hideFromActiveList: false,
        archiveAfterDays: 2,
        autoArchiveEnabled: false,
        description: 'Keep checked-out bookings visible for 2 days for settlement'
      },
      {
        status: 'Completed',
        hideFromActiveList: true,
        archiveAfterDays: 1,
        autoArchiveEnabled: false,
        description: 'Archive completed bookings after 1 day'
      }
    ];

    const results = [];

    // Get system user or first available user
    const systemUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'system@hotel.com' },
          { userType: 'ADMIN' },
          { isActive: true }
        ]
      }
    });

    if (!systemUser) {
      throw new Error('No valid user found to create archive configs');
    }

    for (const configData of defaultConfigs) {
      const config = await prisma.archiveConfig.upsert({
        where: { status: configData.status },
        update: {}, // Don't update if exists
        create: {
          ...configData,
          createdBy: systemUser.id
        }
      });
      results.push(config);
    }

    console.log('✅ Default archive configurations initialized');

    res.json({
      success: true,
      message: 'Default archive configurations initialized successfully',
      data: {
        configs: results,
        total: results.length
      }
    });

  } catch (error) {
    console.error('❌ Error initializing default configs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to initialize default configurations',
        code: 'ARCHIVE_CONFIG_INIT_ERROR'
      }
    });
  }
};