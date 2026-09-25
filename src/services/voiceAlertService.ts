import { Alert, AlertSeverity, VoiceSettings } from '../types/alerts';

interface QueueItem {
  id: string;
  text: string;
  severity: AlertSeverity;
  priorityScore: number; // critical: 4, danger: 3, warning: 2, info: 1
  timestamp: number;
}

const STORAGE_KEY = 'cat_voice_settings';

const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: true,
  volume: 0.9,
  rate: 1.05,
  pitch: 1.0,
  voiceURI: null,
};

const SEVERITY_SCORES: Record<AlertSeverity, number> = {
  critical: 4,
  danger: 3,
  warning: 2,
  info: 1,
};

export class VoiceAlertService {
  private static instance: VoiceAlertService | null = null;
  private queue: QueueItem[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeSpeaking = false;
  private settings: VoiceSettings;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private recentSpokenHistory: Map<string, number> = new Map(); // hash/key -> timestamp
  private duplicateSuppressionMs = 15000; // 15 seconds duplicate suppression window
  private listeners: Set<(speaking: boolean) => void> = new Set();
  private settingsListeners: Set<(settings: VoiceSettings) => void> = new Set();

  private constructor() {
    this.settings = this.loadSettings();
    this.initVoices();
  }

  public static getInstance(): VoiceAlertService {
    if (!VoiceAlertService.instance) {
      VoiceAlertService.instance = new VoiceAlertService();
    }
    return VoiceAlertService.instance;
  }

  private loadSettings(): VoiceSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SETTINGS.enabled,
          volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULT_SETTINGS.volume,
          rate: typeof parsed.rate === 'number' ? parsed.rate : DEFAULT_SETTINGS.rate,
          pitch: typeof parsed.pitch === 'number' ? parsed.pitch : DEFAULT_SETTINGS.pitch,
          voiceURI: parsed.voiceURI || null,
        };
      }
    } catch (e) {
      console.warn('Failed to load voice settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      this.notifySettingsChanged();
    } catch (e) {
      console.warn('Failed to save voice settings:', e);
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const populateVoices = () => {
      this.availableVoices = window.speechSynthesis.getVoices();
    };

    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
    return this.availableVoices;
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
  }

  public subscribe(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.activeSpeaking);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeSettings(listener: (settings: VoiceSettings) => void): () => void {
    this.settingsListeners.add(listener);
    listener(this.settings);
    return () => {
      this.settingsListeners.delete(listener);
    };
  }

  private notifySpeaking(speaking: boolean): void {
    this.activeSpeaking = speaking;
    this.listeners.forEach((fn) => fn(speaking));
  }

  private notifySettingsChanged(): void {
    this.settingsListeners.forEach((fn) => fn(this.settings));
  }

  public isSpeaking(): boolean {
    return this.activeSpeaking;
  }

  /**
   * Speak an alert:
   * By default, only 'critical' and 'danger' alerts are voiced unless force is true.
   */
  public speakAlert(alert: Alert, force = false): boolean {
    if (!this.settings.enabled) return false;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

    // Only speak critical and danger alerts as per spec, unless forced (e.g. test)
    if (!force && alert.severity !== 'critical' && alert.severity !== 'danger') {
      return false;
    }

    const textToSpeak = alert.voiceText || `${alert.title}. ${alert.message}`;
    if (!textToSpeak.trim()) return false;

    // Check duplicate suppression window
    const suppressionKey = `${alert.severity}:${textToSpeak}`;
    const now = Date.now();
    const lastSpoken = this.recentSpokenHistory.get(suppressionKey);

    if (!force && lastSpoken && (now - lastSpoken) < this.duplicateSuppressionMs) {
      // Duplicate alert suppressed
      return false;
    }

    this.recentSpokenHistory.set(suppressionKey, now);
    // Cleanup old suppression history
    for (const [k, time] of this.recentSpokenHistory.entries()) {
      if (now - time > 60000) {
        this.recentSpokenHistory.delete(k);
      }
    }

    const priorityScore = SEVERITY_SCORES[alert.severity] || 1;
    const isCritical = alert.severity === 'critical';

    // If critical alert arrives while another non-critical alert is speaking:
    // CANCEL current speech immediately and preempt queue!
    if (isCritical && this.activeSpeaking && this.currentUtterance) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      this.activeSpeaking = false;
      // Prepend to top of queue
      this.queue.unshift({
        id: alert.id,
        text: textToSpeak,
        severity: alert.severity,
        priorityScore,
        timestamp: now,
      });
      this.processQueue();
      return true;
    }

    // Add to priority queue
    const item: QueueItem = {
      id: alert.id,
      text: textToSpeak,
      severity: alert.severity,
      priorityScore,
      timestamp: now,
    };

    if (isCritical) {
      // Insert before any non-critical items
      const firstNonCriticalIdx = this.queue.findIndex((q) => q.priorityScore < 4);
      if (firstNonCriticalIdx === -1) {
        this.queue.push(item);
      } else {
        this.queue.splice(firstNonCriticalIdx, 0, item);
      }
    } else {
      // Sort into queue by priority score descending, then FIFO
      let inserted = false;
      for (let i = 0; i < this.queue.length; i++) {
        if (priorityScore > this.queue[i].priorityScore) {
          this.queue.splice(i, 0, item);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        this.queue.push(item);
      }
    }

    this.processQueue();
    return true;
  }

  /**
   * Process items in the speech queue sequentially without overlapping.
   */
  private processQueue(): void {
    if (this.activeSpeaking || this.queue.length === 0) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const nextItem = this.queue.shift();
    if (!nextItem) return;

    try {
      const utterance = new SpeechSynthesisUtterance(nextItem.text);
      utterance.volume = Math.max(0, Math.min(1, this.settings.volume));
      utterance.rate = Math.max(0.5, Math.min(2, this.settings.rate));
      utterance.pitch = Math.max(0.5, Math.min(2, this.settings.pitch));

      if (this.settings.voiceURI && this.availableVoices.length > 0) {
        const matched = this.availableVoices.find((v) => v.voiceURI === this.settings.voiceURI);
        if (matched) {
          utterance.voice = matched;
        }
      }

      utterance.onstart = () => {
        this.activeSpeaking = true;
        this.currentUtterance = utterance;
        this.notifySpeaking(true);
      };

      utterance.onend = () => {
        this.activeSpeaking = false;
        this.currentUtterance = null;
        this.notifySpeaking(false);
        // Process next item after brief industrial pause
        setTimeout(() => this.processQueue(), 250);
      };

      utterance.onerror = (err) => {
        console.warn('Speech synthesis error or interrupted:', err);
        this.activeSpeaking = false;
        this.currentUtterance = null;
        this.notifySpeaking(false);
        setTimeout(() => this.processQueue(), 250);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to speak alert:', err);
      this.activeSpeaking = false;
      this.currentUtterance = null;
      this.notifySpeaking(false);
      this.processQueue();
    }
  }

  /**
   * Test alert voice announcement
   */
  public testAlert(customText = 'Caterpillar Intelligent Voice Alert System test. Status operational.'): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    this.queue = [];
    this.activeSpeaking = false;

    const testItem: Alert = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      severity: 'critical',
      module: 'B',
      title: 'Voice System Test',
      message: customText,
      voiceText: customText,
      acknowledged: true,
      escalated: false,
    };

    this.speakAlert(testItem, true);
  }

  /**
   * Cancel all current and queued announcements
   */
  public cancelAll(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.queue = [];
    window.speechSynthesis.cancel();
    this.currentUtterance = null;
    this.activeSpeaking = false;
    this.notifySpeaking(false);
  }
}

export const voiceAlertService = VoiceAlertService.getInstance();
