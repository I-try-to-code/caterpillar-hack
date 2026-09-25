import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { getOperatorActionDirective, OperatorActionDirective } from '../../lib/calculations';
import { AlertTriangle, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

export const OperatorActionCard: React.FC = () => {
  const { telemetry } = useTelemetry();
  const directive: OperatorActionDirective = getOperatorActionDirective(telemetry);

  const containerStyles =
    directive.priority === 'urgent'
      ? 'border-cat-red bg-cat-red/10 shadow-cat-danger animate-pulse-subtle'
      : directive.priority === 'caution'
      ? 'border-cat-amber bg-cat-amber/10'
      : 'border-cat-green bg-cat-green/10 shadow-cat-safe';

  const badgeStyles =
    directive.priority === 'urgent'
      ? 'bg-cat-red text-white'
      : directive.priority === 'caution'
      ? 'bg-cat-amber text-cat-bg'
      : 'bg-cat-green/20 text-cat-green border border-cat-green/40';

  return (
    <div className={`cab-panel p-4 md:p-5 border-2 rounded-lg transition-all ${containerStyles}`}>
      <div className="flex items-center justify-between border-b border-cat-border/60 pb-2.5">
        <div className="flex items-center space-x-2">
          {directive.priority === 'urgent' && <AlertOctagon className="w-5 h-5 text-cat-red" />}
          {directive.priority === 'caution' && <AlertTriangle className="w-5 h-5 text-cat-amber" />}
          {directive.priority === 'normal' && <CheckCircle2 className="w-5 h-5 text-cat-green" />}
          <span className="text-xs font-black uppercase tracking-wider text-cat-text">
            Immediate Operator Action Required
          </span>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${badgeStyles}`}>
          {directive.badge}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="text-lg md:text-xl font-black text-cat-text flex items-center gap-2">
          <span>{directive.headline}</span>
        </h3>
        <p className="text-sm font-semibold text-cat-text mt-1 leading-relaxed">
          {directive.instruction}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-cat-border/40 flex items-center justify-between text-xs text-cat-muted">
        <span className="font-mono text-[11px]">Directive Engine: Real-time Rule Matrix</span>
        <div className="flex items-center gap-1 font-bold text-cat-yellow">
          <span>Acknowledge Protocol</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
