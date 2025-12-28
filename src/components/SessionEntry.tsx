import { useState, useEffect } from 'react';
import { Session, Result } from '../types';
import { ALL_TESTS, getTestsByCategory } from '../data/tests';
import { saveSession, generateSessionId, getSessionById } from '../utils/storage';
import { scoreResultWithProfile, getScoreColor, parseTimeMMSS, formatSecondsToMMSS, getDynamicBenchmarks, getBodyweightRelativeScore } from '../utils/scoring';
import { getUserProfile } from '../utils/profile';
import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftAge } from '../utils/draftSession';
import { WorkoutMode } from './WorkoutMode';
import { Timer } from './Timer';
import { VoiceInput } from './VoiceInput';

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
  const [isWorkoutMode, setIsWorkoutMode] = useState(false);
  const [showTimer, setShowTimer] = useState<string | null>(null); // testId of test with open timer
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const profile = getUserProfile();

  useEffect(() => {
    // Check for draft on mount (only if not editing existing session)
    if (!sessionId && hasDraft()) {
      const draftAge = getDraftAge();
      if (draftAge && draftAge < 24 * 60 * 60 * 1000) { // Less than 24 hours old
        setShowDraftPrompt(true);
      } else {
        clearDraft(); // Clear old drafts
      }
    }

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

  // Auto-save draft every 10 seconds
  useEffect(() => {
    if (sessionId) return; // Don't auto-save when editing existing session

    const interval = setInterval(() => {
      if (bodyweight || results.size > 0) {
        saveDraft({
          date,
          bodyweight,
          notes,
          results,
          lastSaved: new Date().toISOString(),
        });
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(interval);
  }, [date, bodyweight, notes, results, sessionId]);

  const handleResultChange = (testId: string, value: string) => {
    const test = ALL_TESTS.find((t) => t.id === testId);
    if (!test) return;

    let resultValue: number | boolean | string = value;
    let parsedValue: number | undefined;
    let score;
    let bodyweightAdjustedScore;

    switch (test.inputType) {
      case 'reps':
      case 'seconds':
      case 'miles':
      case 'inches':
      case 'percentage':
      case 'weight_lbs':
        resultValue = value === '' ? '' : parseFloat(value);
        if (typeof resultValue === 'number' && !isNaN(resultValue)) {
          // Use profile-aware scoring
          score = scoreResultWithProfile(test, resultValue, profile);

          // If bodyweight-relative test and we have current bodyweight, calculate adjusted score
          if (test.isBodyweightRelative && bodyweight && parseFloat(bodyweight) > 0) {
            const bwScore = getBodyweightRelativeScore(test, resultValue, parseFloat(bodyweight), profile);
            bodyweightAdjustedScore = bwScore.score;
          }
        }
        break;

      case 'time_mmss':
        resultValue = value;
        parsedValue = parseTimeMMSS(value) ?? undefined;
        if (parsedValue !== undefined) {
          score = scoreResultWithProfile(test, parsedValue, profile);
        }
        break;

      case 'pass_fail':
        resultValue = value === 'true';
        score = scoreResultWithProfile(test, resultValue, profile);
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
        bodyweightAdjustedScore,
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

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setDate(draft.date);
      setBodyweight(draft.bodyweight);
      setNotes(draft.notes);
      setResults(draft.results);
      setShowDraftPrompt(false);
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
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
    clearDraft(); // Clear draft after successful save
    onSave();
  };

  const handleTimerComplete = (testId: string, seconds: number) => {
    const test = ALL_TESTS.find(t => t.id === testId);
    if (!test) return;

    if (test.inputType === 'seconds') {
      handleResultChange(testId, seconds.toString());
    } else if (test.inputType === 'time_mmss') {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      handleResultChange(testId, formatted);
    }
    setShowTimer(null);
  };

  const handleVoiceResult = (testId: string, transcript: string) => {
    // Try to extract a number from the transcript
    const numMatch = transcript.match(/(\d+\.?\d*)/);
    if (numMatch) {
      handleResultChange(testId, numMatch[1]);
    } else if (transcript.toLowerCase().includes('pass')) {
      handleResultChange(testId, 'true');
    } else if (transcript.toLowerCase().includes('fail')) {
      handleResultChange(testId, 'false');
    }
  };

  const handleMediaUpload = async (testId: string, file: File) => {
    // Check file size (limit to 2MB per file)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please choose a smaller file.');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, GIF, or MP4 files.');
      return;
    }

    const result = results.get(testId);
    if (!result) {
      alert('Please enter a test result first before uploading media.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';

      const newResults = new Map(results);
      const updatedResult = {
        ...result,
        media: [
          ...(result.media || []),
          {
            type: mediaType as 'photo' | 'video',
            data: base64,
            filename: file.name,
          },
        ],
      };
      newResults.set(testId, updatedResult);
      setResults(newResults);
    };

    reader.onerror = () => {
      alert('Failed to read file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = (testId: string, mediaIndex: number) => {
    const result = results.get(testId);
    if (!result || !result.media) return;

    const newResults = new Map(results);
    const updatedResult = {
      ...result,
      media: result.media.filter((_, idx) => idx !== mediaIndex),
    };
    newResults.set(testId, updatedResult);
    setResults(newResults);
  };

  const testsByCategory = getTestsByCategory();
  const categories = Object.keys(testsByCategory);

  const getInputValue = (testId: string): string => {
    const result = results.get(testId);
    if (!result) return '';

    const test = ALL_TESTS.find((t) => t.id === testId);
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
    const test = ALL_TESTS.find((t) => t.id === testId);
    if (!test) return '';

    // Use dynamic benchmarks based on user profile (age/gender adjusted)
    const benchmarks = getDynamicBenchmarks(test, profile);
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
    <>
      {/* Draft Prompt Modal */}
      {showDraftPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📝 Draft Found!</h3>
            <p className="text-gray-700 mb-6">
              We found a saved draft from your previous session. Would you like to continue where you left off?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLoadDraft}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all"
              >
                Load Draft
              </button>
              <button
                onClick={handleDiscardDraft}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-all"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Mode */}
      {isWorkoutMode && (
        <WorkoutMode
          tests={Object.values(testsByCategory).flat()}
          bodyweight={bodyweight}
          results={results}
          onResultChange={handleResultChange}
          onResultNoteChange={handleResultNoteChange}
          onExit={() => setIsWorkoutMode(false)}
        />
      )}

    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {sessionId ? 'Edit Session' : 'New Test Session'}
          </h1>
          {!sessionId && (bodyweight || results.size > 0) && (
            <span className="text-sm text-green-600 font-medium animate-pulse">
              ✓ Auto-saving...
            </span>
          )}
        </div>
        <p className="text-gray-600">Enter your test results and track your progress</p>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
          <button
            onClick={() => setIsWorkoutMode(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            🏋️ Guided Workout Mode
          </button>
        </div>
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
                      <div className="flex items-center gap-2">
                        {test.inputType === 'pass_fail' ? (
                          <select
                            value={inputValue}
                            onChange={(e) => handleResultChange(test.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        )}

                        {/* Timer button for time-based tests */}
                        {(test.inputType === 'seconds' || test.inputType === 'time_mmss') && (
                          <button
                            type="button"
                            onClick={() => setShowTimer(showTimer === test.id ? null : test.id)}
                            className={`p-2 rounded-lg text-sm transition-all ${
                              showTimer === test.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="Timer"
                          >
                            ⏱️
                          </button>
                        )}

                        {/* Voice input */}
                        <VoiceInput onResult={(transcript) => handleVoiceResult(test.id, transcript)} />
                      </div>

                      {/* Timer modal */}
                      {showTimer === test.id && (
                        <div className="mt-3 animate-slideIn">
                          <Timer
                            mode="stopwatch"
                            onComplete={(seconds) => handleTimerComplete(test.id, seconds)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Benchmark Hint */}
                    <div className="lg:col-span-4">
                      <p className="text-xs text-gray-500 pt-2">{getBenchmarkHint(test.id)}</p>
                    </div>

                    {/* Score Label */}
                    <div className="lg:col-span-1">
                      {result?.score && (
                        <div className="space-y-1">
                          <span className={`inline-block text-xs px-2 py-1 rounded font-semibold ${getScoreColor(result.score)}`}>
                            {result.score}
                          </span>
                          {test.isBodyweightRelative && result.bodyweightAdjustedScore && (
                            <div className="text-xs text-blue-600 font-medium" title="Bodyweight-adjusted score">
                              BW: {result.bodyweightAdjustedScore}
                            </div>
                          )}
                        </div>
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

                  {/* Media Upload Section */}
                  {result && (
                    <div className="mt-3 pl-0 lg:pl-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="cursor-pointer px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-200 transition-all">
                          📷 Add Photo/Video
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/quicktime"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleMediaUpload(test.id, file);
                              }
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>

                        {result.media && result.media.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {result.media.map((media, idx) => (
                              <div key={idx} className="relative group">
                                {media.type === 'photo' ? (
                                  <img
                                    src={media.data}
                                    alt={media.filename}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-purple-300 cursor-pointer hover:border-purple-500 transition-all"
                                    title={media.filename}
                                    onClick={() => window.open(media.data, '_blank')}
                                  />
                                ) : (
                                  <video
                                    src={media.data}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-purple-300 cursor-pointer hover:border-purple-500 transition-all"
                                    title={media.filename}
                                    onClick={() => window.open(media.data, '_blank')}
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedia(test.id, idx)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {result.media && result.media.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {result.media.length} file(s) attached • Click to view full size
                        </p>
                      )}
                    </div>
                  )}
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
    </>
  );
};
