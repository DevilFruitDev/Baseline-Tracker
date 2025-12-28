import { useMemo } from 'react';
import { Session } from '../types';
import { eachDayOfInterval, format, subDays } from 'date-fns';

interface TrainingHeatmapProps {
  sessions: Session[];
}

export const TrainingHeatmap: React.FC<TrainingHeatmapProps> = ({ sessions }) => {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 364); // Last 365 days
    const allDays = eachDayOfInterval({ start: startDate, end: today });

    // Group sessions by date
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = format(new Date(session.dateISO), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += session.results.length;
      return acc;
    }, {} as Record<string, number>);

    // Create heatmap data
    return allDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = sessionsByDate[dateStr] || 0;
      return {
        date: day,
        dateStr,
        count,
        intensity: count === 0 ? 0 : count < 5 ? 1 : count < 10 ? 2 : count < 14 ? 3 : 4
      };
    });
  }, [sessions]);

  // Group by weeks
  const weeks = useMemo(() => {
    const weeksArray: typeof heatmapData[] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      weeksArray.push(heatmapData.slice(i, i + 7));
    }
    return weeksArray;
  }, [heatmapData]);

  const getIntensityColor = (intensity: number): string => {
    const colors = [
      'bg-gray-100',
      'bg-green-200',
      'bg-green-400',
      'bg-green-600',
      'bg-green-800'
    ];
    return colors[intensity];
  };

  const totalSessions = sessions.length;
  const daysWithActivity = heatmapData.filter(d => d.count > 0).length;
  const currentStreak = useMemo(() => {
    let streak = 0;
    const sortedData = [...heatmapData].reverse();
    for (const day of sortedData) {
      if (day.count > 0) {
        streak++;
      } else if (streak > 0) {
        break;
      }
    }
    return streak;
  }, [heatmapData]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          Training Heatmap
        </h2>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-2xl text-blue-600">{totalSessions}</div>
            <div className="text-gray-600">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-green-600">{currentStreak}</div>
            <div className="text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-purple-600">{daysWithActivity}</div>
            <div className="text-gray-600">Active Days</div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex flex-col gap-1">
          {/* Day labels */}
          <div className="flex gap-1 mb-2">
            <div className="w-8"></div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="text-xs text-gray-500 w-3 text-center">
                {idx % 2 === 0 ? day[0] : ''}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day) => {
                  const hasSession = day.count > 0;
                  return (
                    <div
                      key={day.dateStr}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)} ${
                        hasSession ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''
                      } transition-all duration-200`}
                      title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} test${day.count !== 1 ? 's' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(intensity => (
              <div key={intensity} className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Last 365 days of training activity. Darker green = more tests completed that day.
      </p>
    </div>
  );
};
