// src/routes/tenants.ts
import { Router } from 'express';
import { Tenant } from '../models/Tenant';
import { authMiddleware, verifyToken } from '../middleware/auth';
import { validateTenantAccess } from '../middleware/tenantValidation';
import { requireRole } from '../middleware/roleBasedAccess';
import { IAuthRequest } from '../types';

const router = Router();

// Get all tenants for current user
router.get('/', authMiddleware, async (req: IAuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Get the user's tenant
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      });
    }

    res.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Get tenant by ID
router.get('/:tenantId', authMiddleware, validateTenantAccess, async (req: IAuthRequest, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      });
    }

    res.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Create tenant (admin only)
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { name, slug, description } = req.body;

      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          error: 'Name and slug are required',
        });
      }

      // Check if slug already exists
      const existingTenant = await Tenant.findOne({ slug });
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          error: 'Tenant slug already exists',
        });
      }

      const tenant = await Tenant.create({
        name,
        slug,
        description,
      });

      res.status(201).json({
        success: true,
        data: tenant,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Update tenant (admin only)
router.patch(
  '/:tenantId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId } = req.params;
      const { name, description } = req.body;

      const tenant = await Tenant.findByIdAndUpdate(
        tenantId,
        { name, description },
        { new: true, runValidators: true }
      );

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found',
        });
      }

      res.json({
        success: true,
        data: tenant,
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

