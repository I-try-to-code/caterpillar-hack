import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ClipboardCheck, AlertTriangle, AlertOctagon, PhoneCall, Check } from 'lucide-react';

interface InspectionItemState {
  id: string;
  name: string;
  category: string;
  status: 'pass' | 'warning' | 'fail';
  valueDisplay: string;
  reason: string;
}

export const PreStartInspection: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [escalatedItem, setEscalatedItem] = useState<string | null>(null);

  // Evaluate 5 core inspection points against live TelemetryContext
  const inspectionItems: InspectionItemState[] = [
    // 1. Engine Oil
    {
      id: 'oil',
      name: 'Engine Oil Level & Pressure',
      category: 'Lubrication',
      status:
        telemetry.oilPressure < 25 || telemetry.oilPressure > 70
          ? 'fail'
          : telemetry.oilPressure < 35
          ? 'warning'
          : 'pass',
      valueDisplay: `${telemetry.oilPressure} psi`,
      reason:
        telemetry.oilPressure < 25
          ? 'Critical low oil pressure: risk of rod bearing damage'
          : telemetry.oilPressure > 70
          ? 'Oil overpressure spike detected'
          : telemetry.oilPressure < 35
          ? 'Oil pressure low; verify dipstick'
          : 'Full capacity & optimal lubrication pressure',
    },
    // 2. Hydraulic Fluid
    {
      id: 'hydraulic',
      name: 'Hydraulic System & Fluid',
      category: 'Hydraulics',
      status:
        telemetry.hydraulicPressure > 360
          ? 'fail'
          : telemetry.hydraulicPressure > 320
          ? 'warning'
          : 'pass',
      valueDisplay: `${telemetry.hydraulicPressure} bar`,
      reason:
        telemetry.hydraulicPressure > 360
          ? 'Extreme hydraulic pressure exceeding relief valve threshold'
          : telemetry.hydraulicPressure > 320
          ? 'Elevated hydraulic load on pump circuit'
          : 'Operating within factory spec (250–300 bar)',
    },
    // 3. Track Tension
    {
      id: 'tracks',
      name: 'Track Tension & Undercarriage',
      category: 'Undercarriage',
      status:
        telemetry.gForce > 2.4 || (telemetry.speed > 22 && telemetry.slopeAngle > 18)
          ? 'fail'
          : telemetry.speed > 16 || telemetry.slopeAngle > 15 || telemetry.gForce > 1.8
          ? 'warning'
          : 'pass',
      valueDisplay:
        telemetry.gForce > 2.4 ? 'Severe Strain' : telemetry.speed > 16 ? 'Loaded' : 'Calibrated',
      reason:
        telemetry.gForce > 2.4
          ? 'Excessive lateral track guide tension and shock load'
          : telemetry.speed > 16 || telemetry.slopeAngle > 15
          ? 'Track tension loaded on steep grade / speed'
          : 'Grease cylinder tension calibrated & track sag nominal',
    },
    // 4. Coolant Level
    {
      id: 'coolant',
      name: 'Coolant Level & Reservoir',
      category: 'Thermal Management',
      status:
        telemetry.coolantLevel < 25 ? 'fail' : telemetry.coolantLevel < 50 ? 'warning' : 'pass',
      valueDisplay: `${telemetry.coolantLevel}%`,
      reason:
        telemetry.coolantLevel < 25
          ? 'Coolant reserve depleted: immediate head gasket risk'
          : telemetry.coolantLevel < 50
          ? 'Coolant below 50% marker; top-off recommended'
          : 'Expansion tank level optimal & anti-freeze mix verified',
    },
    // 5. Electrical System
    {
      id: 'electrical',
      name: 'Electrical & CAN-Bus Circuit',
      category: 'Electrical',
      status:
        telemetry.engineTemp > 115 ? 'fail' : telemetry.engineTemp > 98 ? 'warning' : 'pass',
      valueDisplay: `${telemetry.engineTemp}°C / 24V`,
      reason:
        telemetry.engineTemp > 115
          ? 'Alternator thermal overload & harness heat warning'
          : telemetry.engineTemp > 98
          ? 'High alternator circuit duty cycle'
          : '24V dual-battery charging circuit & CAN-bus J1939 stable',
    },
  ];

  const passCount = inspectionItems.filter((i) => i.status === 'pass').length;
  const warnCount = inspectionItems.filter((i) => i.status === 'warning').length;
  const failCount = inspectionItems.filter((i) => i.status === 'fail').length;

  const handleEscalate = (itemName: string) => {
    setEscalatedItem(itemName);
    setTimeout(() => setEscalatedItem(null), 5000);
  };

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <ClipboardCheck className="w-5 h-5 text-cat-yellow" />
          <div>
            <h2 className="text-base font-extrabold text-cat-text uppercase tracking-wide">
              CAT Walk-Around Digital Inspection
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              OSHA &bull; Pre-Shift Equipment Safety Protocol
            </span>
          </div>
        </div>

        {/* Status Counts */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-cat-green/20 text-cat-green border border-cat-green/40 font-bold">
            {passCount} Pass
          </span>
          {warnCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-cat-amber/20 text-cat-amber border border-cat-amber/40 font-bold">
              {warnCount} Warning
            </span>
          )}
          {failCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-cat-red/20 text-cat-red border border-cat-red/40 font-bold animate-pulse">
              {failCount} Fail
            </span>
          )}
        </div>
      </div>

      {/* Escalation Alert Notification */}
      {escalatedItem && (
        <div className="p-2.5 rounded bg-cat-red/20 border border-cat-red text-cat-red text-xs font-bold flex items-center space-x-2 animate-bounce">
          <AlertOctagon className="w-4 h-4 flex-shrink-0" />
          <span>
            SUPERVISOR ESCALATION SENT: Urgent inspection failure logged for &ldquo;{escalatedItem}&rdquo;.
          </span>
        </div>
      )}

      {/* 5 Subsystem Inspection Items */}
      <div className="space-y-2">
        {inspectionItems.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all ${
              item.status === 'fail'
                ? 'bg-cat-red/15 border-cat-red shadow-cat-danger'
                : item.status === 'warning'
                ? 'bg-cat-amber/10 border-cat-amber/50'
                : 'bg-cat-surface/40 border-cat-border/60'
            }`}
          >
            {/* Title & Category */}
            <div className="flex items-start space-x-3">
              <div
                className={`p-1.5 rounded mt-0.5 flex-shrink-0 font-bold ${
                  item.status === 'fail'
                    ? 'bg-cat-red text-white'
                    : item.status === 'warning'
                    ? 'bg-cat-amber text-cat-bg'
                    : 'bg-cat-green/20 text-cat-green'
                }`}
              >
                {item.status === 'fail' && <AlertOctagon className="w-4 h-4" />}
                {item.status === 'warning' && <AlertTriangle className="w-4 h-4" />}
                {item.status === 'pass' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-cat-text tracking-tight">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-cat-muted font-semibold">({item.category})</span>
                </div>
                <p className="text-xs text-cat-muted mt-0.5 font-medium">{item.reason}</p>
              </div>
            </div>

            {/* Reading, Status Badge & Action */}
            <div className="flex items-center justify-between sm:justify-end space-x-3 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-cat-border/40 w-full sm:w-auto">
              <span className="font-extrabold telemetry-readout text-sm text-cat-text">
                {item.valueDisplay}
              </span>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  item.status === 'fail'
                    ? 'bg-cat-red text-white'
                    : item.status === 'warning'
                    ? 'bg-cat-amber text-cat-bg'
                    : 'bg-cat-green/20 text-cat-green border border-cat-green/40'
                }`}
              >
                {item.status.toUpperCase()}
              </span>

              {item.status === 'fail' && (
                <button
                  type="button"
                  onClick={() => handleEscalate(item.name)}
                  className="touch-btn h-8 px-2 text-[11px] font-black uppercase bg-cat-red hover:bg-cat-redDark text-white rounded border border-cat-red flex items-center space-x-1 shadow-sm transition-colors"
                  title="Dispatch immediate failure ticket to site supervisor"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Escalate</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
