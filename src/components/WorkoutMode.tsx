import { useState, useEffect } from 'react';
import { TestDefinition, Result } from '../types';
import { getScoreColor, getDynamicBenchmarks } from '../utils/scoring';
import { getUserProfile } from '../utils/profile';
import { Timer } from './Timer';
import { VoiceInput } from './VoiceInput';

interface WorkoutModeProps {
  tests: TestDefinition[];
  bodyweight: string;
  results: Map<string, Result>;
  onResultChange: (testId: string, value: string) => void;
  onResultNoteChange: (testId: string, note: string) => void;
  onExit: () => void;
}

export const WorkoutMode: React.FC<WorkoutModeProps> = ({
  tests,
  results,
  onResultChange,
  onResultNoteChange,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const profile = getUserProfile();

  const currentTest = tests[currentIndex];
  const result = results.get(currentTest.id);
  const progress = ((currentIndex + 1) / tests.length) * 100;
  const completedCount = Array.from(results.values()).filter(r => r.value !== '' && r.value !== null && r.value !== undefined).length;

  useEffect(() => {
    // Show instructions when moving to a new test
    setShowInstructions(true);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < tests.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTimer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTimer(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleTimerComplete = (seconds: number) => {
    if (currentTest.inputType === 'seconds') {
      onResultChange(currentTest.id, seconds.toString());
    } else if (currentTest.inputType === 'time_mmss') {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      onResultChange(currentTest.id, formatted);
    }
    setShowTimer(false);
  };

  const handleVoiceResult = (transcript: string) => {
    // Try to extract a number from the transcript
    const numMatch = transcript.match(/(\d+\.?\d*)/);
    if (numMatch) {
      onResultChange(currentTest.id, numMatch[1]);
    } else if (transcript.toLowerCase().includes('pass')) {
      onResultChange(currentTest.id, 'true');
    } else if (transcript.toLowerCase().includes('fail')) {
      onResultChange(currentTest.id, 'false');
    }
  };

  const getInputValue = (): string => {
    if (!result) return '';

    if (currentTest.inputType === 'pass_fail') {
      return result.value === true ? 'true' : result.value === false ? 'false' : '';
    }

    return result.value.toString();
  };

  const benchmarks = getDynamicBenchmarks(currentTest, profile);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">🏋️ Guided Workout Mode</h2>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition-all"
            >
              ✕ Exit
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Test {currentIndex + 1} of {tests.length}</span>
              <span>{completedCount} completed</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Category */}
          <div className="text-sm opacity-90 mt-2">
            Category: {currentTest.category}
          </div>
        </div>

        {/* Test Content */}
        <div className="p-6 space-y-6">
          {/* Test Name */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {currentTest.name}
            </h3>
            {currentTest.isBodyweightRelative && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Bodyweight-Relative Test
              </span>
            )}
          </div>

          {/* Instructions */}
          {showInstructions && currentTest.instructions && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 animate-slideIn">
              <div className="flex items-start gap-3">
                <span className="text-3xl">📋</span>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Instructions</h4>
                  <p className="text-gray-700">{currentTest.instructions}</p>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="mt-3 text-sm text-yellow-700 hover:text-yellow-800 font-semibold"
                  >
                    Got it! ✓
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Benchmarks */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">📊 Target Benchmarks</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {benchmarks.baseline !== undefined && (
                <div className="text-center p-2 bg-yellow-100 rounded-lg">
                  <div className="text-xs text-yellow-700">Baseline</div>
                  <div className="font-bold text-yellow-900">{benchmarks.baseline} {currentTest.unit}</div>
                </div>
              )}
              {benchmarks.strong !== undefined && (
                <div className="text-center p-2 bg-blue-100 rounded-lg">
                  <div className="text-xs text-blue-700">Strong</div>
                  <div className="font-bold text-blue-900">{benchmarks.strong} {currentTest.unit}</div>
                </div>
              )}
              {benchmarks.elite !== undefined && (
                <div className="text-center p-2 bg-green-100 rounded-lg">
                  <div className="text-xs text-green-700">Elite</div>
                  <div className="font-bold text-green-900">{benchmarks.elite} {currentTest.unit}</div>
                </div>
              )}
            </div>
          </div>

          {/* Timer (for time-based tests) */}
          {(currentTest.inputType === 'seconds' || currentTest.inputType === 'time_mmss') && (
            <div>
              {!showTimer ? (
                <button
                  onClick={() => setShowTimer(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  ⏱️ Start Timer
                </button>
              ) : (
                <Timer
                  mode="stopwatch"
                  onComplete={handleTimerComplete}
                />
              )}
            </div>
          )}

          {/* Result Input */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Enter Your Result
            </label>

            <div className="flex items-center gap-3">
              {currentTest.inputType === 'pass_fail' ? (
                <select
                  value={getInputValue()}
                  onChange={(e) => onResultChange(currentTest.id, e.target.value)}
                  className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select --</option>
                  <option value="true">✓ Pass</option>
                  <option value="false">✗ Fail</option>
                </select>
              ) : (
                <input
                  type={currentTest.inputType === 'time_mmss' ? 'text' : 'number'}
                  step={currentTest.inputType === 'miles' || currentTest.inputType === 'seconds' ? '0.01' : '1'}
                  value={getInputValue()}
                  onChange={(e) => onResultChange(currentTest.id, e.target.value)}
                  placeholder={currentTest.inputType === 'time_mmss' ? 'mm:ss' : currentTest.unit}
                  className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              )}

              {/* Voice Input */}
              <VoiceInput onResult={handleVoiceResult} placeholder="Say your result..." />
            </div>

            {/* Score Display */}
            {result?.score && (
              <div className="mt-4 text-center">
                <span className={`inline-block text-lg px-6 py-2 rounded-full font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </span>
                {currentTest.isBodyweightRelative && result.bodyweightAdjustedScore && result.bodyweightAdjustedScore !== result.score && (
                  <div className="mt-2">
                    <span className={`inline-block text-sm px-4 py-1 rounded-full font-medium border ${getScoreColor(result.bodyweightAdjustedScore)}`}>
                      BW-Adjusted: {result.bodyweightAdjustedScore}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            <div className="mt-4">
              <input
                type="text"
                value={result?.note || ''}
                onChange={(e) => onResultNoteChange(currentTest.id, e.target.value)}
                placeholder="Add a note (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 bg-yellow-100 text-yellow-700 font-semibold rounded-lg hover:bg-yellow-200 transition-all"
            >
              Skip →
            </button>

            {currentIndex < tests.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onExit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                ✓ Complete Workout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
