// src/routes/content.ts
import { Router } from 'express';
import { Content } from '../models/Content';
import { ContentType } from '../models/ContentType';
import { authMiddleware } from '../middleware/auth';
import { validateTenantAccess } from '../middleware/tenantValidation';
import { requireRole } from '../middleware/roleBasedAccess';
import { IAuthRequest } from '../types';

const router = Router();

// Get all content entries for a content type
router.get(
  '/:tenantId/:contentTypeSlug',
  authMiddleware,
  validateTenantAccess,
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, contentTypeSlug } = req.params;
      const { isDraft } = req.query;

      let query: any = {
        tenantId,
        contentTypeSlug,
      };

      // Filter by draft status if specified
      if (isDraft !== undefined) {
        query.isDraft = isDraft === 'true';
      }

      const content = await Content.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Get single content entry by ID
router.get(
  '/:tenantId/:contentTypeSlug/:contentId',
  authMiddleware,
  validateTenantAccess,
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, contentTypeSlug, contentId } = req.params;

      const content = await Content.findOne({
        _id: contentId,
        tenantId,
        contentTypeSlug,
      })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found',
        });
      }

      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Create new content entry (admin/editor)
router.post(
  '/:tenantId/:contentTypeSlug',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin', 'editor'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, contentTypeSlug } = req.params;
      const { data, isDraft } = req.body;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      // Get content type to validate schema
      const contentType = await ContentType.findOne({
        tenantId,
        slug: contentTypeSlug,
      });

      if (!contentType) {
        return res.status(404).json({
          success: false,
          error: 'Content type not found',
        });
      }

      const content = await Content.create({
        tenantId,
        contentTypeId: contentType._id,
        contentTypeSlug,
        data,
        isDraft: isDraft !== false,
        createdBy: req.user.userId,
        updatedBy: req.user.userId,
      });

      const populatedContent = await Content.findById(content._id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      res.status(201).json({
        success: true,
        data: populatedContent,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Update content entry (admin/editor)
router.patch(
  '/:tenantId/:contentTypeSlug/:contentId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin', 'editor'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, contentTypeSlug, contentId } = req.params;
      const { data, isDraft } = req.body;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const content = await Content.findOneAndUpdate(
        {
          _id: contentId,
          tenantId,
          contentTypeSlug,
        },
        {
          data,
          isDraft,
          updatedBy: req.user.userId,
        },
        { new: true, runValidators: true }
      )
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found',
        });
      }

      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Publish content (move from draft to published)
router.post(
  '/:tenantId/:contentTypeSlug/:contentId/publish',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin', 'editor'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, contentTypeSlug, contentId } = req.params;

      const content = await Content.findOneAndUpdate(
        {
          _id: contentId,
          tenantId,
          contentTypeSlug,
        },
        {
          isDraft: false,
          publishedAt: new Date(),
        },
        { new: true }
      )
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found',
        });
      }

      res.json({
        success: true,
        message: 'Content published successfully',
        data: content,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Delete content entry (admin only)
router.delete(
  '/:tenantId/:contentTypeSlug/:contentId',
  authMiddleware,
  validateTenantAccess,
  requireRole('admin'),
  async (req: IAuthRequest, res) => {
    try {
      const { tenantId, contentTypeSlug, contentId } = req.params;

      const content = await Content.findOneAndDelete({
        _id: contentId,
        tenantId,
        contentTypeSlug,
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found',
        });
      }

      res.json({
        success: true,
        message: 'Content deleted successfully',
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

