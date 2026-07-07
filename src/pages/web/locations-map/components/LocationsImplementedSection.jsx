import React, { lazy, Suspense, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import { getGpsData } from '../../../../utils/location';
import MapSkeleton from './MapSkeleton';

const LocationsImplementedMapCanvas = lazy(() => import('./LocationsImplementedMapCanvas'));

const LocationsImplementedSection = ({ locations, loading }) => {
  const [viewMode, setViewMode] = useLocalStorage('globalLocationsViewMode', 'grid');
  const [activeCountry, setActiveCountry] = useState('All');

  const sites = useMemo(
    () => locations.flatMap(({ country, sites }) => (sites || []).map((s) => ({ ...s, country }))),
    [locations]
  );

  const countries = useMemo(() => ['All', ...locations.map((l) => l.country)], [locations]);

  const filtered = activeCountry === 'All'
    ? sites
    : sites.filter((s) => s.country === activeCountry);

  if (!loading && sites.length === 0) return null;

  return (
    <div className="mt-10 md:mt-14 bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] p-6 sm:p-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#E52321]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-[#0B0D0F] tracking-tight">Locations Implemented</h2>
            <p className="text-sm text-gray-400">Geographic footprint of the verified project sites.</p>
          </div>
        </div>
        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
          {['grid', 'list', 'map'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-lg transition-all duration-300 ${viewMode === mode ? 'bg-white text-[#E52321] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <SafeIcon icon={mode === 'grid' ? 'FiGrid' : mode === 'list' ? 'FiList' : 'FiMap'} className="text-lg" />
            </button>
          ))}
        </div>
      </div>

      {countries.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {countries.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCountry(c)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all duration-200 ${
                activeCountry === c
                  ? 'bg-[#E52321] text-white border-[#E52321] shadow-sm shadow-red-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#E52321]/40 hover:text-[#E52321]'
              }`}
            >
              {c !== 'All' && <SafeIcon icon="FiFlag" className="text-[10px]" />}
              {c}
              {c !== 'All' && (
                <span className={`ml-0.5 ${activeCountry === c ? 'text-white/70' : 'text-gray-400'}`}>
                  ({sites.filter((s) => s.country === c).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        viewMode === 'map' ? (
          <MapSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[72px] rounded-2xl bg-gray-100" />
            ))}
          </div>
        )
      ) : viewMode === 'map' ? (
        <Suspense fallback={<MapSkeleton />}>
          <LocationsImplementedMapCanvas sites={filtered} activeCountry={activeCountry} />
        </Suspense>
      ) : (
        <motion.div
          layout
          className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col space-y-3'}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((site, idx) => {
              const coords = (site.lat && site.lng)
                ? `${Number(site.lat).toFixed(4)}, ${Number(site.lng).toFixed(4)}`
                : getGpsData(site.address, site.region);
              return (
                <motion.div
                  layout
                  key={`${site.country}-${site.address}-${idx}`}
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
                    <span className="text-sm font-bold text-[#0B0D0F] truncate">{site.address}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm font-medium">
          No locations found for {activeCountry}.
        </div>
      )}
    </div>
  );
};

export default LocationsImplementedSection;
