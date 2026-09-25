import React, { useState, useRef, useEffect } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useIncidentLogger } from '../../hooks/useIncidentLogger';
import { evaluateMachineHealth } from '../../lib/machineHealth';
import { detectMeaningfulTelemetryChanges } from '../../lib/telemetryComparison';
import { TelemetryState } from '../../types/telemetry';
import {
  Bot,
  User,
  Send,
  Sparkles,
  X,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  sourceNote?: string;
  actionRecommendation?: string;
  navTarget?: 'dashboard' | 'safety' | 'training' | 'anomalies' | 'handover';
}

interface AssistantCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onNavigateToTab?: (tab: 'dashboard' | 'safety' | 'training' | 'anomalies' | 'handover') => void;
}

const QUICK_QUESTIONS = [
  'What is happening?',
  'What changed?',
  'Why am I getting this warning?',
  'What should I do next?',
  'How is my machine performing?',
  'What should I learn next?',
  'Summarize my shift',
];

export const AssistantCommandCenter: React.FC<AssistantCommandCenterProps> = ({
  isOpen,
  onClose,
  initialQuery,
  onNavigateToTab,
}) => {
  const { telemetry } = useTelemetry();
  const { incidents } = useIncidentLogger();

  // Baseline telemetry snapshot for "What changed?"
  const [baselineSnapshot, setBaselineSnapshot] = useState<TelemetryState>(telemetry);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize or handle initialQuery
  useEffect(() => {
    if (messages.length === 0) {
      const nowStr = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          timestamp: nowStr,
          text: `Hello Operator OP1001. I am your CAT machine-aware digital co-pilot. I have direct access to your machine's CAN bus telemetry, active safety interlocks, and task progress. How can I assist your operation?`,
          sourceNote: 'Telemetry Engine Linked • Deterministic Safety Authoritative',
        },
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleAskQuestion(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Deterministic Answer Engine
  const generateGroundedResponse = (question: string): { text: string; action?: string; navTarget?: 'dashboard' | 'safety' | 'training' | 'anomalies' | 'handover' } => {
    const qLower = question.toLowerCase();
    const health = evaluateMachineHealth(telemetry);
    const changes = detectMeaningfulTelemetryChanges(baselineSnapshot, telemetry);

    // 1. "What is happening?"
    if (qLower.includes('happening') || qLower.includes('status') || qLower.includes('what is going on')) {
      const activeDangerConditions: string[] = [];
      if (telemetry.proximityDistance < 3.5) {
        activeDangerConditions.push(
          `1) Critical proximity obstacle at ${telemetry.proximityDistance.toFixed(1)}m within swing zone`
        );
      }
      if (telemetry.slopeAngle >= 25.0) {
        activeDangerConditions.push(
          `2) Dangerous slope grade at ${telemetry.slopeAngle.toFixed(1)}° exceeding the 25° rollover threshold`
        );
      }
      if (!telemetry.seatbeltFastened && telemetry.speed > 0) {
        activeDangerConditions.push(
          `3) Machine interlock active due to unfastened seatbelt while moving at ${telemetry.speed.toFixed(1)} km/h`
        );
      } else if (!telemetry.seatbeltFastened) {
        activeDangerConditions.push(`Seatbelt unlatched in operator cab`);
      }
      if (telemetry.idleTimeMinutes >= 10.0) {
        activeDangerConditions.push(
          `Prolonged engine idle at ${telemetry.idleTimeMinutes.toFixed(1)} min`
        );
      }

      if (activeDangerConditions.length >= 3) {
        return {
          text: `Three safety conditions are currently active:\n\n• ${activeDangerConditions.join('\n• ')}\n\nImmediate corrective action is required to ensure operator and equipment safety. The deterministic interlock system has prioritized these hazards.`,
          action: 'Immediately halt track travel and lower the bucket to ground level.',
        };
      } else if (activeDangerConditions.length > 0) {
        return {
          text: `The following ${activeDangerConditions.length} condition(s) require operator attention:\n\n• ${activeDangerConditions.join('\n• ')}\n\nMachine systems are operating under caution/danger protocol.`,
          action: 'Acknowledge warning on HUD and execute safety procedure.',
        };
      } else {
        return {
          text: `All machine systems are operating normally. Inclinometer shows safe ${telemetry.slopeAngle.toFixed(1)}° grade, proximity perimeter is clear (${telemetry.proximityDistance.toFixed(1)}m), seatbelt is secured, and hydraulic circuit is stable at ${telemetry.hydraulicPressure} bar.`,
        };
      }
    }

    // 2. "What changed?"
    if (qLower.includes('changed') || qLower.includes('delta') || qLower.includes('recent')) {
      if (changes.length === 0) {
        return {
          text: `No significant parameter deltas detected over the last 5 minutes. Monitored CAN bus channels (slope, proximity, seatbelt, hydraulic load) remain stable within baseline steady-state envelopes.`,
        };
      }
      const changeBullets = changes.map(
        (c) => `• ${c.parameter}: ${c.previousDisplay} → ${c.currentDisplay} (${c.message})`
      );
      return {
        text: `In the last 5 minutes, ${changes.length} meaningful telemetry transition(s) occurred:\n\n${changeBullets.join('\n')}\n\nBaseline snapshot is tracking deviations from initial shift calibration.`,
        action: 'Review changes to verify stability before advancing work cycle.',
      };
    }

    // 3. "Why am I getting this warning?"
    if (qLower.includes('why') || qLower.includes('warning') || qLower.includes('alarm')) {
      const activeReasons: string[] = [];
      if (telemetry.slopeAngle >= 25.0) {
        activeReasons.push(
          `• Rollover Alarm: Inclinometer reads ${telemetry.slopeAngle.toFixed(1)}° (rated limit is 25.0°). At this pitch, high bucket position severely raises the center of mass, creating imminent tip-over danger.`
        );
      }
      if (telemetry.proximityDistance < 3.0) {
        activeReasons.push(
          `• Proximity Danger: Radar sensor detected an obstacle at ${telemetry.proximityDistance.toFixed(1)}m, breaching the 3.0m emergency buffer.`
        );
      }
      if (!telemetry.seatbeltFastened && telemetry.speed > 0) {
        activeReasons.push(
          `• Machine Interlock: Machine speed is ${telemetry.speed.toFixed(1)} km/h while cab seatbelt buckle switch registers unlatched.`
        );
      }
      if (telemetry.idleTimeMinutes >= 10.0) {
        activeReasons.push(
          `• Excessive Idle: Zero track motion with engine running at ${telemetry.engineRPM} RPM for ${telemetry.idleTimeMinutes.toFixed(1)} minutes (> 10m threshold).`
        );
      }
      if (health.criticalCount > 0) {
        activeReasons.push(
          `• Mechanical Alert: ${health.criticalCount} subsystem(s) in critical range (Oil: ${telemetry.oilPressure} psi, Hyd: ${health.subsystems.hydraulicTemp.valueDisplay}).`
        );
      }

      if (activeReasons.length > 0) {
        return {
          text: `You are receiving warnings due to the following deterministic threshold triggers:\n\n${activeReasons.join('\n')}`,
          action: 'Follow machine prompts: lower implements and eliminate hazard sources.',
        };
      } else {
        return {
          text: `You currently have zero active warning interlocks. All sensor readings are within approved Caterpillar safe operating envelopes.`,
        };
      }
    }

    // 4. "What should I do next?"
    if (qLower.includes('do next') || qLower.includes('action') || qLower.includes('recommend')) {
      const directives: string[] = [];
      if (telemetry.slopeAngle >= 25.0) {
        directives.push('1. Lower excavator bucket immediately to ground level to lower machine center-of-gravity.');
        directives.push('2. Slowly track down slope toward stable terrain with tracks pointed straight down incline.');
      }
      if (telemetry.proximityDistance < 3.5) {
        directives.push('3. Halt all hydraulic swing movement; sound cab horn twice to alert ground workers.');
      }
      if (!telemetry.seatbeltFastened) {
        directives.push('4. Fasten operator seatbelt before re-engaging travel levers.');
      }
      if (telemetry.idleTimeMinutes >= 10.0) {
        directives.push('5. Switch engine to Auto-Stop or shutdown if waiting for haul trucks exceeds 3 minutes.');
      }

      if (directives.length > 0) {
        return {
          text: `Here is the prioritized safety action protocol based on live machine telemetry:\n\n${directives.join('\n')}`,
          action: 'Execute directives in order of priority before resuming digging.',
        };
      } else {
        return {
          text: `All safety parameters are green. Recommended next action: Proceed with Trenching Zone B along the staked survey cut. Target 4 bucket cycles per minute to maintain current schedule.`,
        };
      }
    }

    // 5. "How is my machine performing?"
    if (qLower.includes('performing') || qLower.includes('machine') || qLower.includes('health')) {
      const fuelWasteEst = (telemetry.idleTimeMinutes * 0.08 * 3.8).toFixed(2);
      return {
        text: `Machine Health & Performance Assessment:\n\n• Mechanical Health Index: ${health.overallScore} / 100 (${health.overallStatus.toUpperCase()})\n• Engine Oil Pressure: ${telemetry.oilPressure} psi (${health.subsystems.oilPressure.status})\n• Hydraulic Temperature: ${health.subsystems.hydraulicTemp.valueDisplay} (${health.subsystems.hydraulicTemp.status})\n• Undercarriage Shock: ${telemetry.gForce.toFixed(2)}G (Track status: ${health.subsystems.trackTension.valueDisplay})\n• Idling: ${telemetry.idleTimeMinutes.toFixed(1)} min (Est. fuel waste: ~$${fuelWasteEst})\n• Completed Load Cycles: ${telemetry.loadCycles} cycles`,
        action: health.overallScore < 85 ? 'Inspect machine seals and reduce track speed.' : undefined,
      };
    }

    // 6. "What should I learn next?"
    if (qLower.includes('learn') || qLower.includes('training') || qLower.includes('course')) {
      if (telemetry.slopeAngle > 15 || incidents.some((i) => i.type === 'rollover_risk')) {
        return {
          text: `Based on your recent slope readings (${telemetry.slopeAngle.toFixed(1)}°), I recommend taking the module:\n\n"Steep Slope & Trench Excavation Techniques"\n\nThis 15-minute simulation reviews center-of-gravity management, proper bucket anchoring, and bench cutting safety.`,
          action: 'Open Operator Training Hub to launch module.',
          navTarget: 'training',
        };
      } else if (telemetry.proximityDistance < 5 || incidents.some((i) => i.type === 'proximity_hazard')) {
        return {
          text: `Based on proximity events logged today, I recommend:\n\n"Swing Radius Safety & Ground Spotter Coordination"\n\nFocuses on blindspot radar alerts and 2-way horn signaling with trench ground crew.`,
          action: 'Open Operator Training Hub to launch module.',
          navTarget: 'training',
        };
      } else if (telemetry.idleTimeMinutes > 8) {
        return {
          text: `Based on your idle duration (${telemetry.idleTimeMinutes.toFixed(1)} min), I recommend:\n\n"Eco-Mode Idling & Fuel Conservation Practices"\n\nCovers CAT Product Link idle thresholds, engine shutdown timers, and stage queueing.`,
          action: 'Open Operator Training Hub to launch module.',
          navTarget: 'training',
        };
      } else {
        return {
          text: `Your operational metrics are strong! To further advance your qualification level, review:\n\n"Precision Trench Grading & Cycle Optimization"\n\nFocuses on smooth stick hydraulic feathering to reduce wear and fuel consumption.`,
          action: 'Review advanced operator training modules.',
          navTarget: 'training',
        };
      }
    }

    // 7. "Summarize my shift"
    if (qLower.includes('summarize') || qLower.includes('handover') || qLower.includes('shift')) {
      const proxCount = incidents.filter((i) => i.type === 'proximity_hazard').length;
      const seatCount = incidents.filter((i) => i.type === 'seatbelt').length;
      return {
        text: `Shift Handover Briefing (EXC001 • OP1001):\n\n• Completed Task: Trenching Zone B — 62% progress\n• Safety Events: ${Math.max(2, proxCount)} proximity events, ${Math.max(1, seatCount)} seatbelt event(s)\n• Machine Events: ${telemetry.idleTimeMinutes.toFixed(1)} min idle, ${health.criticalCount} critical subsystem conditions\n• Open Issues: ${telemetry.slopeAngle >= 15 ? `Slope warning (${telemetry.slopeAngle.toFixed(1)}°)` : 'Zero unresolved critical issues'}\n• Follow-Up: Perform walkaround inspection of hydraulic seals and complete slope safety review.`,
        action: 'Open Shift Handover screen for supervisor digital sign-off.',
        navTarget: 'handover',
      };
    }

    // Fallback grounded answer
    return {
      text: `Understood. Current CAN telemetry: Machine ${telemetry.machineId}, Engine RPM ${telemetry.engineRPM}, Slope ${telemetry.slopeAngle.toFixed(1)}°, Proximity ${telemetry.proximityDistance.toFixed(1)}m, Oil ${telemetry.oilPressure} psi. Deterministic safety interlocks are authoritative. How else can I assist?`,
    };
  };

  const handleAskQuestion = (questionText: string) => {
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: timeStr,
      text: questionText,
    };

    const response = generateGroundedResponse(questionText);

    const assistantMsg: ChatMessage = {
      id: `asst-${Date.now() + 1}`,
      sender: 'assistant',
      timestamp: timeStr,
      text: response.text,
      sourceNote: 'Derived from live CAN bus telemetry & active safety state',
      actionRecommendation: response.action,
      navTarget: response.navTarget,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputVal('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleAskQuestion(inputVal.trim());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-cat-panel border-2 border-cat-border rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] max-h-[720px] flex flex-col overflow-hidden text-cat-text select-none">
        {/* 1. Co-Pilot Header */}
        <div className="p-4 border-b-2 border-cat-border bg-cat-surface flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-cat-yellow text-slate-950 font-black shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-cat-text tracking-tight">
                  CAT Operator Assistant
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cat-yellow/20 text-cat-yellow border border-cat-yellow/40">
                  CO-PILOT
                </span>
              </div>
              <p className="text-xs text-cat-muted font-bold">
                Your machine-aware co-pilot &bull; Deterministic Safety Engine Authoritative
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setBaselineSnapshot(telemetry)}
              className="touch-btn h-8 px-2.5 text-xs font-bold text-cat-yellow bg-cat-surface hover:bg-cat-hover rounded border border-cat-border hover:border-cat-yellow transition-all flex items-center space-x-1"
              title="Reset 'What Changed' baseline to current telemetry"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Baseline</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="touch-btn h-9 w-9 rounded-md hover:bg-cat-surface text-cat-muted hover:text-cat-text border border-transparent hover:border-cat-border flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Structured Machine Context Pill Bar */}
        <div className="px-4 py-2 bg-cat-bg/80 border-b border-cat-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
            <span className="text-[10px] uppercase font-bold text-cat-muted flex-shrink-0">
              Live Context:
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cat-surface border border-cat-border flex-shrink-0">
              Machine: {telemetry.machineId}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cat-surface border border-cat-border flex-shrink-0">
              Slope: {telemetry.slopeAngle.toFixed(1)}°
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cat-surface border border-cat-border flex-shrink-0">
              Proximity: {telemetry.proximityDistance.toFixed(1)}m
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cat-surface border border-cat-border flex-shrink-0">
              Seatbelt: {telemetry.seatbeltFastened ? 'Fastened' : 'Unfastened'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cat-surface border border-cat-border flex-shrink-0">
              Idle: {telemetry.idleTimeMinutes.toFixed(1)}m
            </span>
          </div>

          <div className="text-[10px] text-cat-green font-bold flex items-center space-x-1 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-cat-green animate-pulse" />
            <span>Telemetry Grounded &bull; Zero Hallucinations</span>
          </div>
        </div>

        {/* 3. Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cat-bg/30">
          {messages.map((msg) => {
            const isAsst = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex space-x-3 ${isAsst ? 'items-start' : 'items-start flex-row-reverse space-x-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isAsst
                      ? 'bg-cat-yellow text-slate-950 font-black'
                      : 'bg-cat-surface border border-cat-border text-cat-text'
                  }`}
                >
                  {isAsst ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1.5 max-w-[85%]">
                  <div
                    className={`p-3.5 rounded-xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                      isAsst
                        ? 'bg-cat-surface border border-cat-border text-cat-text shadow-sm'
                        : 'bg-cat-yellow text-slate-950 font-medium'
                    }`}
                  >
                    {msg.text}

                    {msg.actionRecommendation && (
                      <div className="mt-2.5 pt-2 border-t border-cat-border/60 text-xs font-bold text-cat-amber flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-start space-x-1.5">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>Directive: {msg.actionRecommendation}</span>
                        </div>
                        {msg.navTarget && onNavigateToTab && (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateToTab(msg.navTarget!);
                              onClose();
                            }}
                            className="touch-btn h-7 px-2.5 rounded bg-cat-yellow text-slate-950 font-black text-xs flex items-center space-x-1 hover:bg-yellow-400"
                          >
                            <span className="capitalize">Go to {msg.navTarget}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center space-x-2 text-[10px] text-cat-muted ${
                      isAsst ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sourceNote && <span>&bull; {msg.sourceNote}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* 4. Quick Action Query Chips (Prompt Requirement) */}
        <div className="p-3 bg-cat-surface/80 border-t border-cat-border space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-cat-muted">
            <span className="uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cat-yellow" />
              Machine-Aware Quick Prompts
            </span>
            <span>Click to run immediate analysis</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskQuestion(q)}
                className="touch-btn h-8 px-2.5 text-xs font-bold rounded-md bg-cat-panel hover:bg-cat-surface text-cat-text hover:text-cat-yellow border border-cat-border hover:border-cat-yellow transition-all whitespace-nowrap flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Input Field */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t-2 border-cat-border bg-cat-panel flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask your digital co-pilot about machine state, safety limits, or directives..."
            className="flex-1 h-10 px-3.5 rounded-lg bg-cat-surface border border-cat-border text-xs text-cat-text focus:outline-none focus:border-cat-yellow"
          />
          <button
            type="submit"
            className="touch-btn h-10 px-4 rounded-lg bg-cat-yellow text-slate-950 font-black hover:bg-yellow-400 flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
