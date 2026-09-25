import { Alert, AlertSeverity, AppModule } from '../types/alerts';
import { TelemetryState } from '../types/telemetry';

export interface ConditionSnapshot {
  id: string;
  name: string;
  severity: AlertSeverity | 'safe';
  value: string;
  threshold: string;
  lastUpdated: number;
}

export interface TransitionResult {
  newAlerts: Alert[];
  updatedConditions: Map<string, ConditionSnapshot>;
  clearedConditions: string[];
}

const SEVERITY_RANK: Record<AlertSeverity | 'safe', number> = {
  critical: 4,
  danger: 3,
  warning: 2,
  info: 1,
  safe: 0,
};

export function getSeverityRank(sev: AlertSeverity | 'safe'): number {
  return SEVERITY_RANK[sev] ?? 0;
}

export function sortAlertsByPriority(alerts: Alert[]): Alert[] {
  return [...alerts].sort((a, b) => {
    const diff = getSeverityRank(b.severity) - getSeverityRank(a.severity);
    if (diff !== 0) return diff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

interface EvaluatedCondition {
  id: string;
  name: string;
  severity: AlertSeverity | 'safe';
  module: AppModule;
  title: string;
  message: string;
  voiceText: string;
  value: string;
  threshold: string;
}

/**
 * Pure evaluation function: computes current status for each monitored condition.
 */
function evaluateAllConditions(telemetry: TelemetryState): EvaluatedCondition[] {
  const conditions: EvaluatedCondition[] = [];

  // 1. Proximity
  const prox = telemetry.proximityDistance;
  if (prox < 3.0) {
    conditions.push({
      id: 'condition-proximity',
      name: 'Proximity Obstacle',
      severity: 'critical',
      module: 'B',
      title: 'Critical Proximity Breach',
      message: `Obstacle at ${prox.toFixed(1)}m — less than 3m emergency buffer.`,
      voiceText: `Critical proximity alert. Obstacle at ${prox.toFixed(1)} meters. Stop machine immediately.`,
      value: `${prox.toFixed(1)}m`,
      threshold: '< 3.0m',
    });
  } else if (prox < 5.0) {
    conditions.push({
      id: 'condition-proximity',
      name: 'Proximity Obstacle',
      severity: 'danger',
      module: 'B',
      title: 'Danger Zone Breach',
      message: `Obstacle at ${prox.toFixed(1)}m inside 5m safety perimeter.`,
      voiceText: `Danger zone breach. Object at ${prox.toFixed(1)} meters. Caution advised.`,
      value: `${prox.toFixed(1)}m`,
      threshold: '< 5.0m',
    });
  } else if (prox <= 10.0) {
    conditions.push({
      id: 'condition-proximity',
      name: 'Proximity Obstacle',
      severity: 'warning',
      module: 'B',
      title: 'Proximity Caution',
      message: `Object detected at ${prox.toFixed(1)}m within caution perimeter.`,
      voiceText: `Proximity caution. Object at ${prox.toFixed(1)} meters.`,
      value: `${prox.toFixed(1)}m`,
      threshold: '< 10.0m',
    });
  } else {
    conditions.push({
      id: 'condition-proximity',
      name: 'Proximity Obstacle',
      severity: 'safe',
      module: 'B',
      title: 'Proximity Clear',
      message: `Perimeter clear: ${prox.toFixed(1)}m`,
      voiceText: 'Proximity perimeter cleared.',
      value: `${prox.toFixed(1)}m`,
      threshold: '> 10.0m',
    });
  }

  // 2. Slope / Incline
  const slope = telemetry.slopeAngle;
  if (slope >= 25.0) {
    conditions.push({
      id: 'condition-slope',
      name: 'Slope Inclinometer',
      severity: 'critical',
      module: 'B',
      title: 'Rollover Risk — Extreme Slope',
      message: `Slope angle ${slope.toFixed(1)}° exceeds 25° critical rollover limit.`,
      voiceText: `Critical slope warning. Angle ${slope.toFixed(0)} degrees. Risk of rollover. Lower bucket immediately.`,
      value: `${slope.toFixed(1)}°`,
      threshold: '≥ 25.0°',
    });
  } else if (slope >= 15.0) {
    conditions.push({
      id: 'condition-slope',
      name: 'Slope Inclinometer',
      severity: 'warning',
      module: 'B',
      title: 'Elevated Slope Grade',
      message: `Grade at ${slope.toFixed(1)}° within 15°–25° caution band.`,
      voiceText: `Caution: Slope grade at ${slope.toFixed(0)} degrees.`,
      value: `${slope.toFixed(1)}°`,
      threshold: '≥ 15.0°',
    });
  } else {
    conditions.push({
      id: 'condition-slope',
      name: 'Slope Inclinometer',
      severity: 'safe',
      module: 'B',
      title: 'Slope Nominal',
      message: `Stable grade at ${slope.toFixed(1)}°`,
      voiceText: 'Slope angle returned to safe operating level.',
      value: `${slope.toFixed(1)}°`,
      threshold: '< 15.0°',
    });
  }

  // 3. Trench Edge Proximity
  const trench = telemetry.trenchDistance;
  if (trench < 2.0) {
    conditions.push({
      id: 'condition-trench',
      name: 'Trench Proximity',
      severity: 'critical',
      module: 'B',
      title: 'Trench Edge Danger',
      message: `Trench edge ${trench.toFixed(1)} ft away — STOP machine travel immediately!`,
      voiceText: `Danger: Trench edge ${trench.toFixed(1)} feet away. Stop movement now.`,
      value: `${trench.toFixed(1)} ft`,
      threshold: '< 2.0 ft',
    });
  } else if (trench <= 4.0) {
    conditions.push({
      id: 'condition-trench',
      name: 'Trench Proximity',
      severity: 'warning',
      module: 'B',
      title: 'Trench Edge Caution',
      message: `Trench edge ${trench.toFixed(1)} ft away approaching limit.`,
      voiceText: `Trench caution: ${trench.toFixed(1)} feet from edge.`,
      value: `${trench.toFixed(1)} ft`,
      threshold: '< 4.0 ft',
    });
  } else {
    conditions.push({
      id: 'condition-trench',
      name: 'Trench Proximity',
      severity: 'safe',
      module: 'B',
      title: 'Trench Clearance Safe',
      message: `Trench clearance ${trench.toFixed(1)} ft safe`,
      voiceText: 'Trench edge clearance safe.',
      value: `${trench.toFixed(1)} ft`,
      threshold: '> 4.0 ft',
    });
  }

  // 4. Seatbelt Interlock
  const seatbelt = telemetry.seatbeltFastened;
  const speed = telemetry.speed;
  if (!seatbelt && speed > 0) {
    conditions.push({
      id: 'condition-seatbelt',
      name: 'Seatbelt Safety',
      severity: 'critical',
      module: 'B',
      title: 'Machine Interlock — Fasten Seatbelt',
      message: 'Machine locked: operator seatbelt unfastened during machine travel.',
      voiceText: 'Machine interlock active. Fasten seatbelt before proceeding.',
      value: 'Unfastened / In Motion',
      threshold: 'Fastened',
    });
  } else if (!seatbelt) {
    conditions.push({
      id: 'condition-seatbelt',
      name: 'Seatbelt Safety',
      severity: 'warning',
      module: 'B',
      title: 'Seatbelt Unlatched',
      message: 'Operator seatbelt unfastened while engine is running.',
      voiceText: 'Seatbelt unlatched. Please fasten seatbelt.',
      value: 'Unfastened',
      threshold: 'Fastened',
    });
  } else {
    conditions.push({
      id: 'condition-seatbelt',
      name: 'Seatbelt Safety',
      severity: 'safe',
      module: 'B',
      title: 'Seatbelt Fastened',
      message: 'Seatbelt secured and locked.',
      voiceText: 'Seatbelt fastened.',
      value: 'Fastened',
      threshold: 'Fastened',
    });
  }

  // 5. Personnel in Blindspot
  const personnel = telemetry.nearbyPersonnel;
  if (personnel > 0) {
    conditions.push({
      id: 'condition-personnel',
      name: 'Personnel Detection',
      severity: 'critical',
      module: 'B',
      title: 'Personnel in Swing Zone',
      message: `${personnel} worker(s) detected inside excavator swing perimeter!`,
      voiceText: `Alert: Personnel detected in swing radius. Cease rotation and sound horn.`,
      value: `${personnel} detected`,
      threshold: '0',
    });
  } else {
    conditions.push({
      id: 'condition-personnel',
      name: 'Personnel Detection',
      severity: 'safe',
      module: 'B',
      title: 'Swing Zone Clear',
      message: 'No personnel in blindspot radius.',
      voiceText: 'Personnel swing zone clear.',
      value: '0 detected',
      threshold: '0',
    });
  }

  // 6. Engine Thermal Overload
  const temp = telemetry.engineTemp;
  if (temp > 115) {
    conditions.push({
      id: 'condition-thermal',
      name: 'Engine Thermal',
      severity: 'critical',
      module: 'D',
      title: 'Engine Thermal Overload',
      message: `Coolant temperature at ${temp}°C exceeds 115°C critical limit.`,
      voiceText: `Critical warning: Engine coolant at ${temp} degrees. Idle engine in neutral.`,
      value: `${temp}°C`,
      threshold: '≤ 115°C',
    });
  } else if (temp > 105) {
    conditions.push({
      id: 'condition-thermal',
      name: 'Engine Thermal',
      severity: 'warning',
      module: 'D',
      title: 'High Engine Temperature',
      message: `Coolant temperature at ${temp}°C elevated above normal.`,
      voiceText: `Caution: Engine temperature elevated at ${temp} degrees.`,
      value: `${temp}°C`,
      threshold: '≤ 105°C',
    });
  } else {
    conditions.push({
      id: 'condition-thermal',
      name: 'Engine Thermal',
      severity: 'safe',
      module: 'D',
      title: 'Engine Temp Normal',
      message: `Operating temperature at ${temp}°C nominal.`,
      voiceText: 'Engine temperature nominal.',
      value: `${temp}°C`,
      threshold: '< 105°C',
    });
  }

  // 7. Hydraulic System Pressure
  const hyd = telemetry.hydraulicPressure;
  if (hyd > 370) {
    conditions.push({
      id: 'condition-hydraulic',
      name: 'Hydraulic System',
      severity: 'danger',
      module: 'D',
      title: 'Hydraulic Pressure Overload',
      message: `System pressure at ${hyd} bar exceeds 370 bar rated capacity.`,
      voiceText: `Warning: Hydraulic pressure overload at ${hyd} bar. Reduce hydraulic load.`,
      value: `${hyd} bar`,
      threshold: '≤ 370 bar',
    });
  } else if (hyd > 340) {
    conditions.push({
      id: 'condition-hydraulic',
      name: 'Hydraulic System',
      severity: 'warning',
      module: 'D',
      title: 'High Hydraulic Pressure',
      message: `System pressure at ${hyd} bar approaching relief limit.`,
      voiceText: `Notice: Hydraulic pressure high at ${hyd} bar.`,
      value: `${hyd} bar`,
      threshold: '≤ 340 bar',
    });
  } else {
    conditions.push({
      id: 'condition-hydraulic',
      name: 'Hydraulic System',
      severity: 'safe',
      module: 'D',
      title: 'Hydraulic Pressure Normal',
      message: `System pressure at ${hyd} bar nominal.`,
      voiceText: 'Hydraulic pressure stabilized.',
      value: `${hyd} bar`,
      threshold: '< 340 bar',
    });
  }

  return conditions;
}

/**
 * State Transition Engine:
 * Compares current conditions against previous snapshots.
 * Returns only meaningful transitions:
 * - 'started': condition enters a non-safe state from safe or unmonitored.
 * - 'escalated': condition severity increases (e.g., warning -> danger, danger -> critical).
 * - 'normalized': condition returns to safe from an alert state.
 */
export function processStateTransitions(
  telemetry: TelemetryState,
  previousConditions: Map<string, ConditionSnapshot>
): TransitionResult {
  const currentConditions = evaluateAllConditions(telemetry);
  const updatedConditions = new Map<string, ConditionSnapshot>(previousConditions);
  const newAlerts: Alert[] = [];
  const clearedConditions: string[] = [];

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  for (const cond of currentConditions) {
    const prev = previousConditions.get(cond.id);
    const prevSeverity: AlertSeverity | 'safe' = prev ? prev.severity : 'safe';
    const currentSeverity = cond.severity;

    const prevRank = getSeverityRank(prevSeverity);
    const currentRank = getSeverityRank(currentSeverity);

    if (currentSeverity === 'safe') {
      if (prev && prevSeverity !== 'safe') {
        // Condition cleared -> returned to normal!
        clearedConditions.push(cond.id);
        updatedConditions.set(cond.id, {
          id: cond.id,
          name: cond.name,
          severity: 'safe',
          value: cond.value,
          threshold: cond.threshold,
          lastUpdated: Date.now(),
        });

        // Add info alert for normalization
        newAlerts.push({
          id: `${cond.id}-norm-${Date.now()}`,
          timestamp: timeStr,
          severity: 'info',
          module: cond.module,
          title: `${cond.name} Normalized`,
          message: `${cond.name} returned to normal operating threshold (${cond.value}).`,
          voiceText: `${cond.name} returned to safe operating level.`,
          acknowledged: true,
          escalated: false,
          conditionId: cond.id,
          stateTransition: 'normalized',
          active: false,
        });
      }
    } else {
      // Condition is in an active alert state (warning, danger, or critical)
      let transition: 'started' | 'escalated' | null = null;

      if (!prev || prevSeverity === 'safe') {
        transition = 'started';
      } else if (currentRank > prevRank) {
        transition = 'escalated';
      }

      if (transition) {
        // Genuine transition triggered!
        const alertObj: Alert = {
          id: `${cond.id}-${Date.now()}`,
          timestamp: timeStr,
          severity: currentSeverity as AlertSeverity,
          module: cond.module,
          title: cond.title,
          message: cond.message,
          voiceText: cond.voiceText,
          acknowledged: false,
          escalated: false,
          conditionId: cond.id,
          stateTransition: transition,
          active: true,
        };

        newAlerts.push(alertObj);
      }

      // Update snapshot if severity or value changed meaningfully
      if (!prev || prev.severity !== currentSeverity || prev.value !== cond.value) {
        updatedConditions.set(cond.id, {
          id: cond.id,
          name: cond.name,
          severity: currentSeverity,
          value: cond.value,
          threshold: cond.threshold,
          lastUpdated: Date.now(),
        });
      }
    }
  }

  return {
    newAlerts,
    updatedConditions,
    clearedConditions,
  };
}
