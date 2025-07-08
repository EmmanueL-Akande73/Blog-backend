// Import necessary modules from express, prisma client, and password hashing utility
import { Request, Response } from 'express'; // Import types for Express request and response
import prisma from '../utils/prisma'; // Import Prisma client instance
import { hashPassword } from '../utils/hash'; // Import password hashing utility

// Admin-only: Create new user
export const adminCreateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Destructure user creation fields from request body
        const { username, password, role, branchId } = req.body;

        // Input validation: username and password must be provided
        if (!username?.trim() || !password?.trim()) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }
        // Validate role is one of the allowed roles
        if (role && !['ADMIN', 'HEADQUARTER_MANAGER', 'BRANCH_MANAGER', 'CASHIER', 'CHEF', 'CUSTOMER'].includes(role)) {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }

        // If a branchId is provided for certain roles, validate the branch exists
        if (branchId && ['BRANCH_MANAGER', 'CASHIER', 'CHEF'].includes(role)) {
            const branch = await prisma.branch.findUnique({
                where: { id: Number(branchId) }
            });
            if (!branch) {
                res.status(400).json({ message: 'Invalid branch specified' });
                return;
            }
        }

        // Check if the username is already taken
        const existingUser = await prisma.user.findUnique({
            where: { username: username.trim() }
        });
        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }

        // Hash the password before saving
        const hashedPassword = await hashPassword(password);
        // Create the new user in the database
        const newUser = await prisma.user.create({
            data: {
                username: username.trim(), // Save trimmed username
                email: `${username.trim()}@steakz.com`, // Generate email from username
                password: hashedPassword, // Store hashed password
                role: role || 'CUSTOMER', // Default to CUSTOMER if no role
                branchId: branchId && ['BRANCH_MANAGER', 'CASHIER', 'CHEF'].includes(role) ? Number(branchId) : null // Assign branch if needed
            },
            select: {
                id: true,
                username: true,
                role: true,
                branchId: true,
                branch: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdAt: true,
                createdBy: {
                    select: {
                        username: true
                    }
                }
            }
        });

        // Respond with success and the new user
        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        // Log and respond with error if something goes wrong
        console.error('Error in adminCreateUser:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Admin-only: Update user details
export const adminUpdateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user id from request params and update fields from body
        const { id } = req.params;
        const { username, password, branchId } = req.body;

        // Require at least one field to update
        if (!username?.trim() && !password?.trim() && branchId === undefined) {
            res.status(400).json({ message: 'No update data provided' });
            return;
        }

        // Find the user to update and get their role
        const targetUser = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                role: true,
                createdById: true
            }
        });

        // If user not found, return error
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Prepare update data object
        const updateData: any = {};

        // If username is provided, check for uniqueness and add to update
        if (username?.trim()) {
            const existingUser = await prisma.user.findUnique({
                where: { username: username.trim() }
            });
            if (existingUser && existingUser.id !== Number(id)) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }
            updateData.username = username.trim();
        }

        // If password is provided, hash and add to update
        if (password?.trim()) {
            updateData.password = await hashPassword(password);
        }
        // If branchId is provided, validate and add to update
        if (branchId !== undefined) {
            if (branchId && ['BRANCH_MANAGER', 'CASHIER', 'CHEF'].includes(targetUser.role)) {
                const branch = await prisma.branch.findUnique({
                    where: { id: Number(branchId) }
                });
                if (!branch) {
                    res.status(400).json({ message: 'Invalid branch specified' });
                    return;
                }
                updateData.branchId = Number(branchId);
            } else if (!branchId) {
                updateData.branchId = null;
            }
        }

        // Update the user in the database
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: updateData,
            select: {
                id: true,
                username: true,
                role: true,
                branchId: true,
                branch: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                updatedAt: true
            }
        });
        // Respond with updated user
        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        // Log and respond with error if something goes wrong
        console.error('Error in adminUpdateUser:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Admin-only: Change user role
export const adminChangeRole = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user id from params and new role from body
        const { id } = req.params;
        const { role } = req.body;
        // Validate role
        if (!role || !['ADMIN', 'HEADQUARTER_MANAGER', 'BRANCH_MANAGER', 'CASHIER', 'CHEF', 'CUSTOMER'].includes(role)) {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }

        // Find the user to update
        const targetUser = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                role: true,
                createdById: true
            }
        });

        // If user not found, return error
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Update the user's role
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { role },
            select: {
                id: true,
                username: true,
                role: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        username: true
                    }
                }
            }
        });

        // Respond with updated user
        res.json({
            message: `User role updated to ${role}`,
            user: updatedUser
        });
    } catch (error) {
        // Log and respond with error if something goes wrong
        console.error('Error in adminChangeRole:', error);
        res.status(500).json({ message: 'Error changing user role' });
    }
};

