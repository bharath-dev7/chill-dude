import { DayLoad, DailyEntry, DailyScan, FocusSession, Prisma, RecommendationMode, RelaxSession, Task, TimetableDay } from '@prisma/client';
import prisma from '../../lib/prisma';
import { HttpError } from '../../lib/httpError';
import { decideRecommendation, getDateKey, getLastDateKeys, ScanSignalInput } from './app.logic';

type DailyEntryWithRecommendation = {
  id: string;
  dateKey: string;
  submittedAt: string;
  text: string;
  summary: string;
  recommendation: {
    mode: RecommendationMode;
    stressScore: number;
    reasons: string[];
    signals: Prisma.JsonValue;
  };
};

function toDailyEntryView(entry: DailyEntry): DailyEntryWithRecommendation {
  return {
    id: entry.id,
    dateKey: entry.dateKey,
    submittedAt: entry.submittedAt.toISOString(),
    text: entry.text,
    summary: entry.summary,
    recommendation: {
      mode: entry.recommendationMode,
      stressScore: entry.stressScore,
      reasons: entry.reasons,
      signals: entry.signals,
    },
  };
}

function toScanView(scan: DailyScan | null): { emotion: string; confidence: number; capturedAt: string } | null {
  if (!scan) {
    return null;
  }

  return {
    emotion: scan.emotion,
    confidence: scan.confidence,
    capturedAt: scan.updatedAt.toISOString(),
  };
}

function toTaskView(task: Task): { id: string; title: string; dueDate: string | null; completed: boolean } {
  return {
    id: task.id,
    title: task.title,
    dueDate: task.dueDate ?? null,
    completed: task.completed,
  };
}

function buildStressTrend(entries: DailyEntry[], keys: string[]): Array<{ day: string; stress: number | null }> {
  return keys.map((dateKey) => {
    const entry = entries.find((item) => item.dateKey === dateKey);
    return {
      day: dateKey,
      stress: entry ? entry.stressScore : null,
    };
  });
}

function buildFocusTrend(focusSessions: FocusSession[], keys: string[]): Array<{ day: string; minutes: number }> {
  return keys.map((dateKey) => {
    const minutes = focusSessions
      .filter((session) => session.dateKey === dateKey)
      .reduce((sum, session) => sum + session.minutes, 0);

    return {
      day: dateKey,
      minutes,
    };
  });
}

export async function getAppState(userId: string): Promise<{
  todayKey: string;
  todayFaceScan: { emotion: string; confidence: number; capturedAt: string } | null;
  todayEntry: DailyEntryWithRecommendation | null;
  diaryEntries: DailyEntryWithRecommendation[];
  tasks: Array<{ id: string; title: string; dueDate: string | null; completed: boolean }>;
  timetableLoadToday: DayLoad;
  focusSessions: Array<{ id: string; dateKey: string; minutes: number; createdAt: string }>;
  relaxSessions: Array<{ id: string; dateKey: string; minutes: number; createdAt: string }>;
  insights: {
    stressTrend: Array<{ day: string; stress: number | null }>;
    focusTrend: Array<{ day: string; minutes: number }>;
  };
  notifications: string[];
}> {
  const todayKey = getDateKey();

  const [todayScan, todayEntry, entries, tasks, timetableDay, focusSessions, relaxSessions] = await Promise.all([
    prisma.dailyScan.findUnique({ where: { userId_dateKey: { userId, dateKey: todayKey } } }),
    prisma.dailyEntry.findUnique({ where: { userId_dateKey: { userId, dateKey: todayKey } } }),
    prisma.dailyEntry.findMany({ where: { userId }, orderBy: { dateKey: 'desc' }, take: 90 }),
    prisma.task.findMany({ where: { userId }, orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }] }),
    prisma.timetableDay.findUnique({ where: { userId_dateKey: { userId, dateKey: todayKey } } }),
    prisma.focusSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 120 }),
    prisma.relaxSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 120 }),
  ]);

  const lastKeys = getLastDateKeys(7);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const notifications: string[] = [];

  if ((timetableDay?.load ?? DayLoad.medium) === DayLoad.heavy || pendingTasks.length >= 4) {
    notifications.push('Today is likely to feel heavy. Start with a short session to build momentum.');
  }

  const dueToday = pendingTasks.find((task) => task.dueDate === todayKey);
  if (dueToday) {
    notifications.push(`I think today is the day for "${dueToday.title}".`);
  }

  const recentStress = entries
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .slice(0, 3)
    .map((entry) => entry.stressScore);

  if (recentStress.length === 3) {
    const avg = recentStress.reduce((sum, score) => sum + score, 0) / 3;
    if (avg >= 66) {
      notifications.push('Stress has been elevated for several days. Take a short break and check in with someone you trust.');
    }
  }

  return {
    todayKey,
    todayFaceScan: toScanView(todayScan),
    todayEntry: todayEntry ? toDailyEntryView(todayEntry) : null,
    diaryEntries: entries.map(toDailyEntryView),
    tasks: tasks.map(toTaskView),
    timetableLoadToday: timetableDay?.load ?? DayLoad.medium,
    focusSessions: focusSessions.map((item: FocusSession) => ({
      id: item.id,
      dateKey: item.dateKey,
      minutes: item.minutes,
      createdAt: item.createdAt.toISOString(),
    })),
    relaxSessions: relaxSessions.map((item: RelaxSession) => ({
      id: item.id,
      dateKey: item.dateKey,
      minutes: item.minutes,
      createdAt: item.createdAt.toISOString(),
    })),
    insights: {
      stressTrend: buildStressTrend(entries, lastKeys),
      focusTrend: buildFocusTrend(focusSessions, lastKeys),
    },
    notifications,
  };
}

