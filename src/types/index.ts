// src/types/index.ts
import { Request, Response, NextFunction } from 'express';

export interface ITenant {
  _id?: any;
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  _id?: any;
  email: string;
  password: string;
  tenantId: any;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword?: (password: string) => Promise<boolean>;
}

export interface ISchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'richtext' | 'array' | 'reference';
  required: boolean;
  defaultValue?: any;
  description?: string;
  referenceType?: string;
  arrayItemType?: string;
}

export interface IContentType {
  _id?: any;
  tenantId: any;
  name: string;
  slug: string;
  description?: string;
  fields: ISchemaField[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContent {
  _id?: any;
  tenantId: any;
  contentTypeId: any;
  contentTypeSlug: string;
  data: Record<string, any>;
  isDraft: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: any;
  updatedBy: any;
}

export interface IJWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface IAuthRequest extends Request {
  user?: IJWTPayload;
  tenantId?: string;
  body: any;
  params: any;
  query: any;
  headers: any;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

