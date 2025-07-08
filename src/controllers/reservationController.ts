import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createReservation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { branchId, date, time, partySize, notes, paymentMethod, depositAmount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ error: 'Deposit amount is required and must be greater than 0' });
    }

    // Validate payment method
    const validPaymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'DIGITAL_WALLET', 'BANK_TRANSFER'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Validate branch exists
    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId }
      });
      
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }
    }

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        branchId,
        date: new Date(date),
        time: new Date(time),
        partySize,
        notes,
        paymentMethod,
        paymentStatus: paymentMethod ? 'COMPLETED' : 'PENDING',
        depositAmount,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        branch: true
      }
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
};

export const getUserReservations = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        branch: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

export const getAllReservations = async (req: Request, res: Response): Promise<any> => {
  try {
    const userRole = req.user?.role;
    
    if (!['ADMIN', 'HEADQUARTER_MANAGER', 'BRANCH_MANAGER'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { branchId, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (branchId) where.branchId = Number(branchId);
    if (status) where.status = status;

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          branch: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.reservation.count({ where })
    ]);

    res.json({
      reservations,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

export const updateReservationStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user?.role;

    if (!['ADMIN', 'HEADQUARTER_MANAGER', 'BRANCH_MANAGER', 'CASHIER'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Only allow branch manager or cashier to confirm reservations in their branch
    if (userRole === 'BRANCH_MANAGER' || userRole === 'CASHIER') {
      const userBranchId = req.user?.branchId;
      const reservationToUpdate = await prisma.reservation.findUnique({ where: { id: Number(id) } });
      if (!reservationToUpdate || reservationToUpdate.branchId !== userBranchId) {
        return res.status(403).json({ error: 'You can only update reservations in your branch.' });
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        branch: true
      }
    });

    res.json(reservation);  } catch (error) {
    console.error('Error updating reservation status:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
};

export const cancelReservation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(id) }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if user owns the reservation or has permission to cancel
    if (reservation.userId !== userId && !['ADMIN', 'HEADQUARTER_MANAGER', 'BRANCH_MANAGER'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Update reservation status to cancelled
    const updatedReservation = await prisma.reservation.update({
      where: { id: Number(id) },
      data: { status: 'CANCELLED' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        branch: true
      }
    });

    res.json(updatedReservation);
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
};

export const getReservationById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        branch: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if user owns the reservation or has permission to view
    if (reservation.userId !== userId && !['ADMIN', 'HEADQUARTER_MANAGER', 'BRANCH_MANAGER'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
};
