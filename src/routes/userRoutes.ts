// Import the Router from express
import { Router } from 'express';
// Import all user-related controller functions
import {
    getAllUsers, // Controller to get all users
    getAllMenuItems, // Controller to get all menu items
    getAllReservations, // Controller to get all reservations
    getAllOrders, // Controller to get all orders
    adminUpdateUser, // Controller to update a user (admin/HQ)
    adminChangeRole, // Controller to change a user's role (admin/HQ)
    adminDeleteUser, // Controller to delete a user (admin/HQ)
    getMe, // Controller to get current user profile
    branchManagerCreateStaff, // Controller for branch/HQ manager to create staff
    branchManagerUpdateStaff, // Controller for branch/HQ manager to update staff
    branchManagerDeleteStaff, // Controller for branch/HQ manager to delete staff
    branchManagerGetStaff, // Controller for branch/HQ manager to get staff
    adminCreateUser // Controller for admin/HQ to create user
} from '../controllers/userController';
// Import prisma client instance
import prisma from '../utils/prisma';
// Import authentication middleware
import { authenticateToken } from '../middleware/authMiddleware';

// Create a new router instance
const router = Router();

// Middleware to restrict access to ADMIN and HQ MANAGER
function adminOrHQView(handler: any) {
  return (req: any, res: any) => {
    // Debug log for user info
    console.log('adminOrHQView req.user:', req.user); // Debug log
    // Only allow if user is ADMIN or HQ MANAGER
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'HEADQUARTER_MANAGER')) {
      return handler(req, res);
    }
    // Otherwise, forbidden
    res.status(403).json({ message: 'Forbidden' });
  };
}
// Route to get all users (admin/HQ only)
router.get('/users', authenticateToken, adminOrHQView(getAllUsers));
// Route to get all menu items (admin/HQ only)
router.get('/menu', authenticateToken, adminOrHQView(getAllMenuItems));
// Route to get all reservations (admin/HQ only)
router.get('/reservations', authenticateToken, adminOrHQView(getAllReservations));
// Route to get all orders (admin/HQ only)
router.get('/orders', authenticateToken, adminOrHQView(getAllOrders));

// Route to get all branches for user assignment
router.get('/branches', async (_req, res) => {
    try {
        // Query all active branches, ordered by name
        const branches = await prisma.branch.findMany({
            select: {
                id: true,
                name: true,
                city: true,
                district: true,
                isActive: true
            },
            where: {
                isActive: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        // Respond with branches
        res.json(branches);
    } catch (error) {
        // Log and respond with error
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Error fetching branches' });
    }
});

// Admin and HQ manager user management routes
// Route to create user (admin/HQ only)
router.post('/', authenticateToken, adminOrHQView(adminCreateUser));
// Route to update user (admin/HQ or self)
router.put('/:id', authenticateToken, async (req, res) => {
  if (
    req.user &&
    (req.user.role === 'ADMIN' ||
      req.user.role === 'HEADQUARTER_MANAGER' ||
      req.user.id === Number(req.params.id))
  ) {
    return adminUpdateUser(req, res);
  }
  res.status(403).json({ message: 'Forbidden' });
});
// Route to change user role (admin/HQ only)
router.patch('/:id/role', authenticateToken, adminOrHQView(adminChangeRole));
// Route to delete user (admin/HQ only)
router.delete('/:id', authenticateToken, adminOrHQView(adminDeleteUser));

// Branch manager staff management
// Route to get staff for branch/HQ manager
router.get('/branch-staff', authenticateToken, branchManagerGetStaff);
// Route to create staff for branch/HQ manager
router.post('/branch-staff', authenticateToken, async (req, res) => {
  try {
    await branchManagerCreateStaff(req, res);
    // If the controller sends a response, do not send another
    // (branchManagerCreateStaff already sends the response)
  } catch (error) {
    // Do not send any error message here, let the controller handle it
  }
});
// Route to update staff for branch/HQ manager
router.put('/branch-staff/:id', authenticateToken, branchManagerUpdateStaff);
// Route to delete staff for branch/HQ manager
router.delete('/branch-staff/:id', authenticateToken, branchManagerDeleteStaff);

// Route to get current user profile
router.get('/me', authenticateToken, getMe);

// Export the router
export default router;
