import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { evaluateProximitySafety, evaluateSlopeSafety, evaluateSeatbeltSafety, evaluateTrenchSafety } from '../../lib/safetyRules';
import { ShieldCheck, AlertTriangle, AlertOctagon, Radio, Lock, Unlock, Compass, Eye, HeartPulse } from 'lucide-react';

export const SafetyStatusPanel: React.FC = () => {
  const { telemetry } = useTelemetry();

  const prox = evaluateProximitySafety(telemetry.proximityDistance);
  const slope = evaluateSlopeSafety(telemetry.slopeAngle);
  const belt = evaluateSeatbeltSafety(telemetry.seatbeltFastened, telemetry.speed);
  const trench = evaluateTrenchSafety(telemetry.trenchDistance);

  const hasDanger =
    prox.status === 'danger' ||
    slope.status === 'danger' ||
    belt.status === 'danger' ||
    trench.status === 'danger' ||
    telemetry.nearbyPersonnel > 0;

  const hasCaution =
    prox.status === 'caution' ||
    slope.status === 'caution' ||
    belt.status === 'caution' ||
    trench.status === 'caution' ||
    telemetry.postureState !== 'Good';

  const overall = hasDanger ? 'danger' : hasCaution ? 'caution' : 'safe';

  return (
    <div className="cab-panel p-4 md:p-5 border-l-4 border-l-cat-yellow flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Primary Cockpit Beacon */}
      <div className="flex items-center space-x-3.5">
        <div
          className={`p-3 rounded-lg border-2 shadow-lg ${
            overall === 'danger'
              ? 'bg-cat-red/20 border-cat-red text-cat-red shadow-cat-danger animate-pulse'
              : overall === 'caution'
              ? 'bg-cat-amber/20 border-cat-amber text-cat-amber'
              : 'bg-cat-green/20 border-cat-green text-cat-green shadow-cat-safe'
          }`}
        >
          {overall === 'danger' && <AlertOctagon className="w-8 h-8" />}
          {overall === 'caution' && <AlertTriangle className="w-8 h-8" />}
          {overall === 'safe' && <ShieldCheck className="w-8 h-8" />}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow">
              Real-Time Cockpit Safety HUD
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-black bg-cat-surface text-cat-muted border border-cat-border">
              CAN-BUS 2.0B / J1939
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-cat-text mt-0.5 tracking-tight">
            {overall === 'danger'
              ? 'HAZARD BREACH — IMMEDIATE ATTENTION'
              : overall === 'caution'
              ? 'CAUTION ENVELOPE — ATTENTION REQUIRED'
              : 'ALL SAFETY PERIMETERS SECURE'}
          </h1>
          <p className="text-xs text-cat-muted mt-0.5">
            Real-time interlocks, 360° LiDAR radar, rollover attitude, and operator wellbeing.
          </p>
        </div>
      </div>

      {/* 5 Subsystem Pill Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Radar */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded border font-bold ${
            prox.status === 'danger'
              ? 'bg-cat-red/20 text-cat-red border-cat-red'
              : prox.status === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-surface text-cat-text border-cat-border'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Radar: {telemetry.proximityDistance.toFixed(1)}m</span>
        </div>

        {/* Seatbelt */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded border font-bold ${
            belt.isLocked
              ? 'bg-cat-red text-white border-cat-red animate-pulse'
              : !telemetry.seatbeltFastened
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-surface text-cat-green border-cat-border'
          }`}
        >
          {telemetry.seatbeltFastened ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>Belt: {telemetry.seatbeltFastened ? 'LATCHED' : 'UNLATCHED'}</span>
        </div>

        {/* Slope */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded border font-bold ${
            slope.status === 'danger'
              ? 'bg-cat-red/20 text-cat-red border-cat-red'
              : slope.status === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-surface text-cat-text border-cat-border'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Slope: {telemetry.slopeAngle.toFixed(1)}&deg;</span>
        </div>

        {/* Trench */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded border font-bold ${
            trench.status === 'danger'
              ? 'bg-cat-red/20 text-cat-red border-cat-red'
              : trench.status === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-surface text-cat-text border-cat-border'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Trench: {telemetry.trenchDistance.toFixed(1)}ft</span>
        </div>

        {/* Wellbeing */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded border font-bold ${
            telemetry.postureState !== 'Good'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-surface text-cat-green border-cat-border'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>{telemetry.postureState}</span>
        </div>
      </div>
    </div>
  );
};
