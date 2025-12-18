// src/middleware/roleBasedAccess.ts
import { IAuthRequest } from '../types';
import { Response, NextFunction } from 'express';

type Role = 'admin' | 'editor' | 'viewer';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied: requires one of roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

