import { useState, useCallback, useEffect, useRef } from 'react';
import { IncidentLog, IncidentType, IncidentSeverity } from '../types/alerts';
import { useTelemetry } from '../context/TelemetryContext';
import { evaluateProximitySafety, evaluateSlopeSafety, evaluateSeatbeltSafety, evaluateTrenchSafety } from '../lib/safetyRules';

const INITIAL_INCIDENTS: IncidentLog[] = [
  {
    id: 'INC-1001',
    timestamp: '10:42:15',
    type: 'proximity_hazard',
    details: {
      distance: 3.2,
      personnel: 1,
      zone: 'Zone B',
      description: 'Person detected within 3.2m hazardous swing radius',
      response: 'Horn sounded and travel halted immediately',
    },
    severity: 'high',
    operatorNotes: 'Spotter was repositioning survey stakes near trench edge.',
    escalatedToSupervisor: false,
  },
  {
    id: 'INC-1002',
    timestamp: '10:46:30',
    type: 'idling',
    details: {
      idleMinutes: 6.5,
      rpm: 720,
      description: 'Continuous machine idle exceeding 6 minutes in staging',
      response: 'Operator switched engine to eco-idle mode',
    },
    severity: 'low',
    operatorNotes: 'Waiting for dump truck queue at Haul Corridor A.',
    escalatedToSupervisor: false,
  },
  {
    id: 'INC-1003',
    timestamp: '10:51:08',
    type: 'seatbelt',
    details: {
      speed: 4.8,
      seatbeltFastened: false,
      description: 'Machine moving while operator seatbelt was unfastened',
      response: 'Cab interlock alarm triggered; operator fastened belt',
    },
    severity: 'critical',
    operatorNotes: 'Operator unbuckled to inspect side trench window; reprimanded.',
    escalatedToSupervisor: true,
  },
  {
    id: 'INC-1004',
    timestamp: '11:15:42',
    type: 'trench_proximity',
    details: {
      trenchDistance: 1.8,
      slope: 11.2,
      description: 'Trench edge detected at 1.8 feet (< 2.0 ft critical limit)',
      response: 'Machine reversed 1.5m to restore safety berm',
    },
    severity: 'high',
    operatorNotes: 'Soil sloughed off trench lip; berm staked 1m further back.',
    escalatedToSupervisor: false,
  },
];

export function useIncidentLogger(): {
  incidents: IncidentLog[];
  logIncident: (
    type: IncidentType,
    details: Record<string, unknown>,
    severity: IncidentSeverity,
    operatorNotes?: string,
    escalated?: boolean
  ) => void;
  escalateIncident: (id: string, operatorNotes?: string) => void;
  exportIncidentsToCSV: () => void;
} {
  const [incidents, setIncidents] = useState<IncidentLog[]>(INITIAL_INCIDENTS);
  const { telemetry } = useTelemetry();
  const lastLoggedRef = useRef<{ [key: string]: number }>({});

  const logIncident = useCallback(
    (
      type: IncidentType,
      details: Record<string, unknown>,
      severity: IncidentSeverity,
      operatorNotes?: string,
      escalated = false
    ) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newIncident: IncidentLog = {
        id: `INC-${Date.now().toString().slice(-4)}`,
        timestamp: timeStr,
        type,
        details,
        severity,
        operatorNotes,
        escalatedToSupervisor: escalated,
      };

      setIncidents((prev) => [newIncident, ...prev]);
    },
    []
  );

  const escalateIncident = useCallback((id: string, operatorNotes?: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              escalatedToSupervisor: true,
              operatorNotes: operatorNotes || inc.operatorNotes || 'Escalated by operator.',
            }
          : inc
      )
    );
  }, []);

  // Automatic incident logger with 30-second cooldown per incident type to avoid spam
  useEffect(() => {
    const now = Date.now();
    const canLog = (key: string, cooldownMs = 30000) => {
      const last = lastLoggedRef.current[key] || 0;
      if (now - last > cooldownMs) {
        lastLoggedRef.current[key] = now;
        return true;
      }
      return false;
    };

    // Seatbelt violation while moving
    const belt = evaluateSeatbeltSafety(telemetry.seatbeltFastened, telemetry.speed);
    if (belt.status === 'danger' && canLog('seatbelt')) {
      logIncident(
        'seatbelt',
        {
          speed: telemetry.speed,
          seatbeltFastened: false,
          description: 'Machine moving while seatbelt was unfastened',
          response: 'Cab interlock alarm triggered',
        },
        'critical',
        'Automatic log: Seatbelt unfastened while track speed > 0.'
      );
    }

    // Trench critical breach
    const trench = evaluateTrenchSafety(telemetry.trenchDistance);
    if (trench.status === 'danger' && canLog('trench')) {
      logIncident(
        'trench_proximity',
        {
          trenchDistance: telemetry.trenchDistance,
          description: `Trench edge at ${telemetry.trenchDistance.toFixed(1)} ft (< 2.0 ft critical limit)`,
          response: 'Immediate halt order issued to operator',
        },
        'critical',
        'Automatic log: Critical trench edge buffer violation.'
      );
    }

    // Slope rollover hazard
    const slope = evaluateSlopeSafety(telemetry.slopeAngle);
    if (slope.status === 'danger' && canLog('slope')) {
      logIncident(
        'rollover_risk',
        {
          slopeAngle: telemetry.slopeAngle,
          gForce: telemetry.gForce,
          description: `Incline angle at ${telemetry.slopeAngle.toFixed(1)}° (Rollover threshold ≥ 25°)`,
          response: 'Bucket lowered and counterweight centered',
        },
        'critical',
        'Automatic log: High rollover incline angle detected.'
      );
    }

    // Proximity / personnel hazard
    const prox = evaluateProximitySafety(telemetry.proximityDistance);
    if (prox.status === 'danger' && canLog('proximity')) {
      logIncident(
        'proximity_hazard',
        {
          proximityDistance: telemetry.proximityDistance,
          nearbyPersonnel: telemetry.nearbyPersonnel,
          description: `Object or worker detected at ${telemetry.proximityDistance.toFixed(1)}m`,
          response: 'Blindspot radar alarm sounded',
        },
        'high',
        'Automatic log: Proximity perimeter breach.'
      );
    }
  }, [telemetry, logIncident]);

  const exportIncidentsToCSV = useCallback(() => {
    const headers = [
      'Incident ID',
      'Timestamp',
      'Type',
      'Severity',
      'Description',
      'Response',
      'Operator Notes',
      'Escalated To Supervisor',
    ];

    const rows = incidents.map((inc) => [
      `"${inc.id}"`,
      `"${inc.timestamp}"`,
      `"${inc.type}"`,
      `"${inc.severity}"`,
      `"${String(inc.details.description || '')}"`,
      `"${String(inc.details.response || '')}"`,
      `"${inc.operatorNotes || ''}"`,
      `"${inc.escalatedToSupervisor ? 'YES' : 'NO'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cat_incidents_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [incidents]);

  return {
    incidents,
    logIncident,
    escalateIncident,
    exportIncidentsToCSV,
  };
}
