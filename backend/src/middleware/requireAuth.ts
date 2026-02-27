import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/httpError';
import { verifyAuthToken } from '../modules/auth/auth.token';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header) {
    next(new HttpError(401, 'Authorization header is required'));
    return;
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(new HttpError(401, 'Authorization format must be: Bearer <token>'));
    return;
  }

  req.auth = verifyAuthToken(token);
  next();
}
