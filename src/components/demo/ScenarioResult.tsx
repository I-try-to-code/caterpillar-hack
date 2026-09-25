import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useVoiceAlerts } from '../../hooks/useVoiceAlerts';
import { useIncidentLogger } from '../../hooks/useIncidentLogger';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface DemoScenarioDef {
  id: number;
  name: string;
  stepNumber: number;
  description: string;
  targetTelemetry: Record<string, unknown>;
  expectedOutcomes: {
    label: string;
    checkFn: (ctx: { telemetry: any; alerts: any[]; incidents: any[] }) => boolean;
  }[];
  suggestedAIQuestion: string;
}

interface ScenarioResultProps {
  scenario: DemoScenarioDef;
  onAskAI?: (question: string) => void;
  onNextScenario?: () => void;
}

export const ScenarioResult: React.FC<ScenarioResultProps> = ({
  scenario,
  onAskAI,
  onNextScenario,
}) => {
  const { telemetry } = useTelemetry();
  const { activeAlerts } = useVoiceAlerts();
  const { incidents } = useIncidentLogger();

  const context = {
    telemetry,
    alerts: activeAlerts,
    incidents,
  };

  const results = scenario.expectedOutcomes.map((exp) => ({
    label: exp.label,
    passed: exp.checkFn(context),
  }));

  const allPassed = results.every((r) => r.passed);

  return (
    <div className="p-4 rounded-xl bg-cat-surface border-2 border-cat-yellow/50 shadow-md space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cat-border pb-2.5">
        <div className="flex items-center space-x-2.5">
          <span className="w-6 h-6 rounded-full bg-cat-yellow text-slate-950 font-black text-xs flex items-center justify-center">
            {scenario.stepNumber}
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cat-yellow block">
              Active Judge Demonstration
            </span>
            <h3 className="text-sm font-black text-cat-text tracking-tight">
              {scenario.name}
            </h3>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
            allPassed
              ? 'bg-cat-green/20 text-cat-green border border-cat-green/40'
              : 'bg-cat-amber/20 text-cat-amber border border-cat-amber/40 animate-pulse'
          }`}
        >
          {allPassed ? 'All Conditions Verified' : 'Awaiting Injection'}
        </span>
      </div>

      <p className="text-xs text-cat-muted leading-relaxed">
        {scenario.description}
      </p>

      {/* Expected Outcomes Live Verification List */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] uppercase font-bold text-cat-muted block">
          Expected System State:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {results.map((res, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-md border text-xs flex items-center space-x-2 transition-colors ${
                res.passed
                  ? 'bg-cat-green/10 border-cat-green/30 text-cat-text'
                  : 'bg-cat-bg border-cat-border/60 text-cat-muted'
              }`}
            >
              {res.passed ? (
                <CheckCircle2 className="w-4 h-4 text-cat-green flex-shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-cat-border flex-shrink-0" />
              )}
              <span className={`text-[11px] font-bold ${res.passed ? 'text-cat-text' : 'text-cat-muted'}`}>
                {res.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cat-border/60">
        {onAskAI && (
          <button
            type="button"
            onClick={() => onAskAI(scenario.suggestedAIQuestion)}
            className="touch-btn h-8 px-3 text-xs font-bold rounded-md bg-cat-yellow text-slate-950 hover:bg-yellow-400 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Co-Pilot: &ldquo;{scenario.suggestedAIQuestion}&rdquo;</span>
          </button>
        )}

        {onNextScenario && (
          <button
            type="button"
            onClick={onNextScenario}
            className="touch-btn h-8 px-3 text-xs font-bold rounded-md bg-cat-surface hover:bg-cat-hover text-cat-text border border-cat-border flex items-center space-x-1.5 transition-colors"
          >
            <span>Next Scenario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
