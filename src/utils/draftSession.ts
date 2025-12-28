import { Result } from '../types';

export interface DraftSession {
  date: string;
  bodyweight: string;
  notes: string;
  results: Map<string, Result>;
  lastSaved: string;
}

const DRAFT_KEY = 'baseline_tracker_draft_session';

export function saveDraft(draft: DraftSession): void {
  try {
    const serializedDraft = {
      ...draft,
      results: Array.from(draft.results.entries()),
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(serializedDraft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

export function loadDraft(): DraftSession | null {
  try {
    const draftStr = localStorage.getItem(DRAFT_KEY);
    if (!draftStr) return null;

    const parsed = JSON.parse(draftStr);
    return {
      ...parsed,
      results: new Map(parsed.results),
    };
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function hasDraft(): boolean {
  return localStorage.getItem(DRAFT_KEY) !== null;
}

export function getDraftAge(): number | null {
  const draft = loadDraft();
  if (!draft || !draft.lastSaved) return null;

  const lastSaved = new Date(draft.lastSaved);
  const now = new Date();
  return now.getTime() - lastSaved.getTime();
}
