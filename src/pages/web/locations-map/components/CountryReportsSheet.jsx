import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';
import ReportListRow from '../../portal/components/ReportListRow';

const CountryReportsSheet = ({ isOpen, onClose, country, reports }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[70] lg:hidden backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[80] lg:hidden bg-white rounded-t-[2rem] max-h-[88vh] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.15)]"
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
                  <SafeIcon icon="FiFlag" className="text-[#E52321]" />
                </div>
                <h3 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest truncate">
                  {country}
                </h3>
                <span className="bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 rounded-full px-2.5 py-1 text-[10px] font-black leading-none flex-shrink-0">
                  {reports.length} report{reports.length === 1 ? '' : 's'}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors"
              >
                <SafeIcon icon="FiX" className="text-gray-500 text-sm" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {reports.map((report) => (
                <ReportListRow key={report.id} report={report} />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CountryReportsSheet;
