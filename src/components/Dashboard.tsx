import { useEffect, useState } from 'react';
import { Session, WeakTest } from '../types';
import { getAllSessions, deleteSession } from '../utils/storage';
import { getBottom3WeakestTests, getCategoryScoreSummary, compareWithPreviousSession } from '../utils/comparison';
import { getScoreColor, formatResultValue, getNextTarget } from '../utils/scoring';
import { getTestById } from '../data/tests';
import { TrainingHeatmap } from './TrainingHeatmap';
import { ProgressChart } from './ProgressChart';
import { AICoach } from './AICoach';
import { ProfileSettings } from './ProfileSettings';
import { CustomTestManager } from './CustomTestManager';

interface DashboardProps {
  onNewSession: () => void;
  onEditSession: (sessionId: string) => void;
  refreshTrigger?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNewSession, onEditSession, refreshTrigger }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai' | 'settings'>('overview');

  useEffect(() => {
    loadSessions();
  }, [refreshTrigger]);

  const loadSessions = () => {
    const allSessions = getAllSessions();
    setSessions(allSessions);
  };

  const handleDelete = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      deleteSession(sessionId);
      loadSessions();
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `baseline-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSessions = JSON.parse(e.target?.result as string) as Session[];

        // Merge with existing sessions
        const existingIds = new Set(sessions.map(s => s.id));
        const newSessions = importedSessions.filter(s => !existingIds.has(s.id));

        if (newSessions.length === 0) {
          alert('No new sessions to import. All sessions already exist.');
          return;
        }

        const allSessions = [...sessions, ...newSessions];
        allSessions.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

        localStorage.setItem('baseline_tracker_sessions', JSON.stringify(allSessions));
        loadSessions();
        alert(`Successfully imported ${newSessions.length} session(s)!`);
      } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const latestSession = sessions[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Baseline Tracker
          </h1>
          <p className="text-gray-600 text-lg">Track your fitness baseline tests and monitor progress</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <button
            onClick={onNewSession}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ✨ New Session
          </button>

          <button
            onClick={handleExportData}
            disabled={sessions.length === 0}
            className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
          >
            📥 Export Data
          </button>

          <label className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border border-gray-200">
            📤 Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-2 shadow-md border border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📈 Analytics
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🤖 AI Coach
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

        {/* Latest Session Summary */}
        {latestSession && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl">
                🎯
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Latest Session</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-medium mb-1">Date</p>
                <p className="font-bold text-gray-900">{new Date(latestSession.dateISO).toLocaleDateString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <p className="text-sm text-purple-600 font-medium mb-1">Bodyweight</p>
                <p className="font-bold text-gray-900">{latestSession.bodyweightLbs} lbs</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 col-span-2 md:col-span-1">
                <p className="text-sm text-green-600 font-medium mb-1">Tests Completed</p>
                <p className="font-bold text-gray-900">{latestSession.results.length} / 14</p>
              </div>
            </div>

            {/* Category Scores */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Category Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(getCategoryScoreSummary(latestSession)).map(([category, { average }]) => {
                  const scoreLabels = ['Fail', 'Developing', 'Baseline', 'Strong', 'Elite'];
                  const label = scoreLabels[Math.round(average)] || 'Unknown';
                  return (
                    <div key={category} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center transform transition-all duration-200 hover:scale-105 hover:shadow-md">
                      <p className="text-xs text-gray-600 font-medium mb-2">{category}</p>
                      <p className={`text-sm font-bold px-3 py-1.5 rounded-lg ${getScoreColor(label as any)}`}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom 3 Weakest */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Focus Areas (Bottom 3)
              </h3>
              <div className="space-y-3">
                {getBottom3WeakestTests(latestSession).map((weakTest: WeakTest, idx) => {
                  const test = getTestById(weakTest.testId);
                  if (!test) return null;
                  const result = latestSession.results.find(r => r.testId === weakTest.testId);
                  if (!result) return null;

                  return (
                    <div key={weakTest.testId} className="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-l-4 border-red-400 transform transition-all duration-200 hover:scale-102 hover:shadow-md">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          <span className="bg-red-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                            {idx + 1}
                          </span>
                          {weakTest.testName}
                        </p>
                        <p className="text-sm text-gray-600 ml-8">{weakTest.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatResultValue(test, result)}</p>
                        <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${getScoreColor(weakTest.score)}`}>
                          {weakTest.score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Targets */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Next Targets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {latestSession.results.slice(0, 6).map((result) => {
                  const test = getTestById(result.testId);
                  if (!test) return null;
                  return (
                    <div key={result.testId} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 transform transition-all duration-200 hover:scale-102">
                      <span className="text-gray-700 font-medium truncate">{test.name}</span>
                      <span className="font-bold text-blue-700 ml-2 text-sm">
                        {getNextTarget(test, result.value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Session List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              All Sessions
            </h2>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏋️</div>
              <p className="text-gray-500 text-lg">No sessions yet. Create your first session to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sessions.map((session, index) => {
                const isExpanded = expandedSession === session.id;
                const prevSession = sessions[index + 1];
                const comparisons = prevSession ? compareWithPreviousSession(session, prevSession) : [];

                return (
                  <div key={session.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedSession(isExpanded ? null : session.id)}>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-lg px-3 py-2 font-bold text-sm">
                            {new Date(session.dateISO).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {new Date(session.dateISO).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-gray-600">{session.bodyweightLbs} lbs • {session.results.length} tests</p>
                          </div>
                          {session.notes && (
                            <span className="text-sm text-gray-500 italic bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                              💭 {session.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditSession(session.id)}
                          className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                          className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {session.results.map((result) => {
                            const test = getTestById(result.testId);
                            if (!test) return null;

                            const comparison = comparisons.find(c => c.testId === result.testId);
                            const hasDelta = comparison && comparison.delta !== undefined;

                            return (
                              <div key={result.testId} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 transform transition-all duration-200 hover:scale-102 hover:shadow-md">
                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                  {test.name}
                                  {test.isBodyweightRelative && (
                                    <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full" title="Bodyweight-relative test">
                                      BW
                                    </span>
                                  )}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="font-bold text-lg">{formatResultValue(test, result)}</p>
                                  <div className="flex flex-col items-end gap-1">
                                    {result.score && (
                                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getScoreColor(result.score)}`}>
                                        {result.score}
                                      </span>
                                    )}
                                    {test.isBodyweightRelative && result.bodyweightAdjustedScore && result.bodyweightAdjustedScore !== result.score && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getScoreColor(result.bodyweightAdjustedScore)}`} title="Bodyweight-adjusted score">
                                        BW: {result.bodyweightAdjustedScore}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {hasDelta && (
                                  <p className={`text-xs mt-2 font-semibold ${comparison.delta! > 0 ? 'text-green-600' : comparison.delta! < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                    {comparison.delta! > 0 ? '📈 +' : comparison.delta! < 0 ? '📉 ' : ''}{comparison.delta!.toFixed(1)} vs previous
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <TrainingHeatmap sessions={sessions} />
            <ProgressChart sessions={sessions} />
          </div>
        )}

        {/* AI Coach Tab */}
        {activeTab === 'ai' && (
          <div>
            <AICoach sessions={sessions} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <ProfileSettings />
            <CustomTestManager />
          </div>
        )}
      </div>
    </div>
  );
};
