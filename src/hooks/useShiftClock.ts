import { useState, useEffect } from 'react';

/**
 * Tracks elapsed shift time for the operator shift.
 * Initialized to a realistic elapsed shift duration (4h 38m 12s) and ticks every second.
 */
export function useShiftClock(initialSeconds = 4 * 3600 + 38 * 60 + 12): {
  elapsedFormatted: string;
  elapsedSeconds: number;
  resetShiftClock: () => void;
} {
  const [seconds, setSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const resetShiftClock = () => {
    setSeconds(0);
  };

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const elapsedFormatted = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;

  return { elapsedFormatted, elapsedSeconds: seconds, resetShiftClock };
}
