import React from 'react';
import { LayoutDashboard, ShieldCheck, GraduationCap, Activity } from 'lucide-react';

export type TabType = 'dashboard' | 'safety' | 'training' | 'anomalies';

interface MainNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  moduleCode: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Daily Task Dashboard',
    moduleCode: 'MOD-A',
    icon: LayoutDashboard,
  },
  {
    id: 'safety',
    label: 'Real-Time Safety & HUD',
    moduleCode: 'MOD-B',
    icon: ShieldCheck,
  },
  {
    id: 'training',
    label: 'Operator Training Hub',
    moduleCode: 'MOD-C',
    icon: GraduationCap,
  },
  {
    id: 'anomalies',
    label: 'Anomaly & Pattern Detection',
    moduleCode: 'MOD-D',
    icon: Activity,
  },
];

export const MainNavigation: React.FC<MainNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-cat-panel/90 border-b border-cat-border px-4 py-1.5 flex items-center justify-between overflow-x-auto flex-shrink-0 select-none">
      <div className="flex items-center space-x-2 sm:space-x-3 w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`touch-btn flex-1 min-w-[140px] px-3 py-2 rounded-md border text-left transition-all flex items-center space-x-3 ${
                isActive
                  ? 'bg-cat-surface border-cat-yellow text-cat-yellow shadow-cat-glow'
                  : 'bg-cat-bg/50 border-cat-border/60 text-cat-text hover:bg-cat-surface/80 hover:border-cat-border'
              }`}
            >
              <div
                className={`p-2 rounded ${
                  isActive ? 'bg-cat-yellow text-slate-950 font-bold' : 'bg-cat-surface text-cat-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] uppercase tracking-wider text-cat-muted font-bold">
                  {item.moduleCode}
                </span>
                <span className="text-sm font-bold tracking-tight truncate leading-tight">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
