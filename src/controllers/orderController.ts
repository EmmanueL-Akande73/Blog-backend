import { Request, Response } from 'express';
import { PrismaClient, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { items, branchId, paymentMethod, discount, discountType } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!branchId) {
      return res.status(400).json({ error: 'Branch is required for all orders' });
    }
    // Validate branch if provided
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Calculate total price and validate items
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });
      
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found or unavailable` });
      }
      
      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;
      
      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    // Apply discount if provided
    let finalTotal = total;
    let appliedDiscount = 0;
    let appliedDiscountType: DiscountType = DiscountType.AMOUNT;
    if (discount && !isNaN(discount) && discount > 0) {
      if (discountType === 'PERCENTAGE') {
        appliedDiscountType = DiscountType.PERCENTAGE;
        appliedDiscount = Math.min(discount, 100); // Cap at 100%
        finalTotal = Math.max(0, total - (total * (appliedDiscount / 100)));
      } else {
        appliedDiscountType = DiscountType.AMOUNT;
        appliedDiscount = discount;
        finalTotal = Math.max(0, total - appliedDiscount);
      }
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        branchId,
        total: finalTotal,
        status: 'PENDING',
        paymentMethod: paymentMethod || 'CASH', // Default payment method for backward compatibility
        paymentStatus: paymentMethod ? 'COMPLETED' : 'PENDING',
        discount: appliedDiscount,
        discountType: appliedDiscountType,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
        user: true,
        branch: true
      }
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
};
// End of file
export const getUserOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
        branch: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        branch: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getAllOrders = async (_req: Request, res: Response): Promise<any> => {
  try {
    // Always use req.user for role/branch (never trust res.locals)
    const userRole = _req.user?.role;
    const userBranchId = _req.user?.branchId;
    // Debug logging for user context
    console.log('getAllOrders: _req.user =', _req.user);
    console.log('getAllOrders: _req.user.branchId =', userBranchId);
    let whereClause: any = {};
    if ((userRole === 'CHEF' || userRole === 'CASHIER')) {
      if (userBranchId != null) {
        whereClause.branchId = userBranchId;
      } else {
        // If staff has no branch, show nothing
        return res.json([]);
      }
    }
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
        user: true,
        branch: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export const updateOrderStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    // Debug: Log user and headers for troubleshooting
    console.log('updateOrderStatus: req.user:', req.user);
    console.log('updateOrderStatus: Authorization header:', req.headers['authorization']);
    const { id } = req.params;
    const { status } = req.body;
    
    // validStatuses is not used, so remove it
    const enumStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED', 'COMPLETED'];
    if (!enumStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Only allow branch manager or cashier to confirm/complete orders in their branch
    const userRole = req.user?.role;
    const userBranchId = req.user?.branchId;
    if (userRole === 'BRANCH_MANAGER' || userRole === 'CASHIER') {
      // Fetch the order to check branch
      const orderToUpdate = await prisma.order.findUnique({ where: { id: parseInt(id) } });
      if (!orderToUpdate || orderToUpdate.branchId !== userBranchId) {
        return res.status(403).json({ error: 'You can only update orders in your branch.' });
      }
    }

    // If status is COMPLETED, also set paymentStatus to COMPLETED
    let updateData: any = { status };
    if (status === 'COMPLETED') {
      updateData.paymentStatus = 'COMPLETED';
    }
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
        user: true,
        branch: true
      }
    });
    return res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getOrdersByStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let whereClause: any = {
      status: status.toUpperCase()
    };

    // If customer, only show their own orders
    if (userRole === 'CUSTOMER') {
      whereClause.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        branch: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Customers can only cancel their own orders, staff can cancel any order
    if (userRole === 'CUSTOMER' && order.userId !== userId) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }

    // Only allow cancellation if order is still PENDING or CONFIRMED
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
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
    
    return res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// Generate a receipt for an order (for POS cashier)
export const generateReceipt = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // order id
    const userRole = req.user?.role;

    // Only cashier or admin can generate receipt
    if (!['CASHIER', 'ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized to generate receipt' });
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: { include: { menuItem: true } },
        user: true,
        branch: true
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Generate a unique receipt number (e.g., using order id and timestamp)
    const receiptNumber = `R-${order.id}-${Date.now()}`;
    const receiptGeneratedAt = new Date();

    // Optionally, update the order with receipt info (add fields in model if needed)
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        receiptNumber,
        receiptGeneratedAt
      },
      include: {
        orderItems: { include: { menuItem: true } },
        user: true,
        branch: true
      }
    });

    // Prepare receipt data
    const receipt = {
      receiptNumber,
      generatedAt: receiptGeneratedAt,
      order: updatedOrder
    };

    return res.json(receipt);
  } catch (error) {
    console.error('Error generating receipt:', error);
    return res.status(500).json({ error: 'Failed to generate receipt' });
  }
};

// Cashier: Set order payment status to COMPLETED
export const setOrderPaymentCompleted = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    // Only cashier or admin can complete payment
    const userRole = req.user?.role;
    if (!['CASHIER', 'ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { paymentStatus: 'COMPLETED' },
      include: {
        orderItems: { include: { menuItem: true } },
        user: true,
        branch: true
      }
    });
    return res.json(order);
  } catch (error) {
    console.error('Error setting payment completed:', error);
    return res.status(500).json({ error: 'Failed to set payment completed' });
  }
};
