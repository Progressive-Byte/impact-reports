import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';
import ReportCard from './ReportCard';
import ReportListRow from './ReportListRow';
import Pagination from '@/common/Pagination';

const ReportResults = ({ reports, loading, viewMode, meta, onPageChange }) => (
  <div className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
    <motion.div
      layout
      className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6' : 'flex flex-col space-y-4'}
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

    {!loading && reports.length === 0 && (
      <div className="text-center py-20 sm:py-28 bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
        <div className="w-16 h-16 bg-[#E52321]/10 border border-[#E52321]/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon="FiInbox" className="text-2xl text-[#E52321]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          Try adjusting your filters or search terms to find what you&apos;re looking for.
        </p>
      </div>
    )}

    {meta && meta.pages > 1 && (
      <div className="mt-8 bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <Pagination meta={meta} onPageChange={onPageChange} label="reports" />
      </div>
    )}
  </div>
);

export default ReportResults;
