import { TelemetryState } from '../types/telemetry';

export interface TelemetryChangeItem {
  id: string;
  parameter: string;
  previousDisplay: string;
  currentDisplay: string;
  severity: 'danger' | 'warning' | 'info';
  timestamp: string;
  message: string;
}

/**
 * Detects only meaningful changes between two telemetry snapshots,
 * filtering out minor sensor fluctuations and noise.
 */
export function detectMeaningfulTelemetryChanges(
  prev: TelemetryState,
  curr: TelemetryState
): TelemetryChangeItem[] {
  const changes: TelemetryChangeItem[] = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // 1. Seatbelt State Changed
  if (prev.seatbeltFastened !== curr.seatbeltFastened) {
    changes.push({
      id: 'seatbelt-change',
      parameter: 'Seatbelt Interlock',
      previousDisplay: prev.seatbeltFastened ? 'Fastened' : 'Unfastened',
      currentDisplay: curr.seatbeltFastened ? 'Fastened' : 'Unfastened',
      severity: !curr.seatbeltFastened ? 'danger' : 'info',
      timestamp: timeStr,
      message: !curr.seatbeltFastened
        ? 'Operator unlatched seatbelt during shift'
        : 'Operator fastened seatbelt',
    });
  }

  // 2. Proximity Distance Changed (Threshold Crossing or Significant Delta >= 2.5m)
  const proximityDelta = curr.proximityDistance - prev.proximityDistance;
  const crossedProximityDanger = prev.proximityDistance >= 3.0 && curr.proximityDistance < 3.0;
  const crossedProximityCaution = prev.proximityDistance >= 5.0 && curr.proximityDistance < 5.0;

  if (crossedProximityDanger || (crossedProximityCaution && Math.abs(proximityDelta) >= 1.0) || Math.abs(proximityDelta) >= 3.0) {
    changes.push({
      id: 'proximity-change',
      parameter: 'Perimeter Proximity',
      previousDisplay: `${prev.proximityDistance.toFixed(1)}m`,
      currentDisplay: `${curr.proximityDistance.toFixed(1)}m`,
      severity: curr.proximityDistance < 3.0 ? 'danger' : curr.proximityDistance < 5.0 ? 'warning' : 'info',
      timestamp: timeStr,
      message:
        curr.proximityDistance < 3.0
          ? 'Obstacle entered critical 3.0m buffer'
          : curr.proximityDistance < 5.0
          ? 'Obstacle entered 5.0m caution radius'
          : 'Proximity clearance changed',
    });
  }

  // 3. Slope Angle Changed (Threshold Crossing or Delta >= 4.0°)
  const slopeDelta = curr.slopeAngle - prev.slopeAngle;
  const crossedSlopeDanger = prev.slopeAngle <= 20 && curr.slopeAngle > 20;
  const crossedSlopeCaution = prev.slopeAngle <= 12 && curr.slopeAngle > 12;

  if (crossedSlopeDanger || crossedSlopeCaution || Math.abs(slopeDelta) >= 4.0) {
    changes.push({
      id: 'slope-change',
      parameter: 'Slope Inclinometer',
      previousDisplay: `${prev.slopeAngle.toFixed(1)}°`,
      currentDisplay: `${curr.slopeAngle.toFixed(1)}°`,
      severity: curr.slopeAngle > 20 ? 'danger' : curr.slopeAngle > 12 ? 'warning' : 'info',
      timestamp: timeStr,
      message:
        curr.slopeAngle > 20
          ? 'Rollover threshold exceeded (> 20°)'
          : curr.slopeAngle > 12
          ? 'Machine working on elevated incline (> 12°)'
          : 'Incline grade repositioned',
    });
  }

  // 4. Nearby Personnel Changed
  if (prev.nearbyPersonnel !== curr.nearbyPersonnel) {
    changes.push({
      id: 'personnel-change',
      parameter: 'Nearby Personnel',
      previousDisplay: `${prev.nearbyPersonnel} pers`,
      currentDisplay: `${curr.nearbyPersonnel} pers`,
      severity: curr.nearbyPersonnel > 0 ? 'danger' : 'info',
      timestamp: timeStr,
      message:
        curr.nearbyPersonnel > prev.nearbyPersonnel
          ? 'Ground personnel entered hazardous swing perimeter'
          : 'Personnel cleared machine zone',
    });
  }

  // 5. Driver Posture Changed
  if (prev.postureState !== curr.postureState) {
    changes.push({
      id: 'posture-change',
      parameter: 'Operator Posture',
      previousDisplay: prev.postureState,
      currentDisplay: curr.postureState,
      severity: curr.postureState === 'Good' ? 'info' : curr.postureState === 'Slouching' ? 'warning' : 'danger',
      timestamp: timeStr,
      message:
        curr.postureState === 'Good'
          ? 'Ergonomic posture restored'
          : `Driver posture changed to ${curr.postureState}`,
    });
  }

  // 6. Weather Condition Changed
  if (prev.weatherCondition !== curr.weatherCondition) {
    changes.push({
      id: 'weather-change',
      parameter: 'Weather Condition',
      previousDisplay: prev.weatherCondition,
      currentDisplay: curr.weatherCondition,
      severity:
        curr.weatherCondition === 'Storm' || curr.weatherCondition === 'Heavy Rain'
          ? 'danger'
          : curr.weatherCondition === 'Rain'
          ? 'warning'
          : 'info',
      timestamp: timeStr,
      message: `Weather shifted to ${curr.weatherCondition}`,
    });
  }

  // 7. Engine Temperature Material Change (>= 8°C or crossed 115°C)
  const tempDelta = curr.engineTemp - prev.engineTemp;
  if ((prev.engineTemp <= 115 && curr.engineTemp > 115) || Math.abs(tempDelta) >= 8) {
    changes.push({
      id: 'engine-temp-change',
      parameter: 'Engine Temperature',
      previousDisplay: `${prev.engineTemp}°C`,
      currentDisplay: `${curr.engineTemp}°C`,
      severity: curr.engineTemp > 115 ? 'danger' : curr.engineTemp > 98 ? 'warning' : 'info',
      timestamp: timeStr,
      message:
        curr.engineTemp > 115
          ? 'Engine exceeded critical thermal limit (115°C)'
          : `Engine temperature shifted by ${tempDelta > 0 ? '+' : ''}${tempDelta}°C`,
    });
  }

  // 8. Idle Time Material Increase (>= 3 min or crossed 10 min)
  const idleDelta = curr.idleTimeMinutes - prev.idleTimeMinutes;
  if ((prev.idleTimeMinutes < 10 && curr.idleTimeMinutes >= 10) || idleDelta >= 3.0) {
    changes.push({
      id: 'idle-time-change',
      parameter: 'Continuous Idle',
      previousDisplay: `${prev.idleTimeMinutes.toFixed(1)}m`,
      currentDisplay: `${curr.idleTimeMinutes.toFixed(1)}m`,
      severity: curr.idleTimeMinutes > 12 ? 'danger' : 'warning',
      timestamp: timeStr,
      message: 'Unproductive continuous idling detected',
    });
  }

  return changes;
}
