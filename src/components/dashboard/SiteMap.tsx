import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Map, Users } from 'lucide-react';

export const SiteMap: React.FC = () => {
  const { telemetry } = useTelemetry();

  // Radar radius scale: proximity distance maps to SVG circle radius
  const radarRadius = Math.max(25, Math.min(80, telemetry.proximityDistance * 6));

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-3">
      {/* Header with Zone Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <Map className="w-5 h-5 text-cat-yellow" />
          <div>
            <h2 className="text-base font-extrabold text-cat-text uppercase tracking-wide">
              2D Construction Site Map &bull; Live Telemetry Overlay
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              GPS Sector Coordinates &bull; Sector 4B
            </span>
          </div>
        </div>

        {/* Personnel Count Indicator reacting to Simulator */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border ${
            telemetry.nearbyPersonnel > 0
              ? 'bg-cat-red/20 text-cat-red border-cat-red animate-pulse'
              : 'bg-cat-green/20 text-cat-green border-cat-green/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>
            {telemetry.nearbyPersonnel > 0
              ? `${telemetry.nearbyPersonnel} Ground Personnel Alert`
              : '0 Personnel in Zone (Clear)'}
          </span>
        </div>
      </div>

      {/* SVG Top-Down Site Map Canvas */}
      <div className="relative w-full aspect-[16/9] bg-[#F8FAFC] rounded-lg border-2 border-cat-border overflow-hidden shadow-inner">
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Red Hazard Pattern */}
            <pattern
              id="hazardPattern"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="16" stroke="#EF4444" strokeWidth="4" opacity="0.35" />
            </pattern>
            {/* Grid Pattern */}
            <pattern id="siteGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="1" />
            </pattern>
          </defs>

          {/* 1. Background Grid */}
          <rect width="800" height="450" fill="url(#siteGrid)" />

          {/* 2. Travel Corridors (Blue) */}
          {/* Main Haul Road Corridor */}
          <path
            d="M 50 220 L 750 220"
            stroke="#3B82F6"
            strokeWidth="48"
            strokeLinecap="round"
            fill="none"
            opacity="0.25"
          />
          <path
            d="M 50 220 L 750 220"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="8 6"
            fill="none"
            opacity="0.8"
          />
          <text x="80" y="225" fill="#60A5FA" fontSize="11" fontWeight="800" letterSpacing="1">
            TRAVEL CORRIDOR A &bull; HAUL ROAD
          </text>

          {/* Secondary Feeder Corridor */}
          <path
            d="M 400 220 L 400 50"
            stroke="#3B82F6"
            strokeWidth="36"
            strokeLinecap="round"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M 400 220 L 400 50"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="6 6"
            fill="none"
            opacity="0.6"
          />

          {/* 3. Hazard Zones (Red) */}
          {/* Trench Edge Hazard */}
          <rect
            x="240"
            y="300"
            width="320"
            height="110"
            fill="url(#hazardPattern)"
            stroke="#EF4444"
            strokeWidth="2"
            rx="4"
          />
          <text x="255" y="325" fill="#EF4444" fontSize="12" fontWeight="900" letterSpacing="1">
            HAZARD ZONE: UNSTABLE TRENCH WALL
          </text>
          <text x="255" y="342" fill="#FCA5A5" fontSize="10" fontWeight="bold">
            Buffer Required: &gt; 3.0m Edge Incline
          </text>

          {/* High-Wall Blast Hazard Zone */}
          <polygon
            points="600,40 760,40 760,150 630,150"
            fill="url(#hazardPattern)"
            stroke="#EF4444"
            strokeWidth="2"
          />
          <text x="615" y="65" fill="#EF4444" fontSize="11" fontWeight="900">
            HAZARD: BLAST AREA
          </text>

          {/* 4. Active Work Zone = Green (Zone B - Trenching) */}
          <rect
            x="180"
            y="70"
            width="250"
            height="180"
            fill="#10B981"
            fillOpacity="0.15"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            rx="6"
          />
          <text x="195" y="95" fill="#10B981" fontSize="13" fontWeight="900" letterSpacing="1">
            ZONE B &bull; ACTIVE WORK ZONE
          </text>
          <text x="195" y="112" fill="#6EE7B7" fontSize="10" fontWeight="bold">
            Excavation &bull; 62% Trench Completed
          </text>

          {/* 5. Three Foot-Traffic Zones */}
          {/* Foot-Traffic Zone 1: Staging Bay Footpath */}
          <rect
            x="60"
            y="60"
            width="90"
            height="110"
            fill="#F59E0B"
            fillOpacity="0.1"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            rx="4"
          />
          <text x="68" y="80" fill="#F59E0B" fontSize="9" fontWeight="bold">
            FOOT TRAFFIC 1
          </text>
          <text x="68" y="95" fill="#D1D5DB" fontSize="8">
            Staging Bay
          </text>

          {/* Foot-Traffic Zone 2: Spotter Observation Post */}
          <rect
            x="480"
            y="90"
            width="100"
            height="90"
            fill="#F59E0B"
            fillOpacity="0.1"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            rx="4"
          />
          <text x="490" y="110" fill="#F59E0B" fontSize="9" fontWeight="bold">
            FOOT TRAFFIC 2
          </text>
          <text x="490" y="125" fill="#D1D5DB" fontSize="8">
            Spotter Post
          </text>

          {/* Foot-Traffic Zone 3: Utility Access Path */}
          <rect
            x="100"
            y="320"
            width="110"
            height="80"
            fill="#F59E0B"
            fillOpacity="0.1"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            rx="4"
          />
          <text x="110" y="340" fill="#F59E0B" fontSize="9" fontWeight="bold">
            FOOT TRAFFIC 3
          </text>
          <text x="110" y="355" fill="#D1D5DB" fontSize="8">
            Utility Access
          </text>

          {/* 6. Machine Position (EXC001) in Zone B */}
          {/* Dynamic Radar Radius Circle */}
          <circle
            cx="310"
            cy="165"
            r={radarRadius}
            fill="none"
            stroke={telemetry.proximityDistance < 3.0 ? '#EF4444' : '#FFCD11'}
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.8"
          />

          {/* Machine Cab Marker */}
          <g transform="translate(295, 150)">
            {/* Machine Tracks */}
            <rect x="0" y="0" width="30" height="8" rx="2" fill="#64748B" stroke="#0F172A" strokeWidth="1" />
            <rect x="0" y="24" width="30" height="8" rx="2" fill="#64748B" stroke="#0F172A" strokeWidth="1" />
            {/* Cab Body */}
            <rect x="5" y="6" width="20" height="20" rx="3" fill="#FFCD11" stroke="#0F172A" strokeWidth="2" />
            {/* Boom Arm */}
            <line x1="20" y1="16" x2="42" y2="16" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
            <circle cx="42" cy="16" r="3" fill="#0F172A" />
            {/* Label */}
            <text x="15" y="-6" fill="#D97706" fontSize="11" fontWeight="900" textAnchor="middle">
              {telemetry.machineId}
            </text>
          </g>

          {/* 7. Nearby Personnel Markers (if any) */}
          {telemetry.nearbyPersonnel > 0 && (
            <g transform="translate(350, 160)">
              <circle cx="0" cy="0" r="14" fill="#EF4444" fillOpacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                {telemetry.nearbyPersonnel}
              </text>
              <text x="0" y="24" fill="#EF4444" fontSize="10" fontWeight="900" textAnchor="middle">
                PERSONNEL IN ZONE
              </text>
            </g>
          )}

          {/* Compass Rose */}
          <g transform="translate(740, 400)">
            <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <polygon points="0,-14 4,0 -4,0" fill="#D97706" />
            <polygon points="0,14 4,0 -4,0" fill="#94A3B8" />
            <text x="0" y="-16" fill="#D97706" fontSize="9" fontWeight="900" textAnchor="middle">
              N
            </text>
          </g>
        </svg>

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-2 left-2 bg-cat-panel/90 border border-cat-border px-2.5 py-1.5 rounded text-[10px] flex items-center space-x-3 backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-cat-green" />
            <span className="text-cat-text font-bold">Active Zone</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-cat-red" />
            <span className="text-cat-text font-bold">Hazard Zone</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="text-cat-text font-bold">Travel Corridor</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-cat-amber" />
            <span className="text-cat-text font-bold">Footpath</span>
          </div>
        </div>
      </div>
    </div>
  );
};
