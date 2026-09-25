import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { AlertSeverity } from '../../types/alerts';
import { PhoneCall, X, CheckCircle2 } from 'lucide-react';

interface EscalationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
  initialSeverity?: AlertSeverity;
  onConfirm: (notes: string) => void;
}

export const EscalationDialog: React.FC<EscalationDialogProps> = ({
  isOpen,
  onClose,
  initialType = 'Safety Hazard Escalation',
  initialSeverity = 'critical',
  onConfirm,
}) => {
  const { telemetry } = useTelemetry();
  const [operatorNotes, setOperatorNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const now = new Date();
  const timestampStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(operatorNotes || 'Immediate operator escalation dispatched to site office.');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-cat-panel border-2 border-cat-red rounded-lg shadow-2xl overflow-hidden flex flex-col space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cat-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-cat-red text-white">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cat-red block">
                Supervisor Emergency Channel &bull; Site Office Dispatch
              </span>
              <h2 className="text-lg font-black text-cat-text">
                Dispatch Supervisor Escalation
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-cat-muted hover:text-cat-text hover:bg-cat-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-cat-green mx-auto animate-bounce" />
            <h3 className="text-base font-extrabold text-cat-green">
              Escalation Successfully Dispatched
            </h3>
            <p className="text-xs text-cat-muted">
              Ticket logged to Site Safety Dispatch Channel 4. Stand by for supervisor radio.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Metadata Summary */}
            <div className="grid grid-cols-2 gap-2 bg-cat-bg/80 p-3 rounded border border-cat-border">
              <div>
                <span className="text-cat-muted text-[10px] uppercase font-bold block">Alert Type</span>
                <span className="font-extrabold text-cat-text text-sm">{initialType}</span>
              </div>
              <div>
                <span className="text-cat-muted text-[10px] uppercase font-bold block">Severity</span>
                <span className="font-black text-cat-red uppercase text-sm">{initialSeverity}</span>
              </div>
              <div>
                <span className="text-cat-muted text-[10px] uppercase font-bold block">Machine / Operator</span>
                <span className="font-bold text-cat-text">
                  {telemetry.machineId} &bull; {telemetry.operatorName} ({telemetry.operatorId})
                </span>
              </div>
              <div>
                <span className="text-cat-muted text-[10px] uppercase font-bold block">Snapshot Time</span>
                <span className="font-mono font-bold text-cat-yellow">{timestampStr}</span>
              </div>
            </div>

            {/* Live Sensor Telemetry Snapshot */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cat-yellow block mb-1">
                Live Sensor Telemetry Snapshot (CAN-Bus Recorded)
              </span>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px] bg-cat-surface/50 p-2.5 rounded border border-cat-border">
                <div>
                  <span className="text-cat-muted block text-[9px]">RPM:</span>
                  <span className="font-bold text-cat-text">{telemetry.engineRPM}</span>
                </div>
                <div>
                  <span className="text-cat-muted block text-[9px]">PROXIMITY:</span>
                  <span className="font-bold text-cat-text">{telemetry.proximityDistance.toFixed(1)}m</span>
                </div>
                <div>
                  <span className="text-cat-muted block text-[9px]">SLOPE:</span>
                  <span className="font-bold text-cat-text">{telemetry.slopeAngle.toFixed(1)}°</span>
                </div>
                <div>
                  <span className="text-cat-muted block text-[9px]">SEATBELT:</span>
                  <span className={telemetry.seatbeltFastened ? 'text-cat-green font-bold' : 'text-cat-red font-bold'}>
                    {telemetry.seatbeltFastened ? 'FASTENED' : 'UNLATCHED'}
                  </span>
                </div>
                <div>
                  <span className="text-cat-muted block text-[9px]">TRENCH:</span>
                  <span className="font-bold text-cat-text">{telemetry.trenchDistance.toFixed(1)}ft</span>
                </div>
                <div>
                  <span className="text-cat-muted block text-[9px]">ENGINE TEMP:</span>
                  <span className="font-bold text-cat-text">{telemetry.engineTemp}°C</span>
                </div>
              </div>
            </div>

            {/* Operator Notes Input */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-cat-text block mb-1">
                Operator Situation Notes &bull; Comments
              </label>
              <textarea
                rows={3}
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="Describe current ground conditions, obstacle details, or equipment concerns..."
                className="w-full bg-cat-bg border border-cat-border rounded p-2 text-xs text-cat-text focus:outline-none focus:border-cat-yellow"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-cat-border">
              <button
                type="button"
                onClick={onClose}
                className="touch-btn h-9 px-4 text-xs font-bold rounded bg-cat-surface hover:bg-cat-hover text-cat-text border border-cat-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="touch-btn h-9 px-4 text-xs font-black uppercase tracking-wider rounded bg-cat-red hover:bg-cat-redDark text-white shadow-cat-danger flex items-center space-x-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Confirm &bull; Transmit to Supervisor</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
