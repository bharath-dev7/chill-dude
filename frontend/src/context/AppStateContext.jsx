/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, getAuthToken, isLocalDemoToken } from '../lib/apiClient';
import { decideRecommendation } from '../lib/recommendation';

const DRAFT_STORAGE_KEY = 'chill_dude_draft_journal';
const FACE_SCAN_STORAGE_KEY = 'chill_dude_face_scan';
const LOCAL_ENTRIES_STORAGE_KEY = 'chill_dude_local_entries';
const LOCAL_TASKS_STORAGE_KEY = 'chill_dude_local_tasks';
const LOCAL_TIMETABLE_STORAGE_KEY = 'chill_dude_local_timetable';
const LOCAL_FOCUS_SESSIONS_STORAGE_KEY = 'chill_dude_local_focus_sessions';
const LOCAL_RELAX_SESSIONS_STORAGE_KEY = 'chill_dude_local_relax_sessions';

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readStoredFaceScan(todayKey = getTodayKey()) {
  try {
    const raw = localStorage.getItem(FACE_SCAN_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.dateKey !== todayKey) {
      return null;
    }

    return {
      emotion: parsed.emotion || 'neutral',
      confidence: Number(parsed.confidence) || 0.55,
      dateKey: parsed.dateKey,
      capturedAt: parsed.capturedAt || new Date().toISOString(),
      source: 'local-js',
    };
  } catch {
    return null;
  }
}

