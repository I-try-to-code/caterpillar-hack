import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { MainNavigation, TabType } from './MainNavigation';
import { ShiftStatusBanner } from '../handover/ShiftStatusBanner';
import { AlertToastBar } from '../alerts/AlertToastBar';
import { SimulatorSidebar } from '../simulator/SimulatorSidebar';
import { AssistantCommandCenter } from '../assistant/AssistantCommandCenter';
import { DemoScenarioPanel } from '../demo/DemoScenarioPanel';
import { useTelemetrySimulation } from '../../hooks/useTelemetrySimulation';
import { Bot } from 'lucide-react';

interface AppShellProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ activeTab, onTabChange, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [assistantTopic, setAssistantTopic] = useState<string | undefined>(undefined);

  const { isRunning, toggleSimulation } = useTelemetrySimulation(3000);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleOpenAssistantWithTopic = (topic: string) => {
    setAssistantTopic(topic);
    setIsAssistantOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-cat-bg text-cat-text select-none relative">
      {/* 1. Industrial Top Bar with Shift Clock, Weather, & Voice Settings */}
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 2. Tactile Module Navigation (MOD-A through MOD-E) */}
      <MainNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* 3. Persistent Shift Status Banner (Machine, Operator, Task, Safety, Alerts, Health) */}
      <ShiftStatusBanner
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenAssistant={() => {
          setAssistantTopic(undefined);
          setIsAssistantOpen(true);
        }}
        onOpenHandover={() => onTabChange('handover')}
      />

      {/* 4. Central Working Area: Collapsible Sidebar + Active Module */}
      <div className="flex flex-1 overflow-hidden relative">
        <SimulatorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isSimRunning={isRunning}
          onToggleSim={toggleSimulation}
          onOpenDemoModal={() => setIsDemoOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-cat-bg relative">
          {children}

          {/* Floating Tactile Co-Pilot Launcher Button (Does not block main content or alerts) */}
          <button
            type="button"
            onClick={() => {
              setAssistantTopic(undefined);
              setIsAssistantOpen(true);
            }}
            className="touch-btn absolute bottom-4 right-4 z-20 h-11 px-3.5 rounded-full bg-cat-yellow text-slate-950 font-black shadow-lg hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border-2 border-slate-950/20"
            title="Open CAT Operator Assistant Co-Pilot"
          >
            <Bot className="w-5 h-5" />
            <span className="text-xs tracking-tight">AI Co-Pilot</span>
          </button>
        </main>
      </div>

      {/* 5. Bottom Alert Notification Ticker */}
      <AlertToastBar />

      {/* 6. AI Command Center Modal / Overlay */}
      <AssistantCommandCenter
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialQuery={assistantTopic}
        onNavigateToTab={onTabChange}
      />

      {/* 7. Judge Demo Scenario Panel Modal */}
      {isDemoOpen && (
        <DemoScenarioPanel
          isOpen={isDemoOpen}
          onClose={() => setIsDemoOpen(false)}
          onOpenAssistantWithTopic={(topic) => {
            setIsDemoOpen(false);
            handleOpenAssistantWithTopic(topic);
          }}
        />
      )}
    </div>
  );
};
