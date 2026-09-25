import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  trend: 'improving' | 'worsening' | 'stable';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  size = 'md',
  showLabel = true,
}) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] space-x-1' : 'text-xs space-x-1.5';
  const iconSizes = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (trend === 'worsening') {
    return (
      <span className={`inline-flex items-center font-bold text-cat-red ${sizeClasses}`}>
        <TrendingUp className={`${iconSizes} flex-shrink-0 animate-pulse-subtle`} />
        {showLabel && <span>Escalating</span>}
      </span>
    );
  }

  if (trend === 'improving') {
    return (
      <span className={`inline-flex items-center font-bold text-cat-green ${sizeClasses}`}>
        <TrendingDown className={`${iconSizes} flex-shrink-0`} />
        {showLabel && <span>Improving</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-bold text-cat-muted ${sizeClasses}`}>
      <Minus className={`${iconSizes} flex-shrink-0`} />
      {showLabel && <span>Stable</span>}
    </span>
  );
};
