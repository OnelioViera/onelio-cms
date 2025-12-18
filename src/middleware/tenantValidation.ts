// src/middleware/tenantValidation.ts
import { IAuthRequest } from '../types';
import { Response, NextFunction } from 'express';

export const validateTenantAccess = (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const tenantIdFromUrl = (req as any).params?.tenantId;
  const tenantIdFromBody = (req as any).body?.tenantId;
  const tenantIdFromAuth = req.user.tenantId;

  const requestedTenantId = tenantIdFromUrl || tenantIdFromBody;

  if (requestedTenantId && requestedTenantId !== tenantIdFromAuth) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: you do not have permission to access this tenant',
    });
  }

  req.tenantId = tenantIdFromAuth;
  next();
};

