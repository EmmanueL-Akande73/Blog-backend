import express from 'express';
import {
  getAllMenuItems,
  getMenuItemsByCategory,
  getFeaturedMenuItems,
  getMenuItemById
} from '../controllers/menuController';

const router = express.Router();

// Get all menu items
router.get('/', getAllMenuItems);

// Get featured menu items (top 3 signature dishes)
router.get('/featured', getFeaturedMenuItems);

// Get menu items by category
router.get('/category/:category', getMenuItemsByCategory);

// Get specific menu item by ID (this must be last to avoid conflicts)
router.get('/:id', getMenuItemById);

export default router;
