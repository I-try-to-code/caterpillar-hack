import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useVoiceAlerts } from '../../hooks/useVoiceAlerts';
import { evaluateTransparentSafety } from '../../lib/calculations';
import { evaluateMachineHealth } from '../../lib/machineHealth';
import {
  HardHat,
  Truck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Bell,
  HeartPulse,
  ClipboardList,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ShiftStatusBannerProps {
  onOpenDemo?: () => void;
  onOpenAssistant?: () => void;
  onOpenHandover?: () => void;
}

export const ShiftStatusBanner: React.FC<ShiftStatusBannerProps> = ({
  onOpenDemo,
  onOpenAssistant,
  onOpenHandover,
}) => {
  const { telemetry } = useTelemetry();
  const { activeAlerts } = useVoiceAlerts();

  // 1. Safety Status
  const safety = evaluateTransparentSafety(telemetry);
  const safetyStatusLabel =
    safety.overall === 'danger'
      ? 'CRITICAL'
      : safety.overall === 'caution'
      ? 'CAUTION'
      : 'SAFE';

  // 2. Machine Health Status
  const machineHealth = evaluateMachineHealth(telemetry);
  const healthStatusLabel =
    machineHealth.overallStatus === 'critical'
      ? 'CRITICAL'
      : machineHealth.overallStatus === 'warning'
      ? 'WARNING'
      : 'NORMAL';

  // 3. Active Alerts Count
  const alertCount = activeAlerts.filter((a) => !a.acknowledged && a.severity !== 'info').length;

  return (
    <div
      className="bg-cat-surface border-b-2 border-cat-border px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-sm select-none z-10 flex-shrink-0"
      aria-label="Shift Status Banner"
    >
      {/* Left side: Machine, Operator, Task */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        {/* Machine Badge */}
        <div className="flex items-center space-x-1.5 bg-cat-panel px-2.5 py-1 rounded border border-cat-border">
          <Truck className="w-3.5 h-3.5 text-cat-yellow flex-shrink-0" />
          <span className="text-[10px] uppercase font-bold text-cat-muted">Machine:</span>
          <span className="font-black text-cat-text tracking-wide">
            {telemetry.machineId || 'EXC001'}
          </span>
        </div>

        {/* Operator Badge */}
        <div className="flex items-center space-x-1.5 bg-cat-panel px-2.5 py-1 rounded border border-cat-border">
          <HardHat className="w-3.5 h-3.5 text-cat-yellow flex-shrink-0" />
          <span className="text-[10px] uppercase font-bold text-cat-muted">Operator:</span>
          <span className="font-black text-cat-text tracking-wide">
            {telemetry.operatorId || 'OP1001'}
          </span>
        </div>

        {/* Current Task */}
        <div className="hidden md:flex items-center space-x-1.5 bg-cat-panel px-2.5 py-1 rounded border border-cat-border">
          <ClipboardList className="w-3.5 h-3.5 text-cat-muted flex-shrink-0" />
          <span className="text-[10px] uppercase font-bold text-cat-muted">Task:</span>
          <span className="font-extrabold text-cat-text truncate max-w-[200px]">
            Trenching Zone B
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-cat-yellow text-slate-950 border border-slate-950/20 shadow-xs">
            62%
          </span>
        </div>
      </div>

      {/* Center / Right side: Safety Status, Active Alerts, Machine Health */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Safety Indicator */}
        <div className="flex items-center space-x-1.5 bg-cat-panel px-2.5 py-1 rounded border border-cat-border">
          <span className="text-[10px] uppercase font-bold text-cat-muted">Safety:</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black tracking-wider ${
              safetyStatusLabel === 'CRITICAL'
                ? 'bg-cat-red text-white animate-pulse shadow-cat-danger'
                : safetyStatusLabel === 'CAUTION'
                ? 'bg-cat-amber text-slate-950'
                : 'bg-cat-green/20 text-cat-green border border-cat-green/40'
            }`}
          >
            {safetyStatusLabel === 'CRITICAL' && <AlertOctagon className="w-3 h-3 mr-1" />}
            {safetyStatusLabel === 'CAUTION' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {safetyStatusLabel === 'SAFE' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {safetyStatusLabel}
          </span>
        </div>

        {/* Active Alerts */}
        <div className="flex items-center space-x-1.5 bg-cat-panel px-2.5 py-1 rounded border border-cat-border">
          <Bell
            className={`w-3.5 h-3.5 ${
              alertCount > 0 ? 'text-cat-red animate-bounce' : 'text-cat-muted'
            }`}
          />
          <span className="text-[10px] uppercase font-bold text-cat-muted">Alerts:</span>
          <span
            className={`font-black px-1.5 py-0.2 rounded text-[11px] ${
              alertCount > 0
                ? 'bg-cat-red text-white font-extrabold'
                : 'text-cat-muted font-bold'
            }`}
          >
            {alertCount}
          </span>
        </div>

        {/* Machine Health Indicator */}
        <div className="flex items-center space-x-1.5 bg-cat-panel px-2.5 py-1 rounded border border-cat-border">
          <HeartPulse
            className={`w-3.5 h-3.5 ${
              healthStatusLabel === 'CRITICAL'
                ? 'text-cat-red animate-pulse'
                : healthStatusLabel === 'WARNING'
                ? 'text-cat-amber'
                : 'text-cat-green'
            }`}
          />
          <span className="text-[10px] uppercase font-bold text-cat-muted">Health:</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black tracking-wider ${
              healthStatusLabel === 'CRITICAL'
                ? 'bg-cat-red text-white animate-pulse'
                : healthStatusLabel === 'WARNING'
                ? 'bg-cat-amber text-slate-950'
                : 'bg-cat-green/20 text-cat-green border border-cat-green/40'
            }`}
          >
            {healthStatusLabel}
          </span>
        </div>

        {/* Quick Demo & Co-Pilot Action Shortcuts */}
        <div className="flex items-center space-x-1.5 ml-1">
          {onOpenDemo && (
            <button
              type="button"
              onClick={onOpenDemo}
              className="touch-btn h-7 px-2.5 text-[11px] font-black rounded-md bg-cat-surface hover:bg-cat-hover text-slate-900 border border-cat-border hover:border-cat-yellow flex items-center space-x-1.5 transition-all shadow-xs"
              title="Launch Judge Demo Scenarios"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Demo Mode</span>
            </button>
          )}

          {onOpenAssistant && (
            <button
              type="button"
              onClick={onOpenAssistant}
              className="touch-btn h-7 px-3 text-[11px] font-black rounded-md bg-cat-yellow text-slate-950 hover:bg-yellow-400 active:scale-95 flex items-center space-x-1.5 transition-all shadow-sm border border-slate-950/20"
              title="Open CAT Operator Assistant Co-Pilot"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>AI Co-Pilot</span>
            </button>
          )}

          {onOpenHandover && (
            <button
              type="button"
              onClick={onOpenHandover}
              className="touch-btn h-7 px-2 text-[11px] font-bold rounded bg-cat-panel hover:bg-cat-surface text-cat-text border border-cat-border flex items-center space-x-1 transition-all"
              title="Shift Handover Briefing & Sign-off"
            >
              <ClipboardList className="w-3 h-3 text-cat-muted" />
              <span className="hidden sm:inline">Handover</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
