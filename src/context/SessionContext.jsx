import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

const SessionContext = createContext(null);

// ── localStorage helpers (web only, graceful fallback on native) ──
const LS_KEY = 'cartaon_pending_sessions';

function lsGet() {
  if (Platform.OS !== 'web') return new Map();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Map();
    return new Map(JSON.parse(raw));
  } catch { return new Map(); }
}

function lsSet(map) {
  if (Platform.OS !== 'web') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...map.entries()]));
  } catch {}
}

function lsClear() {
  if (Platform.OS !== 'web') return;
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export function SessionProvider({ children }) {
  // Initialize from localStorage so the user tab can read codes set by the instructor tab
  const [pendingSessions, setPendingSessions] = useState(() => lsGet());
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Listen for storage changes from other tabs (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e) => {
      if (e.key === LS_KEY) {
        setPendingSessions(lsGet());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeSession]);

  const generateCode = useCallback((studentName, instructorName, durationMinutes = 60) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingSessions(prev => {
      const next = new Map(prev);
      next.set(code, { studentName, instructorName, durationMinutes });
      lsSet(next); // persist for other tabs
      return next;
    });
    return code;
  }, []);

  const startSession = useCallback((code) => {
    const trimmed = code.trim();
    // Check both in-memory and localStorage (instructor may be in a different tab)
    const merged = new Map([...lsGet(), ...pendingSessions]);
    const session = merged.get(trimmed);
    if (!session) return false;
    setActiveSession({ ...session, code: trimmed, startTime: Date.now() });
    setElapsedSeconds(0);
    setPendingSessions(prev => {
      const next = new Map(prev);
      next.delete(trimmed);
      lsSet(next);
      return next;
    });
    return true;
  }, [pendingSessions]);

  const endSession = useCallback(() => {
    setActiveSession(null);
    setElapsedSeconds(0);
    lsClear();
  }, []);

  // Latest pending code (last inserted entry)
  const latestPendingCode = pendingSessions.size > 0
    ? [...pendingSessions.entries()][pendingSessions.size - 1]
    : null;

  const isCompleted = activeSession?.durationMinutes
    ? elapsedSeconds >= activeSession.durationMinutes * 60
    : false;

  return (
    <SessionContext.Provider value={{
      pendingSessions,
      activeSession,
      elapsedSeconds,
      isCompleted,
      latestPendingCode,
      generateCode,
      startSession,
      endSession,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
