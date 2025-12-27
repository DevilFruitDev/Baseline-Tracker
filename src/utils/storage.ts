import { Session } from '../types';

const STORAGE_KEY = 'baseline_tracker_sessions';

export function getAllSessions(): Session[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Session[];
  } catch (error) {
    console.error('Error reading sessions from localStorage:', error);
    return [];
  }
}

export function saveSession(session: Session): void {
  try {
    const sessions = getAllSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    // Sort by date descending (most recent first)
    sessions.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
  }
}

export function deleteSession(sessionId: string): void {
  try {
    const sessions = getAllSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error deleting session from localStorage:', error);
  }
}

export function getSessionById(sessionId: string): Session | undefined {
  return getAllSessions().find((s) => s.id === sessionId);
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
