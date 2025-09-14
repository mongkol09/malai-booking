// ============================================
// ARCHIVE CONFIGURATION ROUTES
// ============================================

import express from 'express';
import { validateApiKey, requireRole } from '../middleware/validateApiKey';
import {
  getArchiveConfigs,
  upsertArchiveConfig,
  deleteArchiveConfig,
  initializeDefaultConfigs
} from '../controllers/archiveConfigController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(validateApiKey);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN', 'STAFF']));

// Get all archive configurations
router.get('/', getArchiveConfigs);

// Initialize default configurations (run once)
router.post('/initialize', initializeDefaultConfigs);

// Create or update archive configuration (upsert)
router.post('/', upsertArchiveConfig);
router.put('/:id', upsertArchiveConfig);

// Delete archive configuration
router.delete('/:id', deleteArchiveConfig);

export default router;