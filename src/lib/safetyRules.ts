import { TelemetryState } from '../types/telemetry';
import { AlertSeverity } from '../types/alerts';

export interface ActiveHazard {
  id: string;
  category: 'proximity' | 'slope' | 'trench' | 'seatbelt' | 'posture' | 'thermal' | 'personnel';
  title: string;
  message: string;
  severity: AlertSeverity;
  currentValue: string;
  threshold: string;
  recommendedAction: string;
}

/**
 * 1. Proximity Rule:
 * > 10m = safe
 * 5–10m = caution
 * < 5m = danger (< 3m = critical)
 */
export function evaluateProximitySafety(distance: number): {
  status: 'safe' | 'caution' | 'danger';
  severity: AlertSeverity;
  message: string;
} {
  if (distance < 3.0) {
    return {
      status: 'danger',
      severity: 'critical',
      message: `Critical proximity breach: Obstacle at ${distance.toFixed(1)}m (< 3m buffer)`,
    };
  }
  if (distance < 5.0) {
    return {
      status: 'danger',
      severity: 'danger',
      message: `Danger zone: Obstacle at ${distance.toFixed(1)}m (< 5m warning perimeter)`,
    };
  }
  if (distance <= 10.0) {
    return {
      status: 'caution',
      severity: 'warning',
      message: `Caution: Object detected at ${distance.toFixed(1)}m (within 5–10m detection ring)`,
    };
  }
  return {
    status: 'safe',
    severity: 'info',
    message: `Clear perimeter: ${distance.toFixed(1)}m clearance (> 10m safe)`,
  };
}

/**
 * 2. Slope Rule:
 * < 15° = safe
 * 15–24.99° = caution
 * >= 25° = danger (rollover risk)
 */
export function evaluateSlopeSafety(angle: number): {
  status: 'safe' | 'caution' | 'danger';
  severity: AlertSeverity;
  message: string;
} {
  if (angle >= 25.0) {
    return {
      status: 'danger',
      severity: 'critical',
      message: `Warning: Slope angle ${angle.toFixed(1)}° — risk of rollover`,
    };
  }
  if (angle >= 15.0) {
    return {
      status: 'caution',
      severity: 'warning',
      message: `Elevated grade: Incline at ${angle.toFixed(1)}° (15°–24.9° caution band)`,
    };
  }
  return {
    status: 'safe',
    severity: 'info',
    message: `Stable grade: ${angle.toFixed(1)}° (< 15° nominal)`,
  };
}

/**
 * 3. Trench Rule:
 * < 2.0 ft = critical ("DANGER: Trench edge X feet away — STOP")
 * 2.0–4.0 ft = caution
 * > 4.0 ft = safe
 */
export function evaluateTrenchSafety(distance: number): {
  status: 'safe' | 'caution' | 'danger';
  severity: AlertSeverity;
  message: string;
} {
  if (distance < 2.0) {
    return {
      status: 'danger',
      severity: 'critical',
      message: `DANGER: Trench edge ${distance.toFixed(1)} feet away — STOP`,
    };
  }
  if (distance <= 4.0) {
    return {
      status: 'caution',
      severity: 'warning',
      message: `Trench edge caution: ${distance.toFixed(1)} feet away (approaching 2ft critical limit)`,
    };
  }
  return {
    status: 'safe',
    severity: 'info',
    message: `Safe trench clearance: ${distance.toFixed(1)} feet (> 4ft buffer)`,
  };
}

/**
 * 4. Seatbelt Rule:
 * seatbelt OFF + speed > 0 = danger / locked ("MACHINE LOCKED — Fasten Seatbelt")
 * seatbelt OFF + speed = 0 = caution
 * seatbelt ON = safe
 */
export function evaluateSeatbeltSafety(fastened: boolean, speed: number): {
  status: 'safe' | 'caution' | 'danger';
  severity: AlertSeverity;
  isLocked: boolean;
  message: string;
} {
  if (!fastened && speed > 0) {
    return {
      status: 'danger',
      severity: 'critical',
      isLocked: true,
      message: 'MACHINE LOCKED — Fasten Seatbelt',
    };
  }
  if (!fastened) {
    return {
      status: 'caution',
      severity: 'warning',
      isLocked: false,
      message: 'Operator seatbelt unlatched while engine is running',
    };
  }
  return {
    status: 'safe',
    severity: 'info',
    isLocked: false,
    message: 'Operator seatbelt fastened and locked',
  };
}

/**
 * 5. Driver Posture Rule:
 * Good = safe
 * Bad posture duration:
 * > 2 min = caution (amber)
 * > 5 min = danger (red)
 */
