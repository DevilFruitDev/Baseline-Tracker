import { TestDefinition, ScoreLabel, Result, UserProfile, Benchmark } from '../types';
import { getUserProfile, getAgeFromProfile, getAgeRange } from './profile';

export function scoreResult(test: TestDefinition, value: number | boolean | string): ScoreLabel {
  // Handle pass/fail tests
  if (test.inputType === 'pass_fail') {
    return value === true ? 'Pass' : 'Fail';
  }

  // For numeric tests
  const numValue = typeof value === 'number' ? value : parseFloat(value as string);
  if (isNaN(numValue)) {
    return 'Unknown';
  }

  const { benchmarks } = test;
  const isLowerBetter = benchmarks.isLowerBetter || false;

  if (isLowerBetter) {
    // For tests where lower is better (e.g., circuit time)
    if (benchmarks.elite !== undefined && numValue <= benchmarks.elite) return 'Elite';
    if (benchmarks.strong !== undefined && numValue <= benchmarks.strong) return 'Strong';
    if (benchmarks.baseline !== undefined && numValue <= benchmarks.baseline) return 'Baseline';
    if (benchmarks.fail !== undefined && numValue > benchmarks.fail) return 'Fail';
    return 'Developing';
  } else {
    // For tests where higher is better
    if (benchmarks.elite !== undefined && numValue >= benchmarks.elite) return 'Elite';
    if (benchmarks.strong !== undefined && numValue >= benchmarks.strong) return 'Strong';
    if (benchmarks.baseline !== undefined && numValue >= benchmarks.baseline) return 'Baseline';
    if (benchmarks.developing !== undefined && numValue >= benchmarks.developing) return 'Developing';
    if (benchmarks.fail !== undefined && numValue < benchmarks.fail) return 'Fail';
    return 'Developing';
  }
}

export function getScoreRankValue(score: ScoreLabel): number {
  // Lower number = weaker performance
  const rankMap: Record<ScoreLabel, number> = {
    Fail: 0,
    Developing: 1,
    Baseline: 2,
    Strong: 3,
    Elite: 4,
    Pass: 2,
    Unknown: -1,
  };
  return rankMap[score] ?? -1;
}

export function getNextTarget(test: TestDefinition, currentValue: number | boolean | string): string {
  if (test.inputType === 'pass_fail') {
    return currentValue === true ? 'Maintain Pass' : 'Target: Pass';
  }

  const numValue = typeof currentValue === 'number' ? currentValue : parseFloat(currentValue as string);
  if (isNaN(numValue)) {
    return 'Enter a value first';
  }

  switch (test.inputType) {
    case 'reps':
      // Check if near a threshold, add +1, otherwise +2
      const nextReps = numValue + 2;
      return `Target: ${nextReps} ${test.unit}`;

    case 'seconds':
      const nextSeconds = numValue + 10;
      return `Target: ${nextSeconds} sec`;

    case 'time_mmss':
      // Improve by 15 seconds (lower is better)
      const improvedSeconds = Math.max(0, numValue - 15);
      return `Target: ${formatSecondsToMMSS(improvedSeconds)}`;

    case 'miles':
      const nextMiles = (numValue + 0.1).toFixed(1);
      return `Target: ${nextMiles} miles`;

    default:
      return 'N/A';
  }
}

export function formatSecondsToMMSS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function parseTimeMMSS(timeStr: string): number | null {
  // Parse formats like "5:50" or "10:05" into total seconds
  const match = timeStr.match(/^(\d+):([0-5]\d)$/);
  if (!match) return null;

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  return minutes * 60 + seconds;
}

