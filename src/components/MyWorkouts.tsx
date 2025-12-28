import { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutDay } from '../types';
import { getAllWorkoutPlans, saveWorkoutPlan, deleteWorkoutPlan, markWorkoutComplete, getWorkoutStats } from '../utils/workoutPlans';

export const MyWorkouts: React.FC = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    const plans = getAllWorkoutPlans();
    setWorkoutPlans(plans);
  };

  const handleSetActive = (planId: string) => {
    const plan = workoutPlans.find(p => p.id === planId);
    if (!plan) return;

    saveWorkoutPlan({
      ...plan,
      isActive: !plan.isActive,
      startDate: !plan.isActive ? new Date().toISOString() : plan.startDate,
    });
    loadPlans();
  };

  const handleDelete = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this workout plan?')) {
      deleteWorkoutPlan(planId);
      loadPlans();
    }
  };

  const handleMarkComplete = (planId: string, dayName: string) => {
    const notes = prompt('Add notes about this workout (optional):');
    markWorkoutComplete(planId, dayName, notes || undefined);
    loadPlans();
  };

  const activePlan = workoutPlans.find(p => p.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">🏋️ My Workout Plans</h2>
        <p className="text-blue-100">AI-generated training programs tailored to your baseline test results</p>
      </div>

      {/* Active Plan Highlight */}
      {activePlan && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-2xl shadow-xl p-6 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                  ACTIVE PLAN
                </span>
                <h3 className="text-2xl font-bold text-gray-900">{activePlan.title}</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Started: {new Date(activePlan.startDate || activePlan.createdDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setExpandedPlan(expandedPlan === activePlan.id ? null : activePlan.id)}
              className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-md"
            >
              {expandedPlan === activePlan.id ? '▲ Collapse' : '▼ View Plan'}
            </button>
          </div>

          {/* Coach's Guidance */}
          {activePlan.coachingNotes && (
            <div className="bg-white rounded-xl p-4 mb-4 border-l-4 border-green-600">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🎓</span>
                Your Coach's Guidance
              </h4>
              <p className="text-gray-700 text-sm">{activePlan.coachingNotes}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const stats = getWorkoutStats(activePlan.id);
              return (
                <>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{activePlan.weeklySchedule.length}</div>
                    <div className="text-xs text-gray-600">Days/Week</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.completedWorkouts}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
                    <div className="text-xs text-gray-600">Day Streak</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{activePlan.goals.length}</div>
                    <div className="text-xs text-gray-600">Goals</div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Expanded Plan View */}
          {expandedPlan === activePlan.id && (
            <div className="mt-6 space-y-4 animate-slideIn">
              {/* Goals */}
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Training Goals
                </h4>
                <ul className="space-y-2">
                  {activePlan.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 font-bold">✓</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weekly Schedule */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">📅 Weekly Schedule</h4>
                <div className="space-y-3">
                  {activePlan.weeklySchedule.map((day, dayIdx) => (
                    <WorkoutDayCard
                      key={dayIdx}
                      day={day}
                      planId={activePlan.id}
                      isExpanded={expandedDay === day.dayName}
                      onToggle={() => setExpandedDay(expandedDay === day.dayName ? null : day.dayName)}
                      onMarkComplete={() => handleMarkComplete(activePlan.id, day.dayName)}
                    />
                  ))}
                </div>
              </div>

              {/* Progression Notes */}
              {activePlan.progressionNotes && (
                <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-600">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">📈</span>
                    Progression Strategy
                  </h4>
                  <p className="text-gray-700 text-sm">{activePlan.progressionNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Workout Plans */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">All Workout Plans ({workoutPlans.length})</h3>
        </div>

        {workoutPlans.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🏃</div>
            <p className="text-gray-500 text-lg mb-4">No workout plans yet</p>
            <p className="text-gray-600 text-sm">
              Visit the AI Coach tab and ask for a personalized workout plan based on your baseline test results!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {workoutPlans.map(plan => (
              <div key={plan.id} className="p-6 hover:bg-gray-50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {plan.isActive && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          ACTIVE
                        </span>
                      )}
                      <h4 className="text-lg font-bold text-gray-900">{plan.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Created: {new Date(plan.createdDate).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.focusAreas.map((area, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetActive(plan.id)}
                      className={`px-4 py-2 font-semibold rounded-lg transition-all text-sm ${
                        plan.isActive
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {plan.isActive ? 'Deactivate' : 'Set Active'}
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-all text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for workout day cards
interface WorkoutDayCardProps {
  day: WorkoutDay;
  planId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkComplete: () => void;
}

const WorkoutDayCard: React.FC<WorkoutDayCardProps> = ({ day, isExpanded, onToggle, onMarkComplete }) => {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:border-blue-300">
      <div
        className="p-4 cursor-pointer flex items-center justify-between bg-gradient-to-r from-gray-50 to-white"
        onClick={onToggle}
      >
        <div className="flex-1">
          <h5 className="font-bold text-gray-900 text-lg">{day.dayName}</h5>
          <p className="text-sm text-gray-600">{day.focus}</p>
          {day.estimatedDuration && (
            <p className="text-xs text-gray-500 mt-1">⏱️ ~{day.estimatedDuration} minutes</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkComplete();
            }}
            className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-all"
          >
            ✓ Complete
          </button>
          <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-gray-50 animate-fadeIn">
          {/* Warmup */}
          {day.warmup && day.warmup.length > 0 && (
            <div>
              <h6 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🔥</span>
                Warmup
              </h6>
              <ul className="space-y-1">
                {day.warmup.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 ml-6">• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Exercises */}
          <div>
            <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💪</span>
              Main Workout
            </h6>
            <div className="space-y-3">
              {day.exercises.map((exercise, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h6 className="font-bold text-gray-900">{exercise.name}</h6>
                      {exercise.targetTest && (
                        <p className="text-xs text-blue-600">Targets: {exercise.targetTest}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    {exercise.sets && (
                      <div>
                        <span className="text-gray-600">Sets:</span> <strong>{exercise.sets}</strong>
                      </div>
                    )}
                    {exercise.reps && (
                      <div>
                        <span className="text-gray-600">Reps:</span> <strong>{exercise.reps}</strong>
                      </div>
                    )}
                    {exercise.duration && (
                      <div>
                        <span className="text-gray-600">Duration:</span> <strong>{exercise.duration}</strong>
                      </div>
                    )}
                    {exercise.rest && (
                      <div>
                        <span className="text-gray-600">Rest:</span> <strong>{exercise.rest}</strong>
                      </div>
                    )}
                    {exercise.intensity && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Intensity:</span> <strong>{exercise.intensity}</strong>
                      </div>
                    )}
                  </div>

                  {exercise.formCues && exercise.formCues.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-2 mt-2">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">📋 Form Cues:</p>
                      <ul className="space-y-1">
                        {exercise.formCues.map((cue, cueIdx) => (
                          <li key={cueIdx} className="text-xs text-yellow-900">• {cue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exercise.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">{exercise.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cooldown */}
          {day.cooldown && day.cooldown.length > 0 && (
            <div>
              <h6 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🧘</span>
                Cooldown
              </h6>
              <ul className="space-y-1">
                {day.cooldown.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 ml-6">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
