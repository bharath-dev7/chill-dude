import { NextFunction, Request, Response } from 'express';
import env from '../config/env';
import { HttpError } from '../lib/httpError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    message: 'Internal server error',
    ...(env.NODE_ENV !== 'production' && err instanceof Error ? { details: err.message } : {}),
  });
}
