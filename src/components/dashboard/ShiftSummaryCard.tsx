import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ScheduledTask } from '../../types/tasks';
import { evaluateTransparentSafety } from '../../lib/calculations';
import { ShieldCheck, AlertTriangle, AlertOctagon, Calendar, Clock, HardHat, Compass } from 'lucide-react';

interface ShiftSummaryCardProps {
  currentTask: ScheduledTask;
  upcomingTasks: ScheduledTask[];
}

export const ShiftSummaryCard: React.FC<ShiftSummaryCardProps> = ({ currentTask, upcomingTasks }) => {
  const { telemetry } = useTelemetry();
  const safety = evaluateTransparentSafety(telemetry);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="cab-panel p-4 md:p-5 border-l-4 border-l-cat-yellow space-y-4">
      {/* 1. Primary Operator Command Center Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cat-border/80">
        {/* Machine & Operator Quick Identification */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Machine ID */}
          <div className="bg-cat-surface px-3 py-2 rounded-md border border-cat-border">
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Active Machine
            </span>
            <span className="text-xl font-black telemetry-readout text-cat-text">
              {telemetry.machineId}
            </span>
          </div>

          {/* Operator ID & Name */}
          <div className="bg-cat-surface px-3 py-2 rounded-md border border-cat-border">
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-muted block">
              Certified Operator
            </span>
            <div className="flex items-center space-x-2">
              <HardHat className="w-4 h-4 text-cat-yellow" />
              <span className="text-base font-bold text-cat-text">{telemetry.operatorName}</span>
              <span className="text-xs text-cat-muted font-mono font-semibold">({telemetry.operatorId})</span>
            </div>
          </div>

          {/* Current Task & Progress */}
          <div className="bg-cat-surface px-4 py-2 rounded-md border border-cat-border flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow">
                Current Task
              </span>
              <span className="text-xs font-black telemetry-readout text-cat-yellow">
                {currentTask.progress}% Complete
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-extrabold text-cat-text truncate mr-2">
                {currentTask.name}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-cat-bg text-cat-muted border border-cat-border/80">
                {currentTask.zone}
              </span>
            </div>
          </div>
        </div>

        {/* Current Safety Status Indicator (SAFE / CAUTION / CRITICAL) */}
        <div
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 shadow-lg self-start lg:self-auto ${
            safety.overall === 'safe'
              ? 'bg-cat-green/10 border-cat-green text-cat-green shadow-cat-safe'
              : safety.overall === 'caution'
              ? 'bg-cat-amber/15 border-cat-amber text-cat-amber'
              : 'bg-cat-red/20 border-cat-red text-cat-red shadow-cat-danger animate-pulse'
          }`}
        >
          {safety.overall === 'safe' && <ShieldCheck className="w-8 h-8 flex-shrink-0" />}
          {safety.overall === 'caution' && <AlertTriangle className="w-8 h-8 flex-shrink-0" />}
          {safety.overall === 'danger' && <AlertOctagon className="w-8 h-8 flex-shrink-0" />}
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest block opacity-90">
              Current Cab Status
            </span>
            <span className="text-xl font-black uppercase tracking-wider">
              {safety.overall === 'safe'
                ? 'SAFE — NOMINAL'
                : safety.overall === 'caution'
                ? 'CAUTION'
                : 'CRITICAL ATTENTION'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Shift Metadata & Next Scheduled Tasks Glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
        {/* Date & Shift Info */}
        <div className="flex items-center space-x-3 bg-cat-surface/40 p-2.5 rounded border border-cat-border/60">
          <Calendar className="w-5 h-5 text-cat-yellow flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-cat-muted block">Calendar Date</span>
            <span className="font-bold text-cat-text">{todayStr}</span>
          </div>
        </div>

        {/* Shift Duration & Active Operator Time */}
        <div className="flex items-center space-x-3 bg-cat-surface/40 p-2.5 rounded border border-cat-border/60">
          <Clock className="w-5 h-5 text-cat-yellow flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-cat-muted block">Active Shift Cycle</span>
            <span className="font-bold text-cat-text">
              {telemetry.shiftType} Shift &bull; {Math.floor(telemetry.continuousOpMinutes / 60)}h {telemetry.continuousOpMinutes % 60}m logged
            </span>
          </div>
        </div>

        {/* Next Scheduled Tasks Queue */}
        <div className="flex items-center space-x-3 bg-cat-surface/40 p-2.5 rounded border border-cat-border/60">
          <Compass className="w-5 h-5 text-cat-yellow flex-shrink-0" />
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-cat-muted block">Queue Ahead</span>
            <span className="font-bold text-cat-text truncate block">
              {upcomingTasks.length > 0 ? upcomingTasks.slice(0, 3).map((t) => t.name.split('—')[0].trim()).join(' → ') : 'Queue Clear'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
