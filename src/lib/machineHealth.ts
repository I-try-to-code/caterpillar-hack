import { TelemetryState } from '../types/telemetry';

export type SubsystemStatus = 'normal' | 'warning' | 'critical';

export interface SubsystemHealth {
  id: string;
  name: string;
  status: SubsystemStatus;
  valueDisplay: string;
  thresholdDisplay: string;
  detail: string;
  recommendedAction?: string;
}

export interface MachineHealthEvaluation {
  overallStatus: SubsystemStatus;
  overallScore: number; // 0 - 100
  headline: string;
  subsystems: {
    oilPressure: SubsystemHealth;
    hydraulicTemp: SubsystemHealth;
    coolant: SubsystemHealth;
    sealIntegrity: SubsystemHealth;
    trackTension: SubsystemHealth;
  };
  criticalCount: number;
  warningCount: number;
}

/**
 * Deterministic Machine Health Evaluator
 * Evaluates the 5 critical CAT excavator subsystems
 */
export function evaluateMachineHealth(telemetry: TelemetryState): MachineHealthEvaluation {
  // 1. Engine Oil Pressure (Normal: 35-65 psi, Warning: 25-34 or 66-70 psi, Critical: <25 or >70 psi)
  let oilStatus: SubsystemStatus = 'normal';
  let oilDetail = 'Lubrication pressure within optimal hydrodynamic bearing range';
  let oilAction: string | undefined;

  if (telemetry.oilPressure < 25) {
    oilStatus = 'critical';
    oilDetail = 'Dangerous oil starvation! Imminent risk of crankshaft & turbocharger seizure';
    oilAction = 'Shut down engine immediately and inspect oil level / pump pressure relief';
  } else if (telemetry.oilPressure > 70) {
    oilStatus = 'critical';
    oilDetail = 'Excessive oil pressure (> 70 psi). Risk of oil filter housing rupture';
    oilAction = 'Reduce RPM to idle; inspect oil pressure relief valve and bypass line';
  } else if (telemetry.oilPressure < 35 || telemetry.oilPressure > 65) {
    oilStatus = 'warning';
    oilDetail = 'Oil pressure hovering outside nominal 35–65 psi band';
    oilAction = 'Monitor oil gauge; schedule oil viscosity & filter inspection at shift handover';
  }

  const oilHealth: SubsystemHealth = {
    id: 'oil-pressure',
    name: 'Engine Oil Pressure',
    status: oilStatus,
    valueDisplay: `${telemetry.oilPressure.toFixed(0)} psi`,
    thresholdDisplay: '35–65 psi',
    detail: oilDetail,
    recommendedAction: oilAction,
  };

  // 2. Hydraulic Fluid Temperature (derived from engine temp + hydraulic pressure load)
  const derivedHydTemp = Math.round(
    0.65 * telemetry.engineTemp + (telemetry.hydraulicPressure / 400) * 35
  );
  let hydStatus: SubsystemStatus = 'normal';
  let hydDetail = 'Hydraulic viscosity and cooler heat rejection operating normally';
  let hydAction: string | undefined;

  if (derivedHydTemp > 100) {
    hydStatus = 'critical';
    hydDetail = `Critical hydraulic overheating (${derivedHydTemp}°C). Severe seal breakdown & fluid degradation`;
    hydAction = 'Cease heavy excavating load; run hydraulic cooler at idle in neutral';
  } else if (derivedHydTemp > 85) {
    hydStatus = 'warning';
    hydDetail = `Elevated hydraulic temperature (${derivedHydTemp}°C). Fluid thermal expansion approaching upper limit`;
    hydAction = 'Check hydraulic oil cooler for mud/debris blockages and reduce cycle tempo';
  }

  const hydraulicHealth: SubsystemHealth = {
    id: 'hydraulic-temp',
    name: 'Hydraulic Fluid Temp',
    status: hydStatus,
    valueDisplay: `${derivedHydTemp}°C`,
    thresholdDisplay: '≤ 85°C',
    detail: hydDetail,
    recommendedAction: hydAction,
  };

  // 3. Coolant Level & Engine Thermal State
  let coolantStatus: SubsystemStatus = 'normal';
  let coolantDetail = 'Coolant level and radiator heat dissipation nominal';
  let coolantAction: string | undefined;

  if (telemetry.coolantLevel < 25 || telemetry.engineTemp > 115) {
    coolantStatus = 'critical';
    coolantDetail =
      telemetry.coolantLevel < 25
        ? `Critical coolant loss (${telemetry.coolantLevel}% remaining). Severe vapor lock risk`
        : `Severe thermal overload (${telemetry.engineTemp}°C). Cylinder head warping imminent`;
    coolantAction = 'Reduce load, idle machine to circulate coolant, never open pressurized cap while hot';
  } else if (telemetry.coolantLevel < 50 || telemetry.engineTemp > 100) {
    coolantStatus = 'warning';
    coolantDetail =
      telemetry.coolantLevel < 50
        ? `Coolant expansion reservoir low (${telemetry.coolantLevel}%)`
        : `Elevated engine head temperature (${telemetry.engineTemp}°C)`;
    coolantAction = 'Top up CAT ELC coolant reservoir during next equipment rest period';
  }

  const coolantHealth: SubsystemHealth = {
    id: 'coolant-system',
    name: 'Engine Coolant & Temp',
    status: coolantStatus,
    valueDisplay: `${telemetry.coolantLevel}% | ${telemetry.engineTemp}°C`,
    thresholdDisplay: '≥ 50% | ≤ 98°C',
    detail: coolantDetail,
    recommendedAction: coolantAction,
  };

  // 4. Seal Integrity (derived: degrades under extreme hydraulic pressure > 350 bar and shock loads)
  let sealIntegrity = 100;
  if (telemetry.hydraulicPressure > 370) {
    sealIntegrity -= 28;
  } else if (telemetry.hydraulicPressure > 340) {
    sealIntegrity -= 15;
  } else if (telemetry.hydraulicPressure > 300) {
    sealIntegrity -= 6;
  }
  if (telemetry.gForce > 2.2) {
    sealIntegrity -= 12;
  }
  sealIntegrity = Math.max(45, Math.min(100, sealIntegrity));

  let sealStatus: SubsystemStatus = 'normal';
  let sealDetail = 'Hydraulic cylinder gland seals and O-rings holding full pressure';
  let sealAction: string | undefined;

  if (sealIntegrity < 75) {
    sealStatus = 'critical';
    sealDetail = `Severe high-pressure seal strain (${sealIntegrity}%). Weep risk at boom & stick cylinders`;
    sealAction = 'Inspect cylinder rods for hydraulic fluid sheen or weeping seals';
  } else if (sealIntegrity < 90) {
    sealStatus = 'warning';
    sealDetail = `Moderate hydraulic pressure relief cycling (${sealIntegrity}% integrity index)`;
    sealAction = 'Avoid feathering relief valves at end of stroke to preserve cylinder seals';
  }

  const sealHealth: SubsystemHealth = {
    id: 'seal-integrity',
    name: 'Cylinder Seal Integrity',
    status: sealStatus,
    valueDisplay: `${sealIntegrity}%`,
    thresholdDisplay: '≥ 90%',
    detail: sealDetail,
    recommendedAction: sealAction,
  };

  // 5. Track Tension (derived: reacts to speed, slope angle, and g-force impacts)
  let trackTensionStatus: SubsystemStatus = 'normal';
  let trackLabel = 'Calibrated';
  let trackDetail = 'Undercarriage track sag calibrated within 40–55mm specification';
  let trackAction: string | undefined;

  if (telemetry.gForce > 2.4 || (telemetry.speed > 22 && telemetry.slopeAngle > 18)) {
    trackTensionStatus = 'critical';
    trackLabel = 'Critical Shock Load';
    trackDetail = `Extreme undercarriage strain (${telemetry.gForce.toFixed(2)}G). Sprocket or idler tooth binding risk`;
    trackAction = 'Stop rough terrain tracking immediately; inspect track tensioner grease valve';
  } else if (telemetry.speed > 16 || telemetry.slopeAngle > 15 || telemetry.gForce > 1.8) {
    trackTensionStatus = 'warning';
    trackLabel = 'High Track Strain';
    trackDetail = `High lateral track side-load on ${telemetry.slopeAngle.toFixed(1)}° slope at ${telemetry.speed.toFixed(1)} km/h`;
    trackAction = 'Reduce travel speed when maneuvering on uneven incline';
  }

  const trackHealth: SubsystemHealth = {
    id: 'track-tension',
    name: 'Undercarriage Track Tension',
    status: trackTensionStatus,
    valueDisplay: trackLabel,
    thresholdDisplay: 'Calibrated Sag',
    detail: trackDetail,
    recommendedAction: trackAction,
  };

  // Aggregate Status & Score
  const subsystemsList = [oilHealth, hydraulicHealth, coolantHealth, sealHealth, trackHealth];
  const criticalCount = subsystemsList.filter((s) => s.status === 'critical').length;
  const warningCount = subsystemsList.filter((s) => s.status === 'warning').length;

  let overallStatus: SubsystemStatus = 'normal';
  let headline = 'All 5 Core Mechanical Subsystems Operating Within Factory Specs';

  if (criticalCount > 0) {
    overallStatus = 'critical';
    headline = `${criticalCount} Subsystem(s) in Critical Condition — Equipment Protection Protocol Active`;
  } else if (warningCount > 0) {
    overallStatus = 'warning';
    headline = `${warningCount} Subsystem(s) Under Elevated Stress — Preventive Attention Recommended`;
  }

  // Calculate overall score (100 base, deductions for warnings and criticals)
  let overallScore = 100;
  overallScore -= criticalCount * 25;
  overallScore -= warningCount * 10;
  overallScore = Math.max(30, Math.min(100, overallScore));

  return {
    overallStatus,
    overallScore,
    headline,
    subsystems: {
      oilPressure: oilHealth,
      hydraulicTemp: hydraulicHealth,
      coolant: coolantHealth,
      sealIntegrity: sealHealth,
      trackTension: trackHealth,
    },
    criticalCount,
    warningCount,
  };
}
