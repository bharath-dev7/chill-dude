import jwt from 'jsonwebtoken';
import env from '../../config/env';
import { HttpError } from '../../lib/httpError';
import { AuthTokenPayload } from './auth.types';

export function signAuthToken(payload: AuthTokenPayload): string {
  const secret: jwt.Secret = env.JWT_SECRET;
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'];

  if (!expiresIn) {
    throw new Error('JWT_EXPIRES_IN is not configured');
  }

  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}
