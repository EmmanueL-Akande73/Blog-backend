import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user's cart with all items
export const getCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          cartItems: {
            include: {
              menuItem: true
            }
          }
        }
      });
    }

    // Calculate total
    const total = cart.cartItems.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity);
    }, 0);

    res.json({
      ...cart,
      total,
      itemCount: cart.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { menuItemId, quantity = 1 } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!menuItemId || quantity <= 0) {
      return res.status(400).json({ error: 'Valid menu item ID and quantity are required' });
    }

    // Validate menu item exists and is available
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId }
    });

    if (!menuItem || !menuItem.isAvailable) {
      return res.status(404).json({ error: 'Menu item not found or unavailable' });
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId: menuItemId
        }
      }
    });

    let cartItem;
    if (existingCartItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: { menuItem: true }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId: menuItemId,
          quantity: quantity
        },
        include: { menuItem: true }
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(cartItemId),
        cart: { userId }
      },
      include: { menuItem: true }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
      include: { menuItem: true }
    });

    res.json(updatedCartItem);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(cartItemId),
        cart: { userId }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id }
    });

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Clear entire cart
export const clearCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Convert cart to order
export const checkoutCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const cashierId = req.user?.id;
    const userRole = req.user?.role;
    const { branchId, paymentMethod, walkInCustomer } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    const validPaymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'DIGITAL_WALLET', 'BANK_TRANSFER'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    if (userRole === 'CASHIER') {
      // Cashier walk-in flow
      if (!walkInCustomer || (!walkInCustomer.name && !walkInCustomer.phone)) {
        return res.status(400).json({ error: 'Walk-in customer details are required. Cashier cannot checkout for themselves.' });
      }
      if (!branchId) {
        return res.status(400).json({ error: 'Branch is required for walk-in orders' });
      }
      const branch = await prisma.branch.findUnique({ where: { id: branchId } });
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      // Get cart with items (cart belongs to cashier, but order is for walk-in)
      const cart = await prisma.cart.findFirst({
        where: { userId: cashierId },
        include: { cartItems: { include: { menuItem: true } } }
      });
      if (!cart || cart.cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
      let total = 0;
      const orderItems = cart.cartItems.map(cartItem => {
        const itemTotal = cartItem.menuItem.price * cartItem.quantity;
        total += itemTotal;
        return {
          menuItemId: cartItem.menuItemId,
          quantity: cartItem.quantity,
          price: cartItem.menuItem.price
        };
      });
      // Create order for walk-in (userId: null, walkInName: cashier input)
      const order = await prisma.order.create({
        data: {
          userId: null, // do NOT associate cashier as customer
          walkInName: walkInCustomer.name || 'Walk-in Customer',
          walkInPhone: walkInCustomer.phone || null,
          branchId,
          total,
          paymentMethod,
          paymentStatus: paymentMethod ? 'COMPLETED' : 'PENDING',
          status: 'PENDING',
          orderItems: { create: orderItems }
        },
        include: { orderItems: { include: { menuItem: true } }, branch: true }
      });
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      return res.status(201).json(order);
    } else {
      // Customer flow
      const userId = req.user?.id;
      if (!branchId) {
        return res.status(400).json({ error: 'Branch is required for all orders' });
      }
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: { cartItems: { include: { menuItem: true } } }
      });
      if (!cart || cart.cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
      let total = 0;
      const orderItems = cart.cartItems.map(cartItem => {
        const itemTotal = cartItem.menuItem.price * cartItem.quantity;
        total += itemTotal;
        return {
          menuItemId: cartItem.menuItemId,
          quantity: cartItem.quantity,
          price: cartItem.menuItem.price
        };
      });
      const order = await prisma.order.create({
        data: {
          userId,
          walkInName: null,
          walkInPhone: null,
          branchId: branchId || null,
          total,
          paymentMethod,
          paymentStatus: paymentMethod ? 'COMPLETED' : 'PENDING',
          status: 'PENDING',
          orderItems: { create: orderItems }
        },
        include: { orderItems: { include: { menuItem: true } }, branch: true }
      });
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      return res.status(201).json(order);
    }
  } catch (error) {
    console.error('Checkout cart error:', error);
    
    // More specific error handling
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Duplicate order detected' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Related record not found' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Foreign key constraint failed' });
      }
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};
