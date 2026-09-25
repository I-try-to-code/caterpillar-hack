import React from 'react';
import { useWellbeing } from '../../hooks/useWellbeing';
import { useTelemetry } from '../../context/TelemetryContext';
import { Sparkles, CheckCircle2, Clock } from 'lucide-react';

export const StretchReminder: React.FC = () => {
  const { telemetry } = useTelemetry();
  const { showStretchReminder, dismissStretch, snoozeStretch } = useWellbeing();

  if (!showStretchReminder) {
    return null;
  }

  return (
    <div className="cab-panel p-4 md:p-5 border-2 border-cat-yellow bg-cat-yellow/10 rounded-lg shadow-cat-glow space-y-3 animate-pulse-subtle">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-yellow/30 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-cat-yellow text-cat-bg font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Ergonomic Health &bull; Continuous Operation Protocol
            </span>
            <h2 className="text-base font-black text-cat-text">
              60-Minute Micro-Stretch Rest Break
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-cat-yellow font-bold bg-cat-panel px-2.5 py-1 rounded border border-cat-yellow/30">
          <Clock className="w-3.5 h-3.5" />
          <span>Active: {telemetry.continuousOpMinutes} min continuous</span>
        </div>
      </div>

      {/* Routine Instructions */}
      <p className="text-xs md:text-sm text-cat-text leading-relaxed">
        You have been operating continuously for <strong>{telemetry.continuousOpMinutes} minutes</strong> without an idle break. Perform these 3 quick in-cab stretches to prevent musculoskeletal strain:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-cat-panel/80 p-2.5 rounded border border-cat-border/80">
          <span className="font-extrabold text-cat-yellow block">1. Cervical Neck Roll</span>
          <span className="text-[11px] text-cat-muted mt-0.5 block">
            Gently tilt head left, back, and right for 15 seconds to relieve neck tension.
          </span>
        </div>

        <div className="bg-cat-panel/80 p-2.5 rounded border border-cat-border/80">
          <span className="font-extrabold text-cat-yellow block">2. Shoulder Blade Squeeze</span>
          <span className="text-[11px] text-cat-muted mt-0.5 block">
            Pull shoulder blades back against seatback; hold for 10 seconds.
          </span>
        </div>

        <div className="bg-cat-panel/80 p-2.5 rounded border border-cat-border/80">
          <span className="font-extrabold text-cat-yellow block">3. Wrist &amp; Forearm Flex</span>
          <span className="text-[11px] text-cat-muted mt-0.5 block">
            Extend arms forward and flex fingers to counter joystick vibration fatigue.
          </span>
        </div>
      </div>

      {/* Controls: Done and Snooze 10 min */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={() => snoozeStretch(10)}
          className="touch-btn h-10 px-4 text-xs font-bold uppercase rounded bg-cat-surface hover:bg-cat-hover text-cat-text border border-cat-border transition-colors flex items-center space-x-1.5"
        >
          <Clock className="w-3.5 h-3.5 text-cat-muted" />
          <span>Snooze 10 min</span>
        </button>

        <button
          type="button"
          onClick={dismissStretch}
          className="touch-btn h-10 px-5 text-xs font-black uppercase rounded bg-cat-yellow hover:bg-cat-yellowHover text-cat-bg shadow-sm transition-colors flex items-center space-x-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Done (Complete Break)</span>
        </button>
      </div>
    </div>
  );
};
