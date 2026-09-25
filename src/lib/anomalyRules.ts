import { TelemetryState } from '../types/telemetry';
import { ActiveAnomaly } from '../types/anomalies';
import { BASELINE_SHIFT_METRICS } from '../data/anomalyHistory';

export function calculateIdleFuelWaste(idleMinutes: number): {
  liters: number;
  costUSD: number;
  co2Kg: number;
} {
  const hours = idleMinutes / 60;
  const liters = Number((hours * BASELINE_SHIFT_METRICS.idleFuelBurnRateLitersPerHour).toFixed(2));
  const costUSD = Number((liters * BASELINE_SHIFT_METRICS.dieselPricePerLiter).toFixed(2));
  const co2Kg = Number((liters * 2.68).toFixed(2)); // ~2.68 kg CO2 per liter diesel
  return { liters, costUSD, co2Kg };
}

export function detectActiveAnomalies(telemetry: TelemetryState): ActiveAnomaly[] {
  const anomalies: ActiveAnomaly[] = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // 1. Excessive Idling Check
  // Engine ON (RPM > 400), speed === 0, idleTime >= 5 min
  const isEngineOn = telemetry.engineRPM > 400;
  const isStationary = telemetry.speed === 0;
  if (isEngineOn && isStationary && telemetry.idleTimeMinutes >= 5) {
    const isCritical = telemetry.idleTimeMinutes >= 10;
    const { liters, costUSD } = calculateIdleFuelWaste(telemetry.idleTimeMinutes);

    anomalies.push({
      id: 'anom-idling',
      category: 'idling',
      title: isCritical ? 'Critical Prolonged Engine Idling' : 'Excessive Engine Idling',
      description: `Engine running while stationary for ${telemetry.idleTimeMinutes.toFixed(1)} min. Fuel wasted: ${liters}L ($${costUSD}).`,
      severity: isCritical ? 'critical' : 'warning',
      currentValue: `${telemetry.idleTimeMinutes.toFixed(1)} min`,
      threshold: '5.0 min (amber) / 10.0 min (red)',
      recommendation: 'Consider shutting down the engine until work resumes.',
      timestamp: timeStr,
      voiceText: `Excessive idling detected: ${telemetry.idleTimeMinutes.toFixed(0)} minutes. Shut down engine to conserve fuel.`,
      metrics: {
        durationMinutes: telemetry.idleTimeMinutes,
        fuelWastedLiters: liters,
        fuelCostDollars: costUSD,
        speed: telemetry.speed,
      },
    });
  }

  // 2. Harsh Operation (G-Force shock loading)
  if (telemetry.gForce > 1.8) {
    const isCritical = telemetry.gForce >= 2.2;
    anomalies.push({
      id: 'anom-harsh-op',
      category: 'harsh_operation',
      title: isCritical ? 'Severe Shock Load / Harsh Operation' : 'Harsh Dynamic Shock Load',
      description: `Cab accelerometer recorded ${telemetry.gForce.toFixed(2)}g impact spike exceeding machine stress envelope.`,
      severity: isCritical ? 'critical' : 'warning',
      currentValue: `${telemetry.gForce.toFixed(2)} g`,
      threshold: '≤ 1.80 g',
      recommendation: 'Smooth out bucket engagement and track travel to minimize bearing fatigue.',
      timestamp: timeStr,
      voiceText: `Harsh operation detected: ${telemetry.gForce.toFixed(1)} G-force shock load.`,
      metrics: {
        gForce: telemetry.gForce,
        speed: telemetry.speed,
      },
    });
  }

  // 3. Bucket While Travelling (High center of gravity hazard)
  if (telemetry.speed > 0 && telemetry.bucketHeight > 1.2) {
    const isCritical = telemetry.bucketHeight >= 2.5;
    anomalies.push({
      id: 'anom-bucket-travel',
      category: 'bucket_travel',
      title: 'Bucket Height Danger While Travelling',
      description: `Bucket elevated to ${telemetry.bucketHeight.toFixed(1)}m during tramming at ${telemetry.speed.toFixed(1)} km/h. High center of gravity tip-over risk.`,
      severity: isCritical ? 'critical' : 'danger',
      currentValue: `${telemetry.bucketHeight.toFixed(1)} m @ ${telemetry.speed.toFixed(1)} km/h`,
      threshold: '≤ 1.2 m while moving',
      recommendation: 'Lower bucket before traveling — high center of gravity hazard.',
      timestamp: timeStr,
      voiceText: 'Lower bucket before traveling. High center of gravity rollover hazard.',
      metrics: {
        bucketHeight: telemetry.bucketHeight,
        speed: telemetry.speed,
      },
    });
  }

  // 4. Hydraulic System Pressure Relief Overload
  if (telemetry.hydraulicPressure > 340) {
    const isDanger = telemetry.hydraulicPressure >= 370;
    anomalies.push({
      id: 'anom-hydraulic',
      category: 'hydraulic_pressure',
      title: isDanger ? 'Critical Hydraulic Overpressure Spike' : 'Hydraulic Relief Pressure High',
      description: `Hydraulic pump load at ${telemetry.hydraulicPressure} bar exceeds optimal continuous envelope (relief valve active).`,
      severity: isDanger ? 'danger' : 'warning',
      currentValue: `${telemetry.hydraulicPressure} bar`,
      threshold: '≤ 340 bar',
      recommendation: 'Hydraulic relief pressure high — reduce force to prevent damage.',
      timestamp: timeStr,
      voiceText: `Hydraulic relief pressure high at ${telemetry.hydraulicPressure} bar. Reduce cylinder force.`,
      metrics: {
        hydraulicPressure: telemetry.hydraulicPressure,
      },
    });
  }

  // 5. Engine Thermal Overload
  if (telemetry.engineTemp > 105) {
    const isCritical = telemetry.engineTemp >= 115;
    anomalies.push({
      id: 'anom-thermal',
      category: 'thermal',
      title: isCritical ? 'Engine Thermal Overload' : 'Elevated Engine Temperature',
      description: `Engine coolant at ${telemetry.engineTemp}°C exceeds normal operating range (80-95°C).`,
      severity: isCritical ? 'critical' : 'warning',
      currentValue: `${telemetry.engineTemp}°C`,
      threshold: '≤ 105°C',
      recommendation: 'High engine coolant temperature — idle in neutral to circulate coolant.',
      timestamp: timeStr,
      voiceText: `Engine temperature high at ${telemetry.engineTemp} degrees.`,
    });
  }

  return anomalies;
}

export function evaluateMachineHealthScore(telemetry: TelemetryState): number {
  let score = 100;

  // Hydraulic pressure penalties
  if (telemetry.hydraulicPressure > 370) score -= 15;
  else if (telemetry.hydraulicPressure > 340) score -= 8;

  // Engine temperature penalties
  if (telemetry.engineTemp > 115) score -= 20;
  else if (telemetry.engineTemp > 105) score -= 10;

  // Oil pressure penalties
  if (telemetry.oilPressure < 25 || telemetry.oilPressure > 70) score -= 18;
  else if (telemetry.oilPressure < 35) score -= 8;

  // Shock loading penalties
  if (telemetry.gForce > 2.2) score -= 12;
  else if (telemetry.gForce > 1.8) score -= 6;

  // Coolant penalties
  if (telemetry.coolantLevel < 25) score -= 15;
  else if (telemetry.coolantLevel < 50) score -= 5;

  return Math.max(10, Math.min(100, Math.round(score)));
}
