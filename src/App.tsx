import React, { useState } from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import { VoiceAlertProvider } from './context/VoiceAlertContext';
import { AppShell } from './components/layout/AppShell';
import { TabType } from './components/layout/MainNavigation';
import { DashboardPage } from './pages/DashboardPage';
import { SafetyPage } from './pages/SafetyPage';
import { TrainingPage } from './pages/TrainingPage';
import { AnomaliesPage } from './pages/AnomaliesPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'safety':
        return <SafetyPage />;
      case 'training':
        return <TrainingPage />;
      case 'anomalies':
        return <AnomaliesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <TelemetryProvider>
      <VoiceAlertProvider>
        <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
          {renderActivePage()}
        </AppShell>
      </VoiceAlertProvider>
    </TelemetryProvider>
  );
};

export default App;
