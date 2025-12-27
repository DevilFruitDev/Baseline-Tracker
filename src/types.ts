export type InputType = 'reps' | 'seconds' | 'time_mmss' | 'miles' | 'pass_fail';

export type ScoreLabel = 'Fail' | 'Developing' | 'Baseline' | 'Strong' | 'Elite' | 'Pass' | 'Unknown';

export interface Benchmark {
  fail?: number;
  developing?: number;
  baseline?: number;
  strong?: number;
  elite?: number;
  // For time-based tests where lower is better
  isLowerBetter?: boolean;
}

export interface TestDefinition {
  id: string;
  name: string;
  category: string;
  unit: string;
  instructions?: string;
  inputType: InputType;
  benchmarks: Benchmark;
}

export interface Result {
  testId: string;
  value: number | boolean | string;
  parsedValue?: number; // For time_mmss, store parsed seconds
  note?: string;
  score?: ScoreLabel;
}

export interface Session {
  id: string;
  dateISO: string;
  bodyweightLbs: number;
  notes?: string;
  results: Result[];
}

export interface SessionComparison {
  testId: string;
  testName: string;
  currentValue: number | boolean | string;
  previousValue?: number | boolean | string;
  delta?: number;
  currentScore?: ScoreLabel;
  previousScore?: ScoreLabel;
}

export interface WeakTest {
  testId: string;
  testName: string;
  category: string;
  score: ScoreLabel;
  value: number | boolean | string;
  rankValue: number; // For sorting (lower = weaker)
}
