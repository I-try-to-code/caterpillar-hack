export interface TrainingModule {
  id: string;
  title: string;
  category: 'Safety' | 'Efficiency' | 'Equipment Care' | 'Site Protocol';
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  score?: number;
  recommendedReason?: string;
}

export const INITIAL_TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'TRN-01',
    title: 'Trench Stability & Proximity Angle Best Practices',
    category: 'Safety',
    description: 'Learn dynamic slope calculation and safe benching procedures when excavating near trenches.',
    estimatedMinutes: 15,
    completed: true,
    score: 95,
  },
  {
    id: 'TRN-02',
    title: 'Fuel Optimization & Idle Cycle Reduction',
    category: 'Efficiency',
    description: 'Master engine power modes and auto-idle settings to reduce diesel consumption and component wear.',
    estimatedMinutes: 20,
    completed: false,
    recommendedReason: 'Recommended due to 30+ min idle cycle recorded in previous shift.',
  },
  {
    id: 'TRN-03',
    title: 'Hydraulic Pressure Thresholds & Smooth Feathering',
    category: 'Equipment Care',
    description: 'Techniques for smooth joystick actuation to minimize pressure spikes and protect hydraulic seals.',
    estimatedMinutes: 25,
    completed: false,
  },
  {
    id: 'TRN-04',
    title: 'Ergonomic Cab Posture & Micro-Stretch Routines',
    category: 'Safety',
    description: 'Guidance on seat suspension adjustment, lumbar support, and quick 60-second stretch breaks.',
    estimatedMinutes: 10,
    completed: false,
  },
];
