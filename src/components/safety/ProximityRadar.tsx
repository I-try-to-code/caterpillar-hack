import React, { useRef, useEffect } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { evaluateProximitySafety } from '../../lib/safetyRules';
import { Radio, Users, Eye, AlertOctagon } from 'lucide-react';

export const ProximityRadar: React.FC = () => {
  const { telemetry } = useTelemetry();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);

  const proximity = evaluateProximitySafety(telemetry.proximityDistance);
  const isDanger = telemetry.proximityDistance < 5.0;
  const isCritical = telemetry.proximityDistance < 3.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = width / 2 - 20;

      ctx.clearRect(0, 0, width, height);

      // 1. Radar Background
      ctx.fillStyle = '#0E0E1C';
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Distance Rings: 5m, 10m, 20m, 30m
      const rings = [
        { dist: 5, radius: (5 / 30) * maxRadius, label: '5m' },
        { dist: 10, radius: (10 / 30) * maxRadius, label: '10m' },
        { dist: 20, radius: (20 / 30) * maxRadius, label: '20m' },
        { dist: 30, radius: maxRadius, label: '30m' },
      ];

      rings.forEach((ring) => {
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        if (ring.dist === 5 && isDanger) {
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2.5;
          ctx.fillStyle = isCritical ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)';
          ctx.fill();
        } else if (ring.dist === 10 && telemetry.proximityDistance <= 10 && !isDanger) {
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#272745';
          ctx.lineWidth = 1;
        }
        ctx.stroke();

        // Distance Labels
        ctx.fillStyle = ring.dist === 5 && isDanger ? '#EF4444' : '#64748B';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(ring.label, cx + 4, cy - ring.radius + 12);
      });

      // 3. Crosshairs
      ctx.strokeStyle = '#252542';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.stroke();

      // 4. Rotating Sweep Beam
      angleRef.current = (angleRef.current + 0.035) % (Math.PI * 2);
      const sweepAngle = angleRef.current;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      const sweepColor = isDanger ? '239, 68, 68' : '255, 205, 17';
      gradient.addColorStop(0, `rgba(${sweepColor}, 0)`);
      gradient.addColorStop(1, `rgba(${sweepColor}, 0.25)`);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, sweepAngle - 0.4, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sweep Leading Edge Line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxRadius, cy + Math.sin(sweepAngle) * maxRadius);
      ctx.strokeStyle = isDanger ? '#EF4444' : '#FFCD11';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 5. Personnel Blips (Reacting to nearbyPersonnel & proximityDistance)
      if (telemetry.nearbyPersonnel > 0) {
        const personnelDistancePx = Math.max(
          18,
          Math.min(maxRadius - 10, (telemetry.proximityDistance / 30) * maxRadius)
        );

        // Render personnel around the machine
        for (let i = 0; i < telemetry.nearbyPersonnel; i++) {
          const personAngle = 0.8 + (i * Math.PI) / 3.5;
          const px = cx + Math.cos(personAngle) * personnelDistancePx;
          const py = cy + Math.sin(personAngle) * personnelDistancePx;

          // Pulsating hazard aura
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.fill();

          // Core blip
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#EF4444';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Person tag
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.fillText(`P${i + 1}`, px + 8, py - 4);
        }
      }

      // 6. Machine Silhouette Center Icon
      ctx.fillStyle = '#FFCD11';
      ctx.beginPath();
      ctx.roundRect(cx - 10, cy - 14, 20, 28, 4);
      ctx.fill();
      ctx.strokeStyle = '#1A1A2E';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Boom orientation line
      ctx.strokeStyle = '#FFCD11';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - 24);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [telemetry.proximityDistance, telemetry.nearbyPersonnel, isDanger, isCritical]);

  return (
    <div
      className={`cab-panel p-4 md:p-5 border-2 rounded-lg space-y-3 transition-all ${
        isDanger ? 'border-cat-red bg-cat-red/5 shadow-cat-danger' : 'border-cat-border'
      }`}
    >
      {/* Header with Proximity Badge */}
      <div className="flex items-center justify-between border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded ${isDanger ? 'bg-cat-red text-white' : 'bg-cat-surface text-cat-yellow'}`}>
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wide text-cat-text">
              360° Proximity Radar HUD
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              Ultrasonic &bull; LiDAR Active Sweep
            </span>
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border flex items-center space-x-1.5 ${
            isDanger
              ? 'bg-cat-red/20 text-cat-red border-cat-red animate-pulse'
              : proximity.status === 'caution'
              ? 'bg-cat-amber/20 text-cat-amber border-cat-amber'
              : 'bg-cat-green/20 text-cat-green border-cat-green/40'
          }`}
        >
          {isDanger && <AlertOctagon className="w-3.5 h-3.5" />}
          <span>{proximity.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Canvas Radar Container */}
      <div className="flex flex-col items-center justify-center relative py-1">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="rounded-full shadow-2xl border-2 border-cat-border/80 w-64 h-64 sm:w-72 sm:h-72"
        />

        {/* Hazard Overlay Alert */}
        {isDanger && (
          <div className="absolute top-2 bg-cat-red text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-cat-danger animate-bounce">
            &lt; 5m DANGER ZONE BREACH
          </div>
        )}
      </div>

      {/* Live Readouts Strip */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cat-border/60 text-xs">
        <div className="bg-cat-surface/50 p-2.5 rounded border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Nearest Clearance</span>
            <Eye className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <span
            className={`text-xl font-black telemetry-readout mt-1 block ${
              isDanger ? 'text-cat-red' : proximity.status === 'caution' ? 'text-cat-amber' : 'text-cat-green'
            }`}
          >
            {telemetry.proximityDistance.toFixed(1)} <span className="text-xs font-normal">m</span>
          </span>
          <span className="text-[10px] text-cat-muted">Threshold: &gt; 5m required</span>
        </div>

        <div className="bg-cat-surface/50 p-2.5 rounded border border-cat-border/60">
          <div className="flex items-center justify-between text-cat-muted text-[10px] uppercase font-bold">
            <span>Blindspot Personnel</span>
            <Users className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <span
            className={`text-xl font-black telemetry-readout mt-1 block ${
              telemetry.nearbyPersonnel > 0 ? 'text-cat-red' : 'text-cat-green'
            }`}
          >
            {telemetry.nearbyPersonnel} <span className="text-xs font-normal">pers</span>
          </span>
          <span className="text-[10px] text-cat-muted">
            {telemetry.nearbyPersonnel > 0 ? 'WARNING: Personnel in radius' : 'Zero workers in perimeter'}
          </span>
        </div>
      </div>
    </div>
  );
};
