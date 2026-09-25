import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useVoiceAlertContext } from '../context/VoiceAlertContext';
import { ActiveAnomaly, AnomalyHistoryRecord } from '../types/anomalies';
import { detectActiveAnomalies, calculateIdleFuelWaste } from '../lib/anomalyRules';
import { INITIAL_ANOMALY_HISTORY } from '../data/anomalyHistory';

export interface AnomalySummaryMetrics {
  totalIdleMinutes: number;
  harshEventsCount: number;
  hydraulicSpikesCount: number;
  bucketTravelWarningsCount: number;
  totalFuelWastedLiters: number;
  totalFuelCostUSD: number;
  activeCount: number;
  hasCriticalAnomalies: boolean;
}

export function useAnomalyDetection(): {
  activeAnomalies: ActiveAnomaly[];
  anomalyHistory: AnomalyHistoryRecord[];
  summary: AnomalySummaryMetrics;
  clearAnomalyHistory: () => void;
} {
  const { telemetry } = useTelemetry();
  const { triggerManualAlert } = useVoiceAlertContext();

  const [activeAnomalies, setActiveAnomalies] = useState<ActiveAnomaly[]>([]);
  const [anomalyHistory, setAnomalyHistory] = useState<AnomalyHistoryRecord[]>(INITIAL_ANOMALY_HISTORY);

  // Suppression ref to prevent repeated voice alerts for the same condition
  const announcedSignaturesRef = useRef<Map<string, number>>(new Map());

  // Evaluate active anomalies on telemetry change
  useEffect(() => {
    const detected = detectActiveAnomalies(telemetry);
    setActiveAnomalies(detected);

    const now = Date.now();

    detected.forEach((anom) => {
      // Signature key includes category and severity
      const sigKey = `${anom.category}:${anom.severity}`;
      const lastAnnounced = announcedSignaturesRef.current.get(sigKey) || 0;

      // Announce if new or if > 25 seconds have elapsed
      if (now - lastAnnounced > 25000) {
        announcedSignaturesRef.current.set(sigKey, now);

        // Feed into central Voice Alert System
        triggerManualAlert({
          severity: anom.severity,
          module: 'D',
          title: anom.title,
          message: anom.description,
          voiceText: anom.voiceText,
          conditionId: anom.id,
          stateTransition: 'started',
        });

        // Record in history log
        setAnomalyHistory((prev) => [
          {
            id: `anom-hist-${Date.now()}`,
            timestamp: anom.timestamp,
            category: anom.category,
            severity: anom.severity,
            title: anom.title,
            value: anom.currentValue,
            durationMinutes: anom.metrics?.durationMinutes,
            fuelWastedLiters: anom.metrics?.fuelWastedLiters,
            recommendation: anom.recommendation,
          },
          ...prev.slice(0, 49), // retain up to 50 historical entries
        ]);
      }
    });
  }, [telemetry, triggerManualAlert]);

  // Aggregate summary calculations
  const summary: AnomalySummaryMetrics = useMemo(() => {
    let idleMins = telemetry.idleTimeMinutes;
    let harshCount = 0;
    let hydSpikes = 0;
    let bucketWarnings = 0;

    // Accumulate from history
    anomalyHistory.forEach((rec) => {
      if (rec.category === 'harsh_operation') harshCount += 1;
      if (rec.category === 'hydraulic_pressure') hydSpikes += 1;
      if (rec.category === 'bucket_travel') bucketWarnings += 1;
      if (rec.durationMinutes && rec.category === 'idling') {
        idleMins += rec.durationMinutes;
      }
    });

    const { liters, costUSD } = calculateIdleFuelWaste(idleMins);
    const hasCritical = activeAnomalies.some((a) => a.severity === 'critical');

    return {
      totalIdleMinutes: Number(idleMins.toFixed(1)),
      harshEventsCount: harshCount,
      hydraulicSpikesCount: hydSpikes,
      bucketTravelWarningsCount: bucketWarnings,
      totalFuelWastedLiters: liters,
      totalFuelCostUSD: costUSD,
      activeCount: activeAnomalies.length,
      hasCriticalAnomalies: hasCritical,
    };
  }, [telemetry.idleTimeMinutes, activeAnomalies, anomalyHistory]);

  const clearAnomalyHistory = useCallback(() => {
    setAnomalyHistory([]);
  }, []);

  return {
    activeAnomalies,
    anomalyHistory,
    summary,
    clearAnomalyHistory,
  };
}
