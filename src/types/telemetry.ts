export type ShiftType = 'Day' | 'Night';

export type WeatherCondition = 'Clear' | 'Rain' | 'Heavy Rain' | 'Storm';

export type PostureState = 'Good' | 'Slouching' | 'Leaning Left' | 'Leaning Right';

export interface TelemetryState {
  machineId: string;
  operatorId: string;
  operatorName: string;
  shiftType: ShiftType;
  engineRPM: number;
  proximityDistance: number;
  slopeAngle: number;
  seatbeltFastened: boolean;
  bucketHeight: number;
  idleTimeMinutes: number;
  gForce: number;
  hydraulicPressure: number;
  trenchDistance: number;
  engineTemp: number;
  coolantLevel: number;
  oilPressure: number;
  speed: number;
  weatherCondition: WeatherCondition;
  nearbyPersonnel: number;
  postureState: PostureState;
  continuousOpMinutes: number;
  engineHours: number;
  fuelUsedLiters: number;
  loadCycles: number;
}

export type TelemetryAction =
  | { type: 'SET_TELEMETRY'; payload: TelemetryState }
  | { type: 'UPDATE_TELEMETRY'; payload: Partial<TelemetryState> }
  | { type: 'RESET_TELEMETRY' };
