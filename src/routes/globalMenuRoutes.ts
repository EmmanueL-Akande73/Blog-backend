import { Router } from 'express';
import { getGlobalMenu, upsertInventory, getBranchInventory } from '../controllers/globalMenuController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();

// Only HQ Manager can access global menu and manage inventory
router.get('/', authenticateToken, authorizeRole(['HEADQUARTER_MANAGER']), getGlobalMenu);
router.post('/inventory', authenticateToken, authorizeRole(['HEADQUARTER_MANAGER']), upsertInventory);
// Allow chefs and branch managers to get inventory for their branch
router.get('/inventory/branch/:branchId', authenticateToken, getBranchInventory);

export default router;
