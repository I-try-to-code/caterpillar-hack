import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { INITIAL_TASKS } from '../data/tasks';
import { calculateTaskTime } from '../lib/calculations';
import { ShiftSummaryCard } from '../components/dashboard/ShiftSummaryCard';
import { CurrentTaskCard } from '../components/dashboard/CurrentTaskCard';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { TaskTimeEstimate } from '../components/dashboard/TaskTimeEstimate';
import { SituationSummary } from '../components/dashboard/SituationSummary';
import { SafetyStatusCard } from '../components/dashboard/SafetyStatusCard';
import { WhatChangedPanel } from '../components/dashboard/WhatChangedPanel';
import { OperatorActionCard } from '../components/dashboard/OperatorActionCard';
import { PreStartInspection } from '../components/dashboard/PreStartInspection';
import { SiteMap } from '../components/dashboard/SiteMap';
import { WeatherConditions } from '../components/dashboard/WeatherConditions';
import { PlayCircle, Clock, MapPin } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { telemetry } = useTelemetry();

  // Primary active task is the in_progress task (Trenching — Zone B)
  const currentTask = INITIAL_TASKS.find((t) => t.status === 'in_progress') || INITIAL_TASKS[0];
  const upcomingTasks = INITIAL_TASKS.filter((t) => t.id !== currentTask.id);

  // Dynamic time estimation for sticky header
  const stickyCalc = calculateTaskTime(
    currentTask.estimatedMinutes,
    telemetry.weatherCondition,
    telemetry.slopeAngle,
    currentTask.progress
  );

  return (
    <div className="flex-1 overflow-y-auto flex flex-col relative select-none">
      {/* 1. STICKY CURRENT TASK HEADER (Always visible during scrolling) */}
      <div className="sticky top-0 z-20 bg-cat-panel/95 backdrop-blur-md border-b-2 border-cat-yellow/60 px-4 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1 rounded bg-cat-yellow text-cat-bg font-black">
            <PlayCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow">
                ONGOING OPERATION
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-black bg-cat-yellow/20 text-cat-yellow border border-cat-yellow/30">
                ACTIVE
              </span>
            </div>
            <span className="text-sm font-extrabold text-cat-text tracking-tight">
              {currentTask.name}
            </span>
          </div>
        </div>

        {/* Progress, Zone & Est. Remaining */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5 bg-cat-surface px-2.5 py-1 rounded border border-cat-border">
            <MapPin className="w-3.5 h-3.5 text-cat-yellow" />
            <span className="font-bold text-cat-text">{currentTask.zone}</span>
          </div>

          {/* Mini progress bar */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-24 h-2 bg-cat-bg rounded-full overflow-hidden border border-cat-border">
              <div
                className="h-full bg-cat-yellow rounded-full"
                style={{ width: `${currentTask.progress}%` }}
              />
            </div>
            <span className="font-mono font-black text-cat-yellow">{currentTask.progress}%</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-cat-surface px-2.5 py-1 rounded border border-cat-yellow/30 text-cat-yellow">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-cat-muted font-bold">Est. Remaining:</span>
            <span className="font-black telemetry-readout">{stickyCalc.remainingMinutes} min</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN DASHBOARD CONTENT GRID */}
      <div className="p-4 md:p-6 space-y-5">
        {/* Top Operator Command Center Card */}
        <ShiftSummaryCard currentTask={currentTask} upcomingTasks={upcomingTasks} />

        {/* Situational Awareness & Immediate Action Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OperatorActionCard />
          <SituationSummary currentTask={currentTask} />
        </div>

        {/* Safety Breakdown & Telemetry Deltas Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SafetyStatusCard />
          <WhatChangedPanel />
        </div>

        {/* Weather & Mud Factor Bar */}
        <WeatherConditions />

        {/* Current Task Details & Transparent Formula Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CurrentTaskCard task={currentTask} />
          <TaskTimeEstimate task={currentTask} />
        </div>

        {/* Worksite Topography & Digital Walk-Around Inspection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SiteMap />
          <PreStartInspection />
        </div>

        {/* Upcoming Shift Tasks */}
        <UpcomingTasks tasks={upcomingTasks} />
      </div>
    </div>
  );
};
