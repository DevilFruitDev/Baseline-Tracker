import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  mode: 'stopwatch' | 'countdown';
  initialSeconds?: number; // For countdown mode
  onComplete?: (seconds: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ mode, initialSeconds = 0, onComplete }) => {
  const [seconds, setSeconds] = useState(mode === 'countdown' ? initialSeconds : 0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (mode === 'countdown') {
            const newValue = prev - 1;
            if (newValue <= 0) {
              handleComplete(0);
              return 0;
            }
            // Beep at 3, 2, 1
            if (newValue <= 3 && newValue > 0) {
              playBeep();
            }
            return newValue;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  const playBeep = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleComplete = (finalSeconds: number) => {
    setIsRunning(false);
    setIsPaused(false);
    playBeep();
    playBeep();
    if (onComplete) {
      onComplete(finalSeconds);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    if (mode === 'stopwatch' && onComplete) {
      onComplete(seconds);
    }
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(mode === 'countdown' ? initialSeconds : 0);
  };

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (mode === 'countdown' && initialSeconds > 0) {
      return ((initialSeconds - seconds) / initialSeconds) * 100;
    }
    return 0;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {mode === 'countdown' ? '⏱️ Countdown Timer' : '⏱️ Stopwatch'}
        </h3>
      </div>

      {/* Timer Display */}
      <div className="relative mb-6">
        {mode === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke={seconds <= 3 ? '#ef4444' : '#3b82f6'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
        <div className={`flex items-center justify-center ${mode === 'countdown' ? 'h-48' : 'h-32'}`}>
          <div className={`text-6xl font-bold ${isRunning ? 'text-blue-600 animate-pulse' : 'text-gray-900'} ${seconds <= 3 && mode === 'countdown' ? 'text-red-600' : ''}`}>
            {formatTime(seconds)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning && !isPaused && (
          <button
            onClick={handleStart}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md"
          >
            ▶️ Start
          </button>
        )}

        {isRunning && (
          <button
            onClick={handlePause}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-bold py-3 px-4 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 shadow-md"
          >
            ⏸️ Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={handleResume}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md"
          >
            ▶️ Resume
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            onClick={handleStop}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md"
          >
            ⏹️ Stop
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
        >
          🔄
        </button>
      </div>

      {/* Quick time presets for countdown */}
      {mode === 'countdown' && !isRunning && !isPaused && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-600 mb-2">Quick presets:</p>
          <div className="flex gap-2">
            {[30, 60, 90, 120, 180].map(secs => (
              <button
                key={secs}
                onClick={() => setSeconds(secs)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  seconds === secs
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {secs}s
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
