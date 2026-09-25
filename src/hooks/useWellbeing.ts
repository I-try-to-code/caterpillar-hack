import { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';

export function useWellbeing(): {
  badPostureSeconds: number;
  badPostureMinutes: number;
  postureSeverity: 'safe' | 'caution' | 'danger';
  showStretchReminder: boolean;
  dismissStretch: () => void;
  snoozeStretch: (minutes?: number) => void;
} {
  const { telemetry } = useTelemetry();
  const [badPostureSeconds, setBadPostureSeconds] = useState<number>(140); // default to 2m 20s for demo visibility
  const [snoozeUntil, setSnoozeUntil] = useState<number>(0);
  const [stretchDismissed, setStretchDismissed] = useState<boolean>(false);

  // Timer tracking seconds spent in bad posture
  useEffect(() => {
    if (telemetry.postureState === 'Good') {
      setBadPostureSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setBadPostureSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [telemetry.postureState]);

  const badPostureMinutes = Math.floor(badPostureSeconds / 60);

  // Posture alert thresholds: >2 min = caution, >5 min = danger
  let postureSeverity: 'safe' | 'caution' | 'danger' = 'safe';
  if (telemetry.postureState !== 'Good') {
    if (badPostureMinutes >= 5) {
      postureSeverity = 'danger';
    } else if (badPostureMinutes >= 2) {
      postureSeverity = 'caution';
    } else {
      postureSeverity = 'caution';
    }
  }

  // Stretch reminder logic: continuous operating minutes >= 60 and not idling
  const isOperatingLong = telemetry.continuousOpMinutes >= 60 && telemetry.idleTimeMinutes < 5;
  const isSnoozed = Date.now() < snoozeUntil;
  const showStretchReminder = isOperatingLong && !isSnoozed && !stretchDismissed;

  const dismissStretch = () => {
    setStretchDismissed(true);
  };

  const snoozeStretch = (minutes = 10) => {
    setSnoozeUntil(Date.now() + minutes * 60 * 1000);
  };

  return {
    badPostureSeconds,
    badPostureMinutes,
    postureSeverity,
    showStretchReminder,
    dismissStretch,
    snoozeStretch,
  };
}
