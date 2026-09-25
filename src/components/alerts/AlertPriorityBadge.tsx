import React from 'react';
import { AlertSeverity } from '../../types/alerts';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface AlertPriorityBadgeProps {
  severity: AlertSeverity | 'safe';
  size?: 'sm' | 'md' | 'lg';
  pulsing?: boolean;
  showIcon?: boolean;
}

export const AlertPriorityBadge: React.FC<AlertPriorityBadgeProps> = ({
  severity,
  size = 'md',
  pulsing = true,
  showIcon = true,
}) => {
  const getBadgeConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          label: 'CRITICAL',
          icon: AlertOctagon,
          className: `bg-cat-red/25 text-cat-red border border-cat-red font-black ${
            pulsing ? 'animate-pulse' : ''
          } shadow-[0_0_8px_rgba(235,0,0,0.4)]`,
        };
      case 'danger':
        return {
          label: 'DANGER',
          icon: AlertOctagon,
          className: `bg-red-600/20 text-red-400 border border-red-500/60 font-black ${
            pulsing ? 'animate-pulse-subtle' : ''
          }`,
        };
      case 'warning':
        return {
          label: 'WARNING',
          icon: AlertTriangle,
          className: 'bg-cat-amber/20 text-cat-amber border border-cat-amber/50 font-bold',
        };
      case 'info':
        return {
          label: 'INFO',
          icon: Info,
          className: 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold',
        };
      case 'safe':
      default:
        return {
          label: 'NORMAL',
          icon: CheckCircle2,
          className: 'bg-cat-green/20 text-cat-green border border-cat-green/40 font-semibold',
        };
    }
  };

  const { label, icon: Icon, className } = getBadgeConfig();

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3 py-1.5 space-x-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded uppercase tracking-wider select-none ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes} flex-shrink-0`} />}
      <span>{label}</span>
    </span>
  );
};
