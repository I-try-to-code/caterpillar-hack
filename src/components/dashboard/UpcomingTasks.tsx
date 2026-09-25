import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ScheduledTask } from '../../types/tasks';
import { calculateTaskTime } from '../../lib/calculations';
import { ListOrdered, Clock, MapPin } from 'lucide-react';

interface UpcomingTasksProps {
  tasks: ScheduledTask[];
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ tasks }) => {
  const { telemetry } = useTelemetry();

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <ListOrdered className="w-5 h-5 text-cat-yellow" />
          <div>
            <h2 className="text-base font-extrabold text-cat-text uppercase tracking-wide">
              Upcoming Shift Schedule
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              Dynamic Weather &amp; Slope Adjusted Duration
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-cat-yellow bg-cat-surface px-2.5 py-0.5 rounded border border-cat-yellow/30">
          {tasks.length} Operations Queued
        </span>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-2.5">
        {tasks.map((task, index) => {
          const calc = calculateTaskTime(
            task.estimatedMinutes,
            telemetry.weatherCondition,
            telemetry.slopeAngle,
            0
          );

          return (
            <div
              key={task.id}
              className="p-3 rounded-md bg-cat-surface/40 border border-cat-border/70 hover:border-cat-yellow/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-cat-bg border border-cat-border flex items-center justify-center font-mono font-black text-cat-yellow flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-cat-text tracking-tight">
                      {task.name}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-cat-surface text-cat-muted border border-cat-border">
                      {task.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-cat-muted mt-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3 h-3 text-cat-yellow" />
                      {task.zone}
                    </span>
                    <span>&bull;</span>
                    <span>Base: {task.estimatedMinutes}m</span>
                  </div>
                </div>
              </div>

              {/* Adjusted Duration Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-cat-border/40">
                <span className="text-[10px] uppercase font-bold text-cat-muted">Adjusted Est.</span>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-cat-yellow" />
                  <span className="text-sm font-black telemetry-readout text-cat-yellow">
                    {calc.estimatedMinutes} min
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
