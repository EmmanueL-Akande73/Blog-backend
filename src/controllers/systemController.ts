import { Request, Response } from 'express';
import prisma from '../utils/prisma';

interface SystemSetting {
    id: number;
    key: string;
    value: string;
    description: string | null;
    category: string;
    isEditable: boolean;
    dataType: string;
    createdAt: Date;
    updatedAt: Date;
}

// Get system settings
export const getSystemSettings = async (_req: Request, res: Response): Promise<void> => {
    try {
        const settings = await prisma.systemSetting.findMany({
            orderBy: {
                category: 'asc'
            }
        });

        // Group settings by category
        const groupedSettings = settings.reduce((acc: Record<string, SystemSetting[]>, setting: SystemSetting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        }, {});

        res.json({
            settings: groupedSettings,
            totalSettings: settings.length
        });
    } catch (error) {
        console.error('Error in getSystemSettings:', error);
        res.status(500).json({ message: 'Error fetching system settings' });
    }
};

// Update system setting
export const updateSystemSetting = async (req: Request, res: Response): Promise<void> => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        if (value === undefined) {
            res.status(400).json({ message: 'Value is required' });
            return;
        }

        const existingSetting = await prisma.systemSetting.findUnique({
            where: { key }
        });

        if (!existingSetting) {
            res.status(404).json({ message: 'Setting not found' });
            return;
        }

        const updatedSetting = await prisma.systemSetting.update({
            where: { key },
            data: {
                value: String(value),
                description: description || existingSetting.description,
                updatedAt: new Date()
            }
        });

        res.json({
            message: 'Setting updated successfully',
            setting: updatedSetting
        });
    } catch (error) {
        console.error('Error in updateSystemSetting:', error);
        res.status(500).json({ message: 'Error updating system setting' });
    }
};

// Get system statistics
export const getSystemStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [
            totalUsers,
            totalBranches,
            totalOrders,
            totalMenuItems,
            totalReservations,
            recentActivity
        ] = await Promise.all([
            prisma.user.count(),
            prisma.branch.count(),
            prisma.order.count(),
            prisma.menuItem.count(),
            prisma.reservation.count(),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    total: true,
                    status: true,
                    createdAt: true,
                    user: {
                        select: {
                            username: true
                        }
                    }
                }
            })
        ]);

        // Calculate growth percentages (mock data for demonstration)
        const stats = {
            users: {
                total: totalUsers,
                growth: '+12%',
                color: 'success'
            },
            branches: {
                total: totalBranches,
                growth: '+5%',
                color: 'info'
            },
            orders: {
                total: totalOrders,
                growth: '+18%',
                color: 'success'
            },
            menuItems: {
                total: totalMenuItems,
                growth: '+3%',
                color: 'warning'
            },
            reservations: {
                total: totalReservations,
                growth: '+8%',
                color: 'info'
            }
        };

        res.json({
            stats,
            recentActivity
        });
    } catch (error) {
        console.error('Error in getSystemStats:', error);
        res.status(500).json({ message: 'Error fetching system statistics' });
    }
};

// Get system logs (mock implementation)
export const getSystemLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, level } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        // Mock system logs - in a real application, these would come from a logging system
        const mockLogs = [
            {
                id: 1,
                timestamp: new Date(),
                level: 'INFO',
                message: 'User admin logged in successfully',
                source: 'AuthController',
                details: { userId: 1, ip: '192.168.1.100' }
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 30000),
                level: 'WARNING',
                message: 'High memory usage detected',
                source: 'SystemMonitor',
                details: { memoryUsage: '85%' }
            },
            {
                id: 3,
                timestamp: new Date(Date.now() - 60000),
                level: 'ERROR',
                message: 'Database connection timeout',
                source: 'DatabaseService',
                details: { timeout: '30s', query: 'SELECT * FROM users' }
            },
            {
                id: 4,
                timestamp: new Date(Date.now() - 120000),
                level: 'INFO',
                message: 'System backup completed successfully',
                source: 'BackupService',
                details: { size: '2.3GB', duration: '45m' }
            },
            {
                id: 5,
                timestamp: new Date(Date.now() - 180000),
                level: 'DEBUG',
                message: 'Cache cleared for menu items',
                source: 'CacheService',
                details: { keys: 15 }
            }
        ];

        // Filter by level if specified
        let filteredLogs = mockLogs;
        if (level && level !== 'ALL') {
            filteredLogs = mockLogs.filter(log => log.level === level);
        }

        // Paginate
        const paginatedLogs = filteredLogs.slice(skip, skip + Number(limit));
        const total = filteredLogs.length;

        res.json({
            logs: paginatedLogs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error in getSystemLogs:', error);
        res.status(500).json({ message: 'Error fetching system logs' });
    }
};

// Clear system cache (mock implementation)
export const clearSystemCache = async (_req: Request, res: Response): Promise<void> => {
    try {
        // In a real application, this would clear Redis cache, memory cache, etc.
        // For now, we'll just simulate the action
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate cache clearing

        res.json({
            message: 'System cache cleared successfully',
            clearedAt: new Date(),
            details: {
                menuCache: 'cleared',
                userSessions: 'refreshed',
                databaseConnections: 'reset'
            }
        });
    } catch (error) {
        console.error('Error in clearSystemCache:', error);
        res.status(500).json({ message: 'Error clearing system cache' });
    }
};

// Backup system data (mock implementation)
export const createSystemBackup = async (_req: Request, res: Response): Promise<void> => {
    try {
        // In a real application, this would create database backups, file backups, etc.
        const backupId = `backup_${Date.now()}`;
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate backup creation

        res.json({
            message: 'System backup created successfully',
            backupId,
            createdAt: new Date(),
            details: {
                size: '2.1GB',
                tables: ['users', 'orders', 'menu_items', 'branches', 'reservations'],
                duration: '2.5 minutes'
            }
        });
    } catch (error) {
        console.error('Error in createSystemBackup:', error);
        res.status(500).json({ message: 'Error creating system backup' });
    }
};
