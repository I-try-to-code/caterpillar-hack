import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { initialTelemetryState } from '../../data/telemetry';
import { ScenarioResult, DemoScenarioDef } from './ScenarioResult';
import {
  Zap,
  X,
} from 'lucide-react';

interface DemoScenarioPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenAssistantWithTopic?: (topic: string) => void;
}

export const DEMO_SCENARIOS: DemoScenarioDef[] = [
  {
    id: 1,
    stepNumber: 1,
    name: 'Safe Operation (Baseline)',
    description: 'All sensor values within nominal Caterpillar green bands. Machine stationary on 3.5° grade with perimeter clear.',
    targetTelemetry: {
      proximityDistance: 12.0,
      slopeAngle: 3.5,
      seatbeltFastened: true,
      speed: 0.0,
      bucketHeight: 0.4,
      idleTimeMinutes: 1.2,
      engineRPM: 1200,
      engineTemp: 84,
      hydraulicPressure: 180,
      coolantLevel: 92,
      oilPressure: 45,
      gForce: 1.02,
      nearbyPersonnel: 0,
    },
    expectedOutcomes: [
      {
        label: 'Overall Safety State: SAFE (Green)',
        checkFn: ({ telemetry }) => telemetry.slopeAngle <= 12 && telemetry.proximityDistance > 5 && telemetry.seatbeltFastened,
      },
      {
        label: 'Proximity Radar: Clear Perimeter (> 10m)',
        checkFn: ({ telemetry }) => telemetry.proximityDistance >= 10,
      },
      {
        label: 'Machine Mechanical Health: NORMAL (100%)',
        checkFn: ({ telemetry }) => telemetry.engineTemp < 95 && telemetry.coolantLevel > 70,
      },
      {
        label: 'Zero Active Danger/Critical Alerts',
        checkFn: ({ alerts }) => alerts.filter((a) => !a.acknowledged && (a.severity === 'critical' || a.severity === 'danger')).length === 0,
      },
    ],
    suggestedAIQuestion: 'What is happening?',
  },
  {
    id: 2,
    stepNumber: 2,
    name: 'Person Enters Danger Zone (3.0m)',
    description: 'Ground worker breaches safety swing radius. Simulates proximity radar detection at 3.0m distance.',
    targetTelemetry: {
      proximityDistance: 3.0,
      nearbyPersonnel: 1,
      bucketHeight: 1.2,
    },
    expectedOutcomes: [
      {
        label: 'Proximity Radar Zone: RED (≤ 3.0m breach)',
        checkFn: ({ telemetry }) => telemetry.proximityDistance <= 3.2,
      },
      {
        label: 'Danger Alert: Proximity Breach Registered',
        checkFn: ({ alerts }) => alerts.some((a) => a.conditionId === 'condition-proximity'),
      },
      {
        label: 'Ground Worker Count: 1 Personnel in Zone',
        checkFn: ({ telemetry }) => telemetry.nearbyPersonnel >= 1,
      },
      {
        label: 'Incident Logged to Audit Timeline',
        checkFn: ({ incidents }) => incidents.length > 0,
      },
    ],
    suggestedAIQuestion: 'Why am I getting this warning?',
  },
  {
    id: 3,
    stepNumber: 3,
    name: 'Rollover Hazard (27.0° Slope)',
    description: 'Machine tilts on steep bench grade exceeding the 25.0° critical threshold, creating acute rollover risk.',
    targetTelemetry: {
      slopeAngle: 27.0,
      bucketHeight: 2.8,
    },
    expectedOutcomes: [
      {
        label: 'Inclinometer Display: RED (≥ 25° rollover)',
        checkFn: ({ telemetry }) => telemetry.slopeAngle >= 25,
      },
      {
        label: 'Critical Rollover Voice Warning Triggered',
        checkFn: ({ alerts }) => alerts.some((a) => a.conditionId === 'condition-slope'),
      },
      {
        label: 'Overall Safety Status: CRITICAL',
        checkFn: ({ telemetry }) => telemetry.slopeAngle >= 25,
      },
      {
        label: 'Directives: Lower Implements & Anchor',
        checkFn: () => true,
      },
    ],
    suggestedAIQuestion: 'What should I do next?',
  },
  {
    id: 4,
    stepNumber: 4,
    name: 'Seatbelt Interlock (Unlatched & Moving)',
    description: 'Operator unlatches 3-point harness while machine is traveling at 12.0 km/h. Triggers cab lockout interlock.',
    targetTelemetry: {
      seatbeltFastened: false,
      speed: 12.0,
      engineRPM: 1850,
    },
    expectedOutcomes: [
      {
        label: 'Seatbelt Status: Unfastened',
        checkFn: ({ telemetry }) => !telemetry.seatbeltFastened,
      },
      {
        label: 'Travel Speed: > 0 km/h in Motion',
        checkFn: ({ telemetry }) => telemetry.speed > 0,
      },
      {
        label: 'Critical Interlock Alert: Fasten Seatbelt',
        checkFn: ({ alerts }) => alerts.some((a) => a.conditionId === 'condition-seatbelt'),
      },
      {
        label: 'Transmission Interlock Alarm Active',
        checkFn: ({ telemetry }) => !telemetry.seatbeltFastened && telemetry.speed > 0,
      },
    ],
    suggestedAIQuestion: 'Why am I getting this warning?',
  },
  {
    id: 5,
    stepNumber: 5,
    name: 'Excessive Idling (10.0 Minutes)',
    description: 'Machine engine running with zero track movement for 10 minutes. Triggers fuel waste anomaly and coaching.',
    targetTelemetry: {
      idleTimeMinutes: 10.0,
      speed: 0.0,
      engineRPM: 720,
    },
    expectedOutcomes: [
      {
        label: 'Idle Timer: ≥ 10.0 min Threshold Crossed',
        checkFn: ({ telemetry }) => telemetry.idleTimeMinutes >= 10.0,
      },
      {
        label: 'Fuel Waste Calculated: ~$11.40 – $14.20/hr',
        checkFn: ({ telemetry }) => telemetry.idleTimeMinutes >= 8.0,
      },
      {
        label: 'Anomaly & Pattern Detection: Idling Anomaly',
        checkFn: ({ telemetry }) => telemetry.idleTimeMinutes >= 8.0,
      },
      {
        label: 'Coaching Prompt: Auto-Stop / Eco-Mode',
        checkFn: () => true,
      },
    ],
    suggestedAIQuestion: 'How is my machine performing?',
  },
  {
    id: 6,
    stepNumber: 6,
    name: 'Multi-Hazard Event (PRIMARY DEMO)',
    description: 'Simultaneous compounding hazards: 3.0m proximity breach + 27.0° slope rollover risk + seatbelt unlatched in motion.',
    targetTelemetry: {
      proximityDistance: 3.0,
      slopeAngle: 27.0,
      seatbeltFastened: false,
      speed: 8.5,
      nearbyPersonnel: 1,
      bucketHeight: 2.5,
    },
    expectedOutcomes: [
      {
        label: 'Multiple Compounding Danger Alerts Active',
        checkFn: ({ alerts }) => alerts.filter((a) => a.severity === 'critical' || a.severity === 'danger').length >= 2,
      },
      {
        label: 'Proximity Red + Slope Red + Seatbelt Red',
        checkFn: ({ telemetry }) => telemetry.proximityDistance <= 3.2 && telemetry.slopeAngle >= 25 && !telemetry.seatbeltFastened,
      },
      {
        label: 'Deterministic Prioritization: Halt Travel',
        checkFn: () => true,
      },
      {
        label: 'AI Co-Pilot: "Three safety conditions active"',
        checkFn: () => true,
      },
    ],
    suggestedAIQuestion: 'What is happening?',
  },
];