export function evaluatePostureSafety(posture: TelemetryState['postureState'], badDurationMinutes = 0): {
  status: 'safe' | 'caution' | 'danger';
  severity: AlertSeverity;
  message: string;
} {
  if (posture === 'Good') {
    return {
      status: 'safe',
      severity: 'info',
      message: 'Optimal spinal ergonomic alignment',
    };
  }
  if (badDurationMinutes >= 5) {
    return {
      status: 'danger',
      severity: 'danger',
      message: `Severe posture fatigue: ${posture} for >5 minutes`,
    };
  }
  if (badDurationMinutes >= 2) {
    return {
      status: 'caution',
      severity: 'warning',
      message: `Ergonomic caution: ${posture} for >2 minutes`,
    };
  }
  return {
    status: 'caution',
    severity: 'warning',
    message: `Posture detected: ${posture}`,
  };
}

/**
 * Centralized Active Hazard Evaluator:
 * Groups all concurrent hazards and calculates a collective recommended action.
 */
export function getActiveHazards(state: TelemetryState, badPostureMinutes = 0): {
  hazards: ActiveHazard[];
  collectiveAction: string;
  hasCritical: boolean;
} {
  const hazards: ActiveHazard[] = [];

  // Proximity Check
  const prox = evaluateProximitySafety(state.proximityDistance);
  if (prox.status === 'danger') {
    hazards.push({
      id: 'hazard-proximity',
      category: 'proximity',
      title: 'Proximity Hazard',
      message: prox.message,
      severity: prox.severity,
      currentValue: `${state.proximityDistance.toFixed(1)}m`,
      threshold: '< 5m',
      recommendedAction: 'Stop machine forward movement and verify clearance.',
    });
  }

  // Personnel Check
  if (state.nearbyPersonnel > 0) {
    hazards.push({
      id: 'hazard-personnel',
      category: 'personnel',
      title: 'Personnel in Blindspot',
      message: `${state.nearbyPersonnel} worker(s) inside swing radius`,
      severity: 'critical',
      currentValue: `${state.nearbyPersonnel} pers`,
      threshold: '0 pers',
      recommendedAction: 'Sound cab horn immediately and cease swing rotation.',
    });
  }

  // Seatbelt Check
  const belt = evaluateSeatbeltSafety(state.seatbeltFastened, state.speed);
  if (belt.status === 'danger' || belt.status === 'caution') {
    hazards.push({
      id: 'hazard-seatbelt',
      category: 'seatbelt',
      title: 'Seatbelt Interlock',
      message: belt.message,
      severity: belt.severity,
      currentValue: state.seatbeltFastened ? 'Fastened' : 'Unfastened',
      threshold: 'Fastened',
      recommendedAction: 'Fasten seatbelt before moving tracks or engaging hydraulics.',
    });
  }

  // Slope Check
  const slope = evaluateSlopeSafety(state.slopeAngle);
  if (slope.status === 'danger') {
    hazards.push({
      id: 'hazard-slope',
      category: 'slope',
      title: 'Slope Inclinometer — Rollover Risk',
      message: slope.message,
      severity: slope.severity,
      currentValue: `${state.slopeAngle.toFixed(1)}°`,
      threshold: '< 25°',
      recommendedAction: 'Lower bucket immediately to ground level and navigate to flatter grade.',
    });
  }

  // Trench Check
  const trench = evaluateTrenchSafety(state.trenchDistance);
  if (trench.status === 'danger') {
    hazards.push({
      id: 'hazard-trench',
      category: 'trench',
      title: 'Trench Edge Proximity',
      message: trench.message,
      severity: trench.severity,
      currentValue: `${state.trenchDistance.toFixed(1)} ft`,
      threshold: '≥ 2.0 ft',
      recommendedAction: 'Halt all travel immediately. Risk of trench berm collapse.',
    });
  }

  // Engine Temp Check
  if (state.engineTemp > 115) {
    hazards.push({
      id: 'hazard-thermal',
      category: 'thermal',
      title: 'Engine Thermal Overload',
      message: `Engine temperature at ${state.engineTemp}°C exceeds 115°C critical limit`,
      severity: 'critical',
      currentValue: `${state.engineTemp}°C`,
      threshold: '≤ 115°C',
      recommendedAction: 'Idle engine in neutral to circulate coolant; do not shut down abruptly.',
    });
  }

  // Posture Check
  const posture = evaluatePostureSafety(state.postureState, badPostureMinutes);
  if (posture.status === 'danger') {
    hazards.push({
      id: 'hazard-posture',
      category: 'posture',
      title: 'Operator Ergonomic Fatigue',
      message: posture.message,
      severity: posture.severity,
      currentValue: state.postureState,
      threshold: 'Good',
      recommendedAction: 'Perform 60-second in-cab posture reset and lumbar adjustment.',
    });
  }

  const hasCritical = hazards.some((h) => h.severity === 'critical');

  let collectiveAction = 'Conditions normal — proceed with standard operation.';
  if (hazards.length >= 3) {
    collectiveAction = 'Multiple concurrent hazards detected: Stop movement and secure machine.';
  } else if (hazards.length === 2) {
    collectiveAction = 'Dual safety hazards active: Halt operations and address interlocks.';
  } else if (hazards.length === 1) {
    collectiveAction = hazards[0].recommendedAction;
  }

  return {
    hazards,
    collectiveAction,
    hasCritical,
  };
}
