import express from 'express';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch
} from '../controllers/branchController';

const router = express.Router();

// Get all active branches
router.get('/', getAllBranches);

// Get specific branch by ID
router.get('/:id', getBranchById);

// Create new branch (admin only)
router.post('/', createBranch);

// Update branch (admin only)
router.put('/:id', updateBranch);

// Delete/deactivate branch (admin only)
router.delete('/:id', deleteBranch);

export default router;
