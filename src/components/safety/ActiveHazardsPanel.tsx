import React from 'react';
import { ActiveHazard } from '../../lib/safetyRules';
import { AlertOctagon, ShieldCheck, ArrowRight, PhoneCall } from 'lucide-react';

interface ActiveHazardsPanelProps {
  hazards: ActiveHazard[];
  collectiveAction: string;
  hasCritical: boolean;
  onEscalate?: () => void;
}

export const ActiveHazardsPanel: React.FC<ActiveHazardsPanelProps> = ({
  hazards,
  collectiveAction,
  hasCritical,
  onEscalate,
}) => {
  if (hazards.length === 0) {
    return (
      <div className="cab-panel p-4 md:p-5 border border-cat-green/40 bg-cat-green/5 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-cat-green/20 text-cat-green">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-cat-green">
                Cab Multi-Hazard Defense Matrix
              </span>
              <span className="w-2 h-2 rounded-full bg-cat-green animate-beacon" />
            </div>
            <h2 className="text-base font-extrabold text-cat-text">
              Zero Active Safety Hazards Detected
            </h2>
            <p className="text-xs text-cat-muted mt-0.5">
              Proximity radar, seatbelt interlock, trench inclinometer, and thermal envelopes are nominal.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-cat-green/20 text-cat-green border border-cat-green/40">
          ALL SYSTEMS SECURE
        </span>
      </div>
    );
  }

  return (
    <div
      className={`cab-panel p-4 md:p-5 border-2 rounded-lg space-y-4 shadow-xl transition-all ${
        hasCritical
          ? 'border-cat-red bg-cat-red/10 shadow-cat-danger animate-pulse-subtle'
          : 'border-cat-amber bg-cat-amber/10'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded ${hasCritical ? 'bg-cat-red text-white' : 'bg-cat-amber text-cat-bg'}`}>
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Multi-Hazard Interlock Matrix &bull; Real-Time Aggregator
            </span>
            <h2 className="text-base font-extrabold text-cat-text">
              {hazards.length} ACTIVE HAZARD{hazards.length > 1 ? 'S' : ''} DETECTED
            </h2>
          </div>
        </div>

        {onEscalate && (
          <button
            type="button"
            onClick={onEscalate}
            className="touch-btn h-9 px-3 text-xs font-black uppercase tracking-wider bg-cat-red hover:bg-cat-redDark text-white rounded border border-cat-red flex items-center space-x-1.5 shadow-md transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Escalate All</span>
          </button>
        )}
      </div>

      {/* Grouped Hazards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {hazards.map((hazard) => (
          <div
            key={hazard.id}
            className={`p-3 rounded-md border text-xs flex flex-col justify-between space-y-2 ${
              hazard.severity === 'critical'
                ? 'bg-cat-red/20 border-cat-red text-cat-text'
                : hazard.severity === 'danger'
                ? 'bg-cat-red/15 border-cat-red/70 text-cat-text'
                : 'bg-cat-amber/15 border-cat-amber text-cat-text'
            }`}
          >
            <div className="flex items-start space-x-2">
              <span
                className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${
                  hazard.severity === 'critical' || hazard.severity === 'danger'
                    ? 'bg-cat-red shadow-cat-danger animate-ping'
                    : 'bg-cat-amber'
                }`}
              />
              <div>
                <span className="font-black text-sm block tracking-tight">
                  {hazard.title}
                </span>
                <p className="text-xs text-cat-muted mt-0.5">{hazard.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-cat-border/40 text-[11px]">
              <span className="text-cat-muted">Reading: <strong className="text-cat-yellow">{hazard.currentValue}</strong></span>
              <span className="text-cat-muted">Limit: <strong className="text-cat-text">{hazard.threshold}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Collective AI Context & Action Box */}
      <div className="p-3.5 rounded-md bg-cat-panel border-l-4 border-l-cat-yellow flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <ArrowRight className="w-4 h-4 text-cat-yellow flex-shrink-0" />
          <span className="text-sm font-bold text-cat-text">
            Recommended Action: <strong className="text-cat-yellow">{collectiveAction}</strong>
          </span>
        </div>

        <span className="text-[10px] text-cat-muted font-mono self-end sm:self-auto">
          AI Assistant Context Ready &bull; Structured Directive
        </span>
      </div>
    </div>
  );
};
