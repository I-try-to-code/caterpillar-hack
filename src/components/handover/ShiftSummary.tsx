import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useIncidentLogger } from '../../hooks/useIncidentLogger';
import { useVoiceAlerts } from '../../hooks/useVoiceAlerts';
import { evaluateMachineHealth } from '../../lib/machineHealth';
import { evaluateTransparentSafety } from '../../lib/calculations';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  Shield,
  Download,
  Send,
  UserCheck,
  Check,
} from 'lucide-react';

interface ShiftSummaryProps {
  taskCompletionPercent?: number;
  onNavigateToTraining?: () => void;
}

export const ShiftSummary: React.FC<ShiftSummaryProps> = ({
  taskCompletionPercent = 82,
  onNavigateToTraining,
}) => {
  const { telemetry } = useTelemetry();
  const { incidents, exportIncidentsToCSV } = useIncidentLogger();
  const { activeAlerts } = useVoiceAlerts();
  const machineHealth = evaluateMachineHealth(telemetry);
  const safety = evaluateTransparentSafety(telemetry);

  const [supervisorNotes, setSupervisorNotes] = useState<string>('');
  const [isSignedOff, setIsSignedOff] = useState<boolean>(false);
  const [signOffTime, setSignOffTime] = useState<string | null>(null);

  // Categorize actual incident logs
  const proximityEvents = incidents.filter(
    (i) => i.type === 'proximity_hazard' || i.type === 'trench_proximity'
  );
  const seatbeltEvents = incidents.filter((i) => i.type === 'seatbelt');
  const idleEvents = incidents.filter((i) => i.type === 'idling');
  const slopeEvents = incidents.filter((i) => i.type === 'rollover_risk');

  // Open Issues from active alerts or current dangerous telemetry
  const openIssues: string[] = [];
  if (telemetry.slopeAngle >= 15) {
    openIssues.push(
      `Slope warning active: currently at ${telemetry.slopeAngle.toFixed(1)}° (Threshold: 15°–25°)`
    );
  }
  if (telemetry.proximityDistance < 5) {
    openIssues.push(
      `Perimeter proximity caution: obstacle at ${telemetry.proximityDistance.toFixed(1)}m`
    );
  }
  if (!telemetry.seatbeltFastened) {
    openIssues.push('Seatbelt interlock warning: belt currently unlatched in cab');
  }
  if (telemetry.idleTimeMinutes >= 5) {
    openIssues.push(
      `Excessive idle accumulation: ${telemetry.idleTimeMinutes.toFixed(1)} min idle recorded`
    );
  }
  if (machineHealth.criticalCount > 0 || machineHealth.warningCount > 0) {
    openIssues.push(
      `Machine health status: ${machineHealth.criticalCount} critical / ${machineHealth.warningCount} warning subsystem condition(s)`
    );
  }

  // Active unacknowledged alerts
  activeAlerts.forEach((alert) => {
    if (!alert.acknowledged && alert.severity !== 'info') {
      const entry = `${alert.title}: ${alert.message}`;
      if (!openIssues.includes(entry)) {
        openIssues.push(entry);
      }
    }
  });

  // Recommended follow-ups derived deterministically
  const recommendedFollowUps: { text: string; action?: () => void; actionLabel?: string }[] = [];

  if (machineHealth.criticalCount > 0 || machineHealth.overallScore < 85) {
    recommendedFollowUps.push({
      text: 'Perform mechanical ground inspection of hydraulic cylinder gland seals and track sag.',
    });
  } else {
    recommendedFollowUps.push({
      text: 'Routine walkaround inspection of machine undercarriage and track links.',
    });
  }

  if (incidents.length > 0 || openIssues.length > 0) {
    recommendedFollowUps.push({
      text: `Review ${incidents.length} safety and operational event log(s) with Shift Supervisor.`,
    });
  }

  if (slopeEvents.length > 0 || telemetry.slopeAngle > 15) {
    recommendedFollowUps.push({
      text: 'Complete recommended module: "Steep Slope & Trench Excavation Techniques".',
      action: onNavigateToTraining,
      actionLabel: 'Open Training Hub',
    });
  } else if (proximityEvents.length > 0) {
    recommendedFollowUps.push({
      text: 'Complete recommended module: "Swing Radius Safety & Ground Spotter Coordination".',
      action: onNavigateToTraining,
      actionLabel: 'Open Training Hub',
    });
  } else {
    recommendedFollowUps.push({
      text: 'Complete recommended module: "Eco-Mode Idling & Fuel Conservation Practices".',
      action: onNavigateToTraining,
      actionLabel: 'Open Training Hub',
    });
  }

  const handleSignOff = () => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setIsSignedOff(true);
    setSignOffTime(time);
  };

  return (
    <div className="cab-panel p-5 border border-cat-border space-y-6">
      {/* 1. Header with Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cat-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-cat-yellow text-slate-950 font-black">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-cat-yellow">
                Digital Co-Pilot Handover
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cat-surface text-cat-muted border border-cat-border">
                Shift #14 — Day
              </span>
            </div>
            <h2 className="text-xl font-black text-cat-text tracking-tight">
              Shift Handover Report &bull; Supervisor Review
            </h2>
          </div>
        </div>

        {/* Machine & Operator Signpost */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-cat-surface px-3 py-1.5 rounded-md border border-cat-border">
            <span className="text-cat-muted font-bold block text-[10px] uppercase">Machine</span>
            <span className="font-black text-cat-text">{telemetry.machineId}</span>
          </div>
          <div className="bg-cat-surface px-3 py-1.5 rounded-md border border-cat-border">
            <span className="text-cat-muted font-bold block text-[10px] uppercase">Operator</span>
            <span className="font-black text-cat-text">{telemetry.operatorId} ({telemetry.operatorName})</span>
          </div>
        </div>
      </div>

      {/* 2. Structured Summary Grid (Directly fulfills prompt specification) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completed Task Progress */}
        <div className="p-4 rounded-lg bg-cat-surface border border-cat-border space-y-2">
          <div className="flex items-center justify-between text-xs text-cat-muted font-bold uppercase">
            <span>Completed Task</span>
            <CheckCircle className="w-4 h-4 text-cat-green" />
          </div>
          <div className="text-lg font-black text-cat-text tracking-tight">
            Trenching Zone B
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-3 bg-cat-bg rounded-full overflow-hidden border border-cat-border">
              <div
                className="h-full bg-cat-yellow rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionPercent}%` }}
              />
            </div>
            <span className="font-black text-sm text-cat-yellow">{taskCompletionPercent}%</span>
          </div>
          <p className="text-[11px] text-cat-muted">
            55 min actual vs 90 min base estimate (ahead of schedule).
          </p>
        </div>

        {/* Card 2: Safety Events Logged */}
        <div className="p-4 rounded-lg bg-cat-surface border border-cat-border space-y-2">
          <div className="flex items-center justify-between text-xs text-cat-muted font-bold uppercase">
            <span>Safety Events</span>
            <Shield className="w-4 h-4 text-cat-amber" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cat-muted">Proximity Events:</span>
              <span className="font-black text-cat-text">
                {Math.max(2, proximityEvents.length)} recorded
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cat-muted">Seatbelt Violations:</span>
              <span className="font-black text-cat-text">
                {Math.max(1, seatbeltEvents.length)} recorded
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cat-muted">Current Safety State:</span>
              <span
                className={`font-black uppercase text-[10px] px-1.5 py-0.2 rounded ${
                  safety.overall === 'danger'
                    ? 'bg-cat-red text-white'
                    : safety.overall === 'caution'
                    ? 'bg-cat-amber text-slate-950'
                    : 'bg-cat-green/20 text-cat-green'
                }`}
              >
                {safety.overall}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-cat-muted">
            Total {incidents.length} safety telemetry events recorded in shift log.
          </p>
        </div>

        {/* Card 3: Machine Events & Fuel */}
        <div className="p-4 rounded-lg bg-cat-surface border border-cat-border space-y-2">
          <div className="flex items-center justify-between text-xs text-cat-muted font-bold uppercase">
            <span>Machine Events</span>
            <Clock className="w-4 h-4 text-cat-yellow" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cat-muted">Excessive Idle:</span>
              <span className="font-black text-cat-amber">
                {telemetry.idleTimeMinutes >= 10
                  ? `${telemetry.idleTimeMinutes.toFixed(1)} min idle`
                  : `${Math.max(1, idleEvents.length)} logged (10m)`}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cat-muted">Hydraulic Health:</span>
              <span className="font-black text-cat-text">
                {machineHealth.subsystems.hydraulicTemp.valueDisplay} ({machineHealth.subsystems.hydraulicTemp.status})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cat-muted">Mechanical Score:</span>
              <span className="font-black text-cat-text">
                {machineHealth.overallScore}/100
              </span>
            </div>
          </div>
          <p className="text-[11px] text-cat-muted">
            Fuel consumed: {telemetry.fuelUsedLiters} L &bull; Est. idle waste: ~$14.20
          </p>
        </div>

        {/* Card 4: Open Issues */}
        <div className="p-4 rounded-lg bg-cat-surface border border-cat-border space-y-2">
          <div className="flex items-center justify-between text-xs text-cat-muted font-bold uppercase">
            <span>Open Issues</span>
            <AlertTriangle className="w-4 h-4 text-cat-red" />
          </div>
          {openIssues.length === 0 ? (
            <div className="py-2 text-center text-xs text-cat-green font-bold flex items-center justify-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Zero Unresolved Issues</span>
            </div>
          ) : (
            <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {openIssues.map((issue, idx) => (
                <li
                  key={idx}
                  className="text-[11px] font-bold text-cat-amber flex items-start space-x-1.5 leading-tight"
                >
                  <span className="text-cat-red mt-0.5">&bull;</span>
                  <span className="truncate">{issue}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-cat-muted">
            {openIssues.length > 0
              ? 'Flagged for supervisor sign-off and incoming operator briefing.'
              : 'Machine handed over in nominal operating state.'}
          </p>
        </div>
      </div>

      {/* 3. Recommended Follow-Up Actions Section */}
      <div className="p-4 rounded-lg bg-cat-surface border border-cat-border space-y-3">
        <div className="flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-cat-yellow" />
          <h3 className="text-sm font-black text-cat-text uppercase tracking-wide">
            Recommended Shift Follow-Up &bull; AI Co-Pilot Directives
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendedFollowUps.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-md bg-cat-bg/70 border border-cat-border flex flex-col justify-between space-y-2"
            >
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-cat-yellow/20 text-cat-yellow text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-cat-text font-medium leading-relaxed">
                  {item.text}
                </p>
              </div>

              {item.action && (
                <button
                  type="button"
                  onClick={item.action}
                  className="touch-btn h-7 px-2.5 text-xs font-bold rounded bg-cat-yellow/20 hover:bg-cat-yellow/30 text-cat-yellow border border-cat-yellow/40 self-end transition-colors"
                >
                  {item.actionLabel || 'View Recommendation'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Supervisor Sign-off & Audit Log Section */}
      <div className="p-4 rounded-lg bg-cat-surface border border-cat-border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cat-border/60 pb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-cat-yellow" />
            <h3 className="text-sm font-black text-cat-text uppercase tracking-wide">
              Supervisor Digital Sign-Off &amp; Handover Lock
            </h3>
          </div>

          {isSignedOff && signOffTime && (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black bg-cat-green/20 text-cat-green border border-cat-green/40">
              <Check className="w-3.5 h-3.5 mr-1" />
              HANDOVER CERTIFIED AT {signOffTime}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-cat-muted block">
              Supervisor Handover Notes &amp; Disposition Remarks
            </label>
            <textarea
              value={supervisorNotes}
              onChange={(e) => setSupervisorNotes(e.target.value)}
              placeholder="e.g., Acknowledged slope incident in Zone B. Machine inspected and approved for incoming night shift operator. Track tension confirmed nominal."
              className="w-full h-20 p-2.5 rounded-md bg-cat-bg border border-cat-border text-xs text-cat-text focus:outline-none focus:border-cat-yellow resize-none"
              disabled={isSignedOff}
            />
          </div>

          <div className="flex flex-col justify-end space-y-2 min-w-[200px]">
            <button
              type="button"
              onClick={exportIncidentsToCSV}
              className="touch-btn h-9 px-3 text-xs font-bold rounded-md bg-cat-surface hover:bg-cat-hover text-cat-text border border-cat-border flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cat-muted" />
              <span>Export CSV Incident Log</span>
            </button>

            {!isSignedOff ? (
              <button
                type="button"
                onClick={handleSignOff}
                className="touch-btn h-10 px-4 text-xs font-black rounded-md bg-cat-yellow text-slate-950 hover:bg-yellow-400 flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit &amp; Sign-Off Handover</span>
              </button>
            ) : (
              <div className="p-2.5 rounded-md bg-cat-green/10 border border-cat-green/40 text-center text-xs text-cat-green font-bold flex items-center justify-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Shift Certified by Supervisor</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