function readStoredEntries() {
  try {
    const raw = localStorage.getItem(LOCAL_ENTRIES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredTasks() {
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredTimetable(todayKey = getTodayKey()) {
  try {
    const raw = localStorage.getItem(LOCAL_TIMETABLE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.dateKey !== todayKey) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function readStoredSessions(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getLastDateKeys(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - index - 1));
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
}

function buildStressTrend(entries, count = 7) {
  const keys = getLastDateKeys(count);
  return keys.map((day) => {
    const entry = entries.find((item) => item.dateKey === day);
    return {
      day,
      stress: entry ? entry.recommendation.stressScore : null,
    };
  });
}

function buildFocusTrend(sessions, count = 7) {
  const keys = getLastDateKeys(count);
  return keys.map((day) => ({
    day,
    minutes: sessions
      .filter((session) => session.dateKey === day)
      .reduce((sum, session) => sum + session.minutes, 0),
  }));
}

function mergeDiaryEntries(localEntries, serverEntries) {
  const byDate = new Map();

  localEntries.forEach((entry) => {
    byDate.set(entry.dateKey, entry);
  });

  serverEntries.forEach((entry) => {
    byDate.set(entry.dateKey, entry);
  });

  return [...byDate.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function mergeTasks(localTasks, serverTasks) {
  const byId = new Map();

  serverTasks.forEach((task) => {
    byId.set(task.id, task);
  });

  localTasks.forEach((task) => {
    byId.set(task.id, task);
  });

  return [...byId.values()].sort((a, b) => Number(a.completed) - Number(b.completed));
}

function mergeSessions(localSessions, serverSessions) {
  const byId = new Map();

  serverSessions.forEach((session) => {
    byId.set(session.id, session);
  });

  localSessions.forEach((session) => {
    byId.set(session.id, session);
  });

  return [...byId.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function createDefaultServerState() {
  return {
    todayKey: getTodayKey(),
    todayFaceScan: null,
    todayEntry: null,
    diaryEntries: [],
    tasks: [],
    timetableLoadToday: 'medium',
    focusSessions: [],
    relaxSessions: [],
    insights: {
      stressTrend: [],
      focusTrend: [],
    },
    notifications: [],
  };
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [serverState, setServerState] = useState(() => createDefaultServerState());
  const [draftJournal, setDraftJournal] = useState(() => localStorage.getItem(DRAFT_STORAGE_KEY) || '');
  const [localFaceScan, setLocalFaceScan] = useState(() => readStoredFaceScan());
  const [localEntries, setLocalEntries] = useState(() => readStoredEntries());
  const [localTasks, setLocalTasks] = useState(() => readStoredTasks());
  const [localTimetable, setLocalTimetable] = useState(() => readStoredTimetable());
  const [localFocusSessions, setLocalFocusSessions] = useState(() => readStoredSessions(LOCAL_FOCUS_SESSIONS_STORAGE_KEY));
  const [localRelaxSessions, setLocalRelaxSessions] = useState(() => readStoredSessions(LOCAL_RELAX_SESSIONS_STORAGE_KEY));
  const [isHydrating, setIsHydrating] = useState(true);
  const [syncError, setSyncError] = useState('');

  const refreshState = useCallback(async () => {
    const token = getAuthToken();
    if (!token || isLocalDemoToken(token)) {
      setServerState(createDefaultServerState());
      setSyncError('');
      setIsHydrating(false);
      return;
    }

    setIsHydrating(true);
    try {
      const state = await apiFetch('/api/app/state');
      setServerState({
        ...createDefaultServerState(),
        ...state,
      });
      setSyncError('');
    } catch (error) {
      setSyncError(error.message || 'Failed to sync app data.');
    } finally {
      setIsHydrating(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  useEffect(() => {
    function handleAuthChange() {
      refreshState();
    }

    window.addEventListener('auth-token-changed', handleAuthChange);
    return () => window.removeEventListener('auth-token-changed', handleAuthChange);
  }, [refreshState]);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, draftJournal);
  }, [draftJournal]);

  useEffect(() => {
    setLocalFaceScan(readStoredFaceScan(serverState.todayKey));
    setLocalTimetable(readStoredTimetable(serverState.todayKey));
  }, [serverState.todayKey]);

  const setFaceScan = useCallback(async (signal) => {
    try {
      const scan = {
        emotion: signal.emotion,
        confidence: signal.confidence,
        dateKey: getTodayKey(),
        capturedAt: new Date().toISOString(),
        source: 'local-js',
      };
      localStorage.setItem(FACE_SCAN_STORAGE_KEY, JSON.stringify(scan));
      setLocalFaceScan(scan);
      setSyncError('');
      return scan;
    } catch {
      setSyncError('Unable to save face scan on this device.');
      return null;
    }
  }, []);

  const saveJournalDraft = useCallback((text) => {
    setDraftJournal(text);
  }, []);

  const activeFaceScan = localFaceScan || serverState.todayFaceScan;
  const activeDiaryEntries = useMemo(
    () => mergeDiaryEntries(localEntries, serverState.diaryEntries),
    [localEntries, serverState.diaryEntries],
  );
  const activeTasks = useMemo(
    () => mergeTasks(localTasks, serverState.tasks),
    [localTasks, serverState.tasks],
  );
  const activeFocusSessions = useMemo(
    () => mergeSessions(localFocusSessions, serverState.focusSessions),
    [localFocusSessions, serverState.focusSessions],
  );
  const activeRelaxSessions = useMemo(
    () => mergeSessions(localRelaxSessions, serverState.relaxSessions),
    [localRelaxSessions, serverState.relaxSessions],
  );
  const activeTodayEntry = useMemo(
    () => activeDiaryEntries.find((entry) => entry.dateKey === serverState.todayKey) || null,
    [activeDiaryEntries, serverState.todayKey],
  );
  const activeTimetableLoad = localTimetable?.dateKey === serverState.todayKey
    ? localTimetable.load
    : serverState.timetableLoadToday;
  const activeNotifications = useMemo(() => {
    const notifications = [...(serverState.notifications || [])];
    const pendingTasks = activeTasks.filter((task) => !task.completed);

    if (notifications.length === 0 && (activeTimetableLoad === 'heavy' || pendingTasks.length >= 4)) {
      notifications.push('Today is likely to feel heavy. Start with a short session to build momentum.');
    }

    const dueToday = pendingTasks.find((task) => task.dueDate === serverState.todayKey);
    if (dueToday && !notifications.some((item) => item.includes(dueToday.title))) {
      notifications.push(`I think today is the day for "${dueToday.title}".`);
    }

    const recentStress = activeDiaryEntries
      .slice(0, 3)
      .map((entry) => entry.recommendation.stressScore);

    if (notifications.length < 3 && recentStress.length === 3) {
      const avg = recentStress.reduce((sum, score) => sum + score, 0) / 3;
      if (avg >= 66) {
        notifications.push('Stress has been elevated for several days. Take a short break and check in with someone you trust.');
      }
    }

    return notifications;
  }, [activeDiaryEntries, activeTasks, activeTimetableLoad, serverState.notifications, serverState.todayKey]);
  const activeInsights = useMemo(() => ({
    stressTrend: buildStressTrend(activeDiaryEntries),
    focusTrend: buildFocusTrend(activeFocusSessions),
  }), [activeDiaryEntries, activeFocusSessions]);

  const submitTodayJournal = useCallback(async (journalText) => {
    const trimmed = (journalText || '').trim();
    if (!trimmed) {
      return { ok: false, error: 'Journal entry cannot be empty.' };
    }

    if (activeTodayEntry) {
      return { ok: false, error: 'Today\'s journal is already submitted and read-only.' };
    }

    try {
      if (isLocalDemoToken(getAuthToken())) {
        throw new Error('Local demo mode');
      }
      const payload = await apiFetch('/api/app/journal', {
        method: 'POST',
        body: JSON.stringify({ text: trimmed }),
      });
      setDraftJournal('');
      setLocalEntries((previous) => {
        const next = previous.filter((entry) => entry.dateKey !== serverState.todayKey);
        localStorage.setItem(LOCAL_ENTRIES_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      await refreshState();
      return { ok: true, entry: payload.entry };
    } catch (error) {
      const recommendation = decideRecommendation({
        faceSignal: activeFaceScan || { emotion: 'neutral', confidence: 0.5 },
        journalText: trimmed,
      });
      const localEntry = {
        id: `local-${serverState.todayKey}`,
        dateKey: serverState.todayKey,
        submittedAt: new Date().toISOString(),
        text: trimmed,
        summary: recommendation.summary,
        recommendation: {
          mode: recommendation.mode,
          stressScore: recommendation.stressScore,
          reasons: recommendation.reasons,
          signals: recommendation.signals,
        },
        source: 'local-js',
      };

      setLocalEntries((previous) => {
        const next = [localEntry, ...previous.filter((entry) => entry.dateKey !== serverState.todayKey)];
        localStorage.setItem(LOCAL_ENTRIES_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setDraftJournal('');
      setSyncError('Backend unavailable. Journal saved locally on this device.');
      return { ok: true, entry: localEntry, localOnly: true, fallbackError: error.message || 'Unable to submit journal.' };
    }
  }, [activeFaceScan, activeTodayEntry, refreshState, serverState.todayKey]);

  const addTask = useCallback(async (title, dueDate) => {
    const clean = (title || '').trim();
    if (!clean) {
      return;
    }

    try {
      if (isLocalDemoToken(getAuthToken())) {
        throw new Error('Local demo mode');
      }
      await apiFetch('/api/app/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: clean, ...(dueDate ? { dueDate } : {}) }),
      });
      await refreshState();
    } catch {
      const localTask = {
        id: `local-task-${Date.now()}`,
        title: clean,
        dueDate: dueDate || null,
        completed: false,
      };
      setLocalTasks((previous) => {
        const next = [localTask, ...previous];
        localStorage.setItem(LOCAL_TASKS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setSyncError('Backend unavailable. Task saved locally on this device.');
    }
  }, [refreshState]);

  const toggleTask = useCallback(async (taskId) => {
    try {
      if (isLocalDemoToken(getAuthToken())) {
        throw new Error('Local demo mode');
      }
      await apiFetch(`/api/app/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });
      await refreshState();
    } catch {
      setLocalTasks((previous) => {
        const existing = previous.find((task) => task.id === taskId);
        const activeTask = activeTasks.find((task) => task.id === taskId);
        const next = existing
          ? previous.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
          : [{ ...(activeTask || { id: taskId, title: 'Task', dueDate: null, completed: false }), completed: !(activeTask?.completed ?? false) }, ...previous];
        localStorage.setItem(LOCAL_TASKS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setSyncError('Backend unavailable. Task state updated locally on this device.');
    }
  }, [activeTasks, refreshState]);

  const setTimetableLoad = useCallback(async (load) => {
    try {
      if (isLocalDemoToken(getAuthToken())) {
        throw new Error('Local demo mode');
      }
      await apiFetch('/api/app/timetable/today', {
        method: 'PUT',
        body: JSON.stringify({ load }),
      });
      await refreshState();
    } catch {
      const localDay = {
        dateKey: serverState.todayKey,
        load,
      };
      localStorage.setItem(LOCAL_TIMETABLE_STORAGE_KEY, JSON.stringify(localDay));
      setLocalTimetable(localDay);
      setSyncError('Backend unavailable. Timetable load saved locally on this device.');
    }
  }, [refreshState, serverState.todayKey]);

  const logFocusSession = useCallback(async (minutes) => {
    if (!minutes || minutes <= 0) {
      return;
    }

    try {
      if (isLocalDemoToken(getAuthToken())) {
        throw new Error('Local demo mode');
      }
      await apiFetch('/api/app/sessions/focus', {
        method: 'POST',
        body: JSON.stringify({ minutes }),
      });
      await refreshState();
    } catch {
      const localSession = {
        id: `local-focus-${Date.now()}`,
        dateKey: serverState.todayKey,
        minutes,
        createdAt: new Date().toISOString(),
      };
      setLocalFocusSessions((previous) => {
        const next = [localSession, ...previous];
        localStorage.setItem(LOCAL_FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setSyncError('Backend unavailable. Focus session saved locally on this device.');
    }
  }, [refreshState, serverState.todayKey]);

  const logRelaxSession = useCallback(async (minutes) => {
    if (!minutes || minutes <= 0) {
      return;
    }

    try {
      if (isLocalDemoToken(getAuthToken())) {
        throw new Error('Local demo mode');
      }
      await apiFetch('/api/app/sessions/relax', {
        method: 'POST',
        body: JSON.stringify({ minutes }),
      });
      await refreshState();
    } catch {
      const localSession = {
        id: `local-relax-${Date.now()}`,
        dateKey: serverState.todayKey,
        minutes,
        createdAt: new Date().toISOString(),
      };
      setLocalRelaxSessions((previous) => {
        const next = [localSession, ...previous];
        localStorage.setItem(LOCAL_RELAX_SESSIONS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setSyncError('Backend unavailable. Relax session saved locally on this device.');
    }
  }, [refreshState, serverState.todayKey]);

  const value = useMemo(() => ({
    todayKey: serverState.todayKey,
    todayFaceScan: activeFaceScan,
    todayEntry: activeTodayEntry,
    draftJournal,
    diaryEntries: activeDiaryEntries,
    tasks: activeTasks,
    timetableLoadToday: activeTimetableLoad,
    focusSessions: activeFocusSessions,
    relaxSessions: activeRelaxSessions,
    insights: activeInsights,
    notifications: activeNotifications,
    isHydrating,
    syncError,
    hasTodayFaceScan: Boolean(activeFaceScan),
    hasTodayJournal: Boolean(activeTodayEntry),
    refreshState,
    setFaceScan,
    saveJournalDraft,
    submitTodayJournal,
    addTask,
    toggleTask,
    setTimetableLoad,
    logFocusSession,
    logRelaxSession,
  }), [
    addTask,
    activeDiaryEntries,
    activeFocusSessions,
    activeNotifications,
    activeRelaxSessions,
    activeTasks,
    activeTimetableLoad,
    draftJournal,
    activeInsights,
    activeTodayEntry,
    isHydrating,
    logFocusSession,
    logRelaxSession,
    refreshState,
    saveJournalDraft,
    serverState.todayKey,
    activeFaceScan,
    setFaceScan,
    setTimetableLoad,
    submitTodayJournal,
    syncError,
    toggleTask,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
