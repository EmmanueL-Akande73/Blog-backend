import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Analytics for HQ Manager: total sales, total reservations, top menu items, branch performance
export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    // Total sales (sum of all order totals)
    const totalSales = await prisma.order.aggregate({
      _sum: { total: true }
    });

    // Total reservations
    const totalReservations = await prisma.reservation.count();

    // Top 5 menu items by order count
    const topMenuItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: topMenuItems.map(i => i.menuItemId) } },
    });
    const topMenuItemsDetailed = topMenuItems.map(item => ({
      ...item,
      menuItem: menuItems.find(m => m.id === item.menuItemId)
    }));

    // Branch performance: total sales and reservations per branch
    const branchSales = await prisma.order.groupBy({
      by: ['branchId'],
      _sum: { total: true },
      _count: { id: true }
    });
    const branchReservations = await prisma.reservation.groupBy({
      by: ['branchId'],
      _count: { id: true }
    });
    // Fetch branch names for all involved branchIds
    const branchIds = Array.from(new Set([
      ...branchSales.map(b => b.branchId),
      ...branchReservations.map(b => b.branchId)
    ].filter(id => id !== null)));
    const branches = await prisma.branch.findMany({
      where: { id: { in: branchIds } },
      select: { id: true, name: true }
    });
    // Attach branch name to sales and reservations
    const branchSalesDetailed = branchSales.map(b => ({
      ...b,
      branchName: branches.find(br => br.id === b.branchId)?.name || 'N/A'
    }));
    const branchReservationsDetailed = branchReservations.map(b => ({
      ...b,
      branchName: branches.find(br => br.id === b.branchId)?.name || 'N/A'
    }));
    res.json({
      totalSales: totalSales._sum.total || 0,
      totalReservations,
      topMenuItems: topMenuItemsDetailed,
      branchSales: branchSalesDetailed,
      branchReservations: branchReservationsDetailed
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: error });
  }
};
