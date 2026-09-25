export type AlertSeverity = 'info' | 'warning' | 'danger' | 'critical';

export type AppModule = 'A' | 'B' | 'C' | 'D';

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  module: AppModule;
  title: string;
  message: string;
  voiceText: string;
  acknowledged: boolean;
  escalated: boolean;
  conditionId?: string;
  stateTransition?: 'started' | 'escalated' | 'normalized';
  active?: boolean;
}

export interface VoiceSettings {
  enabled: boolean;
  volume: number; // 0 to 1
  rate: number;   // 0.8 to 1.5
  pitch: number;  // 0.8 to 1.2
  voiceURI: string | null;
}

export type IncidentType =
  | 'trench_proximity'
  | 'proximity_hazard'
  | 'seatbelt'
  | 'rollover_risk'
  | 'idling'
  | 'harsh_operation'
  | 'sensor_failure'
  | 'bad_posture'
  | 'stretch_reminder';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentLog {
  id: string;
  timestamp: string;
  type: IncidentType;
  details: Record<string, unknown>;
  severity: IncidentSeverity;
  operatorNotes?: string;
  escalatedToSupervisor: boolean;
}
