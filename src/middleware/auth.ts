// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IAuthRequest, IJWTPayload } from '../types';
import { Response, NextFunction } from 'express';

export const verifyToken = (token: string): IJWTPayload => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret as string) as IJWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateToken = (payload: Partial<IJWTPayload>): string => {
  return (jwt.sign as any)(payload, env.jwtSecret as string, {
    expiresIn: env.jwtExpire,
  });
};

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = ((req as any).headers as any)?.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    
    req.user = payload;
    req.tenantId = payload.tenantId;
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: (error as Error).message });
  }
};
