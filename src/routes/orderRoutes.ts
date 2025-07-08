import express from 'express';
import {
  createOrder,
  getUserOrders,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrdersByStatus,
  cancelOrder,
  generateReceipt,
  setOrderPaymentCompleted // <-- add import
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Create a new order (authenticated users)
router.post('/', authenticateToken, createOrder);

// Get all orders (admin)
router.get('/', authenticateToken, getAllOrders);

// Get user's own orders
router.get('/my', authenticateToken, getMyOrders);

// Get orders by status (authenticated users)
router.get('/status/:status', authenticateToken, getOrdersByStatus);

// Get orders for a specific user (admin only)
router.get('/user/:userId', getUserOrders);

// Update order status (staff only)
router.patch('/:id/status', authenticateToken, updateOrderStatus);

// Cancel order
router.patch('/:id/cancel', authenticateToken, cancelOrder);

// Generate receipt for an order (POS cashier or admin)
router.post('/:id/receipt', authenticateToken, generateReceipt);

// Cashier: Set order payment status to COMPLETED
router.patch('/:id/payment-completed', authenticateToken, setOrderPaymentCompleted);

export default router;
