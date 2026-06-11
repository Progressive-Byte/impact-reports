import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const SearchBar = ({ value, onChange, suggestions, showSuggestions, onDismiss, onSuggestionSelect }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) onDismiss();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onDismiss]);

  return (
    <div ref={containerRef} className="w-full relative group mb-8 sm:mb-10">
      <SafeIcon icon="FiSearch" className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-[#E52321] transition-colors" />
      <input
        type="text"
        placeholder="Search by Country, Region, Sector, or Year"
        value={value}
        onChange={onChange}
        onFocus={() => value.length > 1 && suggestions.length > 0 && onSuggestionSelect(null)}
        className="w-full bg-white border border-gray-100 rounded-2xl py-4 sm:py-5 pl-12 sm:pl-14 pr-5 sm:pr-6 text-sm font-medium shadow-xl shadow-black/5 focus:ring-2 focus:ring-[#E52321]/10 transition-all outline-none"
      />
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[1.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] z-50 overflow-hidden py-3"
          >
            <div className="px-5 sm:px-6 py-2 mb-1 border-b border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matched Filters</span>
              <SafeIcon icon="FiFilter" className="text-gray-300 text-xs" />
            </div>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionSelect(s)}
                className="w-full px-5 sm:px-6 py-3 sm:py-4 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#E52321] flex items-center transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-[#E52321]/10 flex items-center justify-center mr-4 transition-colors flex-shrink-0">
                  <SafeIcon icon={s.icon} className="text-gray-400 group-hover:text-[#E52321] text-xs" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{s.type}</span>
                  <span className="truncate">{s.label}</span>
                </div>
                <SafeIcon icon="FiPlus" className="ml-auto flex-shrink-0 text-gray-200 group-hover:text-[#E52321] opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
