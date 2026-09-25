import React from 'react';
import { PatternInsight } from '../../types/anomalies';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  UserCheck,
} from 'lucide-react';

interface PatternInsightCardProps {
  insight: PatternInsight;
}

export const PatternInsightCard: React.FC<PatternInsightCardProps> = ({ insight }) => {
  const getCategoryConfig = () => {
    switch (insight.category) {
      case 'safety':
        return {
          icon: Shield,
          color: 'text-cat-red',
          badgeBg: 'bg-cat-red/15 text-cat-red border-cat-red/40',
        };
      case 'efficiency':
        return {
          icon: Clock,
          color: 'text-cat-yellow',
          badgeBg: 'bg-cat-yellow/15 text-cat-yellow border-cat-yellow/40',
        };
      case 'wear':
        return {
          icon: Zap,
          color: 'text-sky-400',
          badgeBg: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
        };
      case 'behavioral':
      default:
        return {
          icon: UserCheck,
          color: 'text-purple-400',
          badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
        };
    }
  };

  const { icon: CatIcon, badgeBg } = getCategoryConfig();

  return (
    <div className="cab-panel p-4 border border-cat-border rounded-lg space-y-3 flex flex-col justify-between hover:border-cat-yellow/60 transition-colors">
      {/* Header: Category & Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${badgeBg}`}>
            <CatIcon className="w-3 h-3" />
            {insight.category}
          </span>
          <span className="text-[10px] font-mono text-cat-muted flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cat-yellow" />
            AI Context ({insight.confidence}%)
          </span>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center space-x-1 text-xs font-bold">
          {insight.trend === 'worsening' && (
            <span className="text-cat-red flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Escalating
            </span>
          )}
          {insight.trend === 'improving' && (
            <span className="text-cat-green flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> Improving
            </span>
          )}
          {insight.trend === 'stable' && (
            <span className="text-cat-muted flex items-center gap-0.5">
              <Minus className="w-3.5 h-3.5" /> Stable
            </span>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-sm font-extrabold text-cat-text leading-snug">
          {insight.title}
        </h4>
        <p className="text-xs text-cat-muted mt-1 leading-relaxed">
          {insight.description}
        </p>
      </div>

      {/* Metric Pill */}
      <div className="p-2 rounded bg-cat-surface border border-cat-border/80 flex items-center justify-between text-xs">
        <span className="text-cat-muted font-bold text-[11px]">Observed Correlation:</span>
        <span className="font-mono text-cat-yellow font-black">{insight.metric}</span>
      </div>

      {/* Action Recommendation */}
      <div className="pt-2 border-t border-cat-border/60 flex items-start gap-1.5 text-xs text-cat-text">
        <ArrowRight className="w-3.5 h-3.5 text-cat-yellow flex-shrink-0 mt-0.5" />
        <span className="leading-snug">
          <strong className="text-cat-yellow">Action: </strong>
          {insight.recommendation}
        </span>
      </div>
    </div>
  );
};
