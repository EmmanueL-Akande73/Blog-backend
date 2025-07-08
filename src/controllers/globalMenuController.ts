import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all menu items with branch inventories
export const getGlobalMenu = async (_req: Request, res: Response) => {
  try {
    // Get all menu items
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { category: 'asc' },
    });
    // Get all branches
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
    });
    // Get all inventories (assuming inventory is tracked per menu item per branch)
    // If you have an Inventory model, use it. Otherwise, fallback to empty (no error)
    let inventories: any[] = [];
    // Use runtime check for inventory model
    if (typeof (prisma as any).inventory?.findMany === 'function') {
      inventories = await (prisma as any).inventory.findMany();
    } else {
      inventories = [];
    }
    // Map inventories to menu items and branches
    const menuWithInventories = menuItems.map(item => ({
      ...item,
      inventories: branches.map(branch => {
        const inv = inventories.find(i => i.menuItemId === item.id && i.branchId === branch.id);
        return {
          branchId: branch.id,
          branchName: branch.name,
          quantity: inv ? inv.quantity : null // null if not tracked
        };
      })
    }));
    res.json({ menu: menuWithInventories, branches });
  } catch (error) {
    console.error('Error in getGlobalMenu:', error); // Log the error to the backend terminal
    res.status(500).json({ error: 'Failed to fetch global menu', details: error });
  }
};

// Add or update inventory for a menu item and branch
export const upsertInventory = async (req: Request, res: Response): Promise<void> => {
  const { menuItemId, branchId, quantity } = req.body;
  try {
    // Only proceed if inventory model exists
    if (typeof (prisma as any).inventory?.upsert !== 'function') {
      res.status(400).json({ error: 'Inventory management is not enabled in the backend.' });
      return;
    }
    const inventory = await (prisma as any).inventory.upsert({
      where: {
        menuItemId_branchId: {
          menuItemId: Number(menuItemId),
          branchId: Number(branchId)
        }
      },
      update: { quantity: Number(quantity) },
      create: {
        menuItemId: Number(menuItemId),
        branchId: Number(branchId),
        quantity: Number(quantity)
      }
    });
    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory', details: error });
  }
};

// Get inventory for a specific branch (for chefs and branch managers)
export const getBranchInventory = async (req: Request, res: Response): Promise<void> => {
  const branchId = Number(req.params.branchId);
  if (!branchId) {
    res.status(400).json({ error: 'Branch ID is required' });
    return;
  }
  try {
    // Only allow if user is CHEF or BRANCH_MANAGER for this branch
    const user = req.user;
    if (!user || !['CHEF', 'BRANCH_MANAGER'].includes(user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    // If chef, must be assigned to this branch
    if (user.role === 'CHEF' && user.branchId !== branchId) {
      res.status(403).json({ error: 'Forbidden: Not your branch' });
      return;
    }
    // Fetch inventory for the branch
    if (typeof (prisma as any).inventory?.findMany !== 'function') {
      res.status(400).json({ error: 'Inventory management is not enabled in the backend.' });
      return;
    }
    const inventory = await (prisma as any).inventory.findMany({
      where: { branchId },
      include: { menuItem: true }
    });
    res.json(inventory);
    return;
  } catch (error) {
    console.error('Error fetching branch inventory:', error);
    res.status(500).json({ error: 'Failed to fetch branch inventory', details: error });
    return;
  }
};
