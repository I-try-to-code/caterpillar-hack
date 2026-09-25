import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { evaluateTrenchSafety } from '../../lib/safetyRules';
import { ShieldAlert, AlertOctagon, Layers } from 'lucide-react';

export const TrenchMonitor: React.FC = () => {
  const { telemetry } = useTelemetry();
  const trench = evaluateTrenchSafety(telemetry.trenchDistance);
  const isCritical = telemetry.trenchDistance < 2.0;

  return (
    <div
      className={`cab-panel p-4 md:p-5 border-2 rounded-lg space-y-3 transition-all ${
        isCritical
          ? 'border-cat-red bg-cat-red/15 shadow-cat-danger animate-pulse'
          : trench.status === 'caution'
          ? 'border-cat-amber bg-cat-amber/10'
          : 'border-cat-border bg-cat-surface/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`p-1.5 rounded ${
              isCritical
                ? 'bg-cat-red text-white'
                : trench.status === 'caution'
                ? 'bg-cat-amber text-cat-bg'
                : 'bg-cat-surface text-cat-yellow'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wide text-cat-text">
              Trench Edge Distance Monitor
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              Subsurface Ground Inclinometer &bull; Berm Collapse Radar
            </span>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider border ${
            isCritical
              ? 'bg-cat-red text-white border-cat-red shadow-cat-danger animate-bounce'
              : trench.status === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-green/20 text-cat-green border-cat-green/40'
          }`}
        >
          {isCritical ? 'CRITICAL BERM BREACH' : trench.status.toUpperCase()}
        </span>
      </div>

      {/* Prominent Critical Danger Banner */}
      {isCritical && (
        <div className="p-4 rounded-md bg-cat-red text-white font-black text-center shadow-lg border-2 border-white/40 space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <span className="text-lg md:text-xl tracking-tight">
              DANGER: Trench edge {telemetry.trenchDistance.toFixed(1)} feet away — STOP
            </span>
          </div>
          <p className="text-xs font-semibold text-white/90">
            Machine track is within 2.0 ft critical collapse perimeter. Immediate track reversal required.
          </p>
        </div>
      )}

      {/* Trench Cross-Section Visualization */}
      <div className="bg-cat-bg/80 p-3 rounded border border-cat-border/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-5 h-5 text-cat-yellow flex-shrink-0" />
          <div>
            <span className="font-extrabold text-cat-text block">
              Soil Type: Compacted Sandy Clay (Class B)
            </span>
            <span className="text-[10px] text-cat-muted">
              OSHA Mandated Trench Buffer: &ge; 2.0 ft minimum berm
            </span>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-2xl font-black telemetry-readout ${
              isCritical ? 'text-cat-red' : trench.status === 'caution' ? 'text-cat-amber' : 'text-cat-green'
            }`}
          >
            {telemetry.trenchDistance.toFixed(1)} <span className="text-xs font-normal">ft</span>
          </span>
          <span className="text-[10px] text-cat-muted block">Measured to lip</span>
        </div>
      </div>
    </div>
  );
};
