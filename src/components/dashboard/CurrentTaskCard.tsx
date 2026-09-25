import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ScheduledTask } from '../../types/tasks';
import { calculateTaskTime } from '../../lib/calculations';
import { MapPin, Clock, PlayCircle, Layers } from 'lucide-react';

interface CurrentTaskCardProps {
  task: ScheduledTask;
}

export const CurrentTaskCard: React.FC<CurrentTaskCardProps> = ({ task }) => {
  const { telemetry } = useTelemetry();

  // Calculate dynamic task timing using specified formula
  const timeCalc = calculateTaskTime(
    task.estimatedMinutes,
    telemetry.weatherCondition,
    telemetry.slopeAngle,
    task.progress
  );

  return (
    <div className="cab-panel p-4 md:p-5 border-l-4 border-l-cat-yellow space-y-4">
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <PlayCircle className="w-5 h-5 text-cat-yellow" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Active Shift Task Execution
            </span>
            <h2 className="text-lg md:text-xl font-black text-cat-text">
              {task.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider bg-cat-yellow/20 text-cat-yellow border border-cat-yellow/40 animate-pulse-subtle">
            IN PROGRESS
          </span>
        </div>
      </div>

      {/* Progress Bar & Key Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cat-muted font-bold uppercase tracking-wider">
            Execution Progress
          </span>
          <span className="telemetry-readout font-black text-cat-yellow text-sm">
            {task.progress}%
          </span>
        </div>

        {/* Tactile Progress Bar */}
        <div className="h-3 w-full bg-cat-bg rounded-full overflow-hidden border border-cat-border">
          <div
            className="h-full bg-cat-yellow rounded-full transition-all duration-300 shadow-cat-glow"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Grid of Task Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
        {/* Zone */}
        <div className="bg-cat-surface/50 p-2.5 rounded border border-cat-border/60">
          <span className="text-[10px] uppercase font-bold text-cat-muted block">Worksite Zone</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-cat-yellow" />
            <span className="font-extrabold text-cat-text text-sm">{task.zone}</span>
          </div>
        </div>

        {/* Task Type */}
        <div className="bg-cat-surface/50 p-2.5 rounded border border-cat-border/60">
          <span className="text-[10px] uppercase font-bold text-cat-muted block">Operation Type</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <Layers className="w-3.5 h-3.5 text-cat-yellow" />
            <span className="font-extrabold text-cat-text text-sm">{task.type}</span>
          </div>
        </div>

        {/* Estimated Remaining */}
        <div className="bg-cat-surface/50 p-2.5 rounded border border-cat-yellow/30 bg-cat-yellow/5">
          <span className="text-[10px] uppercase font-black text-cat-yellow block">Est. Remaining</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-cat-yellow" />
            <span className="font-black text-cat-yellow telemetry-readout text-sm">
              {timeCalc.remainingMinutes} min
            </span>
          </div>
        </div>

        {/* Base vs Adjusted Duration */}
        <div className="bg-cat-surface/50 p-2.5 rounded border border-cat-border/60">
          <span className="text-[10px] uppercase font-bold text-cat-muted block">Total Adjusted</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="font-bold text-cat-text telemetry-readout text-sm">
              {timeCalc.estimatedMinutes} min
            </span>
            <span className="text-[10px] text-cat-muted">({task.estimatedMinutes}m base)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
