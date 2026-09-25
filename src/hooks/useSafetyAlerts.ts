import { useTelemetry } from '../context/TelemetryContext';
import { Alert } from '../types/alerts';
import { getActiveHazards, ActiveHazard } from '../lib/safetyRules';
import { useVoiceAlertContext } from '../context/VoiceAlertContext';

export function useSafetyAlerts(): {
  alerts: Alert[];
  activeHazards: ActiveHazard[];
  collectiveAction: string;
  hasCritical: boolean;
  acknowledgeAlert: (id: string) => void;
  escalateAlert: (id: string) => void;
  clearAllAlerts: () => void;
} {
  const { telemetry } = useTelemetry();
  const {
    activeAlerts,
    acknowledgeAlert,
    escalateAlert,
    clearAlertHistory,
  } = useVoiceAlertContext();

  const { hazards, collectiveAction, hasCritical } = getActiveHazards(telemetry);

  return {
    alerts: activeAlerts,
    activeHazards: hazards,
    collectiveAction,
    hasCritical,
    acknowledgeAlert,
    escalateAlert,
    clearAllAlerts: clearAlertHistory,
  };
}