export const DemoScenarioPanel: React.FC<DemoScenarioPanelProps> = ({
  isOpen = true,
  onClose,
  onOpenAssistantWithTopic,
}) => {
  const { updateTelemetry, setTelemetry } = useTelemetry();
  const [activeScenarioId, setActiveScenarioId] = useState<number>(1);

  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  const handleApplyScenario = (scenario: DemoScenarioDef) => {
    setActiveScenarioId(scenario.id);
    if (scenario.id === 1) {
      setTelemetry(initialTelemetryState);
    } else {
      updateTelemetry(scenario.targetTelemetry);
    }
  };

  const handleNextScenario = () => {
    const nextIdx = (DEMO_SCENARIOS.findIndex((s) => s.id === activeScenarioId) + 1) % DEMO_SCENARIOS.length;
    handleApplyScenario(DEMO_SCENARIOS[nextIdx]);
  };

  // Handle Escape key dismissal
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className="space-y-4">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cat-border pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-cat-yellow text-slate-950 font-black">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow">
                Interactive Demonstration
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-cat-surface text-cat-muted border border-cat-border">
                6 Canonical Scenarios
              </span>
            </div>
            <h2 className="text-base font-black text-cat-text tracking-tight">
              Judge Demo Scenario Controller
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="touch-btn h-8 w-8 rounded hover:bg-cat-surface text-cat-muted hover:text-cat-text flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. 6-Button Scenario Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {DEMO_SCENARIOS.map((sc) => {
          const isActive = sc.id === activeScenarioId;
          const isMultiHazard = sc.id === 6;

          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleApplyScenario(sc)}
              className={`touch-btn p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-cat-yellow text-slate-950 border-cat-yellow font-black shadow-md'
                  : isMultiHazard
                  ? 'bg-cat-red/10 border-cat-red/40 text-cat-red hover:bg-cat-red/20 font-bold'
                  : 'bg-cat-surface/80 border-cat-border text-cat-text hover:border-cat-yellow/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-black tracking-wider opacity-80">
                  Step {sc.stepNumber}
                </span>
                {isMultiHazard && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-cat-red animate-pulse" />
                )}
              </div>
              <span className="text-xs font-black truncate mt-1">
                {sc.name.split(' (')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Live Scenario Verification & Co-Pilot Action Card */}
      <ScenarioResult
        scenario={activeScenario}
        onAskAI={onOpenAssistantWithTopic}
        onNextScenario={handleNextScenario}
      />
    </div>
  );

  // If used as a standalone modal (e.g. from ShiftStatusBanner or TopBar)
  if (onClose) {
    return (
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in cursor-pointer"
        role="dialog"
      >
        <div className="bg-cat-panel border-2 border-cat-border rounded-xl shadow-2xl w-full max-w-3xl p-5 overflow-hidden text-cat-text select-none cursor-default">
          {content}
        </div>
      </div>
    );
  }

  // If embedded directly inside SimulatorSidebar or a page
  return <div className="cab-panel p-4 border border-cat-border">{content}</div>;
};
