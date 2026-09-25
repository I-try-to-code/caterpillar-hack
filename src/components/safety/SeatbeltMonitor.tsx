import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { evaluateSeatbeltSafety } from '../../lib/safetyRules';
import { Lock, Unlock, AlertOctagon } from 'lucide-react';

export const SeatbeltMonitor: React.FC = () => {
  const { telemetry } = useTelemetry();
  const belt = evaluateSeatbeltSafety(telemetry.seatbeltFastened, telemetry.speed);

  return (
    <div
      className={`cab-panel p-4 md:p-5 border-2 rounded-lg space-y-3 transition-all ${
        belt.isLocked
          ? 'border-cat-red bg-cat-red/15 shadow-cat-danger animate-pulse'
          : !telemetry.seatbeltFastened
          ? 'border-cat-amber bg-cat-amber/10'
          : 'border-cat-border bg-cat-surface/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`p-1.5 rounded ${
              belt.isLocked
                ? 'bg-cat-red text-white'
                : !telemetry.seatbeltFastened
                ? 'bg-cat-amber text-cat-bg'
                : 'bg-cat-surface text-cat-green'
            }`}
          >
            {belt.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wide text-cat-text">
              Seatbelt Interlock System
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              OSHA 1926.602 &bull; Transmission Travel Interlock
            </span>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider border ${
            belt.isLocked
              ? 'bg-cat-red text-white border-cat-red shadow-cat-danger animate-bounce'
              : !telemetry.seatbeltFastened
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-green/20 text-cat-green border-cat-green/40'
          }`}
        >
          {belt.isLocked ? 'TRANSMISSION LOCKED' : telemetry.seatbeltFastened ? 'ENGAGED' : 'UNLATCHED'}
        </span>
      </div>

      {/* Prominent Red Locked State Banner */}
      {belt.isLocked && (
        <div className="p-4 rounded-md bg-cat-red text-white font-black text-center shadow-lg border-2 border-white/40 space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <AlertOctagon className="w-6 h-6 animate-spin" />
            <span className="text-lg md:text-xl tracking-tight">
              MACHINE LOCKED — Fasten Seatbelt
            </span>
          </div>
          <p className="text-xs font-semibold text-white/90">
            Speed is {telemetry.speed.toFixed(1)} km/h while seatbelt is unfastened. Hydraulic travel lock engaged.
          </p>
        </div>
      )}

      {/* Interlock Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="bg-cat-surface/50 p-2.5 rounded border border-cat-border/60">
          <span className="text-cat-muted text-[10px] uppercase font-bold block">
            Buckle Sensor Status
          </span>
          <span
            className={`text-lg font-black telemetry-readout mt-1 block ${
              telemetry.seatbeltFastened ? 'text-cat-green' : 'text-cat-red'
            }`}
          >
            {telemetry.seatbeltFastened ? 'LATCHED (PASS)' : 'DISENGAGED (VIOLATION)'}
          </span>
          <span className="text-[10px] text-cat-muted">Microswitch Sensor Circuit</span>
        </div>

        <div className="bg-cat-surface/50 p-2.5 rounded border border-cat-border/60">
          <span className="text-cat-muted text-[10px] uppercase font-bold block">
            Machine Travel Velocity
          </span>
          <span className="text-lg font-black telemetry-readout text-cat-text mt-1 block">
            {telemetry.speed.toFixed(1)} <span className="text-xs font-normal">km/h</span>
          </span>
          <span className="text-[10px] text-cat-muted">
            {telemetry.speed > 0 ? 'Travel gears rotating' : 'Machine stationary'}
          </span>
        </div>
      </div>
    </div>
  );
};
