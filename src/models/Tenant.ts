// src/models/Tenant.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ITenant } from '../types';

interface ITenantDocument extends Document, Omit<ITenant, '_id' | 'createdAt' | 'updatedAt'> {}

const TenantSchema = new Schema<ITenantDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },
    description: String,
  },
  { timestamps: true }
);

export const Tenant = mongoose.model<ITenantDocument>('Tenant', TenantSchema);

