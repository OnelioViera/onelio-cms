// src/routes/users.ts
import { Router } from 'express';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { validateTenantAccess } from '../middleware/tenantValidation';
import { requireRole } from '../middleware/roleBasedAccess';
import { IAuthRequest } from '../types';

const router = Router();

// Get all users in tenant (admin only)
router.get(
  '/:tenantId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId } = req.params;

      const users = await User.find({ tenantId }).select('-password');

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Get single user (admin only)
router.get(
  '/:tenantId/:userId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, userId } = req.params;

      const user = await User.findOne({ _id: userId, tenantId }).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Create new user (admin only)
router.post(
  '/:tenantId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId } = req.params;
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and name are required',
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
        });
      }

      const user = await User.create({
        email,
        password,
        name,
        tenantId,
        role: role || 'editor',
        isActive: true,
      });

      res.status(201).json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Update user (admin only)
router.patch(
  '/:tenantId/:userId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, userId } = req.params;
      const { name, role, isActive } = req.body;

      const user = await User.findOneAndUpdate(
        { _id: userId, tenantId },
        { name, role, isActive },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Delete user (admin only)
router.delete(
  '/:tenantId/:userId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, userId } = req.params;

      // Prevent deleting yourself
      if (req.user?.userId === userId) {
        return res.status(400).json({
          success: false,
          error: 'You cannot delete your own account',
        });
      }

      const user = await User.findOneAndDelete({
        _id: userId,
        tenantId,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

export default router;

