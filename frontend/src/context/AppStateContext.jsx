/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, getAuthToken } from '../lib/apiClient';

const DRAFT_STORAGE_KEY = 'chill_dude_draft_journal';

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [isHydrating, setIsHydrating] = useState(true);
  const [syncError, setSyncError] = useState('');

  const refreshState = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
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

  const setFaceScan = useCallback(async (signal) => {
    try {
      const payload = await apiFetch('/api/app/scan', {
        method: 'POST',
        body: JSON.stringify({
          emotion: signal.emotion,
          confidence: signal.confidence,
        }),
      });
      await refreshState();
      return payload.scan;
    } catch (error) {
      setSyncError(error.message || 'Unable to save face scan.');
      return null;
    }
  }, [refreshState]);

  const saveJournalDraft = useCallback((text) => {
    setDraftJournal(text);
  }, []);

  const submitTodayJournal = useCallback(async (journalText) => {
    const trimmed = (journalText || '').trim();
    if (!trimmed) {
      return { ok: false, error: 'Journal entry cannot be empty.' };
    }

    try {
      const payload = await apiFetch('/api/app/journal', {
        method: 'POST',
        body: JSON.stringify({ text: trimmed }),
      });
      setDraftJournal('');
      await refreshState();
      return { ok: true, entry: payload.entry };
    } catch (error) {
      return { ok: false, error: error.message || 'Unable to submit journal.' };
    }
  }, [refreshState]);

  const addTask = useCallback(async (title, dueDate) => {
    const clean = (title || '').trim();
    if (!clean) {
      return;
    }

    try {
      await apiFetch('/api/app/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: clean, ...(dueDate ? { dueDate } : {}) }),
      });
      await refreshState();
    } catch (error) {
      setSyncError(error.message || 'Unable to add task.');
    }
  }, [refreshState]);

  const toggleTask = useCallback(async (taskId) => {
    try {
      await apiFetch(`/api/app/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });
      await refreshState();
    } catch (error) {
      setSyncError(error.message || 'Unable to update task.');
    }
  }, [refreshState]);

  const setTimetableLoad = useCallback(async (load) => {
    try {
      await apiFetch('/api/app/timetable/today', {
        method: 'PUT',
        body: JSON.stringify({ load }),
      });
      await refreshState();
    } catch (error) {
      setSyncError(error.message || 'Unable to set timetable load.');
    }
  }, [refreshState]);

  const logFocusSession = useCallback(async (minutes) => {
    if (!minutes || minutes <= 0) {
      return;
    }

    try {
      await apiFetch('/api/app/sessions/focus', {
        method: 'POST',
        body: JSON.stringify({ minutes }),
      });
      await refreshState();
    } catch (error) {
      setSyncError(error.message || 'Unable to log focus session.');
    }
  }, [refreshState]);

  const logRelaxSession = useCallback(async (minutes) => {
    if (!minutes || minutes <= 0) {
      return;
    }

    try {
      await apiFetch('/api/app/sessions/relax', {
        method: 'POST',
        body: JSON.stringify({ minutes }),
      });
      await refreshState();
    } catch (error) {
      setSyncError(error.message || 'Unable to log relax session.');
    }
  }, [refreshState]);

  const value = useMemo(() => ({
    todayKey: serverState.todayKey,
    todayFaceScan: serverState.todayFaceScan,
    todayEntry: serverState.todayEntry,
    draftJournal,
    diaryEntries: serverState.diaryEntries,
    tasks: serverState.tasks,
    timetableLoadToday: serverState.timetableLoadToday,
    focusSessions: serverState.focusSessions,
    relaxSessions: serverState.relaxSessions,
    insights: serverState.insights,
    notifications: serverState.notifications || [],
    isHydrating,
    syncError,
    hasTodayFaceScan: Boolean(serverState.todayFaceScan),
    hasTodayJournal: Boolean(serverState.todayEntry),
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
    draftJournal,
    isHydrating,
    logFocusSession,
    logRelaxSession,
    refreshState,
    saveJournalDraft,
    serverState.diaryEntries,
    serverState.focusSessions,
    serverState.insights,
    serverState.notifications,
    serverState.relaxSessions,
    serverState.tasks,
    serverState.timetableLoadToday,
    serverState.todayEntry,
    serverState.todayFaceScan,
    serverState.todayKey,
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
