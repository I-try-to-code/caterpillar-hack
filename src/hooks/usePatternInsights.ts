import { useMemo } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useVoiceAlerts } from './useVoiceAlerts';
import { useIncidentLogger } from './useIncidentLogger';
import { useAnomalyDetection } from './useAnomalyDetection';
import { PatternInsight, OperatorContextSnapshot } from '../types/anomalies';
import { INITIAL_TASKS } from '../data/tasks';
import {
  generateSituationSummary,
  evaluateMachineSafety,
} from '../lib/calculations';
import { evaluateMachineHealthScore } from '../lib/anomalyRules';

export function usePatternInsights(): {
  patternInsights: PatternInsight[];
  operatorContextSnapshot: OperatorContextSnapshot;
} {
  const { telemetry } = useTelemetry();
  const { activeAlerts } = useVoiceAlerts();
  const { incidents } = useIncidentLogger();
  const { activeAnomalies, anomalyHistory, summary } = useAnomalyDetection();

  const currentTask = INITIAL_TASKS[0] || null;
  const safetyStatus = evaluateMachineSafety(telemetry);
  const situationSummary = currentTask ? generateSituationSummary(telemetry, currentTask) : null;
  const healthScore = evaluateMachineHealthScore(telemetry);

  // Deterministic Pattern Insights
  const patternInsights: PatternInsight[] = useMemo(() => {
    const insights: PatternInsight[] = [];

    // 1. Harsh Operation Frequency Insight
    if (summary.harshEventsCount >= 2 || telemetry.gForce > 1.8) {
      insights.push({
        id: 'insight-harsh-freq',
        category: 'wear',
        title: 'Frequent Shock Loading Detected',
        description: `${summary.harshEventsCount} harsh-operation impacts recorded during current shift. High stress on slewing ring and undercarriage.`,
        metric: `${summary.harshEventsCount} shock events`,
        trend: 'worsening',
        recommendation: 'Feather joystick controls when engaging tough earth and avoid rapid swing reversals.',
        confidence: 93,
      });
    }

    // 2. Idle Time Shift Trend Insight
    if (summary.totalIdleMinutes > 20 || telemetry.idleTimeMinutes >= 5) {
      insights.push({
        id: 'insight-idle-trend',
        category: 'efficiency',
        title: 'Standby Idling Escalation',
        description: `Idle time (${summary.totalIdleMinutes} min) has increased significantly compared with early shift baseline, wasting ~${summary.totalFuelWastedLiters}L fuel.`,
        metric: `${summary.totalIdleMinutes} min idle (${summary.totalFuelCostUSD} USD wasted)`,
        trend: 'worsening',
        recommendation: 'Shut down engine during extended truck queuing or berm stabilization delays.',
        confidence: 95,
      });
    } else {
      insights.push({
        id: 'insight-idle-optimal',
        category: 'efficiency',
        title: 'Fuel Economy & Idle Ratio Nominal',
        description: 'Engine idle duration remains within the target 12% shift efficiency envelope.',
        metric: `${summary.totalIdleMinutes} min accumulated idle`,
        trend: 'improving',
        recommendation: 'Maintain continuous digging-cycle rhythm without unneeded standby.',
        confidence: 88,
      });
    }

    // 3. Bucket Height While Travelling Insight
    if (summary.bucketTravelWarningsCount > 0 || (telemetry.speed > 0 && telemetry.bucketHeight > 1.2)) {
      insights.push({
        id: 'insight-bucket-travel',
        category: 'safety',
        title: 'Elevated Bucket Tramming Pattern',
        description: 'Repeated instances of machine travel with bucket above the 1.2m center-of-gravity safe height.',
        metric: `${telemetry.bucketHeight.toFixed(1)}m bucket @ ${telemetry.speed.toFixed(1)} km/h`,
        trend: 'worsening',
        recommendation: 'Mandate carrying bucket at 0.3m–0.5m above ground grade prior to track movement.',
        confidence: 96,
      });
    }

    // 4. Hydraulic System Load Correlation Insight
    if (summary.hydraulicSpikesCount >= 2 || telemetry.hydraulicPressure > 340) {
      insights.push({
        id: 'insight-hydraulic-stress',
        category: 'wear',
        title: 'Hydraulic Relief Cycling in Dense Material',
        description: `High system pressure (${telemetry.hydraulicPressure} bar) correlates with deep trench breakout forces nearing relief valve limits.`,
        metric: `${summary.hydraulicSpikesCount} pressure spikes`,
        trend: 'worsening',
        recommendation: 'Take shallower bucket passes in compacted material to avoid continuous hydraulic relief bypass.',
        confidence: 91,
      });
    } else {
      insights.push({
        id: 'insight-hydraulic-nominal',
        category: 'wear',
        title: 'Hydraulic Circuit Envelope Stable',
        description: `Hydraulic working pressure averages ${telemetry.hydraulicPressure} bar, well within the 340 bar continuous duty limit.`,
        metric: `${telemetry.hydraulicPressure} bar normal`,
        trend: 'stable',
        recommendation: 'Hydraulic pump displacement and cooler performance are operating optimally.',
        confidence: 94,
      });
    }

    // 5. Behavioral Fatigue & Posture Correlation
    if (telemetry.postureState !== 'Good') {
      insights.push({
        id: 'insight-posture-fatigue',
        category: 'behavioral',
        title: 'Operator Ergonomic Fatigue Indicator',
        description: `Driver posture posture state (${telemetry.postureState}) observed during continuous operation.`,
        metric: `Posture: ${telemetry.postureState}`,
        trend: 'worsening',
        recommendation: 'Take a scheduled 60-second in-cab lumbar stretch and check seat suspension.',
        confidence: 89,
      });
    }

    return insights;
  }, [summary, telemetry]);

  // Unified OperatorContextSnapshot object for future AI Assistant
  const operatorContextSnapshot: OperatorContextSnapshot = useMemo(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const derivedHydTemp = Math.round(
      0.65 * telemetry.engineTemp + (telemetry.hydraulicPressure / 400) * 35
    );

    let sealIntegrity = 99;
    if (telemetry.hydraulicPressure > 370) sealIntegrity = 74;
    else if (telemetry.hydraulicPressure > 340) sealIntegrity = 86;

    let trackTension = 'Nominal / Calibrated';
    if (telemetry.gForce > 2.4 || (telemetry.speed > 22 && telemetry.slopeAngle > 18)) {
      trackTension = 'High Strain';
    } else if (telemetry.speed > 16 || telemetry.slopeAngle > 15) {
      trackTension = 'Loaded';
    }

    return {
      timestamp: timeStr,
      telemetry: { ...telemetry },
      currentTask,
      safetyStatus,
      activeAlerts: [...activeAlerts],
      recentIncidents: [...incidents],
      activeAnomalies: [...activeAnomalies],
      anomalyHistory: [...anomalyHistory],
      machineHealth: {
        overallIndex: healthScore,
        oilPressureStatus: telemetry.oilPressure < 35 ? 'Low Warning' : 'Nominal',
        hydraulicTempStatus: derivedHydTemp > 90 ? 'High' : 'Nominal',
        coolantStatus: telemetry.coolantLevel < 50 ? 'Caution' : 'Nominal',
        sealIntegrity,
        trackTension,
      },
      weather: telemetry.weatherCondition,
      operatorWellbeing: {
        postureState: telemetry.postureState,
        badPostureMinutes: telemetry.postureState !== 'Good' ? 4 : 0,
        stretchReminderDue: telemetry.continuousOpMinutes >= 60,
      },
      situationSummary,
    };
  }, [
    telemetry,
    currentTask,
    safetyStatus,
    activeAlerts,
    incidents,
    activeAnomalies,
    anomalyHistory,
    healthScore,
    situationSummary,
  ]);

  return {
    patternInsights,
    operatorContextSnapshot,
  };
}
