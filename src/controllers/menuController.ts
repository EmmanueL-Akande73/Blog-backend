import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMenuItems = async (_req: Request, res: Response): Promise<any> => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

export const getMenuItemsByCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { category } = req.params;
    
    const menuItems = await prisma.menuItem.findMany({
      where: {
        category: category.toUpperCase() as any,
        isAvailable: true
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

export const getFeaturedMenuItems = async (_req: Request, res: Response): Promise<any> => {
  try {
    // Get the top 3 signature dishes (most expensive main courses)
    const featuredItems = await prisma.menuItem.findMany({
      where: {
        category: 'MAIN',
        isAvailable: true
      },
      orderBy: { price: 'desc' },
      take: 3
    });
    
    res.json(featuredItems);
  } catch (error) {
    console.error('Error fetching featured menu items:', error);
    res.status(500).json({ error: 'Failed to fetch featured menu items' });
  }
};

export const getMenuItemById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    return res.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};
