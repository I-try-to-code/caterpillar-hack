import { useMemo } from 'react';
import { useVoiceAlertContext, VoiceAlertContextType } from '../context/VoiceAlertContext';
import { Alert } from '../types/alerts';

export interface UseVoiceAlertsReturn extends VoiceAlertContextType {
  topAlert: Alert | null;
  hasCriticalAlerts: boolean;
  hasUnacknowledged: boolean;
  activeCount: number;
  unacknowledgedCount: number;
}

export function useVoiceAlerts(): UseVoiceAlertsReturn {
  const context = useVoiceAlertContext();

  const topAlert = useMemo(() => {
    if (context.activeAlerts.length === 0) return null;
    return context.activeAlerts[0];
  }, [context.activeAlerts]);

  const hasCriticalAlerts = useMemo(() => {
    return context.criticalAlerts.length > 0;
  }, [context.criticalAlerts]);

  const hasUnacknowledged = useMemo(() => {
    return context.unacknowledgedAlerts.length > 0;
  }, [context.unacknowledgedAlerts]);

  const activeCount = context.activeAlerts.length;
  const unacknowledgedCount = context.unacknowledgedAlerts.length;

  return {
    ...context,
    topAlert,
    hasCriticalAlerts,
    hasUnacknowledged,
    activeCount,
    unacknowledgedCount,
  };
}
