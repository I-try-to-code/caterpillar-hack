import { TelemetryState, WeatherCondition } from './telemetry';
import { Alert, IncidentLog } from './alerts';
import { ScheduledTask } from './tasks';
import { SituationSummaryData } from '../lib/calculations';

export type AnomalyCategory =
  | 'idling'
  | 'harsh_operation'
  | 'bucket_travel'
  | 'hydraulic_pressure'
  | 'thermal';

export interface ActiveAnomaly {
  id: string;
  category: AnomalyCategory;
  title: string;
  description: string;
  severity: 'warning' | 'danger' | 'critical';
  currentValue: string;
  threshold: string;
  recommendation: string;
  timestamp: string;
  voiceText: string;
  metrics?: {
    durationMinutes?: number;
    fuelWastedLiters?: number;
    fuelCostDollars?: number;
    gForce?: number;
    speed?: number;
    bucketHeight?: number;
    hydraulicPressure?: number;
  };
}

export interface AnomalyHistoryRecord {
  id: string;
  timestamp: string;
  category: AnomalyCategory;
  severity: 'warning' | 'danger' | 'critical';
  title: string;
  value: string;
  durationMinutes?: number;
  fuelWastedLiters?: number;
  recommendation: string;
}

export interface AnomalyTimeSeriesPoint {
  time: string;
  idleTimeMinutes: number;
  gForce: number;
  hydraulicPressure: number;
  fuelWasteLiters: number;
  speed: number;
  engineRPM: number;
}

export interface PatternInsight {
  id: string;
  category: 'efficiency' | 'safety' | 'wear' | 'behavioral';
  title: string;
  description: string;
  metric: string;
  trend: 'improving' | 'worsening' | 'stable';
  recommendation: string;
  confidence: number;
}

export interface OperatorContextSnapshot {
  timestamp: string;
  telemetry: TelemetryState;
  currentTask: ScheduledTask | null;
  safetyStatus: 'safe' | 'caution' | 'danger';
  activeAlerts: Alert[];
  recentIncidents: IncidentLog[];
  activeAnomalies: ActiveAnomaly[];
  anomalyHistory: AnomalyHistoryRecord[];
  machineHealth: {
    overallIndex: number;
    oilPressureStatus: string;
    hydraulicTempStatus: string;
    coolantStatus: string;
    sealIntegrity: number;
    trackTension: string;
  };
  weather: WeatherCondition;
  operatorWellbeing: {
    postureState: string;
    badPostureMinutes: number;
    stretchReminderDue: boolean;
  };
  situationSummary: SituationSummaryData | null;
}
