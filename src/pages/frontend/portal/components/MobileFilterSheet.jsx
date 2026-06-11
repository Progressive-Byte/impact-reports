import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const MobileFilterSheet = ({
  isOpen, onClose,
  children,
  activeFilterCount,
  onExpandAll, onCollapseAll,
  onClearFilters,
  totalResults,
}) => {
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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
                  <SafeIcon icon="FiSliders" className="text-[#E52321]" />
                </div>
                <h3 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 rounded-full px-2.5 py-1 text-[10px] font-black leading-none">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={onExpandAll}   className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Expand</button>
                <button onClick={onCollapseAll} className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Collapse</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {children}
            </div>
            <div className="p-5 border-t border-gray-100 flex-shrink-0">
              <div className={`grid gap-3 ${activeFilterCount > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {activeFilterCount > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="py-4 rounded-2xl bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#E52321]/15 active:scale-95 transition-all"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="py-4 rounded-2xl bg-[#0B0D0F] text-white font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#E52321] active:scale-95 transition-all"
                >
                  Show {totalResults} result{totalResults === 1 ? '' : 's'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterSheet;
