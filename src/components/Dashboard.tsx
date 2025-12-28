import { useEffect, useState } from 'react';
import { Session, WeakTest } from '../types';
import { getAllSessions, deleteSession } from '../utils/storage';
import { getBottom3WeakestTests, getCategoryScoreSummary, compareWithPreviousSession } from '../utils/comparison';
import { getScoreColor, formatResultValue, getNextTarget } from '../utils/scoring';
import { getTestById } from '../data/tests';

interface DashboardProps {
  onNewSession: () => void;
  onEditSession: (sessionId: string) => void;
  refreshTrigger?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNewSession, onEditSession, refreshTrigger }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

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

  const latestSession = sessions[0];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Baseline Tracker</h1>
        <p className="text-gray-600">Track your fitness baseline tests and monitor progress</p>
      </div>

      <button
        onClick={onNewSession}
        className="mb-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        + New Session
      </button>

      {latestSession && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Session Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{new Date(latestSession.dateISO).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bodyweight</p>
              <p className="font-semibold">{latestSession.bodyweightLbs} lbs</p>
            </div>
          </div>

          {/* Category Scores */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Category Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(getCategoryScoreSummary(latestSession)).map(([category, { average }]) => {
                const scoreLabels = ['Fail', 'Developing', 'Baseline', 'Strong', 'Elite'];
                const label = scoreLabels[Math.round(average)] || 'Unknown';
                return (
                  <div key={category} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">{category}</p>
                    <p className={`text-sm font-semibold px-2 py-1 rounded ${getScoreColor(label as any)}`}>
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom 3 Weakest */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Bottom 3 Weakest Tests</h3>
            <div className="space-y-2">
              {getBottom3WeakestTests(latestSession).map((weakTest: WeakTest, idx) => {
                const test = getTestById(weakTest.testId);
                if (!test) return null;
                const result = latestSession.results.find(r => r.testId === weakTest.testId);
                if (!result) return null;

                return (
                  <div key={weakTest.testId} className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {idx + 1}. {weakTest.testName}
                      </p>
                      <p className="text-sm text-gray-600">{weakTest.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatResultValue(test, result)}</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${getScoreColor(weakTest.score)}`}>
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
            <h3 className="font-semibold text-gray-900 mb-3">Next Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {latestSession.results.slice(0, 5).map((result) => {
                const test = getTestById(result.testId);
                if (!test) return null;
                return (
                  <div key={result.testId} className="flex items-center justify-between bg-blue-50 rounded p-2">
                    <span className="text-gray-700 truncate">{test.name}</span>
                    <span className="font-semibold text-blue-700 ml-2">
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
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Sessions</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No sessions yet. Create your first session to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session, index) => {
              const isExpanded = expandedSession === session.id;
              const prevSession = sessions[index + 1];
              const comparisons = prevSession ? compareWithPreviousSession(session, prevSession) : [];

              return (
                <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => setExpandedSession(isExpanded ? null : session.id)}>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(session.dateISO).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-gray-600">{session.bodyweightLbs} lbs</p>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-gray-500 italic">"{session.notes}"</p>
                        )}
                        <span className="text-sm text-gray-400">
                          ({session.results.length} tests)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditSession(session.id)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        View/Edit
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                        className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {session.results.map((result) => {
                          const test = getTestById(result.testId);
                          if (!test) return null;

                          const comparison = comparisons.find(c => c.testId === result.testId);
                          const hasDelta = comparison && comparison.delta !== undefined;

                          return (
                            <div key={result.testId} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-900">{test.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="font-semibold">{formatResultValue(test, result)}</p>
                                {result.score && (
                                  <span className={`text-xs px-2 py-0.5 rounded ${getScoreColor(result.score)}`}>
                                    {result.score}
                                  </span>
                                )}
                              </div>
                              {hasDelta && (
                                <p className={`text-xs mt-1 ${comparison.delta! > 0 ? 'text-green-600' : comparison.delta! < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                  {comparison.delta! > 0 ? '+' : ''}{comparison.delta!.toFixed(1)} vs previous
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
  );
};
