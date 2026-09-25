import React, { useState, useEffect } from 'react';
import { useVoiceAlerts } from '../../hooks/useVoiceAlerts';
import { voiceAlertService } from '../../services/voiceAlertService';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Square,
  RotateCcw,
  Sliders,
  Check,
  Radio,
} from 'lucide-react';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isOpen, onClose }) => {
  const {
    voiceSettings,
    updateVoiceSettings,
    testVoice,
    cancelVoice,
    isSpeaking,
  } = useVoiceAlerts();

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testSuccess, setTestSuccess] = useState<boolean>(false);

  useEffect(() => {
    const voices = voiceAlertService.getVoices();
    setAvailableVoices(voices);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoicesChanged = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }
  }, []);

  if (!isOpen) return null;

  const handleTest = () => {
    testVoice('Caterpillar Intelligent Voice System operational. All cab safety interlocks monitored.');
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    updateVoiceSettings({
      enabled: true,
      volume: 0.9,
      rate: 1.05,
      pitch: 1.0,
      voiceURI: null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="bg-cat-panel border-2 border-cat-yellow/60 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-cat-surface border-b border-cat-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-cat-yellow/15 border border-cat-yellow/40 text-cat-yellow">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-cat-text flex items-center gap-2">
                Cab Voice Alert Settings
              </h2>
              <p className="text-xs text-cat-muted">
                Synthesized voice priority alerts for critical and danger hazards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-cat-surface text-cat-muted hover:text-cat-text hover:bg-cat-border/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Master Enable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-cat-surface border border-cat-border">
            <div className="flex items-center space-x-3">
              {voiceSettings.enabled ? (
                <Volume2 className="w-5 h-5 text-cat-yellow" />
              ) : (
                <VolumeX className="w-5 h-5 text-cat-muted" />
              )}
              <div>
                <div className="text-sm font-bold text-cat-text">Voice Alert Announcements</div>
                <div className="text-xs text-cat-muted">
                  Spoken voice alerts for Critical and Danger conditions
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateVoiceSettings({ enabled: !voiceSettings.enabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                voiceSettings.enabled ? 'bg-cat-yellow' : 'bg-cat-border'
              }`}
            >
              <div
                className={`bg-cat-bg w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  voiceSettings.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Live Status indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded bg-cat-bg border border-cat-border/60 text-xs">
            <span className="text-cat-muted">Synthesizer Engine Status:</span>
            <div className="flex items-center space-x-1.5 font-bold">
              {isSpeaking ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-cat-yellow animate-ping" />
                  <span className="text-cat-yellow flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 animate-pulse" /> Speaking Now...
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-cat-green" />
                  <span className="text-cat-green">Idle / Ready</span>
                </>
              )}
            </div>
          </div>

          {/* Voice Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-cat-text">
              <label htmlFor="voice-volume-slider" className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cat-yellow" />
                <span>Alert Volume</span>
              </label>
              <span className="font-mono text-cat-yellow">
                {Math.round(voiceSettings.volume * 100)}%
              </span>
            </div>
            <input
              id="voice-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={voiceSettings.volume}
              disabled={!voiceSettings.enabled}
              onChange={(e) => updateVoiceSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-cat-yellow bg-cat-surface h-2 rounded-lg cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Speech Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-cat-text">
              <label htmlFor="voice-rate-slider">Speech Rate</label>
              <span className="font-mono text-cat-yellow">{voiceSettings.rate.toFixed(2)}x</span>
            </div>
            <input
              id="voice-rate-slider"
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={voiceSettings.rate}
              disabled={!voiceSettings.enabled}
              onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-cat-yellow bg-cat-surface h-2 rounded-lg cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Speech Pitch */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-cat-text">
              <label htmlFor="voice-pitch-slider">Speech Pitch</label>
              <span className="font-mono text-cat-yellow">{voiceSettings.pitch.toFixed(2)}</span>
            </div>
            <input
              id="voice-pitch-slider"
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={voiceSettings.pitch}
              disabled={!voiceSettings.enabled}
              onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-cat-yellow bg-cat-surface h-2 rounded-lg cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Synthesized Voice Selector */}
          {availableVoices.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="voice-select-dropdown" className="text-xs font-bold text-cat-text">
                Cab Speaker Voice
              </label>
              <select
                id="voice-select-dropdown"
                value={voiceSettings.voiceURI || ''}
                disabled={!voiceSettings.enabled}
                onChange={(e) => updateVoiceSettings({ voiceURI: e.target.value || null })}
                className="w-full py-2 px-3 text-xs rounded bg-cat-surface border border-cat-border text-cat-text focus:outline-none focus:border-cat-yellow font-medium disabled:opacity-40"
              >
                <option value="">Default System Voice</option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons: Test Voice & Cancel */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={!voiceSettings.enabled}
              className="flex-1 touch-btn h-10 px-4 rounded font-bold text-xs bg-cat-yellow text-cat-bg hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md"
            >
              {testSuccess ? (
                <>
                  <Check className="w-4 h-4 text-cat-bg" />
                  <span>Speaking Test Utterance...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-cat-bg" />
                  <span>Test Voice Announcement</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={cancelVoice}
                className="touch-btn h-10 px-3 rounded font-bold text-xs bg-cat-surface hover:bg-cat-red hover:text-white border border-cat-border text-cat-muted flex items-center justify-center gap-1.5 transition-colors"
                title="Silence and clear current speech"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Silence</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-cat-surface border-t border-cat-border flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-cat-muted hover:text-cat-yellow flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="touch-btn px-4 py-1.5 rounded font-bold bg-cat-surface hover:bg-cat-border text-cat-text border border-cat-border transition-colors"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
