import React, { useState } from 'react';
import { useSafetyAlerts } from '../hooks/useSafetyAlerts';
import { useIncidentLogger } from '../hooks/useIncidentLogger';
import { SafetyStatusPanel } from '../components/safety/SafetyStatusPanel';
import { ActiveHazardsPanel } from '../components/safety/ActiveHazardsPanel';
import { ProximityRadar } from '../components/safety/ProximityRadar';
import { SeatbeltMonitor } from '../components/safety/SeatbeltMonitor';
import { TrenchMonitor } from '../components/safety/TrenchMonitor';
import { SlopeGauge } from '../components/safety/SlopeGauge';
import { PostureMonitor } from '../components/safety/PostureMonitor';
import { StretchReminder } from '../components/safety/StretchReminder';
import { IncidentTimeline } from '../components/safety/IncidentTimeline';
import { IncidentTable } from '../components/safety/IncidentTable';
import { EscalationDialog } from '../components/safety/EscalationDialog';
import { IncidentLog, AlertSeverity } from '../types/alerts';

export const SafetyPage: React.FC = () => {
  const { activeHazards, collectiveAction, hasCritical } = useSafetyAlerts();
  const { incidents, logIncident, escalateIncident, exportIncidentsToCSV } = useIncidentLogger();

  // Escalation dialog state
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [escalationData, setEscalationData] = useState<{
    type: string;
    severity: AlertSeverity;
    incidentId?: string;
  }>({
    type: 'Compound Safety Hazard Escalation',
    severity: 'critical',
  });

  const handleOpenEscalation = (type = 'Safety Alert Escalation', severity: AlertSeverity = 'critical', incidentId?: string) => {
    setEscalationData({ type, severity, incidentId });
    setEscalationOpen(true);
  };

  const handleTimelineEscalate = (inc: IncidentLog) => {
    handleOpenEscalation(inc.type.replace('_', ' ').toUpperCase(), inc.severity === 'critical' ? 'critical' : 'danger', inc.id);
  };

  const handleConfirmEscalation = (notes: string) => {
    if (escalationData.incidentId) {
      escalateIncident(escalationData.incidentId, notes);
    } else {
      logIncident(
        'proximity_hazard',
        {
          description: `Manual operator escalation: ${escalationData.type}`,
          response: 'Direct radio ticket to supervisor dispatched',
        },
        escalationData.severity === 'critical' ? 'critical' : 'high',
        notes,
        true
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 select-none">
      {/* 1. Cockpit Header & Status Oversight */}
      <SafetyStatusPanel />

      {/* 2. Active Hazards Grouping Aggregator */}
      <ActiveHazardsPanel
        hazards={activeHazards}
        collectiveAction={collectiveAction}
        hasCritical={hasCritical}
        onEscalate={() => handleOpenEscalation('Active Compound Hazard Escalation', 'critical')}
      />

      {/* 3. In-Cab Rest & Micro-Stretch Reminder (if active) */}
      <StretchReminder />

      {/* 4. Core Cockpit HUD Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HTML5 Canvas 360° Proximity Radar */}
        <ProximityRadar />

        {/* Seatbelt Interlock Monitor with MACHINE LOCKED prominent state */}
        <SeatbeltMonitor />

        {/* Trench Edge Distance Monitor (<2ft Critical STOP) */}
        <TrenchMonitor />

        {/* Gyroscopic Inclinometer & Attitude Horizon Gauge (>=25° Rollover Risk) */}
        <SlopeGauge />
      </div>

      {/* 5. Driver Ergonomic Posture Monitoring */}
      <PostureMonitor />

      {/* 6. Chronological Incident Event Timeline */}
      <IncidentTimeline
        incidents={incidents}
        onEscalate={handleTimelineEscalate}
      />

      {/* 7. Detailed Incident Log Table with CSV Export */}
      <IncidentTable
        incidents={incidents}
        onExportCSV={exportIncidentsToCSV}
      />

      {/* 8. Supervisor Escalation Modal */}
      <EscalationDialog
        isOpen={escalationOpen}
        onClose={() => setEscalationOpen(false)}
        initialType={escalationData.type}
        initialSeverity={escalationData.severity}
        onConfirm={handleConfirmEscalation}
      />
    </div>
  );
};
