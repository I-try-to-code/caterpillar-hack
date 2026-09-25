import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ScheduledTask } from '../../types/tasks';
import { calculateTaskTime } from '../../lib/calculations';
import { Calculator, CloudRain, Compass, UserCheck, Clock } from 'lucide-react';

interface TaskTimeEstimateProps {
  task: ScheduledTask;
}

export const TaskTimeEstimate: React.FC<TaskTimeEstimateProps> = ({ task }) => {
  const { telemetry } = useTelemetry();

  const calc = calculateTaskTime(
    task.estimatedMinutes,
    telemetry.weatherCondition,
    telemetry.slopeAngle,
    task.progress
  );

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-cat-yellow" />
          <div>
            <h2 className="text-base font-extrabold text-cat-text uppercase tracking-wide">
              Task Time Estimation Engine
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              Formula: Base &times; Weather &times; Slope &times; Efficiency
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-cat-muted font-mono">
          Model: CAT-EST-v2
        </span>
      </div>

      {/* Transparent Calculation Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        {/* 1. Base Time */}
        <div className="p-2.5 rounded bg-cat-surface/50 border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Base Time</span>
            <Clock className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <span className="text-lg font-black telemetry-readout text-cat-text mt-1 block">
            {calc.baseMinutes} <span className="text-xs font-normal text-cat-muted">min</span>
          </span>
          <span className="text-[10px] text-cat-muted">Standard spec benchmark</span>
        </div>

        {/* 2. Weather Factor */}
        <div className="p-2.5 rounded bg-cat-surface/50 border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Weather Factor</span>
            <CloudRain className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <span
            className={`text-lg font-black telemetry-readout mt-1 block ${
              calc.weatherFactor > 1.2
                ? 'text-cat-red'
                : calc.weatherFactor > 1.0
                ? 'text-cat-amber'
                : 'text-cat-green'
            }`}
          >
            {calc.weatherFactor.toFixed(2)}&times;
          </span>
          <span className="text-[10px] text-cat-muted truncate block">
            {telemetry.weatherCondition} conditions
          </span>
        </div>

        {/* 3. Slope Factor */}
        <div className="p-2.5 rounded bg-cat-surface/50 border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Slope Factor</span>
            <Compass className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <span
            className={`text-lg font-black telemetry-readout mt-1 block ${
              calc.slopeFactor > 1.2
                ? 'text-cat-red'
                : calc.slopeFactor > 1.05
                ? 'text-cat-amber'
                : 'text-cat-green'
            }`}
          >
            {calc.slopeFactor.toFixed(2)}&times;
          </span>
          <span className="text-[10px] text-cat-muted truncate block">
            Grade: {telemetry.slopeAngle.toFixed(1)}°
          </span>
        </div>

        {/* 4. Operator Efficiency */}
        <div className="p-2.5 rounded bg-cat-surface/50 border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Efficiency</span>
            <UserCheck className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <span className="text-lg font-black telemetry-readout text-cat-green mt-1 block">
            {calc.efficiencyScore.toFixed(2)}&times;
          </span>
          <span className="text-[10px] text-cat-muted">Tier 2 Operator Rating</span>
        </div>
      </div>

      {/* Result Calculation Banner */}
      <div className="p-3 rounded-md bg-cat-surface/80 border border-cat-yellow/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="font-mono text-cat-muted">
          <span>{calc.baseMinutes}m</span>
          <span className="text-cat-yellow font-bold"> &times; </span>
          <span>{calc.weatherFactor.toFixed(2)}</span>
          <span className="text-cat-yellow font-bold"> &times; </span>
          <span>{calc.slopeFactor.toFixed(2)}</span>
          <span className="text-cat-yellow font-bold"> &times; </span>
          <span>{calc.efficiencyScore.toFixed(2)}</span>
          <span className="text-cat-yellow font-bold"> = </span>
          <span className="text-cat-yellow font-black text-sm">{calc.estimatedMinutes} min Total</span>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <span className="text-cat-muted font-bold">Est. Remaining:</span>
          <span className="px-2 py-0.5 rounded bg-cat-yellow text-cat-bg font-black text-sm telemetry-readout shadow-sm">
            {calc.remainingMinutes} min
          </span>
        </div>
      </div>
    </div>
  );
};
