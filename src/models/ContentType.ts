// src/models/ContentType.ts
import mongoose, { Schema } from 'mongoose';

const ContentTypeSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: String,
    fields: {
      type: [
        {
          name: { type: String, required: true },
          type: {
            type: String,
            enum: ['string', 'number', 'boolean', 'date', 'richtext', 'array', 'reference'],
            required: true,
          },
          required: Boolean,
          defaultValue: mongoose.Schema.Types.Mixed,
          description: String,
          referenceType: String,
          arrayItemType: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

ContentTypeSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export const ContentType = mongoose.model('ContentType', ContentTypeSchema);

