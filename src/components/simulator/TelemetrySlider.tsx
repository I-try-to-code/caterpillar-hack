import React from 'react';

interface TelemetrySliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
  status?: 'safe' | 'caution' | 'danger';
  formatValue?: (val: number) => string;
}

export const TelemetrySlider: React.FC<TelemetrySliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  status = 'safe',
  formatValue,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const trackColor =
    status === 'danger'
      ? 'accent-cat-red'
      : status === 'caution'
      ? 'accent-cat-amber'
      : 'accent-cat-yellow';

  const badgeColor =
    status === 'danger'
      ? 'bg-cat-red/20 text-cat-red border-cat-red/40'
      : status === 'caution'
      ? 'bg-cat-amber/20 text-cat-amber border-cat-amber/40'
      : 'bg-cat-surface text-cat-yellow border-cat-yellow/30';

  const displayVal = formatValue ? formatValue(value) : value.toString();

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-cat-muted">
          {label}
        </label>
        <div
          className={`px-2 py-0.5 rounded border text-xs font-extrabold telemetry-readout flex items-center space-x-1 ${badgeColor}`}
        >
          <span>{displayVal}</span>
          <span className="text-[10px] font-normal opacity-80">{unit}</span>
        </div>
      </div>

      <div className="relative flex items-center w-full py-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2.5 bg-cat-bg rounded-lg appearance-none cursor-pointer focus:outline-none ${trackColor}`}
          style={{
            background: `linear-gradient(to right, ${
              status === 'danger'
                ? '#EF4444'
                : status === 'caution'
                ? '#F59E0B'
                : '#FFCD11'
            } ${percentage}%, #1E1E38 ${percentage}%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-cat-muted font-mono px-0.5">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
};
