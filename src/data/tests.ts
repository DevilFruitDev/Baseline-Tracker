import { TestDefinition } from '../types';

export const TEST_DEFINITIONS: TestDefinition[] = [
  // Strength
  {
    id: 'pullups',
    name: 'Pull-ups (Strict)',
    category: 'Strength',
    unit: 'reps',
    inputType: 'reps',
    instructions: 'Strict form, full extension to chin over bar',
    benchmarks: {
      fail: 3,
      developing: 4,
      baseline: 5,
      strong: 8,
      elite: 15,
    },
  },
  {
    id: 'pushups',
    name: 'Push-ups (Strict)',
    category: 'Strength',
    unit: 'reps',
    inputType: 'reps',
    instructions: 'Chest to ground, full lockout',
    benchmarks: {
      fail: 20,
      baseline: 25,
      strong: 40,
      elite: 60,
    },
  },
  {
    id: 'goblet_squat',
    name: 'Goblet Squat (40 lb @3-1)',
    category: 'Strength',
    unit: 'reps',
    inputType: 'reps',
    instructions: '40 lb total, 3 sec down / 1 sec up tempo',
    benchmarks: {
      fail: 10,
      baseline: 12,
      strong: 18,
      elite: 30,
    },
  },
  {
    id: 'calf_raise_left',
    name: 'Single-Leg Calf Raise (Left)',
    category: 'Strength',
    unit: 'reps',
    inputType: 'reps',
    instructions: 'Full range of motion, controlled',
    benchmarks: {
      fail: 15,
      baseline: 20,
      strong: 25,
    },
  },
  {
    id: 'calf_raise_right',
    name: 'Single-Leg Calf Raise (Right)',
    category: 'Strength',
    unit: 'reps',
    inputType: 'reps',
    instructions: 'Full range of motion, controlled',
    benchmarks: {
      fail: 15,
      baseline: 20,
      strong: 25,
    },
  },
  // Conditioning
  {
    id: 'bw_circuit',
    name: 'Bodyweight Circuit',
    category: 'Conditioning',
    unit: 'time (mm:ss)',
    inputType: 'time_mmss',
    instructions: '40 air squats / 30 push-ups / 20 sit-ups / 10 burpees',
    benchmarks: {
      fail: 600, // 10:00 in seconds
      baseline: 540, // 9:00
      strong: 420, // 7:00
      elite: 360, // 6:00
      isLowerBetter: true,
    },
  },
  {
    id: 'cooper_run',
    name: '12-Minute Run (Cooper Test)',
    category: 'Conditioning',
    unit: 'miles',
    inputType: 'miles',
    instructions: 'Distance covered in 12 minutes',
    benchmarks: {
      fail: 1.5,
      baseline: 1.5,
      strong: 1.8,
      elite: 2.1,
    },
  },
  // Core
  {
    id: 'plank',
    name: 'Front Plank (strict)',
    category: 'Core',
    unit: 'seconds',
    inputType: 'seconds',
    instructions: 'Strict form, straight line head to heels',
    benchmarks: {
      fail: 45,
      baseline: 60,
      strong: 90,
      elite: 120,
    },
  },
  {
    id: 'knee_raises',
    name: 'Hanging Knee Raises',
    category: 'Core',
    unit: 'reps',
    inputType: 'reps',
    instructions: 'Controlled, knees to chest',
    benchmarks: {
      fail: 6,
      baseline: 10,
      strong: 15,
      elite: 20,
    },
  },
  // Mobility
  {
    id: 'deep_squat',
    name: 'Deep Squat Hold',
    category: 'Mobility',
    unit: 'seconds',
    inputType: 'seconds',
    instructions: 'Heels down, upright torso',
    benchmarks: {
      fail: 30,
      baseline: 45,
      strong: 60,
    },
  },
  {
    id: 'shoulder_wall',
    name: 'Shoulder Flexion Wall Test',
    category: 'Mobility',
    unit: 'pass/fail',
    inputType: 'pass_fail',
    instructions: 'Arms overhead against wall, ribs down',
    benchmarks: {},
  },
  // Posture/Control
  {
    id: 'balance_left',
    name: 'Single-Leg Balance Eyes Closed (Left)',
    category: 'Posture/Control',
    unit: 'seconds',
    inputType: 'seconds',
    instructions: 'Eyes closed, maintain balance',
    benchmarks: {
      fail: 10,
      baseline: 15,
      strong: 20,
    },
  },
  {
    id: 'balance_right',
    name: 'Single-Leg Balance Eyes Closed (Right)',
    category: 'Posture/Control',
    unit: 'seconds',
    inputType: 'seconds',
    instructions: 'Eyes closed, maintain balance',
    benchmarks: {
      fail: 10,
      baseline: 15,
      strong: 20,
    },
  },
  {
    id: 'wall_posture',
    name: 'Wall Posture Hold (60 sec)',
    category: 'Posture/Control',
    unit: 'pass/fail',
    inputType: 'pass_fail',
    instructions: 'Maintain proper posture for 60 seconds',
    benchmarks: {},
  },
];

export const getTestById = (id: string): TestDefinition | undefined => {
  return TEST_DEFINITIONS.find((test) => test.id === id);
};

export const getTestsByCategory = (): Record<string, TestDefinition[]> => {
  return TEST_DEFINITIONS.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, TestDefinition[]>);
};
