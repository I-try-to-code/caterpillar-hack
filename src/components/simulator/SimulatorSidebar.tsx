import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { initialTelemetryState } from '../../data/telemetry';
import { TelemetryState, WeatherCondition, PostureState } from '../../types/telemetry';
import { TelemetrySlider } from './TelemetrySlider';
import { TelemetryToggle } from './TelemetryToggle';
import { TelemetrySelect, SelectOption } from './TelemetrySelect';
import { SimulatorControl } from './SimulatorControl';
import {
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  Play,
  Pause,
  Flame,
  Zap,
  Activity,
  Compass,
  Eye,
  ShieldAlert,
  Thermometer,
  Gauge,
  Droplet,
  CloudRain,
  UserX,
  UserCheck,
  Timer,
  PhoneCall,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface SimulatorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isSimRunning?: boolean;
  onToggleSim?: () => void;
  onOpenDemoModal?: () => void;
}

const WEATHER_OPTIONS: SelectOption[] = [
  { value: 'Clear', label: 'Clear Skies (Optimal)', badge: 'safe' },
  { value: 'Rain', label: 'Moderate Rain (Wet Soil)', badge: 'caution' },
  { value: 'Heavy Rain', label: 'Heavy Rain (Mud Hazards)', badge: 'danger' },
  { value: 'Storm', label: 'Severe Storm (Lightning / High Winds)', badge: 'danger' },
];

const POSTURE_OPTIONS: SelectOption[] = [
  { value: 'Good', label: 'Good Ergonomics (Centered)', badge: 'safe' },
  { value: 'Slouching', label: 'Slouching (Spinal Fatigue)', badge: 'caution' },
  { value: 'Leaning Left', label: 'Leaning Left (Unbalanced)', badge: 'danger' },
  { value: 'Leaning Right', label: 'Leaning Right (Unbalanced)', badge: 'danger' },
];

