import { useState, useEffect } from 'react';
import { Session, Result } from '../types';
import { TEST_DEFINITIONS, getTestsByCategory } from '../data/tests';
import { saveSession, generateSessionId, getSessionById } from '../utils/storage';
import { scoreResult, getScoreColor, parseTimeMMSS, formatSecondsToMMSS } from '../utils/scoring';

interface SessionEntryProps {
  sessionId?: string;
  onCancel: () => void;
  onSave: () => void;
}

export const SessionEntry: React.FC<SessionEntryProps> = ({ sessionId, onCancel, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bodyweight, setBodyweight] = useState('');
  const [notes, setNotes] = useState('');
  const [results, setResults] = useState<Map<string, Result>>(new Map());

  useEffect(() => {
    if (sessionId) {
      const session = getSessionById(sessionId);
      if (session) {
        setDate(session.dateISO.split('T')[0]);
        setBodyweight(session.bodyweightLbs.toString());
        setNotes(session.notes || '');

        const resultsMap = new Map<string, Result>();
        session.results.forEach((result) => {
          resultsMap.set(result.testId, result);
        });
        setResults(resultsMap);
      }
    }
  }, [sessionId]);

  const handleResultChange = (testId: string, value: string) => {
    const test = TEST_DEFINITIONS.find((t) => t.id === testId);
    if (!test) return;

    let resultValue: number | boolean | string = value;
    let parsedValue: number | undefined;
    let score;

    switch (test.inputType) {
      case 'reps':
      case 'seconds':
      case 'miles':
        resultValue = value === '' ? '' : parseFloat(value);
        if (typeof resultValue === 'number' && !isNaN(resultValue)) {
          score = scoreResult(test, resultValue);
        }
        break;

      case 'time_mmss':
        resultValue = value;
        parsedValue = parseTimeMMSS(value) ?? undefined;
        if (parsedValue !== undefined) {
          score = scoreResult(test, parsedValue);
        }
        break;

      case 'pass_fail':
        resultValue = value === 'true';
        score = scoreResult(test, resultValue);
        break;
    }

    const newResults = new Map(results);
    if (value === '' || value === null || value === undefined) {
      newResults.delete(testId);
    } else {
      newResults.set(testId, {
        testId,
        value: resultValue,
        parsedValue,
        score,
      });
    }

    setResults(newResults);
  };

  const handleResultNoteChange = (testId: string, note: string) => {
    const result = results.get(testId);
    if (result) {
      const newResults = new Map(results);
      newResults.set(testId, { ...result, note: note || undefined });
      setResults(newResults);
    }
  };

  const handleSave = () => {
    if (!bodyweight || parseFloat(bodyweight) <= 0) {
      alert('Please enter a valid bodyweight');
      return;
    }

    const session: Session = {
      id: sessionId || generateSessionId(),
      dateISO: new Date(date).toISOString(),
      bodyweightLbs: parseFloat(bodyweight),
      notes: notes || undefined,
      results: Array.from(results.values()),
    };

    saveSession(session);
    onSave();
  };

  const testsByCategory = getTestsByCategory();
  const categories = Object.keys(testsByCategory);

  const getInputValue = (testId: string): string => {
    const result = results.get(testId);
    if (!result) return '';

    const test = TEST_DEFINITIONS.find((t) => t.id === testId);
    if (!test) return '';

    if (test.inputType === 'pass_fail') {
      return result.value === true ? 'true' : result.value === false ? 'false' : '';
    }

    if (test.inputType === 'time_mmss') {
      return result.value.toString();
    }

    return result.value.toString();
  };

  const getBenchmarkHint = (testId: string): string => {
    const test = TEST_DEFINITIONS.find((t) => t.id === testId);
    if (!test) return '';

    const { benchmarks } = test;
    const isLowerBetter = benchmarks.isLowerBetter || false;

    if (test.inputType === 'pass_fail') {
      return 'Pass/Fail';
    }

    const parts = [];
    if (benchmarks.fail !== undefined) {
      if (isLowerBetter) {
        parts.push(`Fail: >${formatValue(benchmarks.fail, test.inputType)}`);
      } else {
        parts.push(`Fail: <${formatValue(benchmarks.fail, test.inputType)}`);
      }
    }
    if (benchmarks.baseline !== undefined) {
      parts.push(`Baseline: ${formatValue(benchmarks.baseline, test.inputType)}`);
    }
    if (benchmarks.strong !== undefined) {
      parts.push(`Strong: ${formatValue(benchmarks.strong, test.inputType)}`);
    }
    if (benchmarks.elite !== undefined) {
      parts.push(`Elite: ${formatValue(benchmarks.elite, test.inputType)}`);
    }

    return parts.join(' | ');
  };

  const formatValue = (val: number, inputType: string): string => {
    if (inputType === 'time_mmss') {
      return formatSecondsToMMSS(val);
    }
    return val.toString();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {sessionId ? 'Edit Session' : 'New Test Session'}
        </h1>
        <p className="text-gray-600">Enter your test results and track your progress</p>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bodyweight (lbs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={bodyweight}
              onChange={(e) => setBodyweight(e.target.value)}
              placeholder="e.g., 175"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Poor sleep, high stress"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Test Results by Category */}
      {categories.map((category) => (
        <div key={category} className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
          <div className="space-y-4">
            {testsByCategory[category].map((test) => {
              const result = results.get(test.id);
              const inputValue = getInputValue(test.id);

              return (
                <div key={test.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                    {/* Test Name & Instructions */}
                    <div className="lg:col-span-3">
                      <p className="font-medium text-gray-900">{test.name}</p>
                      {test.instructions && (
                        <p className="text-xs text-gray-500 mt-0.5">{test.instructions}</p>
                      )}
                    </div>

                    {/* Input */}
                    <div className="lg:col-span-2">
                      {test.inputType === 'pass_fail' ? (
                        <select
                          value={inputValue}
                          onChange={(e) => handleResultChange(test.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">--</option>
                          <option value="true">Pass</option>
                          <option value="false">Fail</option>
                        </select>
                      ) : (
                        <input
                          type={test.inputType === 'time_mmss' ? 'text' : 'number'}
                          step={test.inputType === 'miles' || test.inputType === 'seconds' ? '0.01' : '1'}
                          value={inputValue}
                          onChange={(e) => handleResultChange(test.id, e.target.value)}
                          placeholder={test.inputType === 'time_mmss' ? 'mm:ss' : test.unit}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      )}
                    </div>

                    {/* Benchmark Hint */}
                    <div className="lg:col-span-4">
                      <p className="text-xs text-gray-500 pt-2">{getBenchmarkHint(test.id)}</p>
                    </div>

                    {/* Score Label */}
                    <div className="lg:col-span-1">
                      {result?.score && (
                        <span className={`inline-block text-xs px-2 py-1 rounded font-semibold ${getScoreColor(result.score)}`}>
                          {result.score}
                        </span>
                      )}
                    </div>

                    {/* Optional Note */}
                    <div className="lg:col-span-2">
                      <input
                        type="text"
                        value={result?.note || ''}
                        onChange={(e) => handleResultNoteChange(test.id, e.target.value)}
                        placeholder="Note"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Save Session
        </button>
      </div>
    </div>
  );
};
