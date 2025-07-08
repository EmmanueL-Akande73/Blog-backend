import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();

// Only HQ Manager can access analytics
router.get('/', authenticateToken, authorizeRole(['HEADQUARTER_MANAGER', 'ADMIN']), getAnalytics);

export default router;
