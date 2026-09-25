import React from 'react';

interface TelemetryToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeText?: string;
  inactiveText?: string;
  dangerWhenFalse?: boolean;
}

export const TelemetryToggle: React.FC<TelemetryToggleProps> = ({
  label,
  checked,
  onChange,
  activeText = 'FASTENED',
  inactiveText = 'UNFASTENED',
  dangerWhenFalse = true,
}) => {
  const isDanger = dangerWhenFalse ? !checked : checked;

  return (
    <div className="flex items-center justify-between w-full py-1">
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-cat-muted">
          {label}
        </span>
        <span
          className={`text-xs font-black uppercase tracking-tight mt-0.5 ${
            isDanger ? 'text-cat-red animate-pulse' : 'text-cat-green'
          }`}
        >
          {checked ? activeText : inactiveText}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`touch-btn relative inline-flex h-8 w-16 items-center rounded-full transition-colors border-2 ${
          checked
            ? 'bg-cat-green/30 border-cat-green'
            : isDanger
            ? 'bg-cat-red/30 border-cat-red'
            : 'bg-cat-surface border-cat-border'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full transition-transform duration-200 shadow-md ${
            checked
              ? 'translate-x-9 bg-cat-green'
              : 'translate-x-0.5 bg-cat-red'
          }`}
        />
      </button>
    </div>
  );
};