export async function upsertDailyScan(userId: string, signal: ScanSignalInput): Promise<{ emotion: string; confidence: number; capturedAt: string }> {
  const dateKey = getDateKey();

  const scan = await prisma.dailyScan.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    update: {
      emotion: signal.emotion,
      confidence: signal.confidence,
    },
    create: {
      userId,
      dateKey,
      emotion: signal.emotion,
      confidence: signal.confidence,
    },
  });

  return {
    emotion: scan.emotion,
    confidence: scan.confidence,
    capturedAt: scan.updatedAt.toISOString(),
  };
}

export async function submitDailyJournal(userId: string, text: string): Promise<DailyEntryWithRecommendation> {
  const dateKey = getDateKey();

  const existing = await prisma.dailyEntry.findUnique({ where: { userId_dateKey: { userId, dateKey } } });
  if (existing) {
    throw new HttpError(409, 'Today\'s journal is already submitted and read-only.');
  }

  const scan = await prisma.dailyScan.findUnique({ where: { userId_dateKey: { userId, dateKey } } });
  const signal = {
    emotion: scan?.emotion ?? 'neutral',
    confidence: scan?.confidence ?? 0.5,
  };

  const recommendation = decideRecommendation(signal, text);

  const entry = await prisma.dailyEntry.create({
    data: {
      userId,
      dateKey,
      text,
      summary: recommendation.summary,
      recommendationMode: recommendation.mode,
      stressScore: recommendation.stressScore,
      reasons: recommendation.reasons,
      signals: recommendation.signals,
    },
  });

  return toDailyEntryView(entry);
}

export async function createTask(userId: string, title: string, dueDate?: string): Promise<{ id: string; title: string; dueDate: string | null; completed: boolean }> {
  const task = await prisma.task.create({
    data: {
      userId,
      title,
      dueDate: dueDate || null,
      completed: false,
    },
  });

  return toTaskView(task);
}

export async function toggleTask(userId: string, taskId: string): Promise<{ id: string; title: string; dueDate: string | null; completed: boolean }> {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) {
    throw new HttpError(404, 'Task not found.');
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { completed: !task.completed },
  });

  return toTaskView(updated);
}

export async function setTodayTimetableLoad(userId: string, load: DayLoad): Promise<{ dateKey: string; load: DayLoad }> {
  const dateKey = getDateKey();

  const row = await prisma.timetableDay.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    update: { load },
    create: {
      userId,
      dateKey,
      load,
    },
  });

  return {
    dateKey: row.dateKey,
    load: row.load,
  };
}

export async function logFocusSession(userId: string, minutes: number): Promise<{ id: string; dateKey: string; minutes: number; createdAt: string }> {
  const session = await prisma.focusSession.create({
    data: {
      userId,
      dateKey: getDateKey(),
      minutes,
    },
  });

  return {
    id: session.id,
    dateKey: session.dateKey,
    minutes: session.minutes,
    createdAt: session.createdAt.toISOString(),
  };
}

export async function logRelaxSession(userId: string, minutes: number): Promise<{ id: string; dateKey: string; minutes: number; createdAt: string }> {
  const session = await prisma.relaxSession.create({
    data: {
      userId,
      dateKey: getDateKey(),
      minutes,
    },
  });

  return {
    id: session.id,
    dateKey: session.dateKey,
    minutes: session.minutes,
    createdAt: session.createdAt.toISOString(),
  };
}
