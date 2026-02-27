import { z } from 'zod';

export const registerBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1).max(80).optional(),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
});
