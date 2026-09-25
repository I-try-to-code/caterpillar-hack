import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Gauge,
  ArrowDownCircle,
  Flame,
} from 'lucide-react';

export const UnsafeOperationPanel: React.FC = () => {
  const { telemetry } = useTelemetry();

  // 1. Harsh G-Force evaluation
  const isHarshCritical = telemetry.gForce >= 2.2;
  const isHarshWarning = telemetry.gForce > 1.8 && telemetry.gForce < 2.2;

  // 2. Bucket height while traveling evaluation
  const isTraveling = telemetry.speed > 0;
  const isBucketUnsafe = isTraveling && telemetry.bucketHeight > 1.2;
  const isBucketCritical = isTraveling && telemetry.bucketHeight >= 2.5;

  // 3. Hydraulic relief pressure evaluation
  const isHydDanger = telemetry.hydraulicPressure >= 370;
  const isHydWarning = telemetry.hydraulicPressure > 340 && telemetry.hydraulicPressure < 370;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-cat-text uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-cat-yellow" />
          Real-Time Unsafe Operation & Mechanical Stress Monitors
        </h3>
        <span className="text-[11px] text-cat-muted font-mono">
          Sensors Polled @ 3000ms &bull; Cab Telematics Bus
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Harsh Operation / Accelerometer G-Force */}
        <div
          className={`cab-panel p-4 border-2 rounded-lg transition-all flex flex-col justify-between space-y-3 ${
            isHarshCritical
              ? 'border-cat-red bg-cat-red/10 shadow-[0_0_10px_rgba(235,0,0,0.25)] animate-pulse-subtle'
              : isHarshWarning
              ? 'border-cat-amber bg-cat-amber/10'
              : 'border-cat-border bg-cat-panel'
          }`}
        >
          <div className="flex items-center justify-between border-b border-cat-border/50 pb-2">
            <span className="text-xs font-bold text-cat-muted uppercase flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cat-yellow" /> Harsh G-Force
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                isHarshCritical
                  ? 'bg-cat-red text-white'
                  : isHarshWarning
                  ? 'bg-cat-amber text-cat-bg'
                  : 'bg-cat-green/20 text-cat-green'
              }`}
            >
              {isHarshCritical ? 'SHOCK IMPACT' : isHarshWarning ? 'HARSH LOAD' : 'NOMINAL'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl md:text-3xl font-black telemetry-readout text-cat-text">
                {telemetry.gForce.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-cat-muted uppercase">G</span>
            </div>
            <p className="text-xs text-cat-muted mt-1">
              Threshold: &le; 1.80g max envelope. Measures impact shock on undercarriage & slew bearing.
            </p>
          </div>

          <div className="p-2 rounded bg-cat-surface text-[11px] border border-cat-border flex items-start gap-1.5">
            {isHarshCritical || isHarshWarning ? (
              <AlertTriangle className="w-3.5 h-3.5 text-cat-amber flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-cat-green flex-shrink-0 mt-0.5" />
            )}
            <span className="text-cat-text">
              {isHarshCritical || isHarshWarning
                ? 'Recommendation: Smooth bucket engagement and avoid rapid slew reversals to prevent bearing fatigue.'
                : 'Dynamic acceleration smooth — optimal component life.'}
            </span>
          </div>
        </div>

        {/* Card 2: Bucket Height While Travelling */}
        <div
          className={`cab-panel p-4 border-2 rounded-lg transition-all flex flex-col justify-between space-y-3 ${
            isBucketCritical
              ? 'border-cat-red bg-cat-red/10 shadow-[0_0_10px_rgba(235,0,0,0.25)] animate-pulse-subtle'
              : isBucketUnsafe
              ? 'border-red-500/80 bg-red-950/20'
              : 'border-cat-border bg-cat-panel'
          }`}
        >
          <div className="flex items-center justify-between border-b border-cat-border/50 pb-2">
            <span className="text-xs font-bold text-cat-muted uppercase flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4 text-cat-yellow" /> Bucket / Travel
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                isBucketUnsafe
                  ? 'bg-cat-red text-white animate-pulse'
                  : 'bg-cat-green/20 text-cat-green'
              }`}
            >
              {isBucketUnsafe ? 'TIP HAZARD' : 'SAFE CARRY'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl md:text-3xl font-black telemetry-readout text-cat-text">
                {telemetry.bucketHeight.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-cat-muted uppercase">m height</span>
              <span className="text-xs text-cat-yellow font-bold">
                @{telemetry.speed.toFixed(1)} km/h
              </span>
            </div>
            <p className="text-xs text-cat-muted mt-1">
              Safe limit: &le; 1.2m while speed &gt; 0 km/h. High center-of-gravity rollover hazard.
            </p>
          </div>

          <div className="p-2 rounded bg-cat-surface text-[11px] border border-cat-border flex items-start gap-1.5">
            {isBucketUnsafe ? (
              <AlertOctagon className="w-3.5 h-3.5 text-cat-red flex-shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-cat-green flex-shrink-0 mt-0.5" />
            )}
            <span className="text-cat-text font-semibold">
              {isBucketUnsafe
                ? 'Lower bucket before traveling — high center of gravity hazard.'
                : 'Bucket carry height within low center of gravity safety zone.'}
            </span>
          </div>
        </div>

        {/* Card 3: Hydraulic Pressure Relief Overload */}
        <div
          className={`cab-panel p-4 border-2 rounded-lg transition-all flex flex-col justify-between space-y-3 ${
            isHydDanger
              ? 'border-cat-red bg-cat-red/10 shadow-[0_0_10px_rgba(235,0,0,0.25)] animate-pulse-subtle'
              : isHydWarning
              ? 'border-cat-amber bg-cat-amber/10'
              : 'border-cat-border bg-cat-panel'
          }`}
        >
          <div className="flex items-center justify-between border-b border-cat-border/50 pb-2">
            <span className="text-xs font-bold text-cat-muted uppercase flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-cat-yellow" /> Hydraulic Relief
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                isHydDanger
                  ? 'bg-cat-red text-white'
                  : isHydWarning
                  ? 'bg-cat-amber text-cat-bg'
                  : 'bg-cat-green/20 text-cat-green'
              }`}
            >
              {isHydDanger ? 'RELIEF OVERLOAD' : isHydWarning ? 'HIGH PRESSURE' : 'NORMAL'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl md:text-3xl font-black telemetry-readout text-cat-text">
                {telemetry.hydraulicPressure}
              </span>
              <span className="text-xs font-bold text-cat-muted uppercase">bar</span>
            </div>
            <p className="text-xs text-cat-muted mt-1">
              Relief threshold: 340 bar continuous / 370 bar peak. Protects pump pistons & cylinder seals.
            </p>
          </div>

          <div className="p-2 rounded bg-cat-surface text-[11px] border border-cat-border flex items-start gap-1.5">
            {isHydDanger || isHydWarning ? (
              <AlertTriangle className="w-3.5 h-3.5 text-cat-amber flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-cat-green flex-shrink-0 mt-0.5" />
            )}
            <span className="text-cat-text">
              {isHydDanger || isHydWarning
                ? 'Hydraulic relief pressure high — reduce force to prevent damage.'
                : 'Cylinder pressure nominal — hydraulic relief valves closed.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
