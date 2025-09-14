// ============================================
// ARCHIVE CONFIGURATION ROUTES
// ============================================

import express from 'express';
import {
  getArchiveConfigs,
  upsertArchiveConfig,
  deleteArchiveConfig,
  initializeDefaultConfigs
} from '../controllers/archiveConfigController';

const router = express.Router();

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