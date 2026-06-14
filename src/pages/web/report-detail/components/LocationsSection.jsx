import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';
import CollapsibleSection from '../../../../common/CollapsibleSection';
import { getGpsData } from '../../../../utils/location';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';

const LocationsSection = ({ report, isOpen, onToggle }) => {
  const [viewMode, setViewMode] = useLocalStorage('locationViewMode', 'grid');

  const locations = report.locations?.length > 0
    ? report.locations
    : (report.countries || []).map((c) => ({ address: c, lat: '', lng: '' }));

  return (
    <CollapsibleSection
      title="Locations Implemented"
      subtitle="Geographic footprint of the verified project sites."
      isOpen={isOpen}
      onToggle={onToggle}
      headerRight={
        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
          {['grid', 'list'].map((mode) => (
            <button
              key={mode}
              onClick={(e) => { e.stopPropagation(); setViewMode(mode); }}
              className={`p-2 rounded-lg transition-all duration-300 ${viewMode === mode ? 'bg-white text-[#E52321] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <SafeIcon icon={mode === 'grid' ? 'FiGrid' : 'FiList'} className="text-lg" />
            </button>
          ))}
        </div>
      }
    >
      <div className="p-6 sm:p-10">
        <motion.div
          layout
          className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col space-y-3'}
        >
          <AnimatePresence mode="popLayout">
            {locations.map((loc, idx) => {
              const name   = loc.address || loc;
              const coords = (loc.lat && loc.lng)
                ? `${Number(loc.lat).toFixed(4)}, ${Number(loc.lng).toFixed(4)}`
                : getGpsData(name, report.region);
              return (
                <motion.div
                  layout
                  key={`${name}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center group transition-all duration-300 ${viewMode === 'grid' ? 'p-5' : 'p-4'}`}
                >
                  <div className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center mr-4 shadow-sm group-hover:bg-[#E52321] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    <SafeIcon icon="FiMapPin" className="text-sm text-[#E52321] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">
                      {coords}
                    </span>
                    <span className="text-sm font-bold text-[#0B0D0F] truncate">{name}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </CollapsibleSection>
  );
};

export default LocationsSection;
