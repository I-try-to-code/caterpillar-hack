import React from 'react';
import { CoachingPromptItem } from '../../hooks/useCoachingPrompts';
import {
  Lightbulb,
  X,
  EyeOff,
  RotateCcw,
  Shield,
  Clock,
  Zap,
  UserCheck,
} from 'lucide-react';

interface CoachingPromptProps {
  prompts: CoachingPromptItem[];
  onDismiss: (id: string) => void;
  onNeverShowAgain: (id: string) => void;
  onResetPreferences?: () => void;
  hasHiddenPrompts?: boolean;
}

export const CoachingPrompt: React.FC<CoachingPromptProps> = ({
  prompts,
  onDismiss,
  onNeverShowAgain,
  onResetPreferences,
  hasHiddenPrompts = false,
}) => {
  const getCategoryIcon = (category: CoachingPromptItem['category']) => {
    switch (category) {
      case 'safety':
        return <Shield className="w-4 h-4 text-cat-red" />;
      case 'efficiency':
        return <Clock className="w-4 h-4 text-cat-yellow" />;
      case 'wear':
        return <Zap className="w-4 h-4 text-sky-500" />;
      case 'posture':
      default:
        return <UserCheck className="w-4 h-4 text-purple-500" />;
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="cab-panel p-4 border border-cat-border rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-cat-surface text-cat-muted border border-cat-border">
            <Lightbulb className="w-5 h-5 text-cat-yellow" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cat-muted block">
              In-Cab Operator Coaching
            </span>
            <span className="text-xs font-bold text-cat-text">
              No active coaching advisories. Machine techniques are operating within target parameters.
            </span>
          </div>
        </div>

        {hasHiddenPrompts && onResetPreferences && (
          <button
            type="button"
            onClick={onResetPreferences}
            className="text-[11px] font-bold text-cat-yellow hover:underline flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore hidden tips</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border rounded-lg space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-cat-border/60 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-cat-yellow text-slate-950 font-black">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Operational Efficiency & Wear Mitigation
            </span>
            <h3 className="text-sm md:text-base font-extrabold text-cat-text flex items-center gap-1.5">
              Operator Coaching Prompts ({prompts.length} Active)
            </h3>
          </div>
        </div>

        {hasHiddenPrompts && onResetPreferences && (
          <button
            type="button"
            onClick={onResetPreferences}
            className="text-[11px] font-bold text-cat-muted hover:text-cat-text flex items-center gap-1 transition-colors"
            title="Restore tips marked as 'Don't show again'"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Preferences</span>
          </button>
        )}
      </div>

      {/* Prompts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {prompts.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-lg bg-cat-surface border border-cat-border flex flex-col justify-between space-y-3 hover:border-cat-yellow/60 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cat-panel border border-cat-border">
                  {getCategoryIcon(item.category)}
                  <span>{item.category}</span>
                </span>
                <span className="text-[10px] font-mono text-cat-muted">
                  {item.triggerCondition}
                </span>
              </div>

              <div>
                <p className="text-xs md:text-sm font-extrabold text-cat-text leading-snug">
                  {item.tip}
                </p>
                <p className="text-[11px] text-cat-muted mt-1 leading-relaxed">
                  {item.rationale}
                </p>
              </div>
            </div>

            {/* Actions: Dismiss & Don't show again */}
            <div className="pt-2 border-t border-cat-border/60 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="px-2.5 py-1 rounded font-bold text-cat-muted hover:text-cat-text hover:bg-cat-hover flex items-center gap-1 transition-colors text-[11px]"
              >
                <X className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </button>

              <button
                type="button"
                onClick={() => onNeverShowAgain(item.id)}
                className="px-2.5 py-1 rounded font-bold text-cat-muted hover:text-cat-red hover:bg-cat-red/10 flex items-center gap-1 transition-colors text-[11px]"
                title="Permanently hide this tip for future sessions"
              >
                <EyeOff className="w-3 h-3" />
                <span>Don't show again</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
