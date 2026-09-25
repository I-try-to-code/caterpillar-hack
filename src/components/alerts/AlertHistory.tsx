import React, { useState, useMemo } from 'react';
import { useVoiceAlerts } from '../../hooks/useVoiceAlerts';
import { AlertPriorityBadge } from './AlertPriorityBadge';
import {
  X,
  History,
  Download,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  Volume2,
  Trash2,
  Check,
  Search,
} from 'lucide-react';

interface AlertHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ isOpen, onClose }) => {
  const {
    recentAlerts,
    acknowledgeAlert,
    acknowledgeAll,
    escalateAlert,
    clearAlertHistory,
    speakAlert,
  } = useVoiceAlerts();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = useMemo(() => {
    return recentAlerts.filter((alert) => {
      if (severityFilter !== 'all' && alert.severity !== severityFilter) {
        return false;
      }
      if (moduleFilter !== 'all' && alert.module !== moduleFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesMsg = alert.message.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg) return false;
      }
      return true;
    });
  }, [recentAlerts, severityFilter, moduleFilter, searchQuery]);

  // Quick stats
  const totalCount = recentAlerts.length;
  const criticalCount = recentAlerts.filter((a) => a.severity === 'critical').length;
  const unackCount = recentAlerts.filter((a) => !a.acknowledged).length;
  const escalatedCount = recentAlerts.filter((a) => a.escalated).length;

  // CSV Export for Shift Handover
  const handleExportCSV = () => {
    if (recentAlerts.length === 0) return;
    const headers = [
      'Timestamp',
      'Severity',
      'Module',
      'Title',
      'Message',
      'ConditionId',
      'Transition',
      'Acknowledged',
      'Escalated',
    ];

    const rows = recentAlerts.map((a) => [
      `"${a.timestamp}"`,
      `"${a.severity.toUpperCase()}"`,
      `"Module ${a.module}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.message.replace(/"/g, '""')}"`,
      `"${a.conditionId || ''}"`,
      `"${a.stateTransition || ''}"`,
      a.acknowledged ? 'YES' : 'NO',
      a.escalated ? 'YES' : 'NO',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAT_Alert_History_Shift_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 animate-fade-in select-none">
      <div className="bg-cat-panel border-2 border-cat-yellow/60 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-cat-surface border-b border-cat-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-cat-yellow/15 border border-cat-yellow/40 text-cat-yellow">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-cat-text flex items-center gap-2">
                Shift Alert Audit & Handover Log
              </h2>
              <p className="text-xs text-cat-muted">
                Complete event log of all machine state transitions and alerts during current shift.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={recentAlerts.length === 0}
              className="touch-btn h-9 px-3 text-xs font-bold rounded bg-cat-surface hover:bg-cat-yellow hover:text-cat-bg border border-cat-border text-cat-text disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
              title="Export CSV for supervisor handover"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Handover CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-cat-surface text-cat-muted hover:text-cat-text hover:bg-cat-border/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-cat-bg border-b border-cat-border/70 text-xs">
          <div className="bg-cat-surface p-2 rounded border border-cat-border flex items-center justify-between">
            <span className="text-cat-muted font-bold">Total Shift Events:</span>
            <span className="font-mono font-black text-sm text-cat-text">{totalCount}</span>
          </div>
          <div className="bg-cat-surface p-2 rounded border border-cat-border flex items-center justify-between">
            <span className="text-cat-red font-bold flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" /> Critical:
            </span>
            <span className="font-mono font-black text-sm text-cat-red">{criticalCount}</span>
          </div>
          <div className="bg-cat-surface p-2 rounded border border-cat-border flex items-center justify-between">
            <span className="text-cat-amber font-bold">Unacknowledged:</span>
            <span className="font-mono font-black text-sm text-cat-amber">{unackCount}</span>
          </div>
          <div className="bg-cat-surface p-2 rounded border border-cat-border flex items-center justify-between">
            <span className="text-purple-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Escalated:
            </span>
            <span className="font-mono font-black text-sm text-purple-400">{escalatedCount}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-cat-surface/60 border-b border-cat-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-cat-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts..."
                className="pl-8 pr-3 py-1 text-xs rounded bg-cat-bg border border-cat-border text-cat-text focus:outline-none focus:border-cat-yellow w-44"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="py-1 px-2 text-xs rounded bg-cat-bg border border-cat-border text-cat-text focus:outline-none focus:border-cat-yellow font-medium"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="danger">Danger Only</option>
              <option value="warning">Warning Only</option>
              <option value="info">Info / Normalized</option>
            </select>

            {/* Module Filter */}
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="py-1 px-2 text-xs rounded bg-cat-bg border border-cat-border text-cat-text focus:outline-none focus:border-cat-yellow font-medium"
            >
              <option value="all">All Modules</option>
              <option value="A">Module A (Daily Dashboard)</option>
              <option value="B">Module B (Safety Cockpit)</option>
              <option value="C">Module C (Training Hub)</option>
              <option value="D">Module D (Anomalies & Telematics)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {unackCount > 0 && (
              <button
                type="button"
                onClick={acknowledgeAll}
                className="touch-btn h-8 px-2.5 rounded text-xs font-bold bg-cat-surface hover:bg-cat-green hover:text-cat-bg border border-cat-green/50 text-cat-green transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Ack All ({unackCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={clearAlertHistory}
              disabled={recentAlerts.length === 0}
              className="touch-btn h-8 px-2.5 rounded text-xs font-bold bg-cat-surface hover:bg-cat-red hover:text-white border border-cat-border text-cat-muted transition-colors flex items-center gap-1 disabled:opacity-40"
              title="Clear shift history"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Alerts Table / List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-cat-muted">
              <CheckCircle2 className="w-10 h-10 text-cat-green/60 mb-2" />
              <p className="text-sm font-bold">No alerts matching filter criteria.</p>
              <p className="text-xs">Machine operating within nominal safety thresholds.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cat-border text-[11px] text-cat-muted uppercase font-black tracking-wider bg-cat-surface/50">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-2">Severity</th>
                  <th className="py-2.5 px-2">Module</th>
                  <th className="py-2.5 px-3">Condition / Description</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cat-border/40">
                {filteredAlerts.map((alert) => {
                  const isCritical = alert.severity === 'critical';
                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-cat-surface/80 transition-colors ${
                        isCritical ? 'bg-cat-red/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-cat-muted whitespace-nowrap">
                        {alert.timestamp}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <AlertPriorityBadge severity={alert.severity} size="sm" />
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-cat-surface text-cat-yellow border border-cat-border">
                          Mod {alert.module}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-cat-text">{alert.title}</span>
                          {alert.stateTransition && (
                            <span
                              className={`text-[9px] font-bold uppercase px-1 py-0.2 rounded ${
                                alert.stateTransition === 'escalated'
                                  ? 'bg-cat-red/20 text-cat-red'
                                  : alert.stateTransition === 'normalized'
                                  ? 'bg-cat-green/20 text-cat-green'
                                  : 'bg-cat-surface text-cat-muted'
                              }`}
                            >
                              {alert.stateTransition}
                            </span>
                          )}
                        </div>
                        <p className="text-cat-muted text-[11px] mt-0.5 line-clamp-1">
                          {alert.message}
                        </p>
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {alert.acknowledged ? (
                            <span className="text-[10px] font-bold text-cat-green flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Ack
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-cat-amber">Pending</span>
                          )}
                          {alert.escalated && (
                            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/30">
                              Escalated
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => speakAlert(alert, true)}
                            className="p-1 rounded bg-cat-surface text-cat-muted hover:text-cat-yellow border border-cat-border"
                            title="Replay Voice Announcement"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          {!alert.acknowledged && (
                            <button
                              type="button"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="px-2 py-0.5 rounded text-[11px] font-bold bg-cat-surface hover:bg-cat-green hover:text-cat-bg border border-cat-border text-cat-text transition-colors"
                            >
                              Ack
                            </button>
                          )}

                          {!alert.escalated && (
                            <button
                              type="button"
                              onClick={() => escalateAlert(alert.id)}
                              className="px-2 py-0.5 rounded text-[11px] font-bold bg-cat-surface hover:bg-cat-red hover:text-white border border-cat-border text-cat-muted transition-colors"
                            >
                              Escalate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-cat-surface border-t border-cat-border flex items-center justify-between text-xs text-cat-muted">
          <span>Showing {filteredAlerts.length} shift log events</span>
          <button
            type="button"
            onClick={onClose}
            className="touch-btn px-4 py-1.5 rounded font-bold bg-cat-surface hover:bg-cat-border text-cat-text border border-cat-border transition-colors"
          >
            Close Log
          </button>
        </div>
      </div>
    </div>
  );
};
