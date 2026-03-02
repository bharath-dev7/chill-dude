import { z } from 'zod';

export const scanBodySchema = z.object({
  emotion: z.enum(['calm', 'neutral', 'tired', 'stressed', 'happy']),
  confidence: z.number().min(0).max(1).default(0.7),
});

export const journalBodySchema = z.object({
  text: z.string().trim().min(1, 'Journal entry cannot be empty').max(6000),
});

export const taskBodySchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(140),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD').optional(),
});

export const taskParamsSchema = z.object({
  taskId: z.string().uuid('Invalid task id'),
});

export const timetableBodySchema = z.object({
  load: z.enum(['light', 'medium', 'heavy']),
});

export const sessionBodySchema = z.object({
  minutes: z.coerce.number().int().min(1).max(240),
});
