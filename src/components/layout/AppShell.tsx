import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { MainNavigation, TabType } from './MainNavigation';
import { AlertToastBar } from '../alerts/AlertToastBar';
import { SimulatorSidebar } from '../simulator/SimulatorSidebar';
import { useTelemetrySimulation } from '../../hooks/useTelemetrySimulation';

interface AppShellProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ activeTab, onTabChange, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const { isRunning, toggleSimulation } = useTelemetrySimulation(3000);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-cat-bg text-cat-text select-none">
      {/* 1. Industrial Top Bar with Health Subsystems & Shift Clock */}
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 2. Tactile Module Navigation */}
      <MainNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* 3. Central Working Area: Collapsible Sidebar + Active Module */}
      <div className="flex flex-1 overflow-hidden relative">
        <SimulatorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isSimRunning={isRunning}
          onToggleSim={toggleSimulation}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-cat-bg relative">
          {children}
        </main>
      </div>

      {/* 4. Bottom Alert Notification Ticker */}
      <AlertToastBar />
    </div>
  );
};
