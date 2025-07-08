import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Combined orders and reservations for a branch
export const getBranchOrdersAndReservations = async (req: Request, res: Response): Promise<any> => {
  try {
    const { branchId } = req.params;
    if (!branchId) {
      return res.status(400).json({ error: 'Branch ID is required' });
    }

    // Fetch orders for the branch
    const orders = await prisma.order.findMany({
      where: { branchId: Number(branchId) },
      include: {
        orderItems: { include: { menuItem: true } },
        user: { select: { id: true, username: true, email: true, role: true, branchId: true } },
        branch: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch reservations for the branch
    const reservations = await prisma.reservation.findMany({
      where: { branchId: Number(branchId) },
      include: {
        user: { select: { id: true, username: true, email: true } },
        branch: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ orders, reservations });
  } catch (error) {
    console.error('Error fetching branch orders and reservations:', error);
    return res.status(500).json({ error: 'Failed to fetch branch orders and reservations' });
  }
};
