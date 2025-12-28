export type InputType = 'reps' | 'seconds' | 'time_mmss' | 'miles' | 'pass_fail' | 'inches' | 'percentage' | 'weight_lbs';

export type ScoreLabel = 'Fail' | 'Developing' | 'Baseline' | 'Strong' | 'Elite' | 'Pass' | 'Unknown';

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: Gender;
  heightInches?: number;
  baselineBodyweightLbs?: number; // For bodyweight-relative calculations
  dateOfBirth?: string;
}

export interface Benchmark {
  fail?: number;
  developing?: number;
  baseline?: number;
  strong?: number;
  elite?: number;
  // For time-based tests where lower is better
  isLowerBetter?: boolean;
  // Age-adjusted benchmarks (optional)
  ageAdjusted?: {
    [ageRange: string]: Benchmark; // e.g., "18-29", "30-39", "40-49"
  };
  // Gender-specific benchmarks (optional)
  genderSpecific?: {
    male?: Benchmark;
    female?: Benchmark;
  };
}

export interface TestDefinition {
  id: string;
  name: string;
  category: string;
  unit: string;
  instructions?: string;
  inputType: InputType;
  benchmarks: Benchmark;
  isBodyweightRelative?: boolean; // True for pull-ups, push-ups, etc.
  isCustom?: boolean; // User-created test
  variations?: string[]; // IDs of alternative/variation tests
  createdAt?: string;
}

export interface Result {
  testId: string;
  value: number | boolean | string;
  parsedValue?: number; // For time_mmss, store parsed seconds
  note?: string;
  score?: ScoreLabel;
  bodyweightAdjustedScore?: ScoreLabel; // For bodyweight-relative tests
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
