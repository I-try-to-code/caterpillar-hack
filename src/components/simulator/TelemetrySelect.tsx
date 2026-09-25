import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: 'safe' | 'caution' | 'danger';
}

interface TelemetrySelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  status?: 'safe' | 'caution' | 'danger';
}

export const TelemetrySelect: React.FC<TelemetrySelectProps> = ({
  label,
  value,
  options,
  onChange,
  status = 'safe',
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  const borderColor =
    status === 'danger'
      ? 'border-cat-red text-cat-red'
      : status === 'caution'
      ? 'border-cat-amber text-cat-amber'
      : 'border-cat-border text-cat-text';

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-cat-muted">
          {label}
        </label>
        {selectedOption?.badge && (
          <span
            className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded border ${
              selectedOption.badge === 'danger'
                ? 'bg-cat-red/20 text-cat-red border-cat-red/40'
                : selectedOption.badge === 'caution'
                ? 'bg-cat-amber/20 text-cat-amber border-cat-amber/40'
                : 'bg-cat-green/20 text-cat-green border-cat-green/40'
            }`}
          >
            {selectedOption.badge}
          </span>
        )}
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`touch-btn w-full bg-cat-bg border-2 rounded-md px-3 py-2 text-sm font-bold focus:outline-none focus:border-cat-yellow transition-colors cursor-pointer appearance-none ${borderColor}`}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-cat-panel text-cat-text py-1"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cat-muted">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
