import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { evaluateTransparentSafety, SafetyCheckItem } from '../../lib/calculations';
import { ShieldCheck, AlertTriangle, AlertOctagon, Check, X } from 'lucide-react';

export const SafetyStatusCard: React.FC = () => {
  const { telemetry } = useTelemetry();
  const { overall, title, checks } = evaluateTransparentSafety(telemetry);

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-4">
      {/* Header with Status Banner */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          {overall === 'safe' && <ShieldCheck className="w-5 h-5 text-cat-green" />}
          {overall === 'caution' && <AlertTriangle className="w-5 h-5 text-cat-amber" />}
          {overall === 'danger' && <AlertOctagon className="w-5 h-5 text-cat-red" />}
          <h2 className="text-base font-extrabold uppercase tracking-wide text-cat-text">
            Transparent Safety Status
          </h2>
        </div>

        <div
          className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider border flex items-center space-x-1.5 ${
            overall === 'safe'
              ? 'bg-cat-green/20 text-cat-green border-cat-green/40'
              : overall === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber/40 animate-pulse-subtle'
              : 'bg-cat-red/20 text-cat-red border-cat-red/40 animate-pulse'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              overall === 'safe'
                ? 'bg-cat-green'
                : overall === 'caution'
                ? 'bg-cat-amber'
                : 'bg-cat-red'
            }`}
          />
          <span>{title}</span>
        </div>
      </div>

      {/* Transparent Reasons Checklist */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-cat-muted flex items-center justify-between px-1">
          <span>Monitored Parameter</span>
          <span>Verified Reason / Sensor Reading</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {checks.map((item: SafetyCheckItem) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-md border flex items-center justify-between text-xs transition-colors ${
                item.status === 'danger'
                  ? 'bg-cat-red/10 border-cat-red/50 text-cat-text'
                  : item.status === 'caution'
                  ? 'bg-cat-amber/10 border-cat-amber/40 text-cat-text'
                  : 'bg-cat-surface/40 border-cat-border/60 text-cat-text'
              }`}
            >
              {/* Parameter Name with Icon */}
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center font-black flex-shrink-0 ${
                    item.status === 'danger'
                      ? 'bg-cat-red text-white'
                      : item.status === 'caution'
                      ? 'bg-cat-amber text-cat-bg'
                      : 'bg-cat-green/20 text-cat-green'
                  }`}
                >
                  {item.status === 'danger' ? (
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  ) : item.status === 'caution' ? (
                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </div>
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </div>

              {/* Current Value & Transparent Reason */}
              <div className="text-right">
                <span
                  className={`font-extrabold telemetry-readout text-sm ${
                    item.status === 'danger'
                      ? 'text-cat-red'
                      : item.status === 'caution'
                      ? 'text-cat-amber'
                      : 'text-cat-green'
                  }`}
                >
                  {item.currentValue}
                </span>
                <span className="text-[11px] text-cat-muted block font-medium">
                  {item.reason}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
