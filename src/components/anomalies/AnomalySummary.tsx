import React from 'react';
import { AnomalySummaryMetrics } from '../../hooks/useAnomalyDetection';
import {
  Clock,
  Fuel,
  Gauge,
  Flame,
  ArrowDownCircle,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';

interface AnomalySummaryProps {
  summary: AnomalySummaryMetrics;
}

export const AnomalySummary: React.FC<AnomalySummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {/* 1. Total Idle Time */}
      <div className="cab-panel p-3 border border-cat-border rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-cat-muted text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px]">Total Idle Time</span>
          <Clock className="w-3.5 h-3.5 text-cat-yellow" />
        </div>
        <div className="mt-2">
          <span className="text-xl md:text-2xl font-black telemetry-readout text-cat-text">
            {summary.totalIdleMinutes}
          </span>
          <span className="text-xs text-cat-muted font-bold ml-1">min</span>
        </div>
        <span className="text-[10px] text-cat-muted font-mono mt-1">
          Target: &le; 25m/shift
        </span>
      </div>

      {/* 2. Estimated Fuel Waste */}
      <div className="cab-panel p-3 border border-cat-border rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-cat-muted text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px]">Fuel Wasted</span>
          <Fuel className="w-3.5 h-3.5 text-cat-amber" />
        </div>
        <div className="mt-2">
          <span className="text-xl md:text-2xl font-black telemetry-readout text-cat-amber">
            {summary.totalFuelWastedLiters}
          </span>
          <span className="text-xs text-cat-muted font-bold ml-1">L</span>
        </div>
        <span className="text-[10px] text-cat-green font-mono font-bold mt-1">
          ${summary.totalFuelCostUSD} USD wasted
        </span>
      </div>

      {/* 3. Harsh Operation Events */}
      <div className="cab-panel p-3 border border-cat-border rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-cat-muted text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px]">Harsh Events</span>
          <Gauge className="w-3.5 h-3.5 text-cat-yellow" />
        </div>
        <div className="mt-2">
          <span
            className={`text-xl md:text-2xl font-black telemetry-readout ${
              summary.harshEventsCount > 0 ? 'text-cat-amber' : 'text-cat-text'
            }`}
          >
            {summary.harshEventsCount}
          </span>
          <span className="text-xs text-cat-muted font-bold ml-1">shocks</span>
        </div>
        <span className="text-[10px] text-cat-muted font-mono mt-1">
          &gt; 1.80g threshold
        </span>
      </div>

      {/* 4. Hydraulic Overpressure Events */}
      <div className="cab-panel p-3 border border-cat-border rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-cat-muted text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px]">Hydraulic Spikes</span>
          <Flame className="w-3.5 h-3.5 text-cat-yellow" />
        </div>
        <div className="mt-2">
          <span
            className={`text-xl md:text-2xl font-black telemetry-readout ${
              summary.hydraulicSpikesCount > 0 ? 'text-cat-red' : 'text-cat-text'
            }`}
          >
            {summary.hydraulicSpikesCount}
          </span>
          <span className="text-xs text-cat-muted font-bold ml-1">spikes</span>
        </div>
        <span className="text-[10px] text-cat-muted font-mono mt-1">
          &gt; 340 bar bypass
        </span>
      </div>

      {/* 5. Bucket / Travel Warnings */}
      <div className="cab-panel p-3 border border-cat-border rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-cat-muted text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px]">Bucket Warnings</span>
          <ArrowDownCircle className="w-3.5 h-3.5 text-cat-yellow" />
        </div>
        <div className="mt-2">
          <span
            className={`text-xl md:text-2xl font-black telemetry-readout ${
              summary.bucketTravelWarningsCount > 0 ? 'text-cat-amber' : 'text-cat-text'
            }`}
          >
            {summary.bucketTravelWarningsCount}
          </span>
          <span className="text-xs text-cat-muted font-bold ml-1">flags</span>
        </div>
        <span className="text-[10px] text-cat-muted font-mono mt-1">
          &gt; 1.2m while moving
        </span>
      </div>

      {/* 6. Active Anomalies */}
      <div
        className={`cab-panel p-3 border-2 rounded-lg flex flex-col justify-between ${
          summary.hasCriticalAnomalies
            ? 'border-cat-red bg-cat-red/10 animate-pulse-subtle'
            : summary.activeCount > 0
            ? 'border-cat-amber bg-cat-amber/10'
            : 'border-cat-green/50 bg-cat-green/5'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px] text-cat-text">
            Active Anomalies
          </span>
          {summary.activeCount > 0 ? (
            <AlertOctagon className="w-3.5 h-3.5 text-cat-red animate-pulse" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-cat-green" />
          )}
        </div>
        <div className="mt-2">
          <span
            className={`text-xl md:text-2xl font-black telemetry-readout ${
              summary.hasCriticalAnomalies
                ? 'text-cat-red'
                : summary.activeCount > 0
                ? 'text-cat-amber'
                : 'text-cat-green'
            }`}
          >
            {summary.activeCount}
          </span>
          <span className="text-xs text-cat-muted font-bold ml-1">active</span>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            summary.activeCount > 0 ? 'text-cat-amber' : 'text-cat-green'
          }`}
        >
          {summary.activeCount > 0 ? 'Action Required' : 'All Clear'}
        </span>
      </div>
    </div>
  );
};
