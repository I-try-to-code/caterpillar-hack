import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { evaluateSlopeSafety } from '../../lib/safetyRules';
import { Compass, AlertOctagon } from 'lucide-react';

export const SlopeGauge: React.FC = () => {
  const { telemetry } = useTelemetry();
  const slope = evaluateSlopeSafety(telemetry.slopeAngle);
  const isRolloverRisk = telemetry.slopeAngle >= 25.0;

  // Inclinometer arc angle (maps 0-45° to -60° to +60° rotation)
  const rotationDeg = Math.min(60, (telemetry.slopeAngle / 45) * 60);

  return (
    <div
      className={`cab-panel p-4 md:p-5 border-2 rounded-lg space-y-3 transition-all ${
        isRolloverRisk
          ? 'border-cat-red bg-cat-red/15 shadow-cat-danger animate-pulse'
          : slope.status === 'caution'
          ? 'border-cat-amber bg-cat-amber/10'
          : 'border-cat-border bg-cat-surface/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`p-1.5 rounded ${
              isRolloverRisk
                ? 'bg-cat-red text-white'
                : slope.status === 'caution'
                ? 'bg-cat-amber text-cat-bg'
                : 'bg-cat-surface text-cat-yellow'
            }`}
          >
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wide text-cat-text">
              Roll &amp; Pitch Inclinometer Gauge
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              3-Axis Gyroscopic Attitude &bull; Center of Gravity
            </span>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider border ${
            isRolloverRisk
              ? 'bg-cat-red text-white border-cat-red shadow-cat-danger animate-bounce'
              : slope.status === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-green/20 text-cat-green border-cat-green/40'
          }`}
        >
          {isRolloverRisk ? 'ROLLOVER CRITICAL' : slope.status.toUpperCase()}
        </span>
      </div>

      {/* Prominent Rollover Warning Banner */}
      {isRolloverRisk && (
        <div className="p-4 rounded-md bg-cat-red text-white font-black text-center shadow-lg border-2 border-white/40 space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <span className="text-lg md:text-xl tracking-tight">
              Warning: Slope angle {telemetry.slopeAngle.toFixed(1)} degrees — risk of rollover
            </span>
          </div>
          <p className="text-xs font-semibold text-white/90">
            Center of gravity shifted. Lower excavator boom immediately and maneuver to level ground.
          </p>
        </div>
      )}

      {/* Graphical Attitude Indicator / Artificial Horizon */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-48 h-28 overflow-hidden rounded-t-full bg-[#0E0E1A] border-2 border-cat-border/80 flex items-center justify-center shadow-inner">
          {/* Dynamic Horizon Line */}
          <div
            className="absolute w-64 h-64 rounded-full border-t-4 transition-transform duration-300 flex items-center justify-center"
            style={{
              transform: `rotate(${rotationDeg}deg)`,
              borderColor: isRolloverRisk ? '#EF4444' : slope.status === 'caution' ? '#F59E0B' : '#10B981',
              backgroundColor: isRolloverRisk ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            }}
          >
            <div
              className={`w-full h-1 ${
                isRolloverRisk ? 'bg-cat-red shadow-cat-danger' : 'bg-cat-yellow'
              }`}
            />
          </div>

          {/* Fixed Center Machine Reference */}
          <div className="absolute z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-cat-yellow flex items-center justify-center bg-cat-panel shadow-md">
              <span className="w-2 h-2 rounded-full bg-cat-yellow" />
            </div>
            <span className="text-[10px] font-black text-cat-yellow mt-1">CAB LEVEL</span>
          </div>
        </div>

        {/* Readout */}
        <div className="mt-2 text-center">
          <span
            className={`text-3xl font-black telemetry-readout ${
              isRolloverRisk ? 'text-cat-red' : slope.status === 'caution' ? 'text-cat-amber' : 'text-cat-green'
            }`}
          >
            {telemetry.slopeAngle.toFixed(1)}&deg;
          </span>
          <span className="text-[11px] text-cat-muted block font-semibold">
            {telemetry.slopeAngle < 15
              ? 'Safe Operating Band (< 15°)'
              : telemetry.slopeAngle < 25
              ? 'Caution Threshold (15°–24.9°)'
              : 'Rollover Hazard Limit (≥ 25°)'}
          </span>
        </div>
      </div>
    </div>
  );
};
