import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { AnomalyTimeSeriesPoint } from '../../types/anomalies';
import { SHIFT_ANOMALY_TIME_SERIES } from '../../data/anomalyHistory';
import { BarChart3 } from 'lucide-react';

interface AnomalyHistoryChartProps {
  data?: AnomalyTimeSeriesPoint[];
}

type ChartMetric = 'all' | 'idle' | 'gforce' | 'hydraulic';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cat-panel p-3 rounded-lg border-2 border-cat-border shadow-xl text-xs space-y-1.5 select-none z-30">
        <div className="font-mono text-cat-yellow font-bold border-b border-cat-border pb-1">
          Shift Interval: {label}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold telemetry-readout text-cat-text">
              {entry.name === 'Idle Time'
                ? `${entry.value} min`
                : entry.name === 'G-Force'
                ? `${entry.value} g`
                : `${entry.value} bar`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnomalyHistoryChart: React.FC<AnomalyHistoryChartProps> = ({
  data = SHIFT_ANOMALY_TIME_SERIES,
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('all');

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border rounded-lg space-y-4">
      {/* Chart Header & Metric Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cat-border/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-cat-surface text-cat-yellow border border-cat-border">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cat-yellow block">
              Shift Telematics Time-Series Correlation
            </span>
            <h3 className="text-base font-extrabold text-cat-text">
              Mechanical Stress & Idling Timeline
            </h3>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center bg-cat-surface p-1 rounded-md border border-cat-border self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              activeMetric === 'all'
                ? 'bg-cat-yellow text-slate-950 shadow-sm'
                : 'text-cat-muted hover:text-cat-text'
            }`}
          >
            All Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('idle')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              activeMetric === 'idle'
                ? 'bg-cat-yellow text-slate-950 shadow-sm'
                : 'text-cat-muted hover:text-cat-text'
            }`}
          >
            Idle Time
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('gforce')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              activeMetric === 'gforce'
                ? 'bg-cat-yellow text-slate-950 shadow-sm'
                : 'text-cat-muted hover:text-cat-text'
            }`}
          >
            G-Force
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('hydraulic')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              activeMetric === 'hydraulic'
                ? 'bg-cat-yellow text-slate-950 shadow-sm'
                : 'text-cat-muted hover:text-cat-text'
            }`}
          >
            Hydraulic
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tick={{ fill: '#64748B' }}
            />

            {/* Left Y Axis for Idle & G-force */}
            {(activeMetric === 'all' || activeMetric === 'idle' || activeMetric === 'gforce') && (
              <YAxis
                yAxisId="left"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tick={{ fill: '#64748B' }}
                domain={[0, 'auto']}
              />
            )}

            {/* Right Y Axis for Hydraulic Pressure (bar) */}
            {(activeMetric === 'all' || activeMetric === 'hydraulic') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#0284C7"
                fontSize={11}
                tickLine={false}
                tick={{ fill: '#0284C7' }}
                domain={[200, 420]}
              />
            )}

            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
              iconType="circle"
              iconSize={8}
            />

            {/* Reference Lines for critical thresholds */}
            {(activeMetric === 'all' || activeMetric === 'idle') && (
              <ReferenceLine
                yAxisId="left"
                y={10}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{ value: 'Idle Critical (10m)', fill: '#EF4444', fontSize: 10, position: 'insideTopLeft' }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'gforce') && (
              <ReferenceLine
                yAxisId="left"
                y={1.8}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{ value: 'G-Force Max (1.8g)', fill: '#F59E0B', fontSize: 10, position: 'insideBottomLeft' }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'hydraulic') && (
              <ReferenceLine
                yAxisId="right"
                y={340}
                stroke="#F97316"
                strokeDasharray="4 4"
                label={{ value: 'Hyd Relief (340 bar)', fill: '#F97316', fontSize: 10, position: 'insideTopRight' }}
              />
            )}

            {/* Metric Lines */}
            {(activeMetric === 'all' || activeMetric === 'idle') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="idleTimeMinutes"
                name="Idle Time"
                stroke="#FFCD11"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#FFCD11' }}
                activeDot={{ r: 5 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'gforce') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="gForce"
                name="G-Force"
                stroke="#F87171"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#F87171' }}
                activeDot={{ r: 5 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'hydraulic') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hydraulicPressure"
                name="Hydraulic Pressure"
                stroke="#38BDF8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#38BDF8' }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-cat-muted pt-2 border-t border-cat-border/60">
        <span>Logged over 8-hour excavator production shift</span>
        <span className="font-mono text-cat-yellow font-bold">
          Correlated with Task: Trenching — Zone B
        </span>
      </div>
    </div>
  );
};
