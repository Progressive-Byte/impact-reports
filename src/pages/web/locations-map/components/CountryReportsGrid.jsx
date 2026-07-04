import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import ReportCard from '../../portal/components/ReportCard';
import ReportListRow from '../../portal/components/ReportListRow';
import ResultsToolbar from '../../portal/components/ResultsToolbar';

const CountryReportsGrid = ({ country, reports, onClear }) => {
  const [viewMode, setViewMode] = useLocalStorage('reportViewMode', 'grid');

  return (
    <div className="mt-10 md:mt-14">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
            <SafeIcon icon="FiFlag" className="text-[#E52321]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reports in</p>
            <h2 className="text-xl font-black text-[#0B0D0F] tracking-tight truncate">{country}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] font-bold text-[#E52321] hover:underline flex-shrink-0"
        >
          Show all countries
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
          <p className="text-gray-500">No reports found for {country}.</p>
        </div>
      ) : (
        <>
          <ResultsToolbar
            loading={false}
            totalResults={reports.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <motion.div
            layout
            className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6' : 'flex flex-col space-y-4'}
          >
            <AnimatePresence mode="popLayout">
              {reports.map((report) => (
                <motion.div
                  layout
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  {viewMode === 'grid' ? <ReportCard report={report} /> : <ReportListRow report={report} />}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CountryReportsGrid;
