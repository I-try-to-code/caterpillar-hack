import React from 'react';

interface SimulatorControlProps {
  icon?: React.ComponentType<{ className?: string }>;
  status?: 'safe' | 'caution' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export const SimulatorControl: React.FC<SimulatorControlProps> = ({
  icon: Icon,
  status = 'safe',
  children,
  className = '',
}) => {
  const borderStatus =
    status === 'danger'
      ? 'border-cat-red/70 bg-cat-red/5 shadow-cat-danger'
      : status === 'caution'
      ? 'border-cat-amber/60 bg-cat-amber/5'
      : 'border-cat-border bg-cat-surface/40 hover:border-cat-border/90';

  return (
    <div
      className={`p-3 rounded-md border transition-all relative ${borderStatus} ${className}`}
    >
      <div className="flex items-start space-x-3">
        {Icon && (
          <div
            className={`p-1.5 rounded mt-0.5 flex-shrink-0 ${
              status === 'danger'
                ? 'bg-cat-red/20 text-cat-red'
                : status === 'caution'
                ? 'bg-cat-amber/20 text-cat-amber'
                : 'bg-cat-bg text-cat-yellow'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
    </div>
  );
};
