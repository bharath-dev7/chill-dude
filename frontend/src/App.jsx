import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { getAuthToken } from './lib/apiClient';
import DashboardPage from './pages/DashboardPage';
import DiaryPage from './pages/DiaryPage';
import FocusPage from './pages/FocusPage';
import InsightsPage from './pages/InsightsPage';
import JournalPage from './pages/JournalPage';
import LoginPage from './pages/LoginPage';
import MoodScanPage from './pages/MoodScanPage';
import ProfilePage from './pages/ProfilePage';
import RelaxPage from './pages/RelaxPage';
import TasksPage from './pages/TasksPage';

function ProtectedRoute({ children }) {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function FlowEntryRoute() {
  const { hasTodayFaceScan, hasTodayJournal, isHydrating } = useAppState();

  if (isHydrating) {
    return (
      <div className="app-shell">
        <div className="page-wrap">
          <div className="panel-strong p-6 text-sm text-slate-600">Syncing your daily state...</div>
        </div>
      </div>
    );
  }

  if (!hasTodayFaceScan) {
    return <Navigate to="/scan" replace />;
  }

  if (!hasTodayJournal) {
    return <Navigate to="/journal" replace />;
  }

  return <Navigate to="/recommendation" replace />;
}

function LoginGateRoute() {
  const token = getAuthToken();
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGateRoute />} />

      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <FlowEntryRoute />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/scan"
        element={(
          <ProtectedRoute>
            <MoodScanPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/journal"
        element={(
          <ProtectedRoute>
            <JournalPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/recommendation"
        element={(
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )}
      />
      <Route path="/dashboard" element={<Navigate to="/recommendation" replace />} />

      <Route
        path="/focus"
        element={(
          <ProtectedRoute>
            <FocusPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/relax"
        element={(
          <ProtectedRoute>
            <RelaxPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/diary"
        element={(
          <ProtectedRoute>
            <DiaryPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/tasks"
        element={(
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/insights"
        element={(
          <ProtectedRoute>
            <InsightsPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppStateProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppStateProvider>
  );
}

export default App;
