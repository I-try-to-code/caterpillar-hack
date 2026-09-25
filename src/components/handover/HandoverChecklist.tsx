import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'mechanical' | 'safety' | 'environment' | 'electrical';
  title: string;
  description: string;
  isAutoVerified: boolean;
  autoVerifiedStatus?: 'pass' | 'fail' | 'warn';
  autoVerifiedDetail?: string;
}

export const HandoverChecklist: React.FC = () => {
  const { telemetry, updateTelemetry } = useTelemetry();

  // Dynamic automatic verification based on live telemetry
  const isBucketLowered = telemetry.bucketHeight <= 0.3;
  const isParkedFlat = telemetry.slopeAngle <= 6.0 && telemetry.speed === 0;
  const isHydraulicsNeutral = telemetry.hydraulicPressure <= 220;
  const isEngineIdleCooled = telemetry.engineTemp <= 92;

  const items: ChecklistItem[] = [
    {
      id: 'chk-bucket',
      category: 'safety',
      title: 'Excavator Bucket Lowered to Ground',
      description: 'Rest bucket cutting edge flat on soil to relieve hydraulic line pressure and eliminate drop hazard.',
      isAutoVerified: true,
      autoVerifiedStatus: isBucketLowered ? 'pass' : 'fail',
      autoVerifiedDetail: isBucketLowered
        ? `Bucket height ${telemetry.bucketHeight.toFixed(1)}m (Ground level)`
        : `Bucket elevated at ${telemetry.bucketHeight.toFixed(1)}m — lower implement!`,
    },
    {
      id: 'chk-park',
      category: 'safety',
      title: 'Machine Parked on Level Stable Ground',
      description: 'Park tracks parallel on compacted bench away from unstable trench lips or crests.',
      isAutoVerified: true,
      autoVerifiedStatus: isParkedFlat ? 'pass' : 'fail',
      autoVerifiedDetail: isParkedFlat
        ? `Stationary on stable ${telemetry.slopeAngle.toFixed(1)}° grade`
        : `Slope is ${telemetry.slopeAngle.toFixed(1)}° (> 6° limit) — reposition machine!`,
    },
    {
      id: 'chk-cool',
      category: 'mechanical',
      title: 'Engine Turbo Cooldown Idle Observed',
      description: 'Allow engine to idle 3–5 minutes at 700–900 RPM before shutdown to prevent oil coking.',
      isAutoVerified: true,
      autoVerifiedStatus: isEngineIdleCooled ? 'pass' : 'warn',
      autoVerifiedDetail: isEngineIdleCooled
        ? `Engine temp cooled to ${telemetry.engineTemp}°C`
        : `Engine temp at ${telemetry.engineTemp}°C — idle 2 min more`,
    },
    {
      id: 'chk-hyd-lock',
      category: 'mechanical',
      title: 'Hydraulic Pilot Control Lockout Lever Engaged',
      description: 'Raise the red hydraulic isolation arm on the left console to disable pilot joy-sticks.',
      isAutoVerified: true,
      autoVerifiedStatus: isHydraulicsNeutral ? 'pass' : 'warn',
      autoVerifiedDetail: isHydraulicsNeutral
        ? `Hydraulic circuit unloaded (${telemetry.hydraulicPressure} bar)`
        : `High circuit pressure (${telemetry.hydraulicPressure} bar)`,
    },
    {
      id: 'chk-cab',
      category: 'environment',
      title: 'Cab Clear, Windows Cleaned, Seatbelt Inspected',
      description: 'Remove personal debris, wipe exterior cameras/mirrors, and verify 3-point seatbelt webbing.',
      isAutoVerified: false,
    },
    {
      id: 'chk-leak-sweep',
      category: 'mechanical',
      title: '360° Ground Walkaround & Leak Sweep',
      description: 'Visually inspect boom/stick cylinder chrome for fluid weepage and check track sprocket teeth.',
      isAutoVerified: false,
    },
    {
      id: 'chk-power',
      category: 'electrical',
      title: 'Master Battery Disconnect Switch Toggled',
      description: 'Rotate battery isolator key in compartment to prevent parasitic discharge overnight.',
      isAutoVerified: false,
    },
  ];

  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({
    'chk-bucket': isBucketLowered,
    'chk-park': isParkedFlat,
  });

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAutoPassTelemetry = () => {
    // 1-click helper for operator / judge demo to prepare machine for perfect handover
    updateTelemetry({
      bucketHeight: 0.1,
      slopeAngle: 2.5,
      speed: 0,
      engineRPM: 750,
      engineTemp: 86,
      hydraulicPressure: 160,
      proximityDistance: 12.0,
      nearbyPersonnel: 0,
    });
    setCheckedIds({
      'chk-bucket': true,
      'chk-park': true,
      'chk-cool': true,
      'chk-hyd-lock': true,
      'chk-cab': true,
      'chk-leak-sweep': true,
      'chk-power': true,
    });
  };

  const completedCount = items.filter((i) => checkedIds[i.id]).length;
  const isAllComplete = completedCount === items.length;

  return (
    <div className="cab-panel p-5 border border-cat-border space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cat-border pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-md bg-cat-yellow text-slate-950 font-black">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-cat-yellow">
                Close-Out Protocol
              </span>
              <span className="text-xs font-bold text-cat-muted">
                ({completedCount} of {items.length} Complete)
              </span>
            </div>
            <h2 className="text-base font-black text-cat-text tracking-tight">
              Shift Close-Out &amp; Handover Checklist
            </h2>
          </div>
        </div>

        {/* 1-Click Auto-Prepare for Handover */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleAutoPassTelemetry}
            className="touch-btn h-8 px-3 text-xs font-bold rounded-md bg-cat-yellow/20 hover:bg-cat-yellow/30 text-cat-yellow border border-cat-yellow/40 transition-colors flex items-center space-x-1.5"
            title="Sets simulator to safe parked state and checks all items"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Secure Machine (Demo)</span>
          </button>

          <button
            type="button"
            onClick={() => setCheckedIds({})}
            className="touch-btn h-8 px-2.5 text-xs font-bold rounded-md bg-cat-surface hover:bg-cat-hover text-cat-muted hover:text-cat-text border border-cat-border transition-colors flex items-center space-x-1"
            title="Reset Checklist"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-cat-surface rounded-full overflow-hidden border border-cat-border">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isAllComplete ? 'bg-cat-green' : 'bg-cat-yellow'
          }`}
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      {/* Items list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {items.map((item) => {
          const isChecked = !!checkedIds[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                isChecked
                  ? 'bg-cat-green/10 border-cat-green/40 text-cat-text'
                  : 'bg-cat-surface/80 border-cat-border hover:border-cat-border/80'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isChecked
                    ? 'bg-cat-green border-cat-green text-white font-black'
                    : 'bg-cat-bg border-cat-border text-transparent'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black tracking-tight ${
                      isChecked ? 'line-through text-cat-muted' : 'text-cat-text'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <p className="text-[11px] text-cat-muted leading-relaxed">
                  {item.description}
                </p>

                {item.isAutoVerified && item.autoVerifiedDetail && (
                  <div className="mt-1 flex items-center space-x-1.5 text-[10px] font-bold">
                    {item.autoVerifiedStatus === 'pass' ? (
                      <span className="text-cat-green flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        CAN Telemetry Verified: {item.autoVerifiedDetail}
                      </span>
                    ) : (
                      <span className="text-cat-amber flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending Telemetry: {item.autoVerifiedDetail}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
