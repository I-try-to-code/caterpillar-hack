import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { MainNavigation, TabType } from './MainNavigation';
import { ShiftStatusBanner } from '../handover/ShiftStatusBanner';
import { AlertToastBar } from '../alerts/AlertToastBar';
import { SimulatorSidebar } from '../simulator/SimulatorSidebar';
import { AssistantCommandCenter } from '../assistant/AssistantCommandCenter';
import { DemoScenarioPanel } from '../demo/DemoScenarioPanel';
import { useTelemetrySimulation } from '../../hooks/useTelemetrySimulation';

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
