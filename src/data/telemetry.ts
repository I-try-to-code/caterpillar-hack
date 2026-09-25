import { TelemetryState } from '../types/telemetry';

/**
 * Sensible default sensor values representing a SAFE operating machine
 */
export const initialTelemetryState: TelemetryState = {
  machineId: 'EXC001',
  operatorId: 'OP1001',
  operatorName: 'Rajesh Kumar',
  shiftType: 'Day',
  engineRPM: 1750,
  proximityDistance: 8.5,
  slopeAngle: 3.8,
  seatbeltFastened: true,
  bucketHeight: 1.2,
  idleTimeMinutes: 4,
  gForce: 1.02,
  hydraulicPressure: 285,
  trenchDistance: 5.4,
  engineTemp: 86,
  coolantLevel: 94,
  oilPressure: 48,
  speed: 3.2,
  weatherCondition: 'Clear',
  nearbyPersonnel: 0,
  postureState: 'Good',
  continuousOpMinutes: 38,
  engineHours: 1532.4,
  fuelUsedLiters: 142.5,
  loadCycles: 42,
};

/**
 * Structured interface for the organizer's sample telemetry rows
 */
export interface OrganizerSampleTelemetryRow {
  timestamp: string;
  machineId: string;
  operatorId: string;
  engineHours: number;
  proximityDistance: number;
  slopeAngle: number;
  idleTimeMinutes: number;
  seatbeltFastened: boolean;
  incidentEscalated: boolean;
  rawText: string;
}

/**
 * Organizer's sample telemetry dataset provided in hackathon requirements:
 * 2025-05-01 08:00:00 | EXC001 | OP1001 | 1523.5 | 5.2 | 12 | 30 | Fastened   | No
 * 2025-05-01 10:00:00 | EXC001 | OP1001 | 1524.8 | 3.8 | 2  | 55 | Unfastened | Yes
 * 2025-05-01 14:00:00 | EXC001 | OP1001 | 1526.5 | 6.1 | 10 | 15 | Fastened   | No
 * 2025-05-02 09:00:00 | EXC001 | OP1001 | 1530.2 | 2.0 | 1  | 60 | Unfastened | Yes
 */
export const ORGANIZER_SAMPLE_TELEMETRY: OrganizerSampleTelemetryRow[] = [
  {
    timestamp: '2025-05-01 08:00:00',
    machineId: 'EXC001',
    operatorId: 'OP1001',
    engineHours: 1523.5,
    proximityDistance: 5.2,
    slopeAngle: 12,
    idleTimeMinutes: 30,
    seatbeltFastened: true,
    incidentEscalated: false,
    rawText: '2025-05-01 08:00:00 | EXC001 | OP1001 | 1523.5 | 5.2 | 12 | 30 | Fastened | No',
  },
  {
    timestamp: '2025-05-01 10:00:00',
    machineId: 'EXC001',
    operatorId: 'OP1001',
    engineHours: 1524.8,
    proximityDistance: 3.8,
    slopeAngle: 2,
    idleTimeMinutes: 55,
    seatbeltFastened: false,
    incidentEscalated: true,
    rawText: '2025-05-01 10:00:00 | EXC001 | OP1001 | 1524.8 | 3.8 | 2 | 55 | Unfastened | Yes',
  },
  {
    timestamp: '2025-05-01 14:00:00',
    machineId: 'EXC001',
    operatorId: 'OP1001',
    engineHours: 1526.5,
    proximityDistance: 6.1,
    slopeAngle: 10,
    idleTimeMinutes: 15,
    seatbeltFastened: true,
    incidentEscalated: false,
    rawText: '2025-05-01 14:00:00 | EXC001 | OP1001 | 1526.5 | 6.1 | 10 | 15 | Fastened | No',
  },
  {
    timestamp: '2025-05-02 09:00:00',
    machineId: 'EXC001',
    operatorId: 'OP1001',
    engineHours: 1530.2,
    proximityDistance: 2.0,
    slopeAngle: 1,
    idleTimeMinutes: 60,
    seatbeltFastened: false,
    incidentEscalated: true,
    rawText: '2025-05-02 09:00:00 | EXC001 | OP1001 | 1530.2 | 2.0 | 1 | 60 | Unfastened | Yes',
  },
];
