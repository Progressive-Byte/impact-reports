import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from './SafeIcon';
import { publicApiRequest } from '../services/publicApi';

const SearchModal = ({ isOpen, onClose }) => {
  const [query,       setQuery]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 2) { setSuggestions([]); return; }

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const data = await publicApiRequest(`/api/public/search?q=${encodeURIComponent(searchTerm)}`);
        if (!cancelled) setSuggestions(data.results || []);
      } catch { /* ignore */ }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const handleSelect = (item) => {
    if (item.type === 'report' || item.type === 'id') {
      navigate(`/report/${item.slug || item.id}`);
    } else {
      navigate(`/?filter=${encodeURIComponent(item.label)}&type=${item.type}`);
    }
    setQuery('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="fixed inset-0 bg-[#0B0D0F]/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center">
              <SafeIcon icon="FiSearch" className="text-2xl text-[#E52321] mr-4" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search by name, ID, country, or region..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && suggestions.length > 0) {
                    handleSelect(suggestions[0]);
                  }
                }}
                className="flex-grow bg-transparent border-none outline-none text-xl font-bold text-gray-900 placeholder-gray-300"
              />
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#E52321] hover:text-white transition-all"
              >
                <SafeIcon icon="FiX" className="text-xl" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="py-4">
                  <div className="px-8 py-2 mb-2 text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Results</span>
                  </div>
                  {suggestions.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSelect(item)}
                      className="w-full px-8 py-4 flex items-center hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-[#E52321]/10 flex items-center justify-center mr-5 transition-colors">
                        <SafeIcon icon={item.icon} className="text-gray-400 group-hover:text-[#E52321] text-lg" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                          {item.type === 'id' ? 'Project ID' : item.type}
                        </span>
                        <span className="text-gray-900 font-bold group-hover:text-[#E52321] transition-colors truncate">{item.label}</span>
                        {item.subtitle && (
                          <span className="text-[10px] text-gray-400 font-medium truncate">ID: {item.subtitle}</span>
                        )}
                      </div>
                      <SafeIcon icon="FiArrowRight" className="ml-auto text-gray-200 group-hover:text-[#E52321] opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              ) : query.length > 1 ? (
                <div className="py-20 text-center">
                  <SafeIcon icon="FiInbox" className="text-4xl text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No matching records found</p>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-gray-400 text-sm font-medium">Start typing to search the impact database...</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 px-8 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-[10px] font-bold text-gray-400">
                  <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 mr-2 text-[9px] shadow-sm font-sans">ESC</kbd> to close
                </div>
                <div className="flex items-center text-[10px] font-bold text-gray-400">
                  <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 mr-2 text-[9px] shadow-sm font-sans">ENTER</kbd> to select
                </div>
              </div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Impact Reports Database</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;