// Admin-only: Delete user
export const adminDeleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user id from params
        const { id } = req.params;

        // Find the user to delete
        const targetUser = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                role: true,
                createdById: true,
                username: true
            }
        });

        // If user not found, return error
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Delete the user from the database
        await prisma.user.delete({
            where: { id: Number(id) }
        });

        // Respond with success message
        res.json({ 
            message: `User ${targetUser.username} and all associated data deleted successfully`
        });
    } catch (error) {
        // Log and respond with error if something goes wrong
        console.error('Error in adminDeleteUser:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// Get all users (for admin dashboard)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Parse pagination parameters from query
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        // Fetch users and total count in parallel
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    branchId: true,
                    branch: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.user.count()
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        // Respond with users and pagination info
        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        // Log and respond with error if something goes wrong
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get all menu items
export const getAllMenuItems = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        let where = {};
        if (category) {
            where = { category: category.toString().toUpperCase() };
        }
        const items = await prisma.menuItem.findMany({ where });
        res.json({ items });
    } catch (error) {
        console.error('Error in getAllMenuItems:', error);
        res.status(500).json({ message: 'Error fetching menu items' });
    }
};

// Get all reservations
export const getAllReservations = async (_req: Request, res: Response) => {
    try {
        const reservations = await prisma.reservation.findMany({
            select: {
                id: true,
                user: {
                    select: {
                        username: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        res.json(reservations);
    } catch (error) {
        console.error('Error in getAllReservations:', error);
        res.status(500).json({ message: 'Error fetching reservations' });
    }
};

// Get all orders
export const getAllOrders = async (_req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            select: {
                id: true,
                user: {
                    select: {
                        username: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

// Get current user profile (for session refresh)
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                branchId: true,
                branch: { select: { id: true, name: true } },
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

// Branch Manager or HQ Manager: Create staff (CASHIER, CHEF, BRANCH_MANAGER, CUSTOMER)
export const branchManagerCreateStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const manager = req.user;
        if (!manager || (manager.role !== 'BRANCH_MANAGER' && manager.role !== 'HEADQUARTER_MANAGER')) {
            res.status(403).json({ message: 'Only branch or HQ managers can create staff.' });
            return;
        }
        const { username, password, role, branchId } = req.body;
        // Restrict role creation based on manager type
        if (manager.role === 'BRANCH_MANAGER') {
            if (!['CASHIER', 'CHEF', 'CUSTOMER'].includes(role)) {
                res.status(400).json({ message: 'Branch managers can only create CASHIER, CHEF, or CUSTOMER.' });
                return;
            }
        } else if (manager.role === 'HEADQUARTER_MANAGER') {
            if (!['BRANCH_MANAGER', 'CASHIER', 'CHEF', 'CUSTOMER'].includes(role)) {
                res.status(400).json({ message: 'HQ managers can only create BRANCH_MANAGER, CASHIER, CHEF, or CUSTOMER.' });
                return;
            }
        }
        if (!username?.trim() || !password?.trim()) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }
        // Check username uniqueness
        const existingUser = await prisma.user.findUnique({ where: { username: username.trim() } });
        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }
        const hashedPassword = await hashPassword(password);
        let assignedBranchId = null;
        if (['CASHIER', 'CHEF', 'BRANCH_MANAGER'].includes(role)) {
            if (manager.role === 'BRANCH_MANAGER') {
                if (!manager.branchId) {
                    res.status(400).json({ message: 'Branch manager does not have a branch assigned.' });
                    return;
                }
                assignedBranchId = manager.branchId;
            } else if (manager.role === 'HEADQUARTER_MANAGER') {
                if (!branchId && role !== 'CUSTOMER') {
                    res.status(400).json({ message: 'HQ manager must specify branchId for staff roles.' });
                    return;
                }
                assignedBranchId = branchId;
            }
        }
        const newUser = await prisma.user.create({
            data: {
                username: username.trim(),
                email: `${username.trim()}@steakz.com`,
                password: hashedPassword,
                role,
                branchId: assignedBranchId ? Number(assignedBranchId) : null,
                createdById: manager.id
            },
            select: {
                id: true, username: true, role: true, branchId: true, createdAt: true
            }
        });
        res.status(201).json({ message: 'Staff created successfully', user: newUser });
    } catch (error) {
        console.error('Error in branchManagerCreateStaff:', error);
        res.status(500).json({ message: 'Error creating staff' });
    }
};

// Branch Manager or HQ Manager: Update staff
export const branchManagerUpdateStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const manager = req.user;
        if (!manager || (manager.role !== 'BRANCH_MANAGER' && manager.role !== 'HEADQUARTER_MANAGER')) {
            res.status(403).json({ message: 'Only branch or HQ managers can update staff.' });
            return;
        }
        const { id } = req.params;
        const { username, password, role, branchId } = req.body;
        const staff = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!staff || !['CASHIER', 'CHEF'].includes(staff.role)) {
            res.status(403).json({ message: 'You can only update staff with role CASHIER or CHEF.' });
            return;
        }
        if (manager.role === 'BRANCH_MANAGER' && staff.branchId !== manager.branchId) {
            res.status(403).json({ message: 'You can only update staff in your branch.' });
            return;
        }
        const updateData: any = {};
        if (username?.trim()) {
            const existingUser = await prisma.user.findUnique({ where: { username: username.trim() } });
            if (existingUser && existingUser.id !== staff.id) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }
            updateData.username = username.trim();
        }
        if (password?.trim()) {
            updateData.password = await hashPassword(password);
        }
        if (role && ['CASHIER', 'CHEF'].includes(role)) {
            updateData.role = role;
        }
        if (manager.role === 'HEADQUARTER_MANAGER' && branchId !== undefined) {
            updateData.branchId = branchId ? Number(branchId) : null;
        }
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: updateData,
            select: { id: true, username: true, role: true, branchId: true, updatedAt: true }
        });
        res.json({ message: 'Staff updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error in branchManagerUpdateStaff:', error);
        res.status(500).json({ message: 'Error updating staff' });
    }
};

