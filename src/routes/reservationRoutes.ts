import express from 'express';
import {
  createReservation,
  getUserReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
  getReservationById
} from '../controllers/reservationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Create a new reservation (authenticated users)
router.post('/', authenticateToken, createReservation);

// Get current user's reservations
router.get('/my', authenticateToken, getUserReservations);

// Get all reservations (admin/manager only)
router.get('/', authenticateToken, getAllReservations);

// Get reservation by ID
router.get('/:id', authenticateToken, getReservationById);

// Update reservation status (admin/manager only)
router.patch('/:id/status', authenticateToken, updateReservationStatus);

// Cancel reservation
router.patch('/:id/cancel', authenticateToken, cancelReservation);

export default router;
