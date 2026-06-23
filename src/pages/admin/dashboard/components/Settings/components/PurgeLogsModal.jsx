import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../../../common/SafeIcon';
import { getCookie } from '../../../../../../utils/cookies';

const PurgeLogsModal = ({ onClose, onConfirm, purging }) => {
  const [downloaded, setDownloaded] = useState(null); // null | 'yes' | 'no'
  const [downloading, setDownloading] = useState(false);
  const [dlFormat, setDlFormat] = useState('csv');

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token    = getCookie('adminToken');
      const response = await fetch(`/api/auth/logs/export?format=${dlFormat}&scope=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Export failed');
      const blob     = await response.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      a.download     = `audit-logs-${new Date().toISOString().split('T')[0]}.${dlFormat === 'excel' ? 'xlsx' : 'csv'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore — user can still proceed */
    } finally {
      setDownloading(false);
    }
  };

  const canPurge = downloaded === 'yes';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#E52321]/5 border-b border-red-100 px-7 pt-7 pb-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#E52321]/10 flex items-center justify-center flex-shrink-0">
              <SafeIcon icon="FiAlertTriangle" className="text-[#E52321] text-xl" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0B0D0F]">Purge Audit Logs</h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                This will permanently delete all activity logs older than 1 year. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <SafeIcon icon="FiX" className="text-sm" />
            </button>
          </div>

          <div className="px-7 py-6 space-y-6">
            {/* Download section */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <SafeIcon icon="FiDownload" className="text-gray-500 text-sm" />
                <p className="text-sm font-bold text-[#0B0D0F]">Download logs before purging?</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                We recommend downloading a full copy of all audit logs before permanently deleting them.
              </p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                {downloading
                  ? <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  : <SafeIcon icon="FiDownload" className="text-sm" />
                }
                {downloading ? 'Downloading…' : 'Download All Logs (CSV)'}
              </button>
            </div>

            {/* Yes / No confirmation */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#0B0D0F]">Have you downloaded your logs?</p>
              <div className="flex gap-3">
                {[
                  { value: 'yes', label: 'Yes, proceed to purge' },
                  { value: 'no',  label: 'No, cancel' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2.5 flex-1 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      downloaded === opt.value
                        ? opt.value === 'yes'
                          ? 'border-[#E52321] bg-red-50'
                          : 'border-gray-400 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purge-confirm"
                      value={opt.value}
                      checked={downloaded === opt.value}
                      onChange={() => setDownloaded(opt.value)}
                      className="accent-[#E52321]"
                    />
                    <span className={`text-xs font-bold ${
                      downloaded === opt.value
                        ? opt.value === 'yes' ? 'text-[#E52321]' : 'text-gray-700'
                        : 'text-gray-500'
                    }`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 pb-7 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canPurge || purging}
              className="flex-1 py-3 bg-[#E52321] hover:bg-[#c91d1b] text-white rounded-xl text-sm font-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {purging
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <SafeIcon icon="FiTrash2" className="text-sm" />
              }
              {purging ? 'Purging…' : 'Purge All Data'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PurgeLogsModal;
