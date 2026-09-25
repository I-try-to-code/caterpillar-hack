import React from 'react';
import { ActiveAnomaly } from '../../types/anomalies';
import { AlertPriorityBadge } from '../alerts/AlertPriorityBadge';
import { CheckCircle2, Lightbulb, ArrowRight } from 'lucide-react';

interface RecommendationCardProps {
  anomalies: ActiveAnomaly[];
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ anomalies }) => {
  if (anomalies.length === 0) {
    return (
      <div className="cab-panel p-4 md:p-5 border border-cat-green/40 bg-cat-green/5 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-cat-green/20 text-cat-green">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-green">
              Active Operator Directives
            </span>
            <h4 className="text-base font-extrabold text-cat-text">
              Zero Active Operational Anomalies
            </h4>
            <p className="text-xs text-cat-muted mt-0.5">
              Hydraulic relief bypass, idle duration, carry height, and machine accelerations are within nominal limits.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-cat-green/20 text-cat-green border border-cat-green/40">
          SOP COMPLIANT
        </span>
      </div>
    );
  }

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-yellow/60 bg-cat-panel rounded-lg space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-cat-border/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-cat-yellow text-cat-bg">
            <Lightbulb className="w-5 h-5 font-black" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Operator Decision Support &bull; AI Action Recommendations
            </span>
            <h3 className="text-base font-extrabold text-cat-text">
              {anomalies.length} Active Operational Directive{anomalies.length > 1 ? 's' : ''}
            </h3>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase bg-cat-red text-white animate-pulse">
          Immediate Action Required
        </span>
      </div>

      <div className="space-y-3">
        {anomalies.map((anom) => (
          <div
            key={anom.id}
            className={`p-3.5 rounded-lg border-2 space-y-2 transition-all ${
              anom.severity === 'critical'
                ? 'border-cat-red/80 bg-cat-red/10'
                : 'border-cat-amber/70 bg-cat-amber/5'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <AlertPriorityBadge severity={anom.severity} size="sm" />
                <span className="font-extrabold text-sm text-cat-text">
                  {anom.title}
                </span>
              </div>
              <span className="text-[11px] font-mono text-cat-muted">
                Observed: <strong className="text-cat-yellow">{anom.currentValue}</strong> (Limit: {anom.threshold})
              </span>
            </div>

            <p className="text-xs text-cat-muted">
              {anom.description}
            </p>

            {/* Prominent Recommendation Directive */}
            <div className="p-2.5 rounded bg-cat-surface border-l-4 border-l-cat-yellow flex items-start space-x-2 text-xs">
              <ArrowRight className="w-4 h-4 text-cat-yellow flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cat-yellow uppercase text-[10px] tracking-wider block">
                  Prescribed Operator Action:
                </span>
                <span className="font-extrabold text-cat-text text-xs md:text-sm">
                  &ldquo;{anom.recommendation}&rdquo;
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
