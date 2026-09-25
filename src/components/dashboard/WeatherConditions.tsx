import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Sun, CloudRain, CloudLightning, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';

export const WeatherConditions: React.FC = () => {
  const { telemetry } = useTelemetry();

  // Deterministic weather metrics derived from active condition
  const getWeatherData = () => {
    switch (telemetry.weatherCondition) {
      case 'Clear':
        return {
          temp: '28°C / 82°F',
          rainForecast: '0% (Dry)',
          wind: '9 km/h NW',
          mudFactor: '1.0x',
          mudStatus: 'Stable Dry Soil',
          alertMessage: null,
          badgeColor: 'bg-cat-green/20 text-cat-green border-cat-green/40',
        };
      case 'Rain':
        return {
          temp: '22°C / 72°F',
          rainForecast: '75% (Light-Mod)',
          wind: '26 km/h W',
          mudFactor: '1.15x',
          mudStatus: 'Slippery Topsoil',
          alertMessage: 'Rain active — Mud factor 1.15x applied to cycle estimates',
          badgeColor: 'bg-sky-400/20 text-sky-400 border-sky-400/40',
        };
      case 'Heavy Rain':
        return {
          temp: '19°C / 66°F',
          rainForecast: '100% (High Volume)',
          wind: '44 km/h SW',
          mudFactor: '1.4x',
          mudStatus: 'High Mud & Rutting',
          alertMessage: 'Heavy rain expected — Mud factor 1.4x',
          badgeColor: 'bg-cat-amber/20 text-cat-amber border-cat-amber/40',
        };
      case 'Storm':
        return {
          temp: '16°C / 61°F',
          rainForecast: '100% (Torrential / Lightning)',
          wind: '68 km/h S (Gusts 85)',
          mudFactor: '1.6x',
          mudStatus: 'Severe Soil Saturation',
          alertMessage: 'Severe Storm Warning — Mud factor 1.6x — Reduce speed & inspect trench walls',
          badgeColor: 'bg-cat-red/20 text-cat-red border-cat-red/40',
        };
      default:
        return {
          temp: '24°C',
          rainForecast: '0%',
          wind: '10 km/h',
          mudFactor: '1.0x',
          mudStatus: 'Normal',
          alertMessage: null,
          badgeColor: 'bg-cat-green/20 text-cat-green',
        };
    }
  };

  const weather = getWeatherData();

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          {telemetry.weatherCondition === 'Clear' && <Sun className="w-5 h-5 text-cat-yellow" />}
          {telemetry.weatherCondition === 'Rain' && <CloudRain className="w-5 h-5 text-sky-400" />}
          {telemetry.weatherCondition === 'Heavy Rain' && <CloudRain className="w-5 h-5 text-cat-amber" />}
          {telemetry.weatherCondition === 'Storm' && <CloudLightning className="w-5 h-5 text-cat-red animate-pulse" />}
          <div>
            <h2 className="text-base font-extrabold text-cat-text uppercase tracking-wide">
              Site Weather &bull; Environmental Conditions
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              Telematics Weather Radar &bull; Worksite Trench Impact
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider border ${weather.badgeColor}`}>
          {telemetry.weatherCondition}
        </span>
      </div>

      {/* Prominent Weather Alert Banner when condition is degraded */}
      {weather.alertMessage && (
        <div
          className={`p-2.5 rounded-md border flex items-center space-x-2 text-xs font-black tracking-wide ${
            telemetry.weatherCondition === 'Storm'
              ? 'bg-cat-red/20 border-cat-red text-cat-red animate-pulse'
              : 'bg-cat-amber/20 border-cat-amber text-cat-amber'
          }`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{weather.alertMessage}</span>
        </div>
      )}

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        {/* Temperature */}
        <div className="p-2.5 rounded bg-cat-surface/50 border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Ambient Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <span className="text-base font-black telemetry-readout text-cat-text mt-1 block">
            {weather.temp}
          </span>
          <span className="text-[10px] text-cat-muted">Site Sensor Barometer</span>
        </div>

        {/* Rain Forecast */}
        <div className="p-2.5 rounded bg-cat-surface/50 border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Rain Forecast</span>
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className="text-base font-black telemetry-readout text-cat-text mt-1 block">
            {weather.rainForecast}
          </span>
          <span className="text-[10px] text-cat-muted">Doppler Radar Model</span>
        </div>

        {/* Wind Speed */}
        <div className="p-2.5 rounded bg-cat-surface/50 border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Wind Velocity</span>
            <Wind className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <span className="text-base font-black telemetry-readout text-cat-text mt-1 block">
            {weather.wind}
          </span>
          <span className="text-[10px] text-cat-muted">Anemometer Mast</span>
        </div>

        {/* Mud Factor Multiplier */}
        <div className="p-2.5 rounded bg-cat-surface/50 border border-cat-yellow/30 bg-cat-yellow/5">
          <div className="flex items-center justify-between text-cat-yellow text-[10px] uppercase font-black">
            <span>Mud Factor</span>
            <span className="text-xs font-mono">SOIL</span>
          </div>
          <span className="text-base font-black telemetry-readout text-cat-yellow mt-1 block">
            {weather.mudFactor}
          </span>
          <span className="text-[10px] text-cat-muted truncate block">{weather.mudStatus}</span>
        </div>
      </div>
    </div>
  );
};
