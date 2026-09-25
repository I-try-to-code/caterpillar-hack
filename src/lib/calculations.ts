import { TelemetryState, WeatherCondition } from '../types/telemetry';
import { ScheduledTask } from '../types/tasks';

export interface SafetyCheckItem {
  id: string;
  name: string;
  status: 'pass' | 'caution' | 'danger';
  currentValue: string;
  reason: string;
}

export interface TransparentSafetyResult {
  overall: 'safe' | 'caution' | 'danger';
  title: string;
  checks: SafetyCheckItem[];
}

/**
 * Transparent Safety Status evaluator listing explicit pass/caution/danger reasons
 */
export function evaluateTransparentSafety(state: TelemetryState): TransparentSafetyResult {
  const checks: SafetyCheckItem[] = [
    // 1. Proximity Distance
    {
      id: 'proximity',
      name: 'Proximity Distance',
      status:
        state.proximityDistance < 3.0
          ? 'danger'
          : state.proximityDistance < 5.0
          ? 'caution'
          : 'pass',
      currentValue: `${state.proximityDistance.toFixed(1)}m`,
      reason:
        state.proximityDistance < 3.0
          ? `Perimeter breach (< 3.0m buffer)`
          : state.proximityDistance < 5.0
          ? `Entering proximity caution zone (< 5.0m)`
          : `Clear zone (> 5.0m clearance)`,
    },
    // 2. Slope Inclinometer
    {
      id: 'slope',
      name: 'Slope Inclinometer',
      status: state.slopeAngle > 20 ? 'danger' : state.slopeAngle > 12 ? 'caution' : 'pass',
      currentValue: `${state.slopeAngle.toFixed(1)}°`,
      reason:
        state.slopeAngle > 20
          ? `Severe rollover hazard (> 20° limit)`
          : state.slopeAngle > 12
          ? `Elevated incline angle (> 12°)`
          : `Safe operating grade (≤ 12°)`,
    },
    // 3. Seatbelt Interlock
    {
      id: 'seatbelt',
      name: 'Seatbelt Interlock',
      status: state.seatbeltFastened ? 'pass' : 'danger',
      currentValue: state.seatbeltFastened ? 'Fastened' : 'Unfastened',
      reason: state.seatbeltFastened
        ? `Operator seatbelt engaged`
        : `Operator seatbelt unlatched violation`,
    },
    // 4. Trench Distance
    {
      id: 'trench',
      name: 'Trench Distance',
      status: state.trenchDistance < 3.0 ? 'danger' : state.trenchDistance < 5.0 ? 'caution' : 'pass',
      currentValue: `${state.trenchDistance.toFixed(1)}m`,
      reason:
        state.trenchDistance < 3.0
          ? `Critical trench edge proximity (< 3.0m)`
          : state.trenchDistance < 5.0
          ? `Approaching trench caution boundary`
          : `Safe distance from bench edge`,
    },
    // 5. Driver Posture
    {
      id: 'posture',
      name: 'Operator Posture',
      status:
        state.postureState === 'Good'
          ? 'pass'
          : state.postureState === 'Slouching'
          ? 'caution'
          : 'danger',
      currentValue: state.postureState,
      reason:
        state.postureState === 'Good'
          ? `Optimal ergonomic spinal alignment`
          : state.postureState === 'Slouching'
          ? `Operator slouching detected (fatigue risk)`
          : `Unbalanced leaning posture detected`,
    },
    // 6. Nearby Personnel
    {
      id: 'personnel',
      name: 'Nearby Personnel',
      status: state.nearbyPersonnel > 0 ? 'danger' : 'pass',
      currentValue: `${state.nearbyPersonnel} pers`,
      reason:
        state.nearbyPersonnel > 0
          ? `${state.nearbyPersonnel} unauthorized worker(s) inside swing radius`
          : `Zero ground workers inside machine perimeter`,
    },
    // 7. Engine Thermal Status
    {
      id: 'temp',
      name: 'Engine Temperature',
      status: state.engineTemp > 115 ? 'danger' : state.engineTemp > 98 ? 'caution' : 'pass',
      currentValue: `${state.engineTemp}°C`,
      reason:
        state.engineTemp > 115
          ? `Critical thermal overload (> 115°C)`
          : state.engineTemp > 98
          ? `High engine thermal load (98–115°C)`
          : `Nominal operating temperature (80–95°C)`,
    },
  ];

  const hasDanger = checks.some((c) => c.status === 'danger');
  const hasCaution = checks.some((c) => c.status === 'caution');

  const overall = hasDanger ? 'danger' : hasCaution ? 'caution' : 'safe';
  const title =
    overall === 'danger'
      ? 'Immediate Attention Required'
      : overall === 'caution'
      ? 'Attention Required'
      : 'Normal';

  return { overall, title, checks };
}

/**
 * Standard simple safety check helper
 */
export function evaluateMachineSafety(state: TelemetryState): 'safe' | 'caution' | 'danger' {
  return evaluateTransparentSafety(state).overall;
}

