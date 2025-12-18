// src/routes/schemas.ts
import { Router } from 'express';
import { ContentType } from '../models/ContentType';
import { authMiddleware } from '../middleware/auth';
import { validateTenantAccess } from '../middleware/tenantValidation';
import { requireRole } from '../middleware/roleBasedAccess';
import { IAuthRequest } from '../types';

const router = Router();

// Get all content types for a tenant
router.get(
  '/:tenantId',
  authMiddleware,
  validateTenantAccess,
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId } = req.params;

      const contentTypes = await ContentType.find({ tenantId });

      res.json({
        success: true,
        data: contentTypes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Get single content type by slug
router.get(
  '/:tenantId/:slug',
  authMiddleware,
  validateTenantAccess,
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, slug } = req.params;

      const contentType = await ContentType.findOne({
        tenantId,
        slug,
      });

      if (!contentType) {
        return res.status(404).json({
          success: false,
          error: 'Content type not found',
        });
      }

      res.json({
        success: true,
        data: contentType,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Create new content type schema (admin/editor)
router.post(
  '/:tenantId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin', 'editor'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId } = req.params;
      const { name, slug, description, fields } = req.body;

      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          error: 'Name and slug are required',
        });
      }

      if (!Array.isArray(fields)) {
        return res.status(400).json({
          success: false,
          error: 'Fields must be an array',
        });
      }

      // Check if slug already exists for this tenant
      const existingContentType = await ContentType.findOne({
        tenantId,
        slug,
      });

      if (existingContentType) {
        return res.status(400).json({
          success: false,
          error: 'Content type slug already exists for this tenant',
        });
      }

      const contentType = await ContentType.create({
        tenantId,
        name,
        slug,
        description,
        fields,
      });

      res.status(201).json({
        success: true,
        data: contentType,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Update content type schema (admin/editor)
router.patch(
  '/:tenantId/:contentTypeId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin', 'editor'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, contentTypeId } = req.params;
      const { name, description, fields } = req.body;

      const contentType = await ContentType.findOneAndUpdate(
        { _id: contentTypeId, tenantId },
        { name, description, fields },
        { new: true, runValidators: true }
      );

      if (!contentType) {
        return res.status(404).json({
          success: false,
          error: 'Content type not found',
        });
      }

      res.json({
        success: true,
        data: contentType,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Delete content type schema (admin only)
router.delete(
  '/:tenantId/:contentTypeId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, contentTypeId } = req.params;

      const contentType = await ContentType.findOneAndDelete({
        _id: contentTypeId,
        tenantId,
      });

      if (!contentType) {
        return res.status(404).json({
          success: false,
          error: 'Content type not found',
        });
      }

      res.json({
        success: true,
        message: 'Content type deleted successfully',
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

