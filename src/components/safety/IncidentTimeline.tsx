import React from 'react';
import { IncidentLog } from '../../types/alerts';
import { History, PhoneCall, CheckCircle2 } from 'lucide-react';

interface IncidentTimelineProps {
  incidents: IncidentLog[];
  onEscalate?: (incident: IncidentLog) => void;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ incidents, onEscalate }) => {
  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-cat-yellow" />
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wide text-cat-text">
              Real-Time Incident Event Timeline
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              Chronological Shift Log &bull; Black-Box Telematics Recorder
            </span>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded text-xs font-bold text-cat-yellow bg-cat-surface border border-cat-yellow/30">
          {incidents.length} Logged Events
        </span>
      </div>

      {/* Visual Timeline Nodes */}
      <div className="relative border-l-2 border-cat-border/80 ml-3.5 space-y-4 py-1">
        {incidents.map((inc) => {
          const isCritical = inc.severity === 'critical';
          const isHigh = inc.severity === 'high';

          const nodeColor =
            isCritical || isHigh
              ? 'bg-cat-red border-cat-red'
              : inc.severity === 'medium'
              ? 'bg-cat-amber border-cat-amber'
              : 'bg-cat-yellow border-cat-yellow';

          const hasResponse = Boolean(inc.details.response);

          return (
            <div key={inc.id} className="relative pl-6 group">
              {/* Timeline Bullet Node */}
              <span
                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-cat-panel ${nodeColor} ${
                  isCritical ? 'animate-ping' : ''
                }`}
              />
              <span
                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-cat-panel ${nodeColor}`}
              />

              {/* Event Card */}
              <div
                className={`p-3 rounded-md border text-xs transition-all ${
                  isCritical
                    ? 'bg-cat-red/10 border-cat-red/60 text-cat-text'
                    : isHigh
                    ? 'bg-cat-amber/10 border-cat-amber/50 text-cat-text'
                    : 'bg-cat-surface/40 border-cat-border/70 text-cat-text'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cat-yellow font-extrabold text-sm">
                      {inc.timestamp}
                    </span>
                    <span className="font-black text-sm uppercase tracking-tight">
                      {inc.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase ${
                        isCritical
                          ? 'bg-cat-red text-white'
                          : isHigh
                          ? 'bg-cat-amber text-cat-bg'
                          : 'bg-cat-surface text-cat-muted border border-cat-border'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  {/* Escalation Status */}
                  <div className="flex items-center space-x-2">
                    {inc.escalatedToSupervisor ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cat-green bg-cat-green/10 px-2 py-0.5 rounded border border-cat-green/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Escalated to Supervisor
                      </span>
                    ) : (
                      onEscalate && (
                        <button
                          type="button"
                          onClick={() => onEscalate(inc)}
                          className="touch-btn h-7 px-2 text-[10px] font-bold uppercase rounded bg-cat-surface hover:bg-cat-hover text-cat-text border border-cat-border hover:border-cat-yellow flex items-center space-x-1"
                        >
                          <PhoneCall className="w-3 h-3 text-cat-yellow" />
                          <span>Escalate</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Details Description */}
                <p className="text-xs text-cat-text font-semibold mt-1.5 leading-snug">
                  {String(inc.details.description || '')}
                </p>

                {/* Corrective Response */}
                {hasResponse && (
                  <div className="mt-2 pt-1.5 border-t border-cat-border/40 text-[11px] text-cat-muted flex items-start space-x-1.5">
                    <span className="text-cat-yellow font-bold">Response:</span>
                    <span>{String(inc.details.response || '')}</span>
                  </div>
                )}

                {/* Operator Notes */}
                {inc.operatorNotes && (
                  <div className="mt-1 text-[11px] text-cat-muted font-medium italic">
                    Note: &ldquo;{inc.operatorNotes}&rdquo;
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
