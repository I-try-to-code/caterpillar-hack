import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTelemetry } from '../context/TelemetryContext';

export interface CoachingPromptItem {
  id: string;
  category: 'efficiency' | 'safety' | 'wear' | 'posture';
  title: string;
  tip: string;
  rationale: string;
  triggerCondition: string;
  priority: 'high' | 'medium' | 'low';
}

const STORAGE_KEY = 'cat_coaching_preferences';

export function useCoachingPrompts() {
  const { telemetry } = useTelemetry();

  // Load permanently excluded IDs from localStorage
  const [excludedIds, setExcludedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Session-only dismissals
  const [sessionDismissedIds, setSessionDismissedIds] = useState<Set<string>>(new Set());

  // Save excluded IDs to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(excludedIds));
      } catch (err) {
        console.warn('Failed to save coaching preferences:', err);
      }
    }
  }, [excludedIds]);

  const allPossiblePrompts: CoachingPromptItem[] = useMemo(() => {
    const list: CoachingPromptItem[] = [];

    // 1. Idling Coaching
    if (telemetry.idleTimeMinutes >= 5) {
      list.push({
        id: 'coach-idle',
        category: 'efficiency',
        title: 'Fuel Conservation Coaching',
        tip: 'Tip: Shut down during long idle periods to reduce fuel consumption.',
        rationale: 'Idle fuel burn rate averages 3.8 L/hr. Shutting down during hauler waits saves fuel and engine wear.',
        triggerCondition: `Idle duration: ${telemetry.idleTimeMinutes.toFixed(1)} min`,
        priority: telemetry.idleTimeMinutes >= 10 ? 'high' : 'medium',
      });
    }

    // 2. Hydraulic Relief Coaching
    if (telemetry.hydraulicPressure > 330) {
      list.push({
        id: 'coach-hydraulic',
        category: 'wear',
        title: 'Hydraulic Circuit Protection',
        tip: 'Tip: Reduce swing speed and curl force to reduce unnecessary hydraulic load.',
        rationale: 'High continuous pressure near 340+ bar opens the relief bypass, causing fluid heating and cylinder seal wear.',
        triggerCondition: `System pressure: ${telemetry.hydraulicPressure} bar`,
        priority: telemetry.hydraulicPressure >= 370 ? 'high' : 'medium',
      });
    }

    // 3. Bucket Height While Tramming Coaching
    if (telemetry.speed > 0 && telemetry.bucketHeight > 1.0) {
      list.push({
        id: 'coach-bucket',
        category: 'safety',
        title: 'Center of Gravity Safety',
        tip: 'Tip: Keep the bucket low while travelling.',
        rationale: 'Carrying the bucket at 0.3m–0.5m lowers the machine center of gravity and minimizes tip-over risk.',
        triggerCondition: `Bucket: ${telemetry.bucketHeight.toFixed(1)}m @ ${telemetry.speed.toFixed(1)} km/h`,
        priority: 'high',
      });
    }

    // 4. Harsh Operation / Dynamic Shock Loading
    if (telemetry.gForce > 1.6) {
      list.push({
        id: 'coach-harsh',
        category: 'wear',
        title: 'Slew & Track Shock Reduction',
        tip: 'Tip: Feather joystick controls when penetrating rocky ground to minimize bearing fatigue.',
        rationale: 'Shock impacts > 1.8g stress the undercarriage idlers, swing bearing teeth, and boom pins.',
        triggerCondition: `Peak G-Force: ${telemetry.gForce.toFixed(2)}g`,
        priority: telemetry.gForce >= 2.2 ? 'high' : 'medium',
      });
    }

    // 5. Driver Posture & Ergonomics
    if (telemetry.postureState !== 'Good') {
      list.push({
        id: 'coach-posture',
        category: 'posture',
        title: 'Operator Ergonomics',
        tip: 'Tip: Adjust your lumbar support and sit upright to reduce spinal fatigue.',
        rationale: `Detected ${telemetry.postureState}. Centered posture prevents operator reaction delay and muscular fatigue.`,
        triggerCondition: `Posture: ${telemetry.postureState}`,
        priority: 'low',
      });
    }

    // 6. Slope Navigation Coaching
    if (telemetry.slopeAngle > 15) {
      list.push({
        id: 'coach-slope',
        category: 'safety',
        title: 'Grade Navigation Best Practice',
        tip: 'Tip: Align tracks vertically with the slope gradient and keep boom low to ground.',
        rationale: 'Traversing slopes diagonally increases sideways rollover moments.',
        triggerCondition: `Incline: ${telemetry.slopeAngle.toFixed(1)}°`,
        priority: telemetry.slopeAngle >= 22 ? 'high' : 'medium',
      });
    }

    return list;
  }, [telemetry]);

  // Filter out session-dismissed and permanently excluded prompts
  const activeCoachingPrompts = useMemo(() => {
    return allPossiblePrompts.filter(
      (p) => !sessionDismissedIds.has(p.id) && !excludedIds.includes(p.id)
    );
  }, [allPossiblePrompts, sessionDismissedIds, excludedIds]);

  const dismissPrompt = useCallback((id: string) => {
    setSessionDismissedIds((prev) => new Set(prev).add(id));
  }, []);

  const neverShowAgain = useCallback((id: string) => {
    setExcludedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resetPreferences = useCallback(() => {
    setExcludedIds([]);
    setSessionDismissedIds(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    activeCoachingPrompts,
    dismissPrompt,
    neverShowAgain,
    resetPreferences,
    hasHiddenPrompts: excludedIds.length > 0 || sessionDismissedIds.size > 0,
  };
}
