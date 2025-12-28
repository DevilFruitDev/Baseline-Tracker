import { TestDefinition } from '../types';

/**
 * Extended test library with flexibility, body composition, and cardiovascular tests
 */
export const EXTENDED_TESTS: TestDefinition[] = [
  // Flexibility Tests
  {
    id: 'sit_and_reach',
    name: 'Sit and Reach',
    category: 'Flexibility',
    unit: 'inches',
    inputType: 'inches',
    instructions: 'Seated, legs straight, reach forward past toes',
    benchmarks: {
      fail: 0,
      baseline: 4,
      strong: 8,
      elite: 12,
      genderSpecific: {
        male: {
          fail: 0,
          baseline: 3,
          strong: 7,
          elite: 11,
        },
        female: {
          fail: 0,
          baseline: 5,
          strong: 9,
          elite: 13,
        },
      },
    },
  },
  {
    id: 'shoulder_reach_test',
    name: 'Back Scratch Test',
    category: 'Flexibility',
    unit: 'inches',
    inputType: 'inches',
    instructions: 'Reach behind back, measure gap between fingers (negative = hands touch)',
    benchmarks: {
      fail: 6,
      baseline: 2,
      strong: 0,
      elite: -2,
      isLowerBetter: true,
    },
  },
  {
    id: 'hip_flexor_stretch',
    name: 'Thomas Test (Hip Flexor)',
    category: 'Flexibility',
    unit: 'pass/fail',
    inputType: 'pass_fail',
    instructions: 'Lie on edge of table, pull one knee to chest, other leg should lie flat',
    benchmarks: {},
  },

  // Body Composition Tests
  {
    id: 'body_fat_percentage',
    name: 'Body Fat Percentage',
    category: 'Body Composition',
    unit: '%',
    inputType: 'percentage',
    instructions: 'Measured via caliper, bioimpedance, or DEXA scan',
    benchmarks: {
      fail: 25,
      baseline: 18,
      strong: 12,
      elite: 8,
      isLowerBetter: true,
      genderSpecific: {
        male: {
          fail: 25,
          baseline: 18,
          strong: 12,
          elite: 8,
          isLowerBetter: true,
        },
        female: {
          fail: 32,
          baseline: 25,
          strong: 18,
          elite: 14,
          isLowerBetter: true,
        },
      },
    },
  },
  {
    id: 'waist_measurement',
    name: 'Waist Circumference',
    category: 'Body Composition',
    unit: 'inches',
    inputType: 'inches',
    instructions: 'Measure at narrowest point of torso',
    benchmarks: {
      fail: 40,
      baseline: 35,
      strong: 32,
      elite: 30,
      isLowerBetter: true,
      genderSpecific: {
        male: {
          fail: 40,
          baseline: 37,
          strong: 34,
          elite: 32,
          isLowerBetter: true,
        },
        female: {
          fail: 35,
          baseline: 32,
          strong: 28,
          elite: 26,
          isLowerBetter: true,
        },
      },
    },
  },
  {
    id: 'body_weight',
    name: 'Body Weight',
    category: 'Body Composition',
    unit: 'lbs',
    inputType: 'weight_lbs',
    instructions: 'Morning weight, after bathroom, before eating',
    benchmarks: {},
  },

  // Cardiovascular Tests
  {
    id: 'resting_heart_rate',
    name: 'Resting Heart Rate',
    category: 'Cardiovascular',
    unit: 'bpm',
    inputType: 'reps',
    instructions: 'Measure first thing in morning, lying down, for 60 seconds',
    benchmarks: {
      fail: 80,
      baseline: 70,
      strong: 60,
      elite: 50,
      isLowerBetter: true,
    },
  },
  {
    id: 'vo2_max_estimate',
    name: 'VO2 Max (Estimated)',
    category: 'Cardiovascular',
    unit: 'ml/kg/min',
    inputType: 'reps',
    instructions: 'Estimated from 12-min run or 1.5 mile time',
    benchmarks: {
      fail: 30,
      baseline: 38,
      strong: 48,
      elite: 58,
      genderSpecific: {
        male: {
          fail: 32,
          baseline: 40,
          strong: 50,
          elite: 60,
        },
        female: {
          fail: 28,
          baseline: 35,
          strong: 45,
          elite: 55,
        },
      },
      ageAdjusted: {
        '18-29': {
          fail: 35,
          baseline: 42,
          strong: 52,
          elite: 62,
        },
        '30-39': {
          fail: 33,
          baseline: 40,
          strong: 50,
          elite: 58,
        },
        '40-49': {
          fail: 30,
          baseline: 37,
          strong: 47,
          elite: 55,
        },
        '50-59': {
          fail: 27,
          baseline: 34,
          strong: 43,
          elite: 51,
        },
        '60+': {
          fail: 24,
          baseline: 30,
          strong: 38,
          elite: 46,
        },
      },
    },
  },
  {
    id: 'recovery_heart_rate',
    name: '1-Min Recovery HR',
    category: 'Cardiovascular',
    unit: 'bpm drop',
    inputType: 'reps',
    instructions: 'HR drop 1 minute after stopping max effort exercise',
    benchmarks: {
      fail: 12,
      baseline: 20,
      strong: 30,
      elite: 40,
    },
  },

  // Power & Speed Tests
  {
    id: 'vertical_jump',
    name: 'Vertical Jump',
    category: 'Power',
    unit: 'inches',
    inputType: 'inches',
    instructions: 'Standing jump, measure max reach difference',
    benchmarks: {
      fail: 12,
      baseline: 18,
      strong: 24,
      elite: 30,
      genderSpecific: {
        male: {
          fail: 14,
          baseline: 20,
          strong: 26,
          elite: 32,
        },
        female: {
          fail: 10,
          baseline: 16,
          strong: 21,
          elite: 26,
        },
      },
    },
  },
  {
    id: 'broad_jump',
    name: 'Standing Broad Jump',
    category: 'Power',
    unit: 'inches',
    inputType: 'inches',
    instructions: 'Jump forward from standing position, measure distance',
    benchmarks: {
      fail: 60,
      baseline: 75,
      strong: 90,
      elite: 105,
    },
  },
  {
    id: '40_yard_dash',
    name: '40-Yard Dash',
    category: 'Speed',
    unit: 'seconds',
    inputType: 'seconds',
    instructions: 'Sprint 40 yards from standing start',
    benchmarks: {
      fail: 6.5,
      baseline: 5.8,
      strong: 5.2,
      elite: 4.8,
      isLowerBetter: true,
    },
  },
];
