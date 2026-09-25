import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { calculateIdleFuelWaste } from '../../lib/anomalyRules';
import { Clock, Fuel, DollarSign, Cloud, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const IdleDetector: React.FC = () => {
  const { telemetry } = useTelemetry();
  const idleMinutes = telemetry.idleTimeMinutes;
  const isEngineOn = telemetry.engineRPM > 400;
  const isStationary = telemetry.speed === 0;

  const { liters, costUSD, co2Kg } = calculateIdleFuelWaste(idleMinutes);

  const isCritical = idleMinutes >= 10;
  const isWarning = idleMinutes >= 5 && idleMinutes < 10;

  const statusBorder = isCritical
    ? 'border-cat-red bg-cat-red/10 shadow-[0_0_12px_rgba(235,0,0,0.25)]'
    : isWarning
    ? 'border-cat-amber bg-cat-amber/10'
    : 'border-cat-border bg-cat-panel';

  const badgeColor = isCritical
    ? 'bg-cat-red text-white animate-pulse'
    : isWarning
    ? 'bg-cat-amber text-cat-bg animate-pulse-subtle'
    : 'bg-cat-green/20 text-cat-green border border-cat-green/40';

  // Progress percentage out of 15 min max scale
  const progressPct = Math.min(100, Math.round((idleMinutes / 15) * 100));

  return (
    <div className={`cab-panel p-4 md:p-5 border-2 rounded-lg transition-all space-y-4 ${statusBorder}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div
            className={`p-2 rounded ${
              isCritical
                ? 'bg-cat-red text-white'
                : isWarning
                ? 'bg-cat-amber text-cat-bg'
                : 'bg-cat-surface text-cat-yellow'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Machine Usage &bull; Fuel Conservation Engine
            </span>
            <h2 className="text-base font-extrabold text-cat-text flex items-center gap-1.5">
              Continuous Idle Time Detector
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${badgeColor}`}>
            {isCritical ? 'CRITICAL IDLE' : isWarning ? 'EXCESSIVE IDLE' : 'OPTIMAL'}
          </span>
        </div>
      </div>

      {/* Main Meter & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left: Big Idle Readout */}
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl md:text-4xl font-black telemetry-readout text-cat-text">
              {idleMinutes.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-cat-muted uppercase">minutes</span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-cat-muted">
            <span>Engine: <strong>{isEngineOn ? `${telemetry.engineRPM} RPM` : 'OFF'}</strong></span>
            <span>&bull;</span>
            <span>Motion: <strong>{isStationary ? 'Stationary' : 'Tramming'}</strong></span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-cat-surface h-3 rounded-full overflow-hidden border border-cat-border relative">
              {/* Threshold markers */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cat-amber z-10"
                style={{ left: '33.3%' }}
                title="5m Amber Threshold"
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cat-red z-10"
                style={{ left: '66.6%' }}
                title="10m Red Threshold"
              />
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isCritical
                    ? 'bg-cat-red'
                    : isWarning
                    ? 'bg-cat-amber'
                    : 'bg-cat-green'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-cat-muted font-mono">
              <span>0m</span>
              <span className="text-cat-amber font-bold">5m (Amber)</span>
              <span className="text-cat-red font-bold">10m (Red)</span>
              <span>15m</span>
            </div>
          </div>
        </div>

        {/* Center: Live Waste Impact KPIs */}
        <div className="grid grid-cols-3 md:col-span-2 gap-2 text-xs">
          <div className="bg-cat-surface p-2.5 rounded border border-cat-border flex flex-col justify-between">
            <span className="text-cat-muted font-bold flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-cat-yellow" /> Fuel Wasted
            </span>
            <span className="text-lg font-black telemetry-readout text-cat-text mt-1">
              {liters} <span className="text-xs text-cat-muted">L</span>
            </span>
            <span className="text-[10px] text-cat-muted font-mono mt-0.5">Rate: 3.8 L/hr</span>
          </div>

          <div className="bg-cat-surface p-2.5 rounded border border-cat-border flex flex-col justify-between">
            <span className="text-cat-muted font-bold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-cat-green" /> Cost Waste
            </span>
            <span className="text-lg font-black telemetry-readout text-cat-green mt-1">
              ${costUSD}
            </span>
            <span className="text-[10px] text-cat-muted font-mono mt-0.5">@ $1.75/L</span>
          </div>

          <div className="bg-cat-surface p-2.5 rounded border border-cat-border flex flex-col justify-between">
            <span className="text-cat-muted font-bold flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-sky-400" /> Carbon Emitted
            </span>
            <span className="text-lg font-black telemetry-readout text-cat-text mt-1">
              {co2Kg} <span className="text-xs text-cat-muted">kg</span>
            </span>
            <span className="text-[10px] text-cat-muted font-mono mt-0.5">CO₂ footprint</span>
          </div>
        </div>
      </div>

      {/* Operator Directive Footer */}
      <div className="p-3 rounded bg-cat-surface border border-cat-border/80 flex items-start gap-2.5 text-xs">
        {isCritical ? (
          <AlertOctagon className="w-4 h-4 text-cat-red flex-shrink-0 mt-0.5 animate-pulse" />
        ) : isWarning ? (
          <AlertTriangle className="w-4 h-4 text-cat-amber flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-cat-green flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <span className="font-bold text-cat-text">Directive: </span>
          <span className="text-cat-muted">
            {isCritical
              ? 'Critical fuel consumption threshold exceeded (>10 min). Shut down engine immediately until hauling trucks enter Zone B.'
              : isWarning
              ? 'Excessive idle advisory (>5 min). Engage auto-idle or shut down engine during queue pauses.'
              : 'Machine engine duty cycle is optimal. Idle periods are within targeted production efficiency parameters.'}
          </span>
        </div>
      </div>
    </div>
  );
};
