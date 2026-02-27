import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../lib/httpError';
import { requireAuth } from '../../middleware/requireAuth';
import { loginBodySchema, registerBodySchema } from './auth.schema';
import { getUserById, loginUser, registerUser, toAuthTokenPayload, toPublicUser } from './auth.service';
import { signAuthToken } from './auth.token';

const router = Router();

function parseBody<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join(', ');
    throw new HttpError(400, details || 'Invalid request body');
  }
  return parsed.data;
}

router.post('/register', async (req, res) => {
  const body = parseBody(registerBodySchema, req.body);
  const user = await registerUser(body);
  const token = signAuthToken(toAuthTokenPayload(user));

  res.status(201).json({
    token,
    user: toPublicUser(user),
  });
});

router.post('/login', async (req, res) => {
  const body = parseBody(loginBodySchema, req.body);
  const user = await loginUser(body);
  const token = signAuthToken(toAuthTokenPayload(user));

  res.json({
    token,
    user: toPublicUser(user),
  });
});

router.get('/me', requireAuth, async (req, res) => {
  if (!req.auth?.userId) {
    throw new HttpError(401, 'Unauthorized');
  }

  const user = await getUserById(req.auth.userId);
  res.json({
    user: toPublicUser(user),
  });
});

export default router;
