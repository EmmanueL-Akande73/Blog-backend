import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import {
    getSystemSettings,
    updateSystemSetting,
    getSystemStats,
    getSystemLogs,
    clearSystemCache,
    createSystemBackup
} from '../controllers/systemController';

const router = express.Router();

// Apply authentication middleware to all routes (admin only)
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

// System settings routes
router.get('/settings', getSystemSettings);
router.put('/settings/:key', updateSystemSetting);

// System statistics
router.get('/stats', getSystemStats);

// System logs
router.get('/logs', getSystemLogs);

// System maintenance
router.post('/cache/clear', clearSystemCache);
router.post('/backup', createSystemBackup);

export default router;
