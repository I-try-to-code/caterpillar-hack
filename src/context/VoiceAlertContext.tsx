import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Alert, VoiceSettings } from '../types/alerts';
import { useTelemetry } from './TelemetryContext';
import { voiceAlertService } from '../services/voiceAlertService';
import {
  processStateTransitions,
  ConditionSnapshot,
  sortAlertsByPriority,
} from '../lib/alertManager';

export interface VoiceAlertContextType {
  activeAlerts: Alert[];
  recentAlerts: Alert[];
  criticalAlerts: Alert[];
  unacknowledgedAlerts: Alert[];
  escalatedAlerts: Alert[];
  voiceSettings: VoiceSettings;
  isSpeaking: boolean;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  testVoice: (message?: string) => void;
  cancelVoice: () => void;
  speakAlert: (alert: Alert, force?: boolean) => boolean;
  acknowledgeAlert: (alertId: string) => void;
  acknowledgeAll: () => void;
  escalateAlert: (alertId: string, notes?: string) => void;
  clearAlertHistory: () => void;
  triggerManualAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'escalated'>) => void;
}

const VoiceAlertContext = createContext<VoiceAlertContextType | undefined>(undefined);

export const VoiceAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { telemetry } = useTelemetry();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(voiceAlertService.getSettings());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(voiceAlertService.isSpeaking());

  // Store tracked condition snapshots
  const conditionSnapshotsRef = useRef<Map<string, ConditionSnapshot>>(new Map());

  // Subscribe to voiceAlertService status & settings changes
  useEffect(() => {
    const unsubSpeaking = voiceAlertService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    const unsubSettings = voiceAlertService.subscribeSettings((settings) => {
      setVoiceSettings(settings);
    });
    return () => {
      unsubSpeaking();
      unsubSettings();
    };
  }, []);

  // Monitor telemetry changes and detect meaningful state transitions
  useEffect(() => {
    const { newAlerts, updatedConditions, clearedConditions } = processStateTransitions(
      telemetry,
      conditionSnapshotsRef.current
    );

    conditionSnapshotsRef.current = updatedConditions;

    if (newAlerts.length > 0 || clearedConditions.length > 0) {
      // 1. Process Voice announcements for new alerts
      newAlerts.forEach((alert) => {
        if (alert.severity === 'critical' || alert.severity === 'danger') {
          voiceAlertService.speakAlert(alert);
        }
      });

      // 2. Update Recent Alerts History (append to history, max 100 items)
      setRecentAlerts((prev) => {
        const combined = [...newAlerts, ...prev];
        return combined.slice(0, 100);
      });

      // 3. Update Active Alerts
      setActiveAlerts((prev) => {
        // Remove cleared conditions
        let updated = prev.filter((a) => !clearedConditions.includes(a.conditionId || ''));

        // For newly started or escalated alerts, replace any existing active alert for same condition
        for (const newA of newAlerts) {
          if (newA.stateTransition !== 'normalized' && newA.conditionId) {
            updated = updated.filter((a) => a.conditionId !== newA.conditionId);
            updated.push(newA);
          }
        }

        return sortAlertsByPriority(updated);
      });
    }
  }, [telemetry]);

  // Derived alert views
  const criticalAlerts = useMemo(
    () => activeAlerts.filter((a) => a.severity === 'critical'),
    [activeAlerts]
  );

  const unacknowledgedAlerts = useMemo(
    () => activeAlerts.filter((a) => !a.acknowledged),
    [activeAlerts]
  );

  const escalatedAlerts = useMemo(
    () => recentAlerts.filter((a) => a.escalated),
    [recentAlerts]
  );

  // Actions
  const updateVoiceSettings = useCallback((partial: Partial<VoiceSettings>) => {
    voiceAlertService.updateSettings(partial);
  }, []);

  const testVoice = useCallback((message?: string) => {
    voiceAlertService.testAlert(message);
  }, []);

  const cancelVoice = useCallback(() => {
    voiceAlertService.cancelAll();
  }, []);

  const speakAlert = useCallback((alert: Alert, force = false) => {
    return voiceAlertService.speakAlert(alert, force);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setActiveAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    setRecentAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const acknowledgeAll = useCallback(() => {
    setActiveAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    setRecentAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  }, []);

  const escalateAlert = useCallback((alertId: string, _notes?: string) => {
    setActiveAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, escalated: true } : a))
    );
    setRecentAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, escalated: true } : a))
    );
  }, []);

  const clearAlertHistory = useCallback(() => {
    setRecentAlerts([]);
  }, []);

  const triggerManualAlert = useCallback(
    (alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'escalated'>) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const fullAlert: Alert = {
        ...alert,
        id: `manual-${Date.now()}`,
        timestamp: timeStr,
        acknowledged: false,
        escalated: false,
        active: true,
      };

      setRecentAlerts((prev) => [fullAlert, ...prev].slice(0, 100));
      setActiveAlerts((prev) => sortAlertsByPriority([fullAlert, ...prev]));

      if (fullAlert.severity === 'critical' || fullAlert.severity === 'danger') {
        voiceAlertService.speakAlert(fullAlert);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      activeAlerts,
      recentAlerts,
      criticalAlerts,
      unacknowledgedAlerts,
      escalatedAlerts,
      voiceSettings,
      isSpeaking,
      updateVoiceSettings,
      testVoice,
      cancelVoice,
      speakAlert,
      acknowledgeAlert,
      acknowledgeAll,
      escalateAlert,
      clearAlertHistory,
      triggerManualAlert,
    }),
    [
      activeAlerts,
      recentAlerts,
      criticalAlerts,
      unacknowledgedAlerts,
      escalatedAlerts,
      voiceSettings,
      isSpeaking,
      updateVoiceSettings,
      testVoice,
      cancelVoice,
      speakAlert,
      acknowledgeAlert,
      acknowledgeAll,
      escalateAlert,
      clearAlertHistory,
      triggerManualAlert,
    ]
  );

  return <VoiceAlertContext.Provider value={value}>{children}</VoiceAlertContext.Provider>;
};

export const useVoiceAlertContext = (): VoiceAlertContextType => {
  const context = useContext(VoiceAlertContext);
  if (!context) {
    throw new Error('useVoiceAlertContext must be used within a VoiceAlertProvider');
  }
  return context;
};
