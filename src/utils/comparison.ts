import { Session, SessionComparison, WeakTest } from '../types';
import { getTestById } from '../data/tests';
import { scoreResult, getScoreRankValue } from './scoring';

export function compareWithPreviousSession(
  currentSession: Session,
  previousSession: Session | undefined
): SessionComparison[] {
  const comparisons: SessionComparison[] = [];

  for (const currentResult of currentSession.results) {
    const test = getTestById(currentResult.testId);
    if (!test) continue;

    const previousResult = previousSession?.results.find((r) => r.testId === currentResult.testId);

    const currentNumValue =
      currentResult.parsedValue !== undefined
        ? currentResult.parsedValue
        : typeof currentResult.value === 'number'
        ? currentResult.value
        : null;

    const previousNumValue = previousResult
      ? previousResult.parsedValue !== undefined
        ? previousResult.parsedValue
        : typeof previousResult.value === 'number'
        ? previousResult.value
        : null
      : null;

    let delta: number | undefined;
    if (currentNumValue !== null && previousNumValue !== null) {
      delta = currentNumValue - previousNumValue;
    }

    comparisons.push({
      testId: currentResult.testId,
      testName: test.name,
      currentValue: currentResult.value,
      previousValue: previousResult?.value,
      delta,
      currentScore: currentResult.score,
      previousScore: previousResult?.score,
    });
  }

  return comparisons;
}

export function getBottom3WeakestTests(session: Session): WeakTest[] {
  const weakTests: WeakTest[] = [];

  for (const result of session.results) {
    const test = getTestById(result.testId);
    if (!test) continue;

    const score = result.score || scoreResult(test, result.value);
    const rankValue = getScoreRankValue(score);

    if (rankValue >= 0) {
      // Exclude Unknown
      weakTests.push({
        testId: result.testId,
        testName: test.name,
        category: test.category,
        score,
        value: result.value,
        rankValue,
      });
    }
  }

  // Sort by rankValue ascending (weakest first), then by category
  weakTests.sort((a, b) => {
    if (a.rankValue !== b.rankValue) {
      return a.rankValue - b.rankValue;
    }
    return a.category.localeCompare(b.category);
  });

  return weakTests.slice(0, 3);
}

export function getCategoryScoreSummary(session: Session): Record<string, { average: number; count: number }> {
  const categoryScores: Record<string, number[]> = {};

  for (const result of session.results) {
    const test = getTestById(result.testId);
    if (!test) continue;

    const score = result.score || scoreResult(test, result.value);
    const rankValue = getScoreRankValue(score);

    if (rankValue >= 0) {
      if (!categoryScores[test.category]) {
        categoryScores[test.category] = [];
      }
      categoryScores[test.category].push(rankValue);
    }
  }

  const summary: Record<string, { average: number; count: number }> = {};
  for (const [category, scores] of Object.entries(categoryScores)) {
    const average = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    summary[category] = { average, count: scores.length };
  }

  return summary;
}
