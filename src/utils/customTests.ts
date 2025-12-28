import { TestDefinition } from '../types';

const CUSTOM_TESTS_KEY = 'baseline_tracker_custom_tests';

export function getCustomTests(): TestDefinition[] {
  try {
    const data = localStorage.getItem(CUSTOM_TESTS_KEY);
    if (!data) return [];
    return JSON.parse(data) as TestDefinition[];
  } catch (error) {
    console.error('Error reading custom tests from localStorage:', error);
    return [];
  }
}

export function saveCustomTest(test: TestDefinition): void {
  try {
    const tests = getCustomTests();
    const existingIndex = tests.findIndex((t) => t.id === test.id);

    if (existingIndex >= 0) {
      tests[existingIndex] = test;
    } else {
      tests.push(test);
    }

    localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(tests));
  } catch (error) {
    console.error('Error saving custom test to localStorage:', error);
  }
}

export function deleteCustomTest(testId: string): void {
  try {
    const tests = getCustomTests().filter((t) => t.id !== testId);
    localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(tests));
  } catch (error) {
    console.error('Error deleting custom test from localStorage:', error);
  }
}

export function generateTestId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getAllTests(defaultTests: TestDefinition[]): TestDefinition[] {
  const customTests = getCustomTests();
  return [...defaultTests, ...customTests];
}
