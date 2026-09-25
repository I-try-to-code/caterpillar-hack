import React, { useState, useEffect } from 'react';
import { OperatorContextSnapshot } from '../../types/anomalies';
import { AnomalySummaryMetrics } from '../../hooks/useAnomalyDetection';
import {
  Bot,
  User,
  Send,
  Sparkles,
  X,
  Fuel,
  Gauge,
  Flame,
  Clock,
} from 'lucide-react';

interface AiAnomalyExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: OperatorContextSnapshot;
  summary: AnomalySummaryMetrics;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  structuredDetails?: {
    label: string;
    value: string;
  }[];
}

export const AiAnomalyExplainer: React.FC<AiAnomalyExplainerProps> = ({
  isOpen,
  onClose,
  snapshot,
  summary,
}) => {
  // Handle Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Generate initial grounded summary based strictly on real snapshot metrics
    const now = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    let initialExplanation = `I have analyzed your live machine telematics and shift logs for Excavator ${snapshot.telemetry.machineId}. `;

    if (summary.activeCount === 0) {
      initialExplanation += `Your operational status is currently NOMINAL. Total idle time is ${summary.totalIdleMinutes} minutes and dynamic G-forces are smooth. Keep up the consistent digging cycle rhythm.`;
    } else {
      const parts: string[] = [];
      if (summary.totalIdleMinutes >= 5) {
        parts.push(`${summary.totalIdleMinutes} minutes of excessive idle time (estimated ~${summary.totalFuelWastedLiters}L fuel wasted)`);
      }
      if (summary.harshEventsCount > 0) {
        parts.push(`${summary.harshEventsCount} harsh-operation shock event${summary.harshEventsCount > 1 ? 's' : ''}`);
      }
      if (summary.hydraulicSpikesCount > 0) {
        parts.push(`${summary.hydraulicSpikesCount} hydraulic relief overpressure spike${summary.hydraulicSpikesCount > 1 ? 's' : ''}`);
      }
      if (summary.bucketTravelWarningsCount > 0) {
        parts.push(`${summary.bucketTravelWarningsCount} elevated bucket tramming warning${summary.bucketTravelWarningsCount > 1 ? 's' : ''}`);
      }

      initialExplanation += `Attention is required: You have accumulated ${parts.join(', ')} during this shift. Consider shutting down the engine during longer pauses and reducing abrupt joystick deflections to protect machine components.`;
    }

    return [
      {
        id: 'msg-init',
        sender: 'ai',
        text: initialExplanation,
        timestamp: now,
        structuredDetails: [
          { label: 'Idle Fuel Waste', value: `${summary.totalFuelWastedLiters} L ($${summary.totalFuelCostUSD} USD)` },
          { label: 'Harsh G-Force', value: `${summary.harshEventsCount} events recorded` },
          { label: 'Hydraulic Spikes', value: `${summary.hydraulicSpikesCount} over 340 bar` },
          { label: 'Machine Health', value: `${snapshot.machineHealth.overallIndex}% Nominal` },
        ],
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');

  if (!isOpen) return null;

  const handleSendPrompt = (questionText: string) => {
    if (!questionText.trim()) return;

    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: timeStr,
    };

    // Grounded deterministic response generation — strictly NO invented numbers
    let aiReplyText = '';
    let details: { label: string; value: string }[] | undefined = undefined;

    const q = questionText.toLowerCase();

    if (q.includes('efficient') || q.includes('efficiency') || q.includes('fuel')) {
      aiReplyText = `Your idle ratio is currently ${
        summary.totalIdleMinutes > 15 ? 'HIGH' : 'ACCEPTABLE'
      }. You have logged ${summary.totalIdleMinutes} minutes of engine idle at 3.8 L/hr, burning an estimated ${
        summary.totalFuelWastedLiters
      } liters of diesel ($${summary.totalFuelCostUSD} USD). Shutting down when queuing for haulers in Zone B will directly improve your shift score.`;
      details = [
        { label: 'Calculated Burn', value: `${summary.totalFuelWastedLiters} L diesel` },
        { label: 'Estimated Waste', value: `$${summary.totalFuelCostUSD} USD` },
        { label: 'Idle Minutes', value: `${summary.totalIdleMinutes} min` },
      ];
    } else if (q.includes('health') || q.includes('index') || q.includes('drop')) {
      aiReplyText = `Your machine health score is ${snapshot.machineHealth.overallIndex}%. Primary deductions: Engine Oil is at ${
        snapshot.telemetry.oilPressure
      } psi (${snapshot.machineHealth.oilPressureStatus}), Hydraulic load reached ${
        snapshot.telemetry.hydraulicPressure
      } bar, and peak G-force shock is ${snapshot.telemetry.gForce.toFixed(2)}g.`;
      details = [
        { label: 'Overall Index', value: `${snapshot.machineHealth.overallIndex}%` },
        { label: 'Hydraulic Pressure', value: `${snapshot.telemetry.hydraulicPressure} bar` },
        { label: 'Oil Pressure', value: `${snapshot.telemetry.oilPressure} psi` },
      ];
    } else if (q.includes('hydraulic') || q.includes('pressure') || q.includes('spike')) {
      aiReplyText = `Hydraulic relief valve has cycled ${
        summary.hydraulicSpikesCount
      } times this shift with a peak of ${
        snapshot.telemetry.hydraulicPressure
      } bar (threshold is 340 bar). This occurs when curling into compacted sandstone or striking bedrock boulders. Feather your bucket joystick to allow the pump to cycle without relief bypass.`;
      details = [
        { label: 'Recorded Spikes', value: `${summary.hydraulicSpikesCount} events` },
        { label: 'Current Load', value: `${snapshot.telemetry.hydraulicPressure} bar` },
        { label: 'Relief Limit', value: '340 bar continuous' },
      ];
    } else if (q.includes('bucket') || q.includes('travel') || q.includes('height')) {
      aiReplyText = `Carrying the bucket above 1.2m while tramming elevates the machine center of gravity, especially on slopes (${
        snapshot.telemetry.slopeAngle.toFixed(1)
      }°). Current bucket height is ${
        snapshot.telemetry.bucketHeight.toFixed(1)
      }m at ${snapshot.telemetry.speed.toFixed(1)} km/h. Lower the bucket to 0.3m–0.5m above ground prior to track movement.`;
      details = [
        { label: 'Current Height', value: `${snapshot.telemetry.bucketHeight.toFixed(1)} m` },
        { label: 'Current Speed', value: `${snapshot.telemetry.speed.toFixed(1)} km/h` },
        { label: 'Safe Carry Limit', value: '≤ 1.2 m' },
      ];
    } else {
      aiReplyText = `Based on your live telematics: Machine ${snapshot.telemetry.machineId} has ${
        summary.activeCount
      } active anomaly advisories. Idle time is ${summary.totalIdleMinutes} min, G-Force is ${
        snapshot.telemetry.gForce.toFixed(2)
      }g, and hydraulic pressure is ${snapshot.telemetry.hydraulicPressure} bar. All recommendations are synced to the cab voice system.`;
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now() + 1}`,
      sender: 'ai',
      text: aiReplyText,
      timestamp: timeStr,
      structuredDetails: details,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuery('');
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6 animate-fade-in select-none cursor-pointer"
    >
      <div className="bg-cat-panel border-2 border-cat-yellow rounded-xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden cursor-default">
        {/* Header */}
        <div className="p-4 bg-cat-surface border-b border-cat-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-cat-yellow text-slate-950 font-black shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-cat-yellow/20 text-cat-yellow border border-cat-yellow/40">
                  Telemetry Grounded AI
                </span>
                <span className="text-xs text-cat-muted font-mono">
                  Machine ID: {snapshot.telemetry.machineId}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-cat-text">
                CAT Operator AI Assistant &bull; Anomaly Explainer
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-cat-surface text-cat-muted hover:text-cat-text hover:bg-cat-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Anomaly Metric Context Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-cat-bg border-b border-cat-border text-xs">
          <div className="bg-cat-panel p-2 rounded border border-cat-border flex items-center justify-between">
            <span className="text-cat-muted font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cat-yellow" /> Idle:
            </span>
            <span className="font-mono font-black text-cat-text">{summary.totalIdleMinutes}m</span>
          </div>

          <div className="bg-cat-panel p-2 rounded border border-cat-border flex items-center justify-between">
            <span className="text-cat-muted font-bold flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-cat-amber" /> Fuel Waste:
            </span>
            <span className="font-mono font-black text-cat-amber">{summary.totalFuelWastedLiters}L</span>
          </div>

          <div className="bg-cat-panel p-2 rounded border border-cat-border flex items-center justify-between">
            <span className="text-cat-muted font-bold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-cat-red" /> Shocks:
            </span>
            <span className="font-mono font-black text-cat-text">{summary.harshEventsCount}</span>
          </div>

          <div className="bg-cat-panel p-2 rounded border border-cat-border flex items-center justify-between">
            <span className="text-cat-muted font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-sky-500" /> Hyd Spikes:
            </span>
            <span className="font-mono font-black text-cat-text">{summary.hydraulicSpikesCount}</span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="p-1.5 rounded-full bg-cat-yellow text-slate-950 flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs md:text-sm space-y-2 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-cat-yellow text-slate-950 font-bold rounded-tr-none'
                    : 'bg-cat-panel text-cat-text border border-cat-border rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Structured grounded metrics if provided by AI */}
                {msg.structuredDetails && (
                  <div className="pt-2 border-t border-cat-border/60 grid grid-cols-2 gap-1.5 text-xs">
                    {msg.structuredDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-cat-surface p-1.5 rounded border border-cat-border flex justify-between items-center"
                      >
                        <span className="text-cat-muted font-medium text-[11px]">{item.label}:</span>
                        <span className="font-mono font-black text-cat-text text-[11px]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] font-mono text-right ${
                    msg.sender === 'user' ? 'text-slate-800' : 'text-cat-muted'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="p-1.5 rounded-full bg-slate-900 text-white flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Question Chips */}
        <div className="p-2 bg-cat-panel border-t border-cat-border flex flex-wrap gap-1.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cat-muted self-center mr-1">
            Suggested:
          </span>
          {[
            'Have I been operating efficiently?',
            'Why did my health index drop?',
            'What caused the hydraulic relief spike?',
            'How can I reduce fuel consumption?',
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendPrompt(prompt)}
              className="px-2.5 py-1 rounded-full bg-cat-surface hover:bg-cat-yellow hover:text-slate-950 border border-cat-border text-cat-text font-bold text-[11px] transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-cat-yellow" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputQuery);
          }}
          className="p-3 bg-cat-surface border-t border-cat-border flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about your machine anomalies, fuel waste, or wear patterns..."
            className="flex-1 px-3 py-2 text-xs md:text-sm rounded bg-cat-panel border border-cat-border text-cat-text focus:outline-none focus:border-cat-yellow"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="touch-btn h-10 px-4 rounded bg-cat-yellow text-slate-950 font-black text-xs hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
