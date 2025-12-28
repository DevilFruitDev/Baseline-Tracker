import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Session } from '../types';
import { ALL_TESTS } from '../data/tests';
import { format } from 'date-fns';

interface ProgressChartProps {
  sessions: Session[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ sessions }) => {
  const [selectedTests, setSelectedTests] = useState<string[]>(['pullups', 'pushups']);

  const chartData = useMemo(() => {
    // Sort sessions by date (oldest first for chart)
    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    );

    return sortedSessions.map(session => {
      const dataPoint: any = {
        date: format(new Date(session.dateISO), 'MMM d'),
        fullDate: format(new Date(session.dateISO), 'MMM d, yyyy'),
      };

      selectedTests.forEach(testId => {
        const result = session.results.find(r => r.testId === testId);
        if (result) {
          const test = ALL_TESTS.find(t => t.id === testId);
          if (test) {
            // Use parsed value for time tests, otherwise use regular value
            let value = result.parsedValue !== undefined ? result.parsedValue : result.value;

            // Convert boolean to number for pass/fail tests
            if (typeof value === 'boolean') {
              value = value ? 1 : 0;
            }

            if (typeof value === 'number') {
              dataPoint[testId] = value;
            }
          }
        }
      });

      return dataPoint;
    });
  }, [sessions, selectedTests]);

  const toggleTest = (testId: string) => {
    setSelectedTests(prev => {
      if (prev.includes(testId)) {
        return prev.filter(id => id !== testId);
      } else if (prev.length < 5) { // Limit to 5 tests
        return [...prev, testId];
      }
      return prev;
    });
  };

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  // Group tests by category
  const testsByCategory = ALL_TESTS.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, typeof ALL_TESTS>);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-2xl">📈</span>
        Progress Over Time
      </h2>

      {/* Test Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">
          Select up to 5 tests to visualize (click to toggle):
        </p>
        <div className="space-y-3">
          {Object.entries(testsByCategory).map(([category, tests]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-500 mb-2">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {tests.map(test => (
                  <button
                    key={test.id}
                    onClick={() => toggleTest(test.id)}
                    disabled={!selectedTests.includes(test.id) && selectedTests.length >= 5}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTests.includes(test.id)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {test.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      {selectedTests.length > 0 && chartData.length > 1 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const test = ALL_TESTS.find(t => t.id === value);
                  return test ? test.name : value;
                }}
              />
              {selectedTests.map((testId, idx) => {
                const test = ALL_TESTS.find(t => t.id === testId);
                return (
                  <Line
                    key={testId}
                    type="monotone"
                    dataKey={testId}
                    name={test?.name || testId}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={3}
                    dot={{ fill: colors[idx % colors.length], r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : selectedTests.length === 0 ? (
        <div className="h-96 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p>Select tests above to visualize your progress</p>
          </div>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">📅</div>
            <p>Need at least 2 sessions to show progress</p>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        Track your improvement across sessions. Higher is better except for time-based tests.
      </p>
    </div>
  );
};