export function getScoreColor(score: ScoreLabel): string {
  switch (score) {
    case 'Elite':
      return 'text-purple-600 bg-purple-50';
    case 'Strong':
      return 'text-green-600 bg-green-50';
    case 'Baseline':
      return 'text-blue-600 bg-blue-50';
    case 'Developing':
      return 'text-yellow-600 bg-yellow-50';
    case 'Pass':
      return 'text-green-600 bg-green-50';
    case 'Fail':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function formatResultValue(test: TestDefinition, result: Result): string {
  if (test.inputType === 'pass_fail') {
    return result.value === true ? 'Pass' : 'Fail';
  }

  if (test.inputType === 'time_mmss' && result.parsedValue !== undefined) {
    return formatSecondsToMMSS(result.parsedValue);
  }

  if (typeof result.value === 'number') {
    return test.inputType === 'miles' ? result.value.toFixed(2) : result.value.toString();
  }

  return result.value.toString();
}

/**
 * Get appropriate benchmarks based on user profile (age/gender)
 */
export function getDynamicBenchmarks(test: TestDefinition, profile?: UserProfile): Benchmark {
  if (!profile) {
    profile = getUserProfile();
  }

  let benchmarks = { ...test.benchmarks };

  // Apply gender-specific benchmarks if available
  if (profile.gender && benchmarks.genderSpecific) {
    if (profile.gender === 'male' && benchmarks.genderSpecific.male) {
      benchmarks = { ...benchmarks, ...benchmarks.genderSpecific.male };
    } else if (profile.gender === 'female' && benchmarks.genderSpecific.female) {
      benchmarks = { ...benchmarks, ...benchmarks.genderSpecific.female };
    }
  }

  // Apply age-adjusted benchmarks if available
  const age = getAgeFromProfile(profile);
  if (age && benchmarks.ageAdjusted) {
    const ageRangeKey = getAgeRange(age);
    if (benchmarks.ageAdjusted[ageRangeKey]) {
      benchmarks = { ...benchmarks, ...benchmarks.ageAdjusted[ageRangeKey] };
    }
  }

  return benchmarks;
}

/**
 * Score a result with dynamic benchmarks (age/gender adjusted)
 */
export function scoreResultWithProfile(
  test: TestDefinition,
  value: number | boolean | string,
  profile?: UserProfile
): ScoreLabel {
  if (test.inputType === 'pass_fail') {
    return value === true ? 'Pass' : 'Fail';
  }

  const numValue = typeof value === 'number' ? value : parseFloat(value as string);
  if (isNaN(numValue)) {
    return 'Unknown';
  }

  const benchmarks = getDynamicBenchmarks(test, profile);
  const isLowerBetter = benchmarks.isLowerBetter || false;

  if (isLowerBetter) {
    if (benchmarks.elite !== undefined && numValue <= benchmarks.elite) return 'Elite';
    if (benchmarks.strong !== undefined && numValue <= benchmarks.strong) return 'Strong';
    if (benchmarks.baseline !== undefined && numValue <= benchmarks.baseline) return 'Baseline';
    if (benchmarks.fail !== undefined && numValue > benchmarks.fail) return 'Fail';
    return 'Developing';
  } else {
    if (benchmarks.elite !== undefined && numValue >= benchmarks.elite) return 'Elite';
    if (benchmarks.strong !== undefined && numValue >= benchmarks.strong) return 'Strong';
    if (benchmarks.baseline !== undefined && numValue >= benchmarks.baseline) return 'Baseline';
    if (benchmarks.developing !== undefined && numValue >= benchmarks.developing) return 'Developing';
    if (benchmarks.fail !== undefined && numValue < benchmarks.fail) return 'Fail';
    return 'Developing';
  }
}

/**
 * Calculate bodyweight-relative score using Wilks-like coefficient
 * This adjusts bodyweight exercises (pull-ups, dips, etc.) to account for weight
 */
export function getBodyweightRelativeScore(
  test: TestDefinition,
  reps: number,
  currentBodyweight: number,
  profile?: UserProfile
): { adjustedReps: number; score: ScoreLabel } {
  if (!profile) {
    profile = getUserProfile();
  }

  const baselineWeight = profile.baselineBodyweightLbs || currentBodyweight;

  // Bodyweight coefficient: lighter = easier, heavier = harder
  // Formula: adjustedReps = reps * (current / baseline)
  // E.g., 10 pull-ups at 200 lbs is more impressive than 10 at 150 lbs
  const weightRatio = currentBodyweight / baselineWeight;
  const adjustedReps = Math.round(reps * weightRatio);

  const score = scoreResultWithProfile(test, adjustedReps, profile);

  return { adjustedReps, score };
}

/**
 * Format bodyweight-relative display
 */
export function formatBodyweightRelative(reps: number, adjustedReps: number): string {
  if (reps === adjustedReps) {
    return `${reps} reps`;
  }
  return `${reps} reps (${adjustedReps} BW-adjusted)`;
}