export const SimulatorSidebar: React.FC<SimulatorSidebarProps> = ({
  isOpen,
  onClose,
  isSimRunning = true,
  onToggleSim,
  onOpenDemoModal,
}) => {
  const { telemetry, updateTelemetry, setTelemetry, resetTelemetry } = useTelemetry();
  const [escalatedMessage, setEscalatedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset Scenario Handlers
  const handleApplyPreset = (_name: string, overrides: Partial<TelemetryState>) => {
    updateTelemetry(overrides);
  };

  const handleEscalateSupervisor = () => {
    setEscalatedMessage(
      `CRITICAL ALERT ESCALATED TO SUPERVISOR (Site Office Channel 4) for Machine ${telemetry.machineId} & Operator ${telemetry.operatorName}`
    );
    setTimeout(() => {
      setEscalatedMessage(null);
    }, 6000);
  };

  // Status evaluators for individual controls
  const rpmStatus =
    telemetry.engineRPM > 2200 ? 'danger' : telemetry.engineRPM > 1900 ? 'caution' : 'safe';
  const proximityStatus =
    telemetry.proximityDistance < 3.0 ? 'danger' : telemetry.proximityDistance < 5.0 ? 'caution' : 'safe';
  const slopeStatus =
    telemetry.slopeAngle > 20 ? 'danger' : telemetry.slopeAngle > 12 ? 'caution' : 'safe';
  const bucketStatus =
    telemetry.bucketHeight > 4.2 ? 'danger' : telemetry.bucketHeight > 3.2 ? 'caution' : 'safe';
  const idleStatus =
    telemetry.idleTimeMinutes > 12 ? 'danger' : telemetry.idleTimeMinutes > 8 ? 'caution' : 'safe';
  const gForceStatus =
    telemetry.gForce > 2.4 ? 'danger' : telemetry.gForce > 1.8 ? 'caution' : 'safe';
  const hydStatus =
    telemetry.hydraulicPressure > 360 ? 'danger' : telemetry.hydraulicPressure > 320 ? 'caution' : 'safe';
  const trenchStatus =
    telemetry.trenchDistance < 3.0 ? 'danger' : telemetry.trenchDistance < 5.0 ? 'caution' : 'safe';
  const tempStatus =
    telemetry.engineTemp > 115 ? 'danger' : telemetry.engineTemp > 98 ? 'caution' : 'safe';
  const coolantStatus =
    telemetry.coolantLevel < 25 ? 'danger' : telemetry.coolantLevel < 50 ? 'caution' : 'safe';
  const oilStatus =
    telemetry.oilPressure < 25 || telemetry.oilPressure > 70
      ? 'danger'
      : telemetry.oilPressure < 35
      ? 'caution'
      : 'safe';
  const speedStatus =
    telemetry.speed > 24 ? 'danger' : telemetry.speed > 16 ? 'caution' : 'safe';
  const personnelStatus = telemetry.nearbyPersonnel > 0 ? 'danger' : 'safe';
  const postureStatus =
    telemetry.postureState === 'Good'
      ? 'safe'
      : telemetry.postureState === 'Slouching'
      ? 'caution'
      : 'danger';
  const weatherStatus =
    telemetry.weatherCondition === 'Clear'
      ? 'safe'
      : telemetry.weatherCondition === 'Rain'
      ? 'caution'
      : 'danger';
  const opTimeStatus =
    telemetry.continuousOpMinutes > 110 ? 'danger' : telemetry.continuousOpMinutes > 90 ? 'caution' : 'safe';

  return (
    <aside
      className="w-80 sm:w-96 md:w-[420px] bg-cat-panel border-r-2 border-cat-border flex flex-col h-full flex-shrink-0 select-none z-20 shadow-2xl transition-all duration-300"
      aria-label="Live Telematics Simulator"
    >
      {/* 1. Header with Collapse & Live Status */}
      <div className="p-3.5 border-b-2 border-cat-border bg-cat-surface/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-cat-yellow text-cat-bg font-black">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-cat-yellow">
                Judge &amp; Demo Console
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-black bg-cat-green/20 text-cat-green border border-cat-green/30 animate-pulse">
                INJECTION ACTIVE
              </span>
            </div>
            <h2 className="text-base font-extrabold text-cat-text tracking-tight">
              Live Telematics Simulator
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="touch-btn h-10 w-10 rounded-md hover:bg-cat-surface text-cat-muted hover:text-cat-text border border-transparent hover:border-cat-border flex items-center justify-center transition-colors"
          title="Collapse Simulator"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* 2. Simulation Engine Status & Reset Bar */}
      <div className="px-3.5 py-2 bg-cat-bg border-b border-cat-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {onToggleSim && (
            <button
              type="button"
              onClick={onToggleSim}
              className={`touch-btn h-8 px-2.5 text-xs font-bold rounded flex items-center space-x-1.5 border transition-all ${
                isSimRunning
                  ? 'bg-cat-green/20 text-cat-green border-cat-green/40'
                  : 'bg-cat-amber/20 text-cat-amber border-cat-amber/40'
              }`}
              title="Pause or Resume Background Derived Telemetry Increment"
            >
              {isSimRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Sim: Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Sim: Paused</span>
                </>
              )}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={resetTelemetry}
          className="touch-btn h-8 px-2.5 text-xs font-extrabold text-cat-yellow bg-cat-surface hover:bg-cat-hover rounded border border-cat-border hover:border-cat-yellow transition-all flex items-center space-x-1.5"
          title="Reset Simulator to Default Safe Operating Parameters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 3. Demo Presets Section */}
      <div className="p-3 bg-cat-surface/40 border-b border-cat-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-cat-yellow flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Judge Demo Scenarios
          </span>
          {onOpenDemoModal && (
            <button
              type="button"
              onClick={onOpenDemoModal}
              className="text-[10px] text-cat-yellow font-extrabold uppercase hover:underline flex items-center gap-1"
            >
              <span>Guided View</span>
              <Sparkles className="w-3 h-3" />
            </button>
          )}
        </div>

        {onOpenDemoModal && (
          <button
            type="button"
            onClick={onOpenDemoModal}
            className="w-full touch-btn h-8 px-2 text-xs font-black rounded bg-cat-yellow text-slate-950 hover:bg-yellow-400 flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Judge Demo Controller</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {/* 1. Safe */}
          <button
            type="button"
            onClick={() => setTelemetry(initialTelemetryState)}
            className="touch-btn h-9 px-2 text-[11px] font-bold rounded bg-cat-surface border border-cat-green/40 text-cat-green hover:bg-cat-green/20 transition-colors"
          >
            1. Safe (Nominal)
          </button>

          {/* 2. Proximity 3m */}
          <button
            type="button"
            onClick={() =>
              handleApplyPreset('Proximity Breach (3m)', {
                proximityDistance: 3.0,
                nearbyPersonnel: 1,
              })
            }
            className="touch-btn h-9 px-2 text-[11px] font-bold rounded bg-cat-surface border border-cat-red/40 text-cat-red hover:bg-cat-red/20 transition-colors"
          >
            2. Proximity (3m)
          </button>

          {/* 3. Rollover 27° */}
          <button
            type="button"
            onClick={() =>
              handleApplyPreset('Rollover Risk (27°)', {
                slopeAngle: 27.0,
                bucketHeight: 2.8,
              })
            }
            className="touch-btn h-9 px-2 text-[11px] font-bold rounded bg-cat-surface border border-cat-red/40 text-cat-red hover:bg-cat-red/20 transition-colors"
          >
            3. Rollover (27°)
          </button>

          {/* 4. Seatbelt Interlock */}
          <button
            type="button"
            onClick={() =>
              handleApplyPreset('Seatbelt Off In Motion', {
                seatbeltFastened: false,
                speed: 12.0,
                engineRPM: 1850,
              })
            }
            className="touch-btn h-9 px-2 text-[11px] font-bold rounded bg-cat-surface border border-cat-red/40 text-cat-red hover:bg-cat-red/20 transition-colors"
          >
            4. Seatbelt Lock
          </button>

          {/* 5. Excessive Idle 10m */}
          <button
            type="button"
            onClick={() =>
              handleApplyPreset('Excessive Idle (10m)', {
                idleTimeMinutes: 10.0,
                engineRPM: 750,
                speed: 0,
              })
            }
            className="touch-btn h-9 px-2 text-[11px] font-bold rounded bg-cat-surface border border-cat-amber/40 text-cat-amber hover:bg-cat-amber/20 transition-colors"
          >
            5. Idle (10 min)
          </button>

          {/* 6. Multi-Hazard (Primary Demo) */}
          <button
            type="button"
            onClick={() =>
              handleApplyPreset('Multi-Hazard Event', {
                proximityDistance: 3.0,
                slopeAngle: 27.0,
                seatbeltFastened: false,
                speed: 8.5,
                nearbyPersonnel: 1,
                bucketHeight: 2.5,
              })
            }
            className="touch-btn h-9 px-2 text-[11px] font-black rounded bg-cat-red text-white hover:bg-red-700 transition-colors shadow-cat-danger"
          >
            6. Multi-Hazard ★
          </button>
        </div>
      </div>

      {/* Escalation Feedback Notification */}
      {escalatedMessage && (
        <div className="p-3 bg-cat-red/20 border-b-2 border-cat-red text-cat-red text-xs font-bold flex items-center space-x-2 animate-bounce">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{escalatedMessage}</span>
        </div>
      )}

      {/* 4. Controls Scrollable Body (All 17 Specified Controls) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* Section: Powertrain & Mechanical */}
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-cat-yellow flex items-center space-x-1.5 pt-1">
          <Activity className="w-3.5 h-3.5" />
          <span>1. Powertrain &amp; Engine Telematics</span>
        </div>

        {/* 1. Engine RPM (0-2500) */}
        <SimulatorControl icon={Gauge} status={rpmStatus}>
          <TelemetrySlider
            label="Engine RPM"
            value={telemetry.engineRPM}
            min={0}
            max={2500}
            step={25}
            unit="RPM"
            status={rpmStatus}
            onChange={(val) => updateTelemetry({ engineRPM: val })}
          />
        </SimulatorControl>

        {/* 10. Engine Temperature (60-130°C) */}
        <SimulatorControl icon={Thermometer} status={tempStatus}>
          <TelemetrySlider
            label="Engine Temperature"
            value={telemetry.engineTemp}
            min={60}
            max={130}
            step={1}
            unit="°C"
            status={tempStatus}
            onChange={(val) => updateTelemetry({ engineTemp: val })}
          />
        </SimulatorControl>

        {/* 11. Coolant Level (0-100%) */}
        <SimulatorControl icon={Droplet} status={coolantStatus}>
          <TelemetrySlider
            label="Coolant Level"
            value={telemetry.coolantLevel}
            min={0}
            max={100}
            step={1}
            unit="%"
            status={coolantStatus}
            onChange={(val) => updateTelemetry({ coolantLevel: val })}
          />
        </SimulatorControl>

        {/* 12. Oil Pressure (0-80 psi) */}
        <SimulatorControl icon={Droplet} status={oilStatus}>
          <TelemetrySlider
            label="Oil Pressure"
            value={telemetry.oilPressure}
            min={0}
            max={80}
            step={1}
            unit="psi"
            status={oilStatus}
            onChange={(val) => updateTelemetry({ oilPressure: val })}
          />
        </SimulatorControl>

        {/* 8. Hydraulic Pressure (0-400 bar) */}
        <SimulatorControl icon={Flame} status={hydStatus}>
          <TelemetrySlider
            label="Hydraulic Pressure"
            value={telemetry.hydraulicPressure}
            min={0}
            max={400}
            step={5}
            unit="bar"
            status={hydStatus}
            onChange={(val) => updateTelemetry({ hydraulicPressure: val })}
          />
        </SimulatorControl>

        {/* Section: Kinematics & Excavation */}
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-cat-yellow flex items-center space-x-1.5 pt-3">
          <Compass className="w-3.5 h-3.5" />
          <span>2. Kinematics, Speeds &amp; Implements</span>
        </div>

        {/* 13. Speed (0-30 km/h) */}
        <SimulatorControl icon={Gauge} status={speedStatus}>
          <TelemetrySlider
            label="Machine Ground Speed"
            value={telemetry.speed}
            min={0}
            max={30}
            step={0.5}
            unit="km/h"
            status={speedStatus}
            formatValue={(v) => v.toFixed(1)}
            onChange={(val) => updateTelemetry({ speed: val })}
          />
        </SimulatorControl>

        {/* 5. Bucket Height (0-5m) */}
        <SimulatorControl icon={Activity} status={bucketStatus}>
          <TelemetrySlider
            label="Bucket Height"
            value={telemetry.bucketHeight}
            min={0}
            max={5}
            step={0.1}
            unit="m"
            status={bucketStatus}
            formatValue={(v) => v.toFixed(1)}
            onChange={(val) => updateTelemetry({ bucketHeight: val })}
          />
        </SimulatorControl>

        {/* 7. G-Force (0-3g) */}
        <SimulatorControl icon={Activity} status={gForceStatus}>
          <TelemetrySlider
            label="Dynamic G-Force & Impact"
            value={telemetry.gForce}
            min={0}
            max={3}
            step={0.05}
            unit="g"
            status={gForceStatus}
            formatValue={(v) => v.toFixed(2)}
            onChange={(val) => updateTelemetry({ gForce: val })}
          />
        </SimulatorControl>

        {/* Section: Cab Safety, Perimeters & Hazards */}
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-cat-yellow flex items-center space-x-1.5 pt-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>3. Zone Safety, Perimeters &amp; Interlocks</span>
        </div>

        {/* 4. Seatbelt (Toggle On/Off) */}
        <SimulatorControl
          icon={UserCheck}
          status={telemetry.seatbeltFastened ? 'safe' : 'danger'}
        >
          <TelemetryToggle
            label="Operator Seatbelt Interlock"
            checked={telemetry.seatbeltFastened}
            activeText="LATCHED (SAFE)"
            inactiveText="UNLATCHED (DANGER)"
            dangerWhenFalse={true}
            onChange={(checked) => updateTelemetry({ seatbeltFastened: checked })}
          />
        </SimulatorControl>

        {/* 2. Proximity Distance (0-30m) */}
        <SimulatorControl icon={Eye} status={proximityStatus}>
          <TelemetrySlider
            label="Proximity Distance (Perimeter Radar)"
            value={telemetry.proximityDistance}
            min={0}
            max={30}
            step={0.2}
            unit="m"
            status={proximityStatus}
            formatValue={(v) => v.toFixed(1)}
            onChange={(val) => updateTelemetry({ proximityDistance: val })}
          />
        </SimulatorControl>

        {/* 9. Trench Distance (0-10 ft) */}
        <SimulatorControl icon={Eye} status={trenchStatus}>
          <TelemetrySlider
            label="Trench Edge Distance"
            value={telemetry.trenchDistance}
            min={0}
            max={10}
            step={0.2}
            unit="ft"
            status={trenchStatus}
            formatValue={(v) => v.toFixed(1)}
            onChange={(val) => updateTelemetry({ trenchDistance: val })}
          />
        </SimulatorControl>

        {/* 3. Slope Angle (0-45°) */}
        <SimulatorControl icon={Compass} status={slopeStatus}>
          <TelemetrySlider
            label="Slope Inclinometer Angle"
            value={telemetry.slopeAngle}
            min={0}
            max={45}
            step={0.5}
            unit="°"
            status={slopeStatus}
            formatValue={(v) => v.toFixed(1)}
            onChange={(val) => updateTelemetry({ slopeAngle: val })}
          />
        </SimulatorControl>

        {/* 15. Nearby Personnel (0-10) */}
        <SimulatorControl icon={UserX} status={personnelStatus}>
          <TelemetrySlider
            label="Nearby Personnel Detected"
            value={telemetry.nearbyPersonnel}
            min={0}
            max={10}
            step={1}
            unit="pers"
            status={personnelStatus}
            onChange={(val) => updateTelemetry({ nearbyPersonnel: val })}
          />
        </SimulatorControl>

        {/* Section: Environmental & Operator Ergonomics */}
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-cat-yellow flex items-center space-x-1.5 pt-3">
          <CloudRain className="w-3.5 h-3.5" />
          <span>4. Environment &amp; Operator Monitoring</span>
        </div>

        {/* 14. Weather Condition (Dropdown) */}
        <SimulatorControl icon={CloudRain} status={weatherStatus}>
          <TelemetrySelect
            label="Site Weather Condition"
            value={telemetry.weatherCondition}
            options={WEATHER_OPTIONS}
            status={weatherStatus}
            onChange={(val) =>
              updateTelemetry({ weatherCondition: val as WeatherCondition })
            }
          />
        </SimulatorControl>

        {/* 16. Posture State (Dropdown) */}
        <SimulatorControl icon={Activity} status={postureStatus}>
          <TelemetrySelect
            label="Driver Ergonomic Posture"
            value={telemetry.postureState}
            options={POSTURE_OPTIONS}
            status={postureStatus}
            onChange={(val) =>
              updateTelemetry({ postureState: val as PostureState })
            }
          />
        </SimulatorControl>

        {/* 6. Idle Timer (0-15 min) */}
        <SimulatorControl icon={Timer} status={idleStatus}>
          <TelemetrySlider
            label="Continuous Idle Timer"
            value={telemetry.idleTimeMinutes}
            min={0}
            max={15}
            step={0.5}
            unit="min"
            status={idleStatus}
            formatValue={(v) => v.toFixed(1)}
            onChange={(val) => updateTelemetry({ idleTimeMinutes: val })}
          />
        </SimulatorControl>

        {/* 17. Continuous Operating Time (0-120 min) */}
        <SimulatorControl icon={Timer} status={opTimeStatus}>
          <TelemetrySlider
            label="Continuous Operating Time"
            value={telemetry.continuousOpMinutes}
            min={0}
            max={120}
            step={1}
            unit="min"
            status={opTimeStatus}
            onChange={(val) => updateTelemetry({ continuousOpMinutes: val })}
          />
        </SimulatorControl>
      </div>

      {/* 5. Escalate to Supervisor & Bottom Actions */}
      <div className="p-3.5 border-t-2 border-cat-border bg-cat-surface flex flex-col gap-2">
        <button
          type="button"
          onClick={handleEscalateSupervisor}
          className="touch-btn h-12 w-full px-4 rounded-md bg-cat-red hover:bg-cat-redDark text-white font-extrabold uppercase tracking-wide text-sm flex items-center justify-center space-x-2 shadow-cat-danger transition-colors"
        >
          <PhoneCall className="w-5 h-5" />
          <span>Escalate to Supervisor</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-cat-muted px-1">
          <span>CAN-Bus Broadcast: Instant</span>
          <span className="flex items-center gap-1 text-cat-green">
            <CheckCircle className="w-3 h-3" /> Ready
          </span>
        </div>
      </div>
    </aside>
  );
};
