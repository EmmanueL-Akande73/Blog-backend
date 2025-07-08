import express from 'express';
import { getBranchOrdersAndReservations } from '../controllers/branchOrdersAndReservationsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Get combined orders and reservations for a branch (branch manager only)
router.get('/:branchId/orders-and-reservations', authenticateToken, getBranchOrdersAndReservations);

export default router;