export interface TaskTimeCalculation {
  baseMinutes: number;
  weatherFactor: number;
  slopeFactor: number;
  efficiencyScore: number;
  estimatedMinutes: number;
  remainingMinutes: number;
}

/**
 * Conceptual task time formula:
 * baseTime × weatherFactor × slopeFactor × operatorEfficiencyScore
 */
export function calculateTaskTime(
  baseMinutes: number,
  weather: WeatherCondition,
  slopeAngle: number,
  progress = 0,
  efficiencyScore = 0.95
): TaskTimeCalculation {
  // Weather Factor
  let weatherFactor = 1.0;
  if (weather === 'Rain') weatherFactor = 1.15;
  else if (weather === 'Heavy Rain') weatherFactor = 1.4;
  else if (weather === 'Storm') weatherFactor = 1.6;

  // Slope factor increases with slope (e.g. 0° = 1.0, 10° = 1.1, 25° = 1.25, 45° = 1.45)
  const slopeFactor = Number((1.0 + Math.max(0, slopeAngle) * 0.01).toFixed(2));

  // Total adjusted task duration
  const estimatedMinutes = Math.round(baseMinutes * weatherFactor * slopeFactor * efficiencyScore);

  // Remaining minutes considering progress percentage
  const remainingMinutes = Math.max(0, Math.round(estimatedMinutes * (1 - progress / 100)));

  return {
    baseMinutes,
    weatherFactor,
    slopeFactor,
    efficiencyScore,
    estimatedMinutes,
    remainingMinutes,
  };
}

export interface SituationSummaryData {
  status: 'NORMAL' | 'CAUTION' | 'CRITICAL';
  headline: string;
  summary: string;
  conditions: string[];
  recommendedActions: string[];
  timestamp: string;
}

/**
 * Deterministic Situation Summary generator:
 * Human-readable machine conditions and action recommendations.
 * Foundation for future AI assistant.
 */
export function generateSituationSummary(
  state: TelemetryState,
  currentTask?: ScheduledTask
): SituationSummaryData {
  const safety = evaluateTransparentSafety(state);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  const taskName = currentTask ? currentTask.name : 'Active Shift Task';
  const progressStr = currentTask ? `${currentTask.progress}%` : '';

  if (safety.overall === 'danger') {
    const dangerReasons = safety.checks
      .filter((c) => c.status === 'danger')
      .map((c) => c.reason);

    let headline = 'Critical machine condition requiring immediate operator action.';
    if (!state.seatbeltFastened && state.nearbyPersonnel > 0) {
      headline = `Immediate attention required. A person is within ${state.proximityDistance.toFixed(
        1
      )}m of the machine and the seatbelt is unfastened.`;
    } else if (!state.seatbeltFastened) {
      headline = `Seatbelt unfastened while machine systems are active.`;
    } else if (state.nearbyPersonnel > 0) {
      headline = `${state.nearbyPersonnel} unauthorized worker(s) inside machine hazardous swing radius.`;
    } else if (state.slopeAngle > 20) {
      headline = `Severe rollover hazard. Incline angle (${state.slopeAngle.toFixed(
        1
      )}°) exceeds safe equipment tolerance.`;
    } else if (state.engineTemp > 115) {
      headline = `Critical engine thermal overload (${state.engineTemp}°C). Risk of cylinder head seizure.`;
    }

    const actions: string[] = [];
    if (!state.seatbeltFastened) actions.push('Fasten operator seatbelt before engaging machine travel.');
    if (state.nearbyPersonnel > 0) actions.push('Sound cab horn and stop hydraulic swing until personnel clear.');
    if (state.slopeAngle > 20) actions.push('Lower excavator bucket to ground level and navigate to flatter grade.');
    if (state.engineTemp > 115) actions.push('Reduce engine throttle to idle; do not shut off immediately.');
    if (state.proximityDistance < 3.0) actions.push('Halt all track travel and check blindspot mirrors.');

    return {
      status: 'CRITICAL',
      headline,
      summary: `Machine ${state.machineId} has triggered high-priority safety interlocks during ${taskName}. Operator action is required before resuming production.`,
      conditions: dangerReasons,
      recommendedActions: actions,
      timestamp: timeStr,
    };
  }

  if (safety.overall === 'caution') {
    const cautionReasons = safety.checks
      .filter((c) => c.status === 'caution')
      .map((c) => c.reason);

    let headline = 'Attention required. Machine parameters are elevated above nominal buffer levels.';
    if (state.slopeAngle > 12 && state.postureState === 'Slouching') {
      headline = `Attention required. Machine is operating at a ${state.slopeAngle.toFixed(
        1
      )}° slope and the operator has been slouching.`;
    } else if (state.slopeAngle > 12) {
      headline = `Operating on an elevated grade (${state.slopeAngle.toFixed(
        1
      )}°). Monitor ground compaction.`;
    } else if (state.weatherCondition === 'Heavy Rain' || state.weatherCondition === 'Storm') {
      headline = `Severe weather advisory. Increased soil moisture reduces trench wall cohesion.`;
    } else if (state.postureState !== 'Good') {
      headline = `Operator ergonomic fatigue alert. Take a posture reset break.`;
    }

    const actions: string[] = [];
    if (state.slopeAngle > 12) actions.push('Maintain slow, controlled track movement and keep bucket low.');
    if (state.postureState !== 'Good') actions.push('Adjust seat lumbar angle and perform micro-stretch.');
    if (state.proximityDistance < 5.0) actions.push('Double check radar sensors when rotating upper structure.');
    if (actions.length === 0) actions.push('Monitor cab telemetry readouts closely.');

    return {
      status: 'CAUTION',
      headline,
      summary: `Machine ${state.machineId} is operational on ${taskName} (${progressStr}), but elevated caution factors warrant operator vigilance.`,
      conditions: cautionReasons,
      recommendedActions: actions,
      timestamp: timeStr,
    };
  }

  return {
    status: 'NORMAL',
    headline: `Machine ${state.machineId} is operating normally. ${taskName} is ${progressStr} complete. No critical safety conditions detected.`,
    summary: `All machine subsystems, hydraulic pressures, and worksite safety envelopes are within nominal Caterpillar factory specifications.`,
    conditions: ['All 7 perimeter & mechanical checks are PASS'],
    recommendedActions: ['Continue smooth excavation cycle according to shift task plan.'],
    timestamp: timeStr,
  };
}

