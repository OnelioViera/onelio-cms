// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

interface IUserDocument extends Document, Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'tenantId'> {
  tenantId: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'editor',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next: any) {
  if (!this.isModified('password')) return next();
  try {
    const bcrypt = require('bcryptjs');
    (this as any).password = await bcrypt.hash((this as any).password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, (this as any).password);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);

