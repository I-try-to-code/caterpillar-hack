import React, { useState } from 'react';
import { useAnomalyDetection } from '../hooks/useAnomalyDetection';
import { usePatternInsights } from '../hooks/usePatternInsights';
import { IdleDetector } from '../components/anomalies/IdleDetector';
import { UnsafeOperationPanel } from '../components/anomalies/UnsafeOperationPanel';
import { AnomalySummary } from '../components/anomalies/AnomalySummary';
import { AnomalyHistoryChart } from '../components/anomalies/AnomalyHistoryChart';
import { PatternInsightCard } from '../components/anomalies/PatternInsightCard';
import { RecommendationCard } from '../components/anomalies/RecommendationCard';
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
} from 'lucide-react';

export const AnomaliesPage: React.FC = () => {
  const { activeAnomalies, anomalyHistory, summary } = useAnomalyDetection();
  const { patternInsights, operatorContextSnapshot } = usePatternInsights();

  const [isAiContextOpen, setIsAiContextOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySnapshot = () => {
    navigator.clipboard.writeText(JSON.stringify(operatorContextSnapshot, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const healthScore = operatorContextSnapshot.machineHealth.overallIndex;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 select-none">
      {/* 1. Module Header */}
      <div className="cab-panel p-4 md:p-5 border-l-4 border-l-cat-yellow flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-xs font-black bg-cat-yellow text-cat-bg uppercase tracking-wider">
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

        {/* Right Header: Machine Health Index + AI Context Snapshot Toggle */}
        <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
          {/* Health Index KPI */}
          <div className="flex items-center space-x-3 bg-cat-surface p-3 rounded-lg border border-cat-border">
            <Zap
              className={`w-7 h-7 ${
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
                className={`text-xl font-black telemetry-readout ${
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

          {/* AI Context Inspector Button */}
          <button
            type="button"
            onClick={() => setIsAiContextOpen(true)}
            className="touch-btn h-12 px-3.5 rounded-lg bg-cat-surface hover:bg-cat-yellow hover:text-cat-bg border border-cat-yellow/50 text-cat-text font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            title="Inspect unified OperatorContextSnapshot schema ready for AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-cat-yellow" />
            <div className="text-left">
              <span className="text-[10px] text-cat-muted block leading-none uppercase">Structured Schema</span>
              <span className="font-extrabold text-xs">AI Context Snapshot</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Anomaly Summary KPI Strip (6 Cards) */}
      <AnomalySummary summary={summary} />

      {/* 3. Primary Operational Directives & Recommendations */}
      <RecommendationCard anomalies={activeAnomalies} />

      {/* 4. Core Monitoring Grid: Idle Detector + Unsafe Operation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Idle Time & Fuel Conservation Engine */}
        <IdleDetector />

        {/* Unsafe Operation & Mechanical Stress Monitors */}
        <UnsafeOperationPanel />
      </div>

      {/* 5. Recharts Shift Time-Series Correlation Chart */}
      <AnomalyHistoryChart />

      {/* 6. High-Level Deterministic Pattern Insights */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cat-yellow" />
            <h3 className="text-base font-extrabold text-cat-text uppercase tracking-wider">
              Shift Usage Pattern Insights & Predictive Correlation
            </h3>
          </div>
          <span className="text-xs text-cat-muted font-mono">
            {patternInsights.length} Pattern Models Active &bull; Rule-Based Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {patternInsights.map((insight) => (
            <PatternInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* 7. Historical Anomaly & Mechanical Event Log */}
      <div className="cab-panel p-4 md:p-5 border border-cat-border rounded-lg space-y-4">
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
              <tr className="border-b border-cat-border bg-cat-surface/50 text-[11px] text-cat-muted uppercase font-black tracking-wider">
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
                <tr key={record.id} className="hover:bg-cat-surface/60 transition-colors">
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

      {/* 8. AI Context Inspector Modal */}
      {isAiContextOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 animate-fade-in select-none">
          <div className="bg-cat-panel border-2 border-cat-yellow rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-cat-surface border-b border-cat-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-cat-yellow text-cat-bg">
                  <Code2 className="w-5 h-5 font-black" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-cat-text flex items-center gap-2">
                    OperatorContextSnapshot Schema
                  </h2>
                  <p className="text-xs text-cat-muted">
                    Structured intelligence payload generated for the future AI Assistant (Phase 7)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopySnapshot}
                  className="touch-btn h-9 px-3 text-xs font-bold rounded bg-cat-surface hover:bg-cat-yellow hover:text-cat-bg border border-cat-border text-cat-text flex items-center gap-1.5 transition-colors"
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
                  className="p-2 rounded-lg bg-cat-surface text-cat-muted hover:text-cat-text hover:bg-cat-border/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Summary Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-cat-bg border-b border-cat-border text-xs">
              <div className="bg-cat-surface p-2 rounded border border-cat-border">
                <span className="text-cat-muted block text-[10px] uppercase font-bold">Safety Status</span>
                <span className="font-extrabold uppercase text-cat-green">{operatorContextSnapshot.safetyStatus}</span>
              </div>
              <div className="bg-cat-surface p-2 rounded border border-cat-border">
                <span className="text-cat-muted block text-[10px] uppercase font-bold">Active Alerts</span>
                <span className="font-mono font-bold text-cat-text">{operatorContextSnapshot.activeAlerts.length} items</span>
              </div>
              <div className="bg-cat-surface p-2 rounded border border-cat-border">
                <span className="text-cat-muted block text-[10px] uppercase font-bold">Active Anomalies</span>
                <span className="font-mono font-bold text-cat-amber">{operatorContextSnapshot.activeAnomalies.length} items</span>
              </div>
              <div className="bg-cat-surface p-2 rounded border border-cat-border">
                <span className="text-cat-muted block text-[10px] uppercase font-bold">Health Score</span>
                <span className="font-mono font-bold text-cat-green">{operatorContextSnapshot.machineHealth.overallIndex}%</span>
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0F0F1A] font-mono text-xs text-cat-text">
              <pre className="whitespace-pre-wrap break-words leading-relaxed text-cat-text/90">
                {JSON.stringify(operatorContextSnapshot, null, 2)}
              </pre>
            </div>

            {/* Footer */}
            <div className="p-3 bg-cat-surface border-t border-cat-border flex items-center justify-between text-xs text-cat-muted">
              <span>Ready for consumption by LLM Agent in Phase 7</span>
              <button
                type="button"
                onClick={() => setIsAiContextOpen(false)}
                className="touch-btn px-4 py-1.5 rounded font-bold bg-cat-surface hover:bg-cat-border text-cat-text border border-cat-border transition-colors"
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
