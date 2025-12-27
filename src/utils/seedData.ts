import { Session, Result } from '../types';
import { getAllSessions, saveSession, generateSessionId } from './storage';
import { scoreResult, parseTimeMMSS } from './scoring';
import { getTestById } from '../data/tests';

export function seedInitialData(): void {
  const sessions = getAllSessions();

  // Only seed if there are no sessions
  if (sessions.length > 0) {
    return;
  }

  const seedResults: Array<{ testId: string; value: number | boolean | string }> = [
    { testId: 'pullups', value: 7 },
    { testId: 'pushups', value: 23 },
    { testId: 'goblet_squat', value: 16 },
    { testId: 'calf_raise_left', value: 22 },
    { testId: 'calf_raise_right', value: 20 },
    { testId: 'bw_circuit', value: '5:50' },
    { testId: 'plank', value: 54 },
    { testId: 'knee_raises', value: 10 },
    { testId: 'deep_squat', value: 31 },
    { testId: 'shoulder_wall', value: true },
    { testId: 'balance_left', value: 2.34 },
    { testId: 'balance_right', value: 3.28 },
    { testId: 'wall_posture', value: false },
  ];

  const results: Result[] = seedResults.map((seedResult) => {
    const test = getTestById(seedResult.testId);
    if (!test) {
      throw new Error(`Test not found: ${seedResult.testId}`);
    }

    let parsedValue: number | undefined;
    let finalValue = seedResult.value;

    if (test.inputType === 'time_mmss' && typeof seedResult.value === 'string') {
      parsedValue = parseTimeMMSS(seedResult.value) ?? undefined;
      if (parsedValue === undefined) {
        throw new Error(`Invalid time format for ${seedResult.testId}: ${seedResult.value}`);
      }
    }

    const scoreValue = parsedValue !== undefined ? parsedValue : seedResult.value;
    const score = scoreResult(test, scoreValue);

    return {
      testId: seedResult.testId,
      value: finalValue,
      parsedValue,
      score,
    };
  });

  const seedSession: Session = {
    id: generateSessionId(),
    dateISO: new Date().toISOString(),
    bodyweightLbs: 175,
    notes: 'Initial baseline test - seed data',
    results,
  };

  saveSession(seedSession);
  console.log('Seed data created successfully');
}
