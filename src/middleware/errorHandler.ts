// src/middleware/errorHandler.ts
import { IAuthRequest } from '../types';
import { Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
): any => {
  const isDev = process.env.NODE_ENV === 'development';

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(isDev && { stack: err.stack }),
    });
  }

  if ((err as any).name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((e: any) => e.message)
      .join(', ');
    return res.status(400).json({
      success: false,
      error: `Validation error: ${message}`,
    });
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  res.status(500).json({
    success: false,
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
};
