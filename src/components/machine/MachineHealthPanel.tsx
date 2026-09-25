import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { evaluateMachineHealth, SubsystemHealth } from '../../lib/machineHealth';
import {
  Gauge,
  Thermometer,
  Droplet,
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface MachineHealthPanelProps {
  onOpenAssistantWithTopic?: (topic: string) => void;
  onEscalate?: (notes: string) => void;
  compact?: boolean;
}

export const MachineHealthPanel: React.FC<MachineHealthPanelProps> = ({
  onOpenAssistantWithTopic,
  onEscalate,
  compact = false,
}) => {
  const { telemetry } = useTelemetry();
  const evaluation = evaluateMachineHealth(telemetry);

  const getStatusBadge = (status: SubsystemHealth['status']) => {
    switch (status) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-cat-red/20 text-cat-red border border-cat-red/50 animate-pulse">
            <AlertOctagon className="w-3 h-3 mr-1" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-cat-amber/20 text-cat-amber border border-cat-amber/50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cat-green/15 text-cat-green border border-cat-green/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Normal
          </span>
        );
    }
  };

  const subsystems = [
    {
      ...evaluation.subsystems.oilPressure,
      icon: Gauge,
    },
    {
      ...evaluation.subsystems.hydraulicTemp,
      icon: Thermometer,
    },
    {
      ...evaluation.subsystems.coolant,
      icon: Droplet,
    },
    {
      ...evaluation.subsystems.sealIntegrity,
      icon: ShieldAlert,
    },
    {
      ...evaluation.subsystems.trackTension,
      icon: Activity,
    },
  ];

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-4">
      {/* 1. Header with Overall Health Index Meter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cat-border/70 pb-3.5">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-md font-black ${
              evaluation.overallStatus === 'critical'
                ? 'bg-cat-red text-white animate-pulse'
                : evaluation.overallStatus === 'warning'
                ? 'bg-cat-amber text-slate-950'
                : 'bg-cat-yellow text-slate-950'
            }`}
          >
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-cat-muted">
                5-Subsystem Diagnostics &bull; Telemetry Grounded
              </span>
              {getStatusBadge(evaluation.overallStatus)}
            </div>
            <h2 className="text-base font-black text-cat-text tracking-tight">
              Machine Mechanical Health
            </h2>
          </div>
        </div>

        {/* Overall Health Score Meter */}
        <div className="flex items-center space-x-3 bg-cat-surface px-3.5 py-1.5 rounded-md border border-cat-border">
          <div className="text-right">
            <span className="text-[10px] text-cat-muted uppercase font-bold block">
              Health Index
            </span>
            <span
              className={`text-lg font-black tracking-tight ${
                evaluation.overallScore >= 90
                  ? 'text-cat-green'
                  : evaluation.overallScore >= 75
                  ? 'text-cat-amber'
                  : 'text-cat-red'
              }`}
            >
              {evaluation.overallScore}
              <span className="text-xs text-cat-muted font-normal"> / 100</span>
            </span>
          </div>
          <div className="w-16 h-2.5 bg-cat-bg rounded-full overflow-hidden border border-cat-border/80">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                evaluation.overallScore >= 90
                  ? 'bg-cat-green'
                  : evaluation.overallScore >= 75
                  ? 'bg-cat-amber'
                  : 'bg-cat-red'
              }`}
              style={{ width: `${evaluation.overallScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Subsystem Diagnosis Cards */}
      <div
        className={`grid gap-3 ${
          compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5'
        }`}
      >
        {subsystems.map((sub) => {
          const Icon = sub.icon;
          const isCritical = sub.status === 'critical';
          const isWarning = sub.status === 'warning';

          return (
            <div
              key={sub.id}
              className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between min-w-0 ${
                isCritical
                  ? 'bg-cat-red/10 border-cat-red/60 shadow-cat-danger'
                  : isWarning
                  ? 'bg-cat-amber/10 border-cat-amber/50'
                  : 'bg-cat-surface/70 border-cat-border hover:border-cat-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0 mr-1.5">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isCritical
                          ? 'text-cat-red'
                          : isWarning
                          ? 'text-cat-amber'
                          : 'text-cat-muted'
                      }`}
                    />
                    <span className="text-xs font-bold text-cat-text truncate">{sub.name}</span>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>

                <div className="my-2">
                  <div className="text-lg font-black text-cat-text tracking-tight">
                    {sub.valueDisplay}
                  </div>
                  <div className="text-[11px] text-cat-muted font-medium">
                    Target: {sub.thresholdDisplay}
                  </div>
                </div>

                <p className="text-[11px] text-cat-muted leading-relaxed line-clamp-2">
                  {sub.detail}
                </p>
              </div>

              {sub.recommendedAction && (
                <div className="mt-2.5 pt-2 border-t border-cat-border/50 text-[10px] text-cat-amber font-semibold flex items-start space-x-1">
                  <span className="font-bold flex-shrink-0">Directive:</span>
                  <span className="line-clamp-2">{sub.recommendedAction}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Action bar with AI consultation and Supervisor Escalation */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cat-border/60">
        <div className="text-xs text-cat-muted flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-cat-green animate-pulse" />
          <span>Real-time CAN bus telemetry polling &bull; Caterpillar Certified Thresholds</span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenAssistantWithTopic && (
            <button
              type="button"
              onClick={() => onOpenAssistantWithTopic('How is my machine performing?')}
              className="touch-btn h-8 px-3 text-xs font-bold rounded-md bg-cat-yellow/20 hover:bg-cat-yellow/30 text-cat-yellow border border-cat-yellow/40 transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Diagnostics</span>
            </button>
          )}

          {evaluation.criticalCount > 0 && onEscalate && (
            <button
              type="button"
              onClick={() =>
                onEscalate(
                  `Machine Health Alert: ${evaluation.criticalCount} subsystem(s) in critical status.`
                )
              }
              className="touch-btn h-8 px-3 text-xs font-bold rounded-md bg-cat-red text-white hover:bg-cat-red/90 transition-colors flex items-center space-x-1.5 shadow-cat-danger"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Escalate Mechanical Alert</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
