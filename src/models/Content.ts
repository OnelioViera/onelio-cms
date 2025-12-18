// src/models/Content.ts
import mongoose, { Schema } from 'mongoose';

const ContentSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    contentTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'ContentType',
      required: true,
    },
    contentTypeSlug: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    publishedAt: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

ContentSchema.index({ tenantId: 1, contentTypeId: 1 });
ContentSchema.index({ tenantId: 1, contentTypeSlug: 1 });

export const Content = mongoose.model('Content', ContentSchema);