// Branch Manager or HQ Manager: Delete staff
export const branchManagerDeleteStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const manager = req.user;
        if (!manager || (manager.role !== 'BRANCH_MANAGER' && manager.role !== 'HEADQUARTER_MANAGER')) {
            res.status(403).json({ message: 'Only branch or HQ managers can delete staff.' });
            return;
        }
        const { id } = req.params;
        const staff = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!staff || !['CASHIER', 'CHEF'].includes(staff.role)) {
            res.status(403).json({ message: 'You can only delete staff with role CASHIER or CHEF.' });
            return;
        }
        if (manager.role === 'BRANCH_MANAGER' && staff.branchId !== manager.branchId) {
            res.status(403).json({ message: 'You can only delete staff in your branch.' });
            return;
        }
        await prisma.user.delete({ where: { id: Number(id) } });
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        console.error('Error in branchManagerDeleteStaff:', error);
        res.status(500).json({ message: 'Error deleting staff' });
    }
};

// Branch Manager or HQ Manager: Get all staff in own branch (HQ manager can view all staff)
export const branchManagerGetStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const manager = req.user;
        if (!manager || (manager.role !== 'BRANCH_MANAGER' && manager.role !== 'HEADQUARTER_MANAGER')) {
            res.status(403).json({ message: 'Only branch or HQ managers can view staff.' });
            return;
        }
        let staff;
        if (manager.role === 'BRANCH_MANAGER') {
            if (!manager.branchId) {
                res.status(403).json({ message: 'Branch manager does not have a branch assigned.' });
                return;
            }
            staff = await prisma.user.findMany({
                where: {
                    branchId: manager.branchId,
                    role: { in: ['CASHIER', 'CHEF'] }
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    branchId: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // HQ manager: view all staff
            staff = await prisma.user.findMany({
                where: {
                    role: { in: ['CASHIER', 'CHEF'] }
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    branchId: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json({ users: staff });
    } catch (error) {
        console.error('Error in branchManagerGetStaff:', error);
        res.status(500).json({ message: 'Error fetching staff' });
    }
};
