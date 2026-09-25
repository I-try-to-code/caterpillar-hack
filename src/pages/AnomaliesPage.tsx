import React, { useState, useMemo } from 'react';
import { useAnomalyDetection } from '../hooks/useAnomalyDetection';
import { usePatternInsights } from '../hooks/usePatternInsights';
import { useCoachingPrompts } from '../hooks/useCoachingPrompts';
import { IdleDetector } from '../components/anomalies/IdleDetector';
import { UnsafeOperationPanel } from '../components/anomalies/UnsafeOperationPanel';
import { AnomalySummary } from '../components/anomalies/AnomalySummary';
import { AnomalyHistoryChart } from '../components/anomalies/AnomalyHistoryChart';
import { PatternCard } from '../components/anomalies/PatternCard';
import { CoachingPrompt } from '../components/anomalies/CoachingPrompt';
import { RecommendationCard } from '../components/anomalies/RecommendationCard';
import { AiAnomalyExplainer } from '../components/anomalies/AiAnomalyExplainer';
import { AlertPriorityBadge } from '../components/alerts/AlertPriorityBadge';
import {
  Activity,
  Zap,
  Code2,
  Copy,
  Check,
  X,
  History,
  Sparkles,
  Bot,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const AnomaliesPage: React.FC = () => {
  const { activeAnomalies, anomalyHistory, summary } = useAnomalyDetection();
  const { patternInsights, operatorContextSnapshot } = usePatternInsights();
  const {
    activeCoachingPrompts,
    dismissPrompt,
    neverShowAgain,
    resetPreferences,
    hasHiddenPrompts,
  } = useCoachingPrompts();

  const [isAiExplainerOpen, setIsAiExplainerOpen] = useState(false);
  const [isAiContextOpen, setIsAiContextOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySnapshot = () => {
    navigator.clipboard.writeText(JSON.stringify(operatorContextSnapshot, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const healthScore = operatorContextSnapshot.machineHealth.overallIndex;

  // Operational Status calculation
  const operationalStatus = useMemo(() => {
    const isAttention =
      summary.hasCriticalAnomalies ||
      summary.activeCount >= 2 ||
      summary.totalIdleMinutes >= 10 ||
      summary.harshEventsCount >= 3;

    const isCaution =
      summary.activeCount > 0 ||
      summary.totalIdleMinutes >= 5 ||
      summary.harshEventsCount > 0 ||
      summary.hydraulicSpikesCount > 0;

    if (isAttention) {
      const reasons: string[] = [];
      if (summary.harshEventsCount > 0) {
        reasons.push(`${summary.harshEventsCount} harsh-operation event${summary.harshEventsCount > 1 ? 's' : ''}`);
      }
      if (summary.totalIdleMinutes >= 5) {
        reasons.push(`${summary.totalIdleMinutes} minutes of excessive idling`);
      }
      if (summary.hydraulicSpikesCount > 0) {
        reasons.push(`${summary.hydraulicSpikesCount} hydraulic relief spike${summary.hydraulicSpikesCount > 1 ? 's' : ''}`);
      }
      if (summary.bucketTravelWarningsCount > 0) {
        reasons.push(`${summary.bucketTravelWarningsCount} elevated bucket tramming hazard${summary.bucketTravelWarningsCount > 1 ? 's' : ''}`);
      }

      return {
        status: 'ATTENTION REQUIRED',
        severity: 'critical' as const,
        explanation: `Attention required: ${reasons.join(' and ')} detected this shift.`,
        borderClass: 'border-cat-red bg-cat-red/10',
        badgeClass: 'bg-cat-red text-white animate-pulse',
        icon: AlertOctagon,
      };
    }

    if (isCaution) {
      return {
        status: 'CAUTION',
        severity: 'warning' as const,
        explanation: `Caution: Elevated machine parameters and ${summary.totalIdleMinutes} minutes of cumulative idle time observed.`,
        borderClass: 'border-cat-amber bg-cat-amber/10',
        badgeClass: 'bg-cat-amber text-cat-bg',
        icon: AlertTriangle,
      };
    }

    return {
      status: 'NORMAL',
      severity: 'safe' as const,
      explanation: 'Normal: All machine stress parameters, cycle durations, and carry heights within target efficiency band.',
      borderClass: 'border-cat-green/50 bg-cat-green/5',
      badgeClass: 'bg-cat-green/20 text-cat-green border border-cat-green/40',
      icon: CheckCircle2,
    };
  }, [summary]);

  const StatusIcon = operationalStatus.icon;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 select-none">
      {/* 1. Module Header */}
      <div className="cab-panel p-4 md:p-5 border-l-4 border-l-cat-yellow flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-xs font-black bg-cat-yellow text-slate-950 uppercase tracking-wider">
              Module D &bull; Mod-4
            </span>
            <span className="text-xs uppercase tracking-widest text-cat-muted font-bold">
              Machine Anomaly & Usage Pattern Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-cat-text mt-1 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-cat-yellow" />
            Machine Anomaly & Usage Pattern Detection
          </h1>
          <p className="text-sm text-cat-muted mt-1 max-w-3xl leading-relaxed">
            Real-time pattern analysis for hydraulic relief spikes, G-force shock loading, elevated bucket tramming, and continuous idle fuel waste.
          </p>
        </div>

        {/* Right Header: Machine Health Index + AI Actions */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {/* Health Index KPI */}
          <div className="flex items-center space-x-3 bg-cat-surface p-2.5 rounded-lg border border-cat-border">
            <Zap
              className={`w-6 h-6 ${
                healthScore >= 90
                  ? 'text-cat-green'
                  : healthScore >= 75
                  ? 'text-cat-amber'
                  : 'text-cat-red'
              }`}
            />
            <div>
              <span className="text-[10px] text-cat-muted uppercase font-bold block">
                Health Index
              </span>
              <span
                className={`text-lg font-black telemetry-readout ${
                  healthScore >= 90
                    ? 'text-cat-green'
                    : healthScore >= 75
                    ? 'text-cat-amber'
                    : 'text-cat-red'
                }`}
              >
                {healthScore}% {healthScore >= 90 ? 'Nominal' : healthScore >= 75 ? 'Caution' : 'Degraded'}
              </span>
            </div>
          </div>

          {/* AI Context Snapshot Toggle */}
          <button
            type="button"
            onClick={() => setIsAiContextOpen(true)}
            className="touch-btn h-11 px-3 rounded-lg bg-cat-surface hover:bg-cat-hover border border-cat-border text-cat-muted hover:text-cat-text font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Inspect unified OperatorContextSnapshot schema"
          >
            <Code2 className="w-4 h-4 text-cat-yellow" />
            <span className="hidden sm:inline">Context JSON</span>
          </button>
        </div>
      </div>

      {/* 2. ANOMALY SITUATION SUMMARY: Prominent Operational Status Banner + AI Explainer Quick Action */}
      <div className={`cab-panel p-4 md:p-5 border-2 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all ${operationalStatus.borderClass}`}>
        <div className="flex items-start space-x-3.5">
          <div
            className={`p-2.5 rounded-lg mt-0.5 ${
              operationalStatus.severity === 'critical'
                ? 'bg-cat-red text-white'
                : operationalStatus.severity === 'warning'
                ? 'bg-cat-amber text-slate-950'
                : 'bg-cat-green/20 text-cat-green'
            }`}
          >
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-cat-muted">
                Operational Status:
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${operationalStatus.badgeClass}`}>
                {operationalStatus.status}
              </span>
            </div>
            <p className="text-sm md:text-base font-extrabold text-cat-text mt-1 leading-snug">
              &ldquo;{operationalStatus.explanation}&rdquo;
            </p>
            <p className="text-xs text-cat-muted mt-0.5">
              Live anomaly pattern detection synced with shift audit log and cab voice synthesizer.
            </p>
          </div>
        </div>

        {/* AI Assistant Quick Action: 'Explain my anomalies' */}
        <button
          type="button"
          onClick={() => setIsAiExplainerOpen(true)}
          className="touch-btn h-11 px-4 rounded-lg bg-cat-yellow text-slate-950 hover:brightness-110 font-black text-xs md:text-sm flex items-center justify-center space-x-2 shadow-md transition-all self-stretch md:self-auto flex-shrink-0"
        >
          <Bot className="w-4 h-4" />
          <span>Explain My Anomalies</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Anomaly Summary KPI Strip (6 Cards) */}
      <AnomalySummary summary={summary} />

      {/* 4. Interactive Contextual Coaching Cards (Dismiss & Don't Show Again) */}
      <CoachingPrompt
        prompts={activeCoachingPrompts}
        onDismiss={dismissPrompt}
        onNeverShowAgain={neverShowAgain}
        onResetPreferences={resetPreferences}
        hasHiddenPrompts={hasHiddenPrompts}
      />

      {/* 5. Primary Operational Directives & Recommendations */}
      <RecommendationCard anomalies={activeAnomalies} />

      {/* 6. Core Monitoring Grid: Idle Detector + Unsafe Operation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Idle Time & Fuel Conservation Engine */}
        <IdleDetector />

        {/* Unsafe Operation & Mechanical Stress Monitors */}
        <UnsafeOperationPanel />
      </div>

      {/* 7. Recharts Shift Time-Series Correlation Chart */}
      <AnomalyHistoryChart />

      {/* 8. High-Level Deterministic Pattern Insights using PatternCard & TrendIndicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cat-yellow" />
            <h3 className="text-base font-extrabold text-cat-text uppercase tracking-wider">
              Shift Usage Pattern Insights & Predictive Correlation
            </h3>
          </div>
          <span className="text-xs text-cat-muted font-mono">
            {patternInsights.length} Pattern Models Active &bull; Transparent Rules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {patternInsights.map((insight) => (
            <PatternCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* 9. Historical Anomaly & Mechanical Event Log */}
      <div className="cab-panel p-4 md:p-5 border border-cat-border rounded-lg space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-cat-border/60 pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cat-yellow" />
            <h3 className="text-base font-extrabold text-cat-text">
              Shift Anomaly Event Log
            </h3>
          </div>
          <span className="text-xs text-cat-muted font-mono">
            {anomalyHistory.length} Logged Events in Current Shift
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cat-border bg-cat-surface text-[11px] text-cat-muted uppercase font-black tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-2">Severity</th>
                <th className="py-2.5 px-2">Category</th>
                <th className="py-2.5 px-3">Anomaly Title</th>
                <th className="py-2.5 px-3">Observed Value</th>
                <th className="py-2.5 px-3">Operator Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cat-border/40">
              {anomalyHistory.slice(0, 10).map((record) => (
                <tr key={record.id} className="hover:bg-cat-surface transition-colors">
                  <td className="py-2.5 px-3 font-mono text-cat-muted whitespace-nowrap">
                    {record.timestamp}
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <AlertPriorityBadge severity={record.severity} size="sm" />
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-cat-surface text-cat-yellow border border-cat-border">
                      {record.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-extrabold text-cat-text">
                    {record.title}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cat-yellow whitespace-nowrap">
                    {record.value}
                  </td>
                  <td className="py-2.5 px-3 text-cat-muted">
                    {record.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10. AI Anomaly Explainer Assistant Modal (Grounded in telemetry) */}
      <AiAnomalyExplainer
        isOpen={isAiExplainerOpen}
        onClose={() => setIsAiExplainerOpen(false)}
        snapshot={operatorContextSnapshot}
        summary={summary}
      />

      {/* 11. AI Context Inspector Modal */}
      {isAiContextOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6 animate-fade-in select-none">
          <div className="bg-cat-panel border-2 border-cat-yellow rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-cat-surface border-b border-cat-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-cat-yellow text-slate-950 font-black">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-cat-text flex items-center gap-2">
                    OperatorContextSnapshot Schema
                  </h2>
                  <p className="text-xs text-cat-muted">
                    Structured intelligence payload generated for the AI Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopySnapshot}
                  className="touch-btn h-9 px-3 text-xs font-bold rounded bg-cat-surface hover:bg-cat-yellow hover:text-slate-950 border border-cat-border text-cat-text flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-cat-green" />
                      <span>Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snapshot JSON</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAiContextOpen(false)}
                  className="p-2 rounded-lg bg-cat-surface text-cat-muted hover:text-cat-text hover:bg-cat-hover transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Summary Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-cat-bg border-b border-cat-border text-xs">
              <div className="bg-cat-panel p-2 rounded border border-cat-border">
                <span className="text-cat-muted block text-[10px] uppercase font-bold">Safety Status</span>
                <span className="font-extrabold uppercase text-cat-green">{operatorContextSnapshot.safetyStatus}</span>
              </div>
              <div className="bg-cat-panel p-2 rounded border border-cat-border">
                <span className="text-cat-muted block text-[10px] uppercase font-bold">Active Alerts</span>
                <span className="font-mono font-bold text-cat-text">{operatorContextSnapshot.activeAlerts.length} items</span>
              </div>
              <div className="bg-cat-panel p-2 rounded border border-cat-border">
                <span className="text-cat-muted block text-[10px] uppercase font-bold">Active Anomalies</span>
                <span className="font-mono font-bold text-cat-amber">{operatorContextSnapshot.activeAnomalies.length} items</span>
              </div>
              <div className="bg-cat-panel p-2 rounded border border-cat-border">
                <span className="text-cat-muted block text-[10px] uppercase font-bold">Health Score</span>
                <span className="font-mono font-bold text-cat-green">{operatorContextSnapshot.machineHealth.overallIndex}%</span>
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0F172A] font-mono text-xs text-cat-text">
              <pre className="whitespace-pre-wrap break-words leading-relaxed text-slate-100">
                {JSON.stringify(operatorContextSnapshot, null, 2)}
              </pre>
            </div>

            {/* Footer */}
            <div className="p-3 bg-cat-surface border-t border-cat-border flex items-center justify-between text-xs text-cat-muted">
              <span>Ready for consumption by LLM Agent</span>
              <button
                type="button"
                onClick={() => setIsAiContextOpen(false)}
                className="touch-btn px-4 py-1.5 rounded font-bold bg-cat-panel hover:bg-cat-hover text-cat-text border border-cat-border transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
