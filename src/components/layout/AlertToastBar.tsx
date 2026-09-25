import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Bell, CheckCircle2, AlertTriangle, AlertOctagon, Volume2 } from 'lucide-react';
import { evaluateMachineSafety } from '../../lib/calculations';

interface AlertToastBarProps {
  onAcknowledgeAll?: () => void;
}

export const AlertToastBar: React.FC<AlertToastBarProps> = ({ onAcknowledgeAll }) => {
  const { telemetry } = useTelemetry();
  const safety = evaluateMachineSafety(telemetry);

  return (
    <footer className="h-14 bg-cat-panel border-t-2 border-cat-border px-4 flex items-center justify-between flex-shrink-0 select-none z-20">
      {/* Alert Status Banner */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex items-center space-x-2 bg-cat-surface px-2.5 py-1 rounded border border-cat-border flex-shrink-0">
          <Bell className="w-4 h-4 text-cat-yellow" />
          <span className="text-xs font-bold uppercase tracking-wider text-cat-text">
            Cab Alert Hub
          </span>
        </div>

        {safety === 'safe' && (
          <div className="flex items-center space-x-2 text-cat-green text-sm font-semibold truncate">
            <CheckCircle2 className="w-4 h-4 text-cat-green flex-shrink-0" />
            <span className="truncate">
              STATUS NOMINAL &bull; Proximity {telemetry.proximityDistance.toFixed(1)}m &bull; Slope {telemetry.slopeAngle.toFixed(1)}&deg; &bull; Seatbelt Fastened
            </span>
          </div>
        )}

        {safety === 'caution' && (
          <div className="flex items-center space-x-2 text-cat-amber text-sm font-bold truncate animate-pulse-subtle">
            <AlertTriangle className="w-4 h-4 text-cat-amber flex-shrink-0" />
            <span className="truncate">
              CAUTION ADVISORY &bull; Check machine parameters &bull; Proximity {telemetry.proximityDistance.toFixed(1)}m
            </span>
          </div>
        )}

        {safety === 'danger' && (
          <div className="flex items-center space-x-2 text-cat-red text-sm font-black truncate animate-bounce">
            <AlertOctagon className="w-4 h-4 text-cat-red flex-shrink-0" />
            <span className="truncate">
              CRITICAL SAFETY ALERT &bull; IMMEDIATE OPERATOR ACTION REQUIRED
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-cat-muted bg-cat-bg/80 px-2 py-1 rounded border border-cat-border/60">
          <Volume2 className="w-3.5 h-3.5 text-cat-yellow" />
          <span>TTS Ready</span>
        </div>

        <button
          type="button"
          onClick={onAcknowledgeAll}
          className="touch-btn h-9 px-3 text-xs uppercase font-extrabold rounded bg-cat-surface border border-cat-border text-cat-text hover:border-cat-yellow hover:text-cat-yellow active:bg-cat-yellow active:text-cat-bg transition-colors"
        >
          Acknowledge
        </button>
      </div>
    </footer>
  );
};
