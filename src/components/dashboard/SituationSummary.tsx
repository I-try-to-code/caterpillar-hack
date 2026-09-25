import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ScheduledTask } from '../../types/tasks';
import { generateSituationSummary, SituationSummaryData } from '../../lib/calculations';
import { Radio, ArrowRight } from 'lucide-react';

interface SituationSummaryProps {
  currentTask: ScheduledTask;
}

export const SituationSummary: React.FC<SituationSummaryProps> = ({ currentTask }) => {
  const { telemetry } = useTelemetry();
  const summaryData: SituationSummaryData = generateSituationSummary(telemetry, currentTask);

  const statusBorder =
    summaryData.status === 'CRITICAL'
      ? 'border-cat-red/80 bg-cat-red/5'
      : summaryData.status === 'CAUTION'
      ? 'border-cat-amber/70 bg-cat-amber/5'
      : 'border-cat-green/50 bg-cat-green/5';

  const badgeColor =
    summaryData.status === 'CRITICAL'
      ? 'bg-cat-red text-white'
      : summaryData.status === 'CAUTION'
      ? 'bg-cat-amber text-cat-bg'
      : 'bg-cat-green/20 text-cat-green border border-cat-green/40';

  return (
    <div className={`cab-panel p-4 md:p-5 border-2 rounded-lg transition-all ${statusBorder}`}>
      {/* Header with Situation Badge */}
      <div className="flex items-center justify-between border-b border-cat-border/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-cat-yellow text-cat-bg">
            <Radio className="w-4 h-4 font-black animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Situational Awareness &bull; Human-Readable Command Summary
            </span>
            <h2 className="text-base font-extrabold text-cat-text">
              Machine Situation Assessment
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-cat-muted">{summaryData.timestamp}</span>
          <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${badgeColor}`}>
            {summaryData.status}
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="mt-3">
        <p className="text-base md:text-lg font-black text-cat-text leading-snug">
          &ldquo;{summaryData.headline}&rdquo;
        </p>
        <p className="text-xs md:text-sm text-cat-muted mt-1 leading-relaxed">
          {summaryData.summary}
        </p>
      </div>

      {/* Conditions & Recommended Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-cat-border/50 text-xs">
        {/* Conditions */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-cat-muted block">
            Observed Condition Factors:
          </span>
          {summaryData.conditions.map((cond, idx) => (
            <div key={idx} className="flex items-start space-x-1.5 text-cat-text">
              <span className="text-cat-yellow font-bold mt-0.5">&bull;</span>
              <span>{cond}</span>
            </div>
          ))}
        </div>

        {/* Recommended Actions */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-cat-yellow block">
            Recommended Actionable Directives:
          </span>
          {summaryData.recommendedActions.map((act, idx) => (
            <div key={idx} className="flex items-start space-x-1.5 text-cat-text font-semibold">
              <ArrowRight className="w-3.5 h-3.5 text-cat-yellow flex-shrink-0 mt-0.5" />
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
