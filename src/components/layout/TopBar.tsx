import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useVoiceAlerts } from '../../hooks/useVoiceAlerts';
import { VoiceSettings } from '../settings/VoiceSettings';
import { evaluateMachineSafety } from '../../lib/calculations';
import { useShiftClock } from '../../hooks/useShiftClock';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  SlidersHorizontal,
  User,
  Clock,
  Sun,
  CloudRain,
  CloudLightning,
  HeartPulse,
  Droplet,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';

interface TopBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const { telemetry } = useTelemetry();
  const { elapsedFormatted } = useShiftClock();
  const { voiceSettings, isSpeaking } = useVoiceAlerts();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  const safetyLevel = evaluateMachineSafety(telemetry);

  // Derived 5-Subsystem Machine Health Calculations
  // 1. Engine Oil Pressure status
  const oilStatus =
    telemetry.oilPressure < 25 || telemetry.oilPressure > 70
      ? 'danger'
      : telemetry.oilPressure < 35
      ? 'caution'
      : 'safe';

  // 2. Hydraulic Fluid Temperature (derived from engine temp & hydraulic pressure load)
  const derivedHydTemp = Math.round(
    0.65 * telemetry.engineTemp + (telemetry.hydraulicPressure / 400) * 35
  );
  const hydTempStatus =
    derivedHydTemp > 100 ? 'danger' : derivedHydTemp > 85 ? 'caution' : 'safe';

  // 3. Coolant Level status
  const coolantStatus =
    telemetry.coolantLevel < 25 ? 'danger' : telemetry.coolantLevel < 50 ? 'caution' : 'safe';

  // 4. Seal Integrity (derived: degrades under extreme hydraulic pressure > 350 bar)
  let sealIntegrity = 99;
  if (telemetry.hydraulicPressure > 370) {
    sealIntegrity = 74;
  } else if (telemetry.hydraulicPressure > 340) {
    sealIntegrity = 86;
  } else if (telemetry.hydraulicPressure > 300) {
    sealIntegrity = 94;
  }
  const sealStatus = sealIntegrity < 80 ? 'danger' : sealIntegrity < 90 ? 'caution' : 'safe';

  // 5. Track Tension (derived: reacts to speed, slope angle, and g-force)
  let trackTensionLabel = 'Calibrated';
  let trackTensionStatus: 'safe' | 'caution' | 'danger' = 'safe';
  if (telemetry.gForce > 2.4 || (telemetry.speed > 22 && telemetry.slopeAngle > 18)) {
    trackTensionLabel = 'High Strain';
    trackTensionStatus = 'danger';
  } else if (telemetry.speed > 16 || telemetry.slopeAngle > 15 || telemetry.gForce > 1.8) {
    trackTensionLabel = 'Loaded';
    trackTensionStatus = 'caution';
  }

  // Weather Icon & Styling
  const renderWeatherBadge = () => {
    switch (telemetry.weatherCondition) {
      case 'Clear':
        return (
          <div className="flex items-center space-x-1.5 text-xs font-bold text-cat-yellow bg-cat-surface px-2 py-1 rounded border border-cat-yellow/30">
            <Sun className="w-3.5 h-3.5 text-cat-yellow" />
            <span>Clear</span>
          </div>
        );
      case 'Rain':
        return (
          <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400 bg-cat-surface px-2 py-1 rounded border border-sky-400/40">
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span>Rain</span>
          </div>
        );
      case 'Heavy Rain':
        return (
          <div className="flex items-center space-x-1.5 text-xs font-bold text-cat-amber bg-cat-amber/10 px-2 py-1 rounded border border-cat-amber/40 animate-pulse-subtle">
            <CloudRain className="w-3.5 h-3.5 text-cat-amber" />
            <span>Heavy Rain</span>
          </div>
        );
      case 'Storm':
        return (
          <div className="flex items-center space-x-1.5 text-xs font-black text-cat-red bg-cat-red/10 px-2 py-1 rounded border border-cat-red/40 animate-pulse">
            <CloudLightning className="w-3.5 h-3.5 text-cat-red" />
            <span>Storm Alert</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Posture Badge & Styling
  const renderPostureBadge = () => {
    switch (telemetry.postureState) {
      case 'Good':
        return (
          <div className="flex items-center space-x-1 text-xs font-bold text-cat-green bg-cat-surface px-2 py-1 rounded border border-cat-green/30">
            <CheckCircle2 className="w-3 h-3 text-cat-green" />
            <span className="hidden xl:inline">Posture:</span>
            <span>Good</span>
          </div>
        );
      case 'Slouching':
        return (
          <div className="flex items-center space-x-1 text-xs font-bold text-cat-amber bg-cat-amber/15 px-2 py-1 rounded border border-cat-amber/40 animate-pulse-subtle">
            <AlertTriangle className="w-3 h-3 text-cat-amber" />
            <span className="hidden xl:inline">Posture:</span>
            <span>Slouch</span>
          </div>
        );
      case 'Leaning Left':
      case 'Leaning Right':
        return (
          <div className="flex items-center space-x-1 text-xs font-black text-cat-red bg-cat-red/15 px-2 py-1 rounded border border-cat-red/40 animate-pulse">
            <AlertOctagon className="w-3 h-3 text-cat-red" />
            <span className="hidden xl:inline">Posture:</span>
            <span>{telemetry.postureState}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-cat-panel border-b-2 border-cat-border px-3 md:px-4 flex items-center justify-between select-none z-30 flex-shrink-0">
      {/* 1. Brand & Machine ID */}
      <div className="flex items-center space-x-3">
        <div className="bg-cat-yellow text-slate-950 font-black px-2.5 py-1 rounded text-lg tracking-tighter flex items-center shadow-md">
          <span className="font-extrabold text-xl leading-none">CAT</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-cat-yellow font-extrabold">
            Intelligent Companion
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="text-sm md:text-base font-extrabold text-cat-text tracking-wide telemetry-readout">
              {telemetry.machineId}
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-cat-surface text-cat-muted border border-cat-border">
              336 EXCAVATOR
            </span>
          </div>
        </div>
      </div>

      {/* 2. Operator & Shift Info */}
      <div className="hidden lg:flex items-center space-x-3 bg-cat-bg/80 px-3 py-1.5 rounded-md border border-cat-border/60">
        <div className="flex items-center space-x-1.5 text-xs">
          <User className="w-3.5 h-3.5 text-cat-yellow" />
          <span className="text-cat-muted">Op:</span>
          <span className="font-bold text-cat-text truncate max-w-[120px]">
            {telemetry.operatorName}
          </span>
          <span className="text-[11px] text-cat-muted telemetry-readout">
            ({telemetry.operatorId})
          </span>
        </div>

        <div className="h-3.5 w-px bg-cat-border" />

        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-cat-muted">Shift:</span>
          <span className="font-bold text-cat-yellow uppercase text-[11px] tracking-wider bg-cat-surface px-1.5 py-0.5 rounded border border-cat-yellow/30">
            {telemetry.shiftType}
          </span>
        </div>

        <div className="h-3.5 w-px bg-cat-border" />

        {/* Global Machine Safety Beacon */}
        <div className="flex items-center space-x-1.5">
          {safetyLevel === 'safe' && (
            <>
              <div className="w-2 h-2 rounded-full bg-cat-green animate-beacon shadow-cat-safe" />
              <ShieldCheck className="w-3.5 h-3.5 text-cat-green" />
              <span className="text-[11px] font-bold uppercase text-cat-green">Nominal</span>
            </>
          )}
          {safetyLevel === 'caution' && (
            <>
              <div className="w-2 h-2 rounded-full bg-cat-amber animate-beacon" />
              <AlertTriangle className="w-3.5 h-3.5 text-cat-amber" />
              <span className="text-[11px] font-bold uppercase text-cat-amber">Caution</span>
            </>
          )}
          {safetyLevel === 'danger' && (
            <>
              <div className="w-2 h-2 rounded-full bg-cat-red animate-beacon shadow-cat-danger" />
              <AlertOctagon className="w-3.5 h-3.5 text-cat-red" />
              <span className="text-[11px] font-bold uppercase text-cat-red">Hazard</span>
            </>
          )}
        </div>
      </div>

      {/* 3. 5-Subsystem Machine Health Indicators (Visible on Ultra-wide displays) */}
      <div className="hidden 2xl:flex items-center space-x-2 bg-cat-bg/90 px-3 py-1 rounded-md border border-cat-border/70">
        <div className="flex items-center space-x-1 text-[11px] font-extrabold uppercase tracking-wider text-cat-muted mr-1">
          <HeartPulse className="w-3.5 h-3.5 text-cat-yellow" />
          <span>Health:</span>
        </div>

        {/* Subsystem 1: Oil Pressure */}
        <div
          className={`flex items-center space-x-1 text-[11px] font-bold px-1.5 py-0.5 rounded border ${
            oilStatus === 'safe'
              ? 'bg-cat-surface text-cat-text border-cat-border'
              : oilStatus === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber/40'
              : 'bg-cat-red/20 text-cat-red border-cat-red/40 animate-pulse'
          }`}
          title={`Engine Oil Pressure: ${telemetry.oilPressure} psi`}
        >
          <Droplet className="w-3 h-3 text-cat-yellow" />
          <span>Oil: {telemetry.oilPressure}psi</span>
        </div>

        {/* Subsystem 2: Hydraulic Fluid Temp */}
        <div
          className={`flex items-center space-x-1 text-[11px] font-bold px-1.5 py-0.5 rounded border ${
            hydTempStatus === 'safe'
              ? 'bg-cat-surface text-cat-text border-cat-border'
              : hydTempStatus === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber/40'
              : 'bg-cat-red/20 text-cat-red border-cat-red/40 animate-pulse'
          }`}
          title={`Hydraulic Fluid Temp: ${derivedHydTemp}°C`}
        >
          <Flame className="w-3 h-3 text-cat-yellow" />
          <span>Hyd: {derivedHydTemp}°C</span>
        </div>

        {/* Subsystem 3: Coolant Level */}
        <div
          className={`flex items-center space-x-1 text-[11px] font-bold px-1.5 py-0.5 rounded border ${
            coolantStatus === 'safe'
              ? 'bg-cat-surface text-cat-text border-cat-border'
              : coolantStatus === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber/40'
              : 'bg-cat-red/20 text-cat-red border-cat-red/40 animate-pulse'
          }`}
          title={`Coolant Level: ${telemetry.coolantLevel}%`}
        >
          <span>Coolant: {telemetry.coolantLevel}%</span>
        </div>

        {/* Subsystem 4: Seal Integrity */}
        <div
          className={`flex items-center space-x-1 text-[11px] font-bold px-1.5 py-0.5 rounded border ${
            sealStatus === 'safe'
              ? 'bg-cat-surface text-cat-text border-cat-border'
              : sealStatus === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber/40'
              : 'bg-cat-red/20 text-cat-red border-cat-red/40 animate-pulse'
          }`}
          title={`Hydraulic Seal Integrity: ${sealIntegrity}%`}
        >
          <span>Seal: {sealIntegrity}%</span>
        </div>

        {/* Subsystem 5: Track Tension */}
        <div
          className={`flex items-center space-x-1 text-[11px] font-bold px-1.5 py-0.5 rounded border ${
            trackTensionStatus === 'safe'
              ? 'bg-cat-surface text-cat-text border-cat-border'
              : trackTensionStatus === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber/40'
              : 'bg-cat-red/20 text-cat-red border-cat-red/40 animate-pulse'
          }`}
          title={`Undercarriage Track Tension: ${trackTensionLabel}`}
        >
          <span>Track: {trackTensionLabel}</span>
        </div>
      </div>

      {/* 4. Weather, Posture, and Voice Audio Badges */}
      <div className="flex items-center space-x-2">
        {renderWeatherBadge()}
        {renderPostureBadge()}

        {/* Voice System Indicator Button */}
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded border transition-colors ${
            isSpeaking
              ? 'bg-cat-yellow/20 text-cat-yellow border-cat-yellow animate-pulse'
              : voiceSettings.enabled
              ? 'bg-cat-surface text-cat-text border-cat-border hover:border-cat-yellow/50'
              : 'bg-cat-surface text-cat-muted border-cat-border opacity-60'
          }`}
          title="Cab Voice Alert Settings"
        >
          {isSpeaking ? (
            <Radio className="w-3.5 h-3.5 text-cat-yellow animate-pulse" />
          ) : voiceSettings.enabled ? (
            <Volume2 className="w-3.5 h-3.5 text-cat-yellow" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-cat-muted" />
          )}
          <span className="hidden lg:inline text-[11px]">
            {isSpeaking ? 'Speaking' : voiceSettings.enabled ? 'Voice' : 'Muted'}
          </span>
        </button>
      </div>

      {/* 5. Shift Clock & Simulator Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Shift Elapsed Clock */}
        <div
          className="flex items-center space-x-1.5 bg-cat-surface px-2.5 py-1.5 rounded border border-cat-border text-xs"
          title="Elapsed Active Shift Time"
        >
          <Clock className="w-3.5 h-3.5 text-cat-yellow" />
          <span className="hidden sm:inline text-cat-muted font-bold">Shift:</span>
          <span className="font-extrabold telemetry-readout text-cat-text tracking-wider">
            {elapsedFormatted}
          </span>
        </div>

        {/* Simulator Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`touch-btn px-3 py-1.5 rounded text-xs md:text-sm font-bold flex items-center space-x-1.5 border transition-all ${
            isSidebarOpen
              ? 'bg-cat-yellow text-slate-950 border-cat-yellow font-black shadow-cat-glow'
              : 'bg-cat-surface text-cat-text border-cat-border hover:border-cat-yellow/70 hover:text-cat-yellow'
          }`}
          title="Toggle Telematics Simulator Panel"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">SIMULATOR</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isSidebarOpen ? 'bg-slate-950' : 'bg-cat-yellow'
            }`}
          />
        </button>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </header>
  );
};
