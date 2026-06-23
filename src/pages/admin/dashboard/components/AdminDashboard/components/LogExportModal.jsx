import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../../common/SafeIcon';
import { getCookie } from '../../../../../../utils/cookies';

const ALL_COLS = [
  { key: 'Type',      label: 'Type' },
  { key: 'Username',  label: 'Username' },
  { key: 'Role',      label: 'Role' },
  { key: 'IP',        label: 'IP Address' },
  { key: 'Timestamp', label: 'Timestamp' },
  { key: 'Archived',  label: 'Archived' },
  { key: 'Details',   label: 'Details' },
];

const TYPE_TAG = {
  login:  { label: 'LOGIN',  cls: 'bg-green-600 text-white' },
  logout: { label: 'LOGOUT', cls: 'bg-orange-500 text-white' },
  purge:  { label: 'PURGE',  cls: 'bg-red-700 text-white' },
};

function mapLog(l) {
  return {
    Type:      l.type      || '',
    Username:  l.username  || '',
    Role:      l.role      || '',
    IP:        l.ip        || '',
    Timestamp: l.createdAt
      ? new Date(l.createdAt).toISOString().replace('T', ' ').slice(0, 19)
      : '',
    Archived:  l.archivedAt
      ? new Date(l.archivedAt).toISOString().replace('T', ' ').slice(0, 19)
      : '',
    Details:   l.details   || '',
  };
}

const LogExportModal = ({ scope, dateFrom, dateTo, previewLogs = [], onClose }) => {
  const [selectedCols, setSelectedCols] = useState(new Set(ALL_COLS.map(c => c.key)));
  const [format,       setFormat]       = useState('csv');
  const [exporting,    setExporting]    = useState(false);

  const toggleCol = (key) =>
    setSelectedCols(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const visibleCols  = ALL_COLS.filter(c => selectedCols.has(c.key));
  const previewRows  = previewLogs.slice(0, 5).map(mapLog);
  const canDownload  = selectedCols.size > 0;

  const handleDownload = async () => {
    if (!canDownload) return;
    setExporting(true);
    try {
      const token  = getCookie('adminToken');
      const params = new URLSearchParams({ format, scope });
      if (scope === 'custom') { params.set('from', dateFrom); params.set('to', dateTo); }
      if (selectedCols.size < ALL_COLS.length) {
        params.set('columns', [...selectedCols].join(','));
      }
      const response = await fetch(`/api/auth/logs/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Export failed');
      }
      const blob = await response.blob();
      const ext  = format === 'excel' ? 'xlsx' : 'csv';
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      const suffix = scope === 'custom' ? `${dateFrom}-to-${dateTo}` : scope;
      a.download   = `activity-logs-${suffix}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Logs exported');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                <SafeIcon icon="FiDownload" className="text-[#0B0D0F] text-base" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#0B0D0F]">Export Activity Logs</h2>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5 capitalize">
                  Scope: {scope === 'custom' ? `${dateFrom} → ${dateTo}` : scope === 'year' ? 'Last 1 Year' : 'All History'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              <SafeIcon icon="FiX" className="text-sm" />
            </button>
          </div>

          <div className="px-7 py-5 space-y-5">
            {/* Column toggles */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-black text-[#0B0D0F] uppercase tracking-widest">
                  Columns to include
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCols(new Set(ALL_COLS.map(c => c.key)))}
                    className="text-[10px] font-bold text-[#E52321] hover:underline"
                  >
                    Select all
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={() => setSelectedCols(new Set())}
                    className="text-[10px] font-bold text-gray-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_COLS.map(col => {
                  const on = selectedCols.has(col.key);
                  return (
                    <button
                      key={col.key}
                      onClick={() => toggleCol(col.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        on
                          ? 'bg-[#0B0D0F] border-[#0B0D0F] text-white'
                          : 'bg-white border-gray-200 text-gray-400 line-through'
                      }`}
                    >
                      {on && <SafeIcon icon="FiCheck" className="text-[10px]" />}
                      {col.label}
                    </button>
                  );
                })}
              </div>
              {selectedCols.size === 0 && (
                <p className="text-[11px] text-[#E52321] font-medium mt-2">
                  Select at least one column to export.
                </p>
              )}
            </div>

            {/* Live preview table */}
            <div>
              <p className="text-xs font-black text-[#0B0D0F] uppercase tracking-widest mb-2.5">
                Preview
                <span className="ml-2 text-[10px] font-bold text-gray-400 normal-case tracking-normal">
                  {previewRows.length > 0
                    ? `showing first ${previewRows.length} rows`
                    : 'no data loaded yet'}
                </span>
              </p>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                {visibleCols.length === 0 || previewRows.length === 0 ? (
                  <div className="py-8 text-center bg-gray-50">
                    <p className="text-xs text-gray-400">
                      {visibleCols.length === 0
                        ? 'No columns selected — nothing to preview'
                        : 'No log data available for preview'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {visibleCols.map(col => (
                            <th key={col.key} className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                            {visibleCols.map(col => (
                              <td key={col.key} className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap max-w-[160px] truncate">
                                {col.key === 'Type' ? (
                                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black ${
                                    TYPE_TAG[row.Type]?.cls ?? 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {(TYPE_TAG[row.Type]?.label ?? row.Type).toUpperCase()}
                                  </span>
                                ) : (
                                  row[col.key] || <span className="text-gray-300">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 pb-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            {/* Format picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Format:</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
                {['csv', 'excel'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 transition-colors ${
                      format === f ? 'bg-[#0B0D0F] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {f === 'csv' ? 'CSV' : 'Excel'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={!canDownload || exporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0D0F] hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {exporting
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <SafeIcon icon="FiDownload" className="text-sm" />
                }
                {exporting ? 'Exporting…' : `Download ${format.toUpperCase()}`}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogExportModal;
