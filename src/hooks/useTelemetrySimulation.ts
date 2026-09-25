import { useState, useEffect, useRef } from 'react';
import { useTelemetry } from '../context/TelemetryContext';

interface UseTelemetrySimulationReturn {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  toggleSimulation: () => void;
}

export function useTelemetrySimulation(intervalMs = 3000): UseTelemetrySimulationReturn {
  const { telemetry, updateTelemetry } = useTelemetry();
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Use refs to avoid stale closures in setInterval while keeping dependencies clean
  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  const cycleCounterRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    const intervalSeconds = intervalMs / 1000;

    const timer = setInterval(() => {
      const current = telemetryRef.current;

      // Realistic fuel burn rate based on current RPM
      let fuelBurnRatePerHour = 0;
      if (current.engineRPM > 1900) {
        fuelBurnRatePerHour = 22.5; // Heavy digging
      } else if (current.engineRPM > 1000) {
        fuelBurnRatePerHour = 14.8; // Standard working
      } else if (current.engineRPM > 0) {
        fuelBurnRatePerHour = 4.2; // Low idle
      }

      const fuelAdded = (fuelBurnRatePerHour * intervalSeconds) / 3600;

      // Engine hours increment proportionally if engine is running
      const engineHoursAdded = current.engineRPM > 0 ? intervalSeconds / 3600 : 0;

      // Continuous operating minutes increment slowly (accumulated fractional minutes)
      const minutesAdded = current.engineRPM > 0 ? intervalSeconds / 60 : 0;

      // Increment load cycle if machine is actively working (speed > 1 and bucket elevated)
      cycleCounterRef.current += 1;
      let newLoadCycles = current.loadCycles;
      if (
        cycleCounterRef.current >= 10 &&
        current.engineRPM > 1200 &&
        current.bucketHeight > 0.8
      ) {
        newLoadCycles += 1;
        cycleCounterRef.current = 0;
      }

      // Update ONLY derived variables (never user slider values)
      updateTelemetry({
        engineHours: Number((current.engineHours + engineHoursAdded).toFixed(4)),
        fuelUsedLiters: Number((current.fuelUsedLiters + fuelAdded).toFixed(3)),
        continuousOpMinutes: Math.min(
          120,
          Math.round(current.continuousOpMinutes + minutesAdded)
        ),
        loadCycles: newLoadCycles,
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, intervalMs, updateTelemetry]);

  const toggleSimulation = () => setIsRunning((prev) => !prev);

  return {
    isRunning,
    setIsRunning,
    toggleSimulation,
  };
}