export interface OperatorActionDirective {
  headline: string;
  instruction: string;
  priority: 'normal' | 'caution' | 'urgent';
  badge: string;
}

/**
 * Returns one clear, unambiguous next action for the operator
 */
export function getOperatorActionDirective(state: TelemetryState): OperatorActionDirective {
  if (!state.seatbeltFastened) {
    return {
      headline: 'Fasten Seatbelt',
      instruction: 'Fasten seatbelt interlock before engaging joystick or moving tracks.',
      priority: 'urgent',
      badge: 'INTERLOCK REQUIRED',
    };
  }

  if (state.nearbyPersonnel > 0) {
    return {
      headline: 'Halt & Clear Personnel',
      instruction: 'Stop machine movement immediately and verify personnel clearance on radar.',
      priority: 'urgent',
      badge: 'BLINDSPOT CLEARANCE',
    };
  }

  if (state.proximityDistance < 3.0) {
    return {
      headline: 'Halt Track Travel',
      instruction: `Obstacle detected at ${state.proximityDistance.toFixed(1)}m. Reverse away from hazard.`,
      priority: 'urgent',
      badge: 'PROXIMITY WARNING',
    };
  }

  if (state.slopeAngle > 20) {
    return {
      headline: 'Reduce Machine Slope',
      instruction: `Current grade is ${state.slopeAngle.toFixed(1)}°. Reposition to flat ground before trenching.`,
      priority: 'urgent',
      badge: 'ROLLOVER RISK',
    };
  }

  if (state.engineTemp > 115) {
    return {
      headline: 'Cool Engine at Idle',
      instruction: `Engine temp is ${state.engineTemp}°C. Disengage hydraulics and idle engine to circulate coolant.`,
      priority: 'urgent',
      badge: 'THERMAL SHUTDOWN RISK',
    };
  }

  if (state.slopeAngle > 12) {
    return {
      headline: 'Operate with Caution on Slope',
      instruction: 'Keep excavator bucket below 1.5m to maintain low center of gravity on slope.',
      priority: 'caution',
      badge: 'INCLINE ADVISORY',
    };
  }

  if (state.weatherCondition === 'Heavy Rain' || state.weatherCondition === 'Storm') {
    return {
      headline: 'Watch Trench Wall Stability',
      instruction: 'Heavy rain increases mud factor (1.4x–1.6x). Step bucket back from trench lip.',
      priority: 'caution',
      badge: 'WEATHER ADVISORY',
    };
  }

  if (state.postureState !== 'Good') {
    return {
      headline: 'Reset Ergonomic Posture',
      instruction: 'Sit upright against lumbar support. Prolonged slouching accelerates operator fatigue.',
      priority: 'caution',
      badge: 'ERGONOMIC COACHING',
    };
  }

  return {
    headline: 'Continue Normal Operation',
    instruction: 'All machine envelopes nominal. Maintain standard excavation cycle in Zone B.',
    priority: 'normal',
    badge: 'CONDITIONS NORMAL',
  };
}

/**
 * Calculates an overall operator fatigue risk score (0-100)
 */
export function calculateFatigueScore(
  continuousMinutes: number,
  posture: TelemetryState['postureState']
): number {
  let score = Math.min(100, Math.round((continuousMinutes / 120) * 60));
  if (posture === 'Slouching') score += 15;
  if (posture === 'Leaning Left' || posture === 'Leaning Right') score += 20;
  return Math.min(100, score);
}

/**
 * Format numbers with unit suffix
 */
export function formatValueWithUnit(value: number, unit: string, decimals = 1): string {
  return `${value.toFixed(decimals)} ${unit}`;
}
