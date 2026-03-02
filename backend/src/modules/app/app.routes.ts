import { DayLoad } from '@prisma/client';
import { Request, Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../lib/httpError';
import { requireAuth } from '../../middleware/requireAuth';
import {
  createTask,
  getAppState,
  logFocusSession,
  logRelaxSession,
  setTodayTimetableLoad,
  submitDailyJournal,
  toggleTask,
  upsertDailyScan,
} from './app.service';
import {
  journalBodySchema,
  scanBodySchema,
  sessionBodySchema,
  taskBodySchema,
  taskParamsSchema,
  timetableBodySchema,
} from './app.schema';

const router = Router();

function parseBody<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join(', ');
    throw new HttpError(400, details || 'Invalid request body');
  }

  return parsed.data;
}

function parseParams<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join(', ');
    throw new HttpError(400, details || 'Invalid route parameters');
  }

  return parsed.data;
}

function getUserId(req: Request): string {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new HttpError(401, 'Unauthorized');
  }

  return userId;
}

router.use(requireAuth);

router.get('/state', async (req, res) => {
  const state = await getAppState(getUserId(req));
  res.json(state);
});

router.get('/insights/weekly', async (req, res) => {
  const state = await getAppState(getUserId(req));
  res.json(state.insights);
});

router.post('/scan', async (req, res) => {
  const body = parseBody(scanBodySchema, req.body);
  const scan = await upsertDailyScan(getUserId(req), body);

  res.status(201).json({
    scan,
  });
});

router.post('/journal', async (req, res) => {
  const body = parseBody(journalBodySchema, req.body);
  const entry = await submitDailyJournal(getUserId(req), body.text);

  res.status(201).json({
    entry,
  });
});

router.post('/tasks', async (req, res) => {
  const body = parseBody(taskBodySchema, req.body);
  const task = await createTask(getUserId(req), body.title, body.dueDate);

  res.status(201).json({
    task,
  });
});

router.patch('/tasks/:taskId/toggle', async (req, res) => {
  const params = parseParams(taskParamsSchema, req.params);
  const task = await toggleTask(getUserId(req), params.taskId);

  res.json({
    task,
  });
});

router.put('/timetable/today', async (req, res) => {
  const body = parseBody(timetableBodySchema, req.body);
  const timetable = await setTodayTimetableLoad(getUserId(req), body.load as DayLoad);

  res.json({
    timetable,
  });
});

router.post('/sessions/focus', async (req, res) => {
  const body = parseBody(sessionBodySchema, req.body);
  const session = await logFocusSession(getUserId(req), body.minutes);

  res.status(201).json({
    session,
  });
});

router.post('/sessions/relax', async (req, res) => {
  const body = parseBody(sessionBodySchema, req.body);
  const session = await logRelaxSession(getUserId(req), body.minutes);

  res.status(201).json({
    session,
  });
});

export default router;

