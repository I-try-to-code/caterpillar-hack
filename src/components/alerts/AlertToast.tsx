import React from 'react';
import { Alert } from '../../types/alerts';
import { AlertPriorityBadge } from './AlertPriorityBadge';
import { Volume2, Check, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface AlertToastProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onEscalate: (id: string) => void;
  onSpeak?: (alert: Alert) => void;
  compact?: boolean;
  className?: string;
}

export const AlertToast: React.FC<AlertToastProps> = ({
  alert,
  onAcknowledge,
  onEscalate,
  onSpeak,
  compact = false,
  className = '',
}) => {
  const isCritical = alert.severity === 'critical';
  const isDanger = alert.severity === 'danger';

  const borderClass = isCritical
    ? 'border-cat-red/80 shadow-[0_0_12px_rgba(235,0,0,0.3)]'
    : isDanger
    ? 'border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
    : alert.severity === 'warning'
    ? 'border-cat-amber/50'
    : 'border-cat-border';

  return (
    <div
      className={`rounded-lg bg-cat-panel border-2 p-3 transition-all ${borderClass} ${
        isCritical && !alert.acknowledged ? 'animate-pulse-subtle' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Header: Priority Badge + Module + Timestamp */}
        <div className="flex items-center flex-wrap gap-2">
          <AlertPriorityBadge severity={alert.severity} size="sm" />
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cat-surface text-cat-yellow border border-cat-yellow/30">
            Module {alert.module}
          </span>
          {alert.stateTransition && (
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                alert.stateTransition === 'escalated'
                  ? 'bg-cat-red/20 text-cat-red border border-cat-red/40'
                  : alert.stateTransition === 'normalized'
                  ? 'bg-cat-green/20 text-cat-green border border-cat-green/40'
                  : 'bg-cat-surface text-cat-muted border border-cat-border'
              }`}
            >
              {alert.stateTransition}
            </span>
          )}
          <span className="text-[11px] font-mono text-cat-muted">{alert.timestamp}</span>
        </div>

        {/* Audio Replay Button */}
        {onSpeak && (
          <button
            type="button"
            onClick={() => onSpeak(alert)}
            className="p-1.5 rounded bg-cat-surface text-cat-muted hover:text-cat-yellow hover:border-cat-yellow/60 border border-cat-border transition-colors"
            title="Replay Voice Announcement"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content: Title & Message */}
      <div className="mt-1.5">
        <h4 className="text-sm font-extrabold text-cat-text flex items-center gap-1.5">
          {alert.title}
        </h4>
        <p className={`text-xs text-cat-muted mt-0.5 ${compact ? 'line-clamp-2' : ''}`}>
          {alert.message}
        </p>
      </div>

      {/* Footer / Actions */}
      <div className="mt-3 pt-2 border-t border-cat-border/60 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {alert.acknowledged ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cat-green bg-cat-green/10 px-2 py-0.5 rounded border border-cat-green/30">
              <Check className="w-3 h-3" />
              Acknowledged
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onAcknowledge(alert.id)}
              className="touch-btn h-8 px-3 rounded text-xs font-bold bg-cat-surface hover:bg-cat-yellow hover:text-cat-bg border border-cat-border hover:border-cat-yellow text-cat-text transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-cat-green" />
              <span>Acknowledge</span>
            </button>
          )}

          {alert.escalated ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
              <ShieldAlert className="w-3 h-3" />
              Escalated to Supv
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onEscalate(alert.id)}
              className="touch-btn h-8 px-2.5 rounded text-xs font-bold bg-cat-surface hover:bg-cat-red hover:text-white border border-cat-border hover:border-cat-red text-cat-muted transition-colors flex items-center gap-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-cat-red" />
              <span>Escalate</span>
            </button>
          )}
        </div>

        {alert.active && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-cat-amber flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cat-amber animate-ping" />
            Active
          </span>
        )}
      </div>
    </div>
  );
};
