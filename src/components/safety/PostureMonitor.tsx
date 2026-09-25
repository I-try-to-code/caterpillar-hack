import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useWellbeing } from '../../hooks/useWellbeing';
import { User, Timer } from 'lucide-react';

export const PostureMonitor: React.FC = () => {
  const { telemetry } = useTelemetry();
  const { badPostureSeconds, badPostureMinutes, postureSeverity } = useWellbeing();

  const isGood = telemetry.postureState === 'Good';
  const isDanger = postureSeverity === 'danger';
  const isCaution = postureSeverity === 'caution';

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div
      className={`cab-panel p-4 md:p-5 border-2 rounded-lg space-y-3 transition-all ${
        isDanger
          ? 'border-cat-red bg-cat-red/15 shadow-cat-danger animate-pulse'
          : isCaution
          ? 'border-cat-amber bg-cat-amber/10'
          : 'border-cat-border bg-cat-surface/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`p-1.5 rounded ${
              isDanger
                ? 'bg-cat-red text-white'
                : isCaution
                ? 'bg-cat-amber text-cat-bg'
                : 'bg-cat-surface text-cat-green'
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wide text-cat-text">
              Driver Ergonomic Posture Monitor
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              AI In-Cab Vision &bull; Spinal Alignment Sensor
            </span>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider border ${
            isDanger
              ? 'bg-cat-red text-white border-cat-red shadow-cat-danger animate-bounce'
              : isCaution
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-green/20 text-cat-green border-cat-green/40'
          }`}
        >
          {isDanger ? 'FATIGUE HAZARD' : isCaution ? 'POSTURE CAUTION' : 'OPTIMAL ALIGNMENT'}
        </span>
      </div>

      {/* Main Posture Readout */}
      <div className="flex items-center justify-between bg-cat-bg/80 p-3 rounded border border-cat-border/80 text-xs">
        <div>
          <span className="text-[10px] text-cat-muted uppercase font-bold block">
            Detected Posture State
          </span>
          <span
            className={`text-xl font-black mt-0.5 block ${
              isDanger ? 'text-cat-red' : isCaution ? 'text-cat-amber' : 'text-cat-green'
            }`}
          >
            {telemetry.postureState}
          </span>
          <span className="text-[11px] text-cat-muted">
            {isGood
              ? 'Centered in seat suspension with full lumbar support'
              : telemetry.postureState === 'Slouching'
              ? 'Spinal slouching detected (> 15° forward neck bend)'
              : `Lateral leaning (${telemetry.postureState}) unbalances pelvic stability`}
          </span>
        </div>

        {!isGood && (
          <div className="text-right flex-shrink-0 bg-cat-surface px-3 py-1.5 rounded border border-cat-border">
            <div className="flex items-center space-x-1 text-[10px] text-cat-muted uppercase font-bold justify-end">
              <Timer className="w-3 h-3 text-cat-yellow" />
              <span>Duration</span>
            </div>
            <span
              className={`text-base font-black telemetry-readout ${
                isDanger ? 'text-cat-red' : 'text-cat-amber'
              }`}
            >
              {formatTimer(badPostureSeconds)}
            </span>
            <span className="text-[10px] text-cat-muted block">
              {badPostureMinutes >= 5 ? 'Threshold: >5m (RED)' : 'Threshold: >2m (AMBER)'}
            </span>
          </div>
        )}
      </div>

      {/* Guidance Note */}
      <div className="text-[11px] text-cat-muted flex items-center justify-between pt-1">
        <span>Rule: &gt;2 min = Amber Warning &bull; &gt;5 min = Red Critical Alert</span>
        {isDanger && (
          <span className="text-cat-red font-bold animate-pulse">
            Immediate 60s micro-stretch recommended
          </span>
        )}
      </div>
    </div>
  );
};
