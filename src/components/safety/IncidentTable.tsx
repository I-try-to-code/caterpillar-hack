import React, { useState } from 'react';
import { IncidentLog } from '../../types/alerts';
import { FileSpreadsheet, Download, Search, CheckCircle2 } from 'lucide-react';

interface IncidentTableProps {
  incidents: IncidentLog[];
  onExportCSV: () => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents, onExportCSV }) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = incidents.filter(
    (inc) =>
      inc.type.toLowerCase().includes(filterQuery.toLowerCase()) ||
      String(inc.details.description || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
      inc.severity.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="cab-panel p-4 md:p-5 border border-cat-border space-y-3">
      {/* Header with Search & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cat-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-cat-yellow" />
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wide text-cat-text">
              Detailed Safety Event Log Table
            </h2>
            <span className="text-[10px] text-cat-muted uppercase font-bold">
              Exportable Audit Trail &bull; Regulatory Compliance
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter incidents..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="touch-btn h-9 w-44 bg-cat-bg border border-cat-border rounded px-3 text-xs text-cat-text focus:outline-none focus:border-cat-yellow"
            />
            <Search className="w-3.5 h-3.5 text-cat-muted absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={onExportCSV}
            className="touch-btn h-9 px-3 text-xs font-black uppercase tracking-wider bg-cat-yellow text-cat-bg hover:bg-cat-yellowHover rounded border border-cat-yellow flex items-center space-x-1.5 shadow-sm transition-colors"
            title="Download CSV audit log of all shift incidents"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-cat-border bg-cat-surface/60 text-cat-muted uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Log ID</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Hazard Type</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">Response Action</th>
              <th className="py-2.5 px-3 text-center">Escalated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cat-border/60">
            {filtered.map((inc) => (
              <tr
                key={inc.id}
                className={`hover:bg-cat-surface/40 transition-colors ${
                  inc.severity === 'critical' ? 'bg-cat-red/5' : ''
                }`}
              >
                <td className="py-3 px-3 font-mono font-bold text-cat-yellow whitespace-nowrap">
                  {inc.id}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-cat-text whitespace-nowrap">
                  {inc.timestamp}
                </td>
                <td className="py-3 px-3 font-extrabold text-cat-text uppercase whitespace-nowrap">
                  {inc.type.replace('_', ' ')}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      inc.severity === 'critical'
                        ? 'bg-cat-red text-white'
                        : inc.severity === 'high'
                        ? 'bg-cat-red/20 text-cat-red border border-cat-red/40'
                        : inc.severity === 'medium'
                        ? 'bg-cat-amber/20 text-cat-amber border border-cat-amber/40'
                        : 'bg-cat-surface text-cat-muted border border-cat-border'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </td>
                <td className="py-3 px-3 text-cat-text font-medium min-w-[200px]">
                  {String(inc.details.description || '')}
                </td>
                <td className="py-3 px-3 text-cat-muted min-w-[180px]">
                  {String(inc.details.response || '—')}
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  {inc.escalatedToSupervisor ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cat-green">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-cat-muted text-[11px]">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
