import { AnomalyTimeSeriesPoint, AnomalyHistoryRecord } from '../types/anomalies';

export const SHIFT_ANOMALY_TIME_SERIES: AnomalyTimeSeriesPoint[] = [
  {
    time: '07:00',
    idleTimeMinutes: 3,
    gForce: 1.1,
    hydraulicPressure: 260,
    fuelWasteLiters: 0.19,
    speed: 0,
    engineRPM: 950,
  },
  {
    time: '08:00',
    idleTimeMinutes: 6,
    gForce: 1.3,
    hydraulicPressure: 295,
    fuelWasteLiters: 0.38,
    speed: 4,
    engineRPM: 1750,
  },
  {
    time: '09:00',
    idleTimeMinutes: 12,
    gForce: 2.1, // harsh event
    hydraulicPressure: 320,
    fuelWasteLiters: 0.76,
    speed: 8,
    engineRPM: 1950,
  },
  {
    time: '10:00',
    idleTimeMinutes: 9,
    gForce: 1.4,
    hydraulicPressure: 365, // hydraulic spike
    fuelWasteLiters: 0.57,
    speed: 5,
    engineRPM: 1850,
  },
  {
    time: '11:00',
    idleTimeMinutes: 18, // heavy standby waiting on haul trucks
    gForce: 1.2,
    hydraulicPressure: 275,
    fuelWasteLiters: 1.14,
    speed: 0,
    engineRPM: 900,
  },
  {
    time: '12:00',
    idleTimeMinutes: 14,
    gForce: 2.4, // impact event
    hydraulicPressure: 340,
    fuelWasteLiters: 0.88,
    speed: 12,
    engineRPM: 2050,
  },
  {
    time: '13:00',
    idleTimeMinutes: 8,
    gForce: 1.5,
    hydraulicPressure: 310,
    fuelWasteLiters: 0.51,
    speed: 6,
    engineRPM: 1800,
  },
  {
    time: '14:00',
    idleTimeMinutes: 11,
    gForce: 1.8,
    hydraulicPressure: 385, // relief valve trip
    fuelWasteLiters: 0.70,
    speed: 7,
    engineRPM: 2100,
  },
  {
    time: '15:00',
    idleTimeMinutes: 7,
    gForce: 1.3,
    hydraulicPressure: 290,
    fuelWasteLiters: 0.44,
    speed: 3,
    engineRPM: 1650,
  },
];

export const INITIAL_ANOMALY_HISTORY: AnomalyHistoryRecord[] = [
  {
    id: 'anom-hist-01',
    timestamp: '09:14:22',
    category: 'harsh_operation',
    severity: 'warning',
    title: 'High G-Force Shock Load',
    value: '2.14 g',
    recommendation: 'Smooth bucket deceleration during rapid swing reversals.',
  },
  {
    id: 'anom-hist-02',
    timestamp: '10:28:45',
    category: 'hydraulic_pressure',
    severity: 'danger',
    title: 'Hydraulic Relief Pressure Spike',
    value: '368 bar',
    recommendation: 'Feather boom joystick when engaging high-density sandstone.',
  },
  {
    id: 'anom-hist-03',
    timestamp: '11:15:10',
    category: 'idling',
    severity: 'danger',
    title: 'Prolonged Cab Idling (Standby)',
    value: '18.2 min',
    durationMinutes: 18.2,
    fuelWastedLiters: 1.15,
    recommendation: 'Engage automatic engine shutdown when waiting >10 minutes for haulers.',
  },
  {
    id: 'anom-hist-04',
    timestamp: '12:05:33',
    category: 'bucket_travel',
    severity: 'warning',
    title: 'Elevated Bucket Tramming',
    value: '2.4 m @ 11.2 km/h',
    recommendation: 'Lower bucket to 0.4m above ground level while repositioning tracks.',
  },
  {
    id: 'anom-hist-05',
    timestamp: '14:12:08',
    category: 'harsh_operation',
    severity: 'critical',
    title: 'Undercarriage Shock Impact',
    value: '2.42 g',
    recommendation: 'Inspect track idlers and drive sprockets for abnormal fatigue.',
  },
];

export const BASELINE_SHIFT_METRICS = {
  averageIdleMinutes: 28.5,
  expectedFuelWasteLiters: 1.8,
  expectedHarshEvents: 1.5,
  expectedHydraulicSpikes: 1.0,
  idleFuelBurnRateLitersPerHour: 3.8, // CAT 336 Excavator nominal idle consumption
  dieselPricePerLiter: 1.75, // USD per liter
};
