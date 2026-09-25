import React from 'react';
import { ShiftSummary } from '../components/handover/ShiftSummary';
import { HandoverChecklist } from '../components/handover/HandoverChecklist';
import { MachineHealthPanel } from '../components/machine/MachineHealthPanel';

interface HandoverPageProps {
  onNavigateToTraining?: () => void;
  onOpenAssistantWithTopic?: (topic: string) => void;
}

export const HandoverPage: React.FC<HandoverPageProps> = ({
  onNavigateToTraining,
  onOpenAssistantWithTopic,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-cat-bg select-none">
      {/* 1. Shift Summary & Metrics */}
      <ShiftSummary onNavigateToTraining={onNavigateToTraining} />

      {/* 2. Machine Mechanical Health Subsystems */}
      <MachineHealthPanel onOpenAssistantWithTopic={onOpenAssistantWithTopic} />

      {/* 3. Shift Close-Out Handover Checklist */}
      <HandoverChecklist />
    </div>
  );
};
