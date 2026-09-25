import React, { useState, useEffect, useRef } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { TelemetryState } from '../../types/telemetry';
import { detectMeaningfulTelemetryChanges, TelemetryChangeItem } from '../../lib/telemetryComparison';
import { History, RefreshCw, CheckCircle } from 'lucide-react';

export const WhatChangedPanel: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [baseline, setBaseline] = useState<TelemetryState>(telemetry);
  const [changes, setChanges] = useState<TelemetryChangeItem[]>([]);
  const lastCheckedRef = useRef<TelemetryState>(telemetry);

  useEffect(() => {
    const diffs = detectMeaningfulTelemetryChanges(baseline, telemetry);
    setChanges(diffs);
  }, [telemetry, baseline]);

  const handleResetBaseline = () => {
    setBaseline(telemetry);
    lastCheckedRef.current = telemetry;
    setChanges([]);
  };

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-cat-yellow" />
          <div>
            <h2 className="text-base font-extrabold text-cat-text uppercase tracking-wide">
              What Changed &bull; Last 5 Minutes
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              Meaningful Deltas vs Baseline Snapshot
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetBaseline}
          className="touch-btn h-8 px-2.5 text-xs font-bold text-cat-yellow bg-cat-surface hover:bg-cat-hover rounded border border-cat-border hover:border-cat-yellow transition-all flex items-center space-x-1"
          title="Reset baseline snapshot to current telemetry"
        >
          <RefreshCw className="w-3 h-3" />
          <span>New Baseline</span>
        </button>
      </div>

      {/* Changes List */}
      <div className="space-y-2">
        {changes.length === 0 ? (
          <div className="p-4 rounded-md bg-cat-surface/30 border border-cat-border/50 text-center text-xs text-cat-muted flex flex-col items-center justify-center space-y-1">
            <CheckCircle className="w-5 h-5 text-cat-green opacity-80" />
            <span className="font-bold text-cat-text">No Significant Deviations Detected</span>
            <span>All monitored telemetry parameters remain stable since baseline.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {changes.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-md border flex items-center justify-between text-xs transition-colors ${
                  item.severity === 'danger'
                    ? 'bg-cat-red/10 border-cat-red/50 text-cat-text'
                    : item.severity === 'warning'
                    ? 'bg-cat-amber/10 border-cat-amber/40 text-cat-text'
                    : 'bg-cat-surface/60 border-cat-border text-cat-text'
                }`}
              >
                {/* Severity indicator & Parameter */}
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      item.severity === 'danger'
                        ? 'bg-cat-red shadow-cat-danger animate-pulse'
                        : item.severity === 'warning'
                        ? 'bg-cat-amber'
                        : 'bg-cat-yellow'
                    }`}
                  />
                  <div>
                    <span className="font-black text-sm block tracking-tight">
                      {item.parameter}
                    </span>
                    <span className="text-[11px] text-cat-muted font-medium">
                      {item.message}
                    </span>
                  </div>
                </div>

                {/* Transition Delta: Previous -> Current */}
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-mono font-bold text-xs flex items-center justify-end space-x-1">
                    <span className="text-cat-muted line-through opacity-70">
                      {item.previousDisplay}
                    </span>
                    <span className="text-cat-yellow font-extrabold">&rarr;</span>
                    <span
                      className={`font-black ${
                        item.severity === 'danger'
                          ? 'text-cat-red'
                          : item.severity === 'warning'
                          ? 'text-cat-amber'
                          : 'text-cat-green'
                      }`}
                    >
                      {item.currentDisplay}
                    </span>
                  </div>
                  <span className="text-[10px] text-cat-muted font-mono">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
