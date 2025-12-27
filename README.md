# Baseline Tracker

A comprehensive fitness baseline testing tracker built with React and TypeScript. Track your fitness test results, compare sessions over time, and identify areas for improvement.

## Features

- **Create Test Sessions**: Log test results with date, bodyweight, and notes
- **Auto-Scoring**: Automatically scores each test as Fail/Developing/Baseline/Strong/Elite based on benchmark ranges
- **Progress Tracking**: Compare results with previous sessions to see deltas
- **Weakness Identification**: Automatically identifies your bottom 3 weakest tests
- **Next Targets**: Provides suggested improvement targets for each test
- **Persistent Storage**: All data saved to localStorage (no backend required)
- **14 Fitness Tests** across 5 categories:
  - Strength (Pull-ups, Push-ups, Goblet Squats, Calf Raises)
  - Conditioning (Bodyweight Circuit, Cooper 12-min Run)
  - Core (Plank, Hanging Knee Raises)
  - Mobility (Deep Squat Hold, Shoulder Flexion Test)
  - Posture/Control (Balance Tests, Wall Posture Hold)

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- localStorage for data persistence

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Baseline-Tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx        # Main dashboard with session list and analytics
│   └── SessionEntry.tsx     # Form for creating/editing test sessions
├── data/
│   └── tests.ts            # Test definitions and benchmarks
├── utils/
│   ├── comparison.ts       # Session comparison logic
│   ├── scoring.ts          # Scoring and parsing utilities
│   ├── storage.ts          # localStorage helpers
│   └── seedData.ts         # Initial seed data
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Main app component
├── main.tsx               # React entry point
└── index.css              # Tailwind CSS imports
```

## Usage

### Creating a Session

1. Click "New Session" on the dashboard
2. Enter session details (date, bodyweight, optional notes)
3. Fill in test results for each fitness test
4. Results are automatically scored based on benchmarks
5. Click "Save Session"

### Viewing Progress

- Dashboard shows all sessions sorted by date (most recent first)
- Latest session displays:
  - Category performance summary
  - Bottom 3 weakest tests
  - Next improvement targets
- Click on any session to expand and see full results
- Comparisons with previous session show deltas

### Test Input Types

- **Reps**: Whole numbers (pull-ups, push-ups, etc.)
- **Seconds**: Decimal numbers allowed (plank, balance tests)
- **Time (mm:ss)**: Format like "5:50" for bodyweight circuit
- **Miles**: Decimal numbers for 12-minute run
- **Pass/Fail**: Dropdown for mobility tests

## Benchmarks

Each test has predefined benchmark ranges for scoring:
- **Elite**: Top-tier performance
- **Strong**: Above-average performance
- **Baseline**: Target baseline level
- **Developing**: Below baseline but progressing
- **Fail**: Below minimum standards

See `src/data/tests.ts` for complete benchmark details.

## Data Persistence

All session data is stored in browser localStorage under the key `baseline_tracker_sessions`. Data persists across browser sessions but is local to your browser. To backup data, export from localStorage or implement your own backup solution.

## Seed Data

On first load, the app creates a sample session with example test results. This helps you understand the app's functionality. You can delete this session if desired.

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
