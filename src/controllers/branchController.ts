import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllBranches = async (_req: Request, res: Response): Promise<any> => {
  try {
    const branches = await prisma.branch.findMany({
      where: {
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
    
    return res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

export const getBranchById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(id) },
      include: {
        reservations: {
          where: {
            status: 'CONFIRMED'
          },
          take: 10,
          orderBy: { date: 'desc' }
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    return res.json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    return res.status(500).json({ error: 'Failed to fetch branch' });
  }
};

export const createBranch = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      address,
      city,
      district,
      phone,
      email,
      description,
      features,
      mondayHours,
      tuesdayHours,
      wednesdayHours,
      thursdayHours,
      fridayHours,
      saturdayHours,
      sundayHours,
      imageUrl,
      latitude,
      longitude
    } = req.body;
    
    if (!name || !address || !city || !phone || !email) {
      return res.status(400).json({ error: 'Name, address, city, phone, and email are required' });
    }
    
    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        city,
        district,
        phone,
        email,
        description,
        features: features || [],
        mondayHours,
        tuesdayHours,
        wednesdayHours,
        thursdayHours,
        fridayHours,
        saturdayHours,
        sundayHours,
        imageUrl,
        latitude,
        longitude
      }
    });
    
    return res.status(201).json(branch);
  } catch (error) {
    console.error('Error creating branch:', error);
    return res.status(500).json({ error: 'Failed to create branch' });
  }
};

export const updateBranch = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const branch = await prisma.branch.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    return res.json(branch);
  } catch (error) {
    console.error('Error updating branch:', error);
    return res.status(500).json({ error: 'Failed to update branch' });
  }
};

export const deleteBranch = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    // Soft delete - set isActive to false
    const branch = await prisma.branch.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });
    
    return res.json({ message: 'Branch deactivated successfully', branch });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return res.status(500).json({ error: 'Failed to delete branch' });
  }
};
