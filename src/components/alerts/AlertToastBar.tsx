import React, { useState } from 'react';
import { useVoiceAlerts } from '../../hooks/useVoiceAlerts';
import { AlertPriorityBadge } from './AlertPriorityBadge';
import { AlertHistory } from './AlertHistory';
import { VoiceSettings } from '../settings/VoiceSettings';
import {
  CheckCircle2,
  Volume2,
  VolumeX,
  History,
  Check,
  ArrowUpRight,
  Radio,
  Sliders,
} from 'lucide-react';

export const AlertToastBar: React.FC = () => {
  const {
    topAlert,
    hasCriticalAlerts,
    activeCount,
    unacknowledgedCount,
    voiceSettings,
    isSpeaking,
    acknowledgeAlert,
    acknowledgeAll,
    escalateAlert,
    speakAlert,
  } = useVoiceAlerts();

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const isCritical = topAlert?.severity === 'critical';
  const isDanger = topAlert?.severity === 'danger';

  return (
    <>
      <footer
        className={`h-14 bg-cat-panel border-t-2 px-3 md:px-4 flex items-center justify-between flex-shrink-0 select-none z-20 transition-all ${
          isCritical
            ? 'border-cat-red/90 bg-cat-red/10 animate-pulse-subtle shadow-[0_-2px_12px_rgba(235,0,0,0.3)]'
            : isDanger
            ? 'border-red-500/70 bg-red-950/20'
            : topAlert?.severity === 'warning'
            ? 'border-cat-amber/60 bg-cat-amber/5'
            : 'border-cat-border bg-cat-panel'
        }`}
      >
        {/* Left Side: Alert Badge / Content */}
        <div className="flex items-center space-x-3 overflow-hidden flex-1 mr-2">
          {topAlert ? (
            <div className="flex items-center space-x-2 md:space-x-3 overflow-hidden">
              <AlertPriorityBadge
                severity={topAlert.severity}
                size="sm"
                pulsing={isCritical}
              />

              <div className="flex items-baseline space-x-2 truncate">
                <span className="text-xs md:text-sm font-black text-cat-text truncate">
                  {topAlert.title}:
                </span>
                <span className="text-xs text-cat-muted truncate hidden sm:inline">
                  {topAlert.message}
                </span>
                <span className="text-[10px] font-mono text-cat-muted whitespace-nowrap hidden lg:inline">
                  [{topAlert.timestamp}]
                </span>
              </div>

              {/* Active count badge if multiple */}
              {activeCount > 1 && (
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-cat-surface text-cat-amber border border-cat-border">
                  +{activeCount - 1} more
                </span>
              )}
            </div>
          ) : (
            /* Nominal Machine State */
            <div className="flex items-center space-x-2 text-cat-green text-xs md:text-sm font-semibold truncate">
              <CheckCircle2 className="w-4 h-4 text-cat-green flex-shrink-0" />
              <span className="truncate">
                STATUS NOMINAL &bull; Cab Safety Interlocks Cleared &bull; Voice Monitoring Active
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Acknowledge, Escalate, TTS Status & Shift History Controls */}
        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          {/* Top Alert Action Buttons */}
          {topAlert && (
            <div className="flex items-center space-x-1.5">
              {/* Audio Replay */}
              <button
                type="button"
                onClick={() => speakAlert(topAlert, true)}
                className="p-1.5 rounded bg-cat-surface hover:bg-cat-border border border-cat-border text-cat-muted hover:text-cat-yellow transition-colors"
                title="Replay Voice Announcement"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              {/* Acknowledge Button */}
              {!topAlert.acknowledged ? (
                <button
                  type="button"
                  onClick={() => acknowledgeAlert(topAlert.id)}
                  className={`touch-btn h-8 px-2.5 md:px-3 text-xs uppercase font-extrabold rounded border transition-colors flex items-center gap-1 ${
                    isCritical
                      ? 'bg-cat-red text-white border-cat-red hover:brightness-110 shadow-sm'
                      : 'bg-cat-surface border-cat-border text-cat-text hover:border-cat-yellow hover:text-cat-yellow'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Ack</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-cat-green hidden sm:inline-flex items-center gap-0.5 bg-cat-green/10 px-2 py-1 rounded border border-cat-green/30">
                  <Check className="w-3 h-3" /> Ack'd
                </span>
              )}

              {/* Escalate Button */}
              {!topAlert.escalated && (
                <button
                  type="button"
                  onClick={() => escalateAlert(topAlert.id)}
                  className="touch-btn h-8 px-2 text-xs font-bold rounded bg-cat-surface hover:bg-cat-red hover:text-white border border-cat-border text-cat-muted transition-colors flex items-center gap-1"
                  title="Escalate to Supervisor"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-cat-red" />
                  <span className="hidden sm:inline">Escalate</span>
                </button>
              )}
            </div>
          )}

          {/* Ack All Button if multiple unacknowledged */}
          {unacknowledgedCount > 1 && (
            <button
              type="button"
              onClick={acknowledgeAll}
              className="touch-btn h-8 px-2 text-xs font-bold rounded bg-cat-surface hover:bg-cat-green hover:text-cat-bg border border-cat-green/40 text-cat-green transition-colors hidden xl:flex items-center gap-1"
            >
              <span>Ack All ({unacknowledgedCount})</span>
            </button>
          )}

          <div className="h-4 w-px bg-cat-border hidden sm:block" />

          {/* Voice Settings Pill */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded border transition-colors ${
              isSpeaking
                ? 'bg-cat-yellow/20 text-cat-yellow border-cat-yellow animate-pulse'
                : voiceSettings.enabled
                ? 'bg-cat-surface text-cat-text border-cat-border hover:border-cat-yellow/60'
                : 'bg-cat-surface text-cat-muted border-cat-border opacity-60'
            }`}
            title="Configure Voice Alerts"
          >
            {isSpeaking ? (
              <Radio className="w-3.5 h-3.5 text-cat-yellow animate-pulse" />
            ) : voiceSettings.enabled ? (
              <Volume2 className="w-3.5 h-3.5 text-cat-yellow" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-cat-muted" />
            )}
            <span className="hidden sm:inline font-bold">
              {isSpeaking ? 'Speaking' : voiceSettings.enabled ? 'Voice ON' : 'Muted'}
            </span>
            <Sliders className="w-3 h-3 text-cat-muted" />
          </button>

          {/* Shift Alert History Modal Button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="touch-btn h-8 px-2.5 rounded text-xs font-bold bg-cat-surface hover:bg-cat-yellow hover:text-cat-bg border border-cat-border text-cat-text transition-colors flex items-center gap-1.5"
            title="Open Shift Alert History & Handover Audit Trail"
          >
            <History className="w-3.5 h-3.5 text-cat-yellow" />
            <span className="hidden md:inline">Alert Log</span>
            {hasCriticalAlerts && (
              <span className="w-2 h-2 rounded-full bg-cat-red animate-ping" />
            )}
          </button>
        </div>
      </footer>

      {/* Voice Settings Modal */}
      <VoiceSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Shift Alert History Modal */}
      <AlertHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
};
