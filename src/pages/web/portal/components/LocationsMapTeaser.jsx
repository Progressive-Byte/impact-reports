import React, { useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SafeIcon from '../../../../common/SafeIcon';
import { usePublicLocationsMap } from '../../../../hooks/usePublicLocationsMap';
import MapSkeleton from '../../locations-map/components/MapSkeleton';

const LocationsMapCanvas = lazy(() => import('../../locations-map/components/LocationsMapCanvas'));

const MAP_PREVIEW_HEIGHT = '260px';

const LocationsMapTeaser = () => {
  const { locations, fetchLocationsMap } = usePublicLocationsMap();

  useEffect(() => { fetchLocationsMap(); }, [fetchLocationsMap]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="w-full md:flex-1 flex flex-col items-start">
          <div className="relative w-14 h-14 rounded-2xl bg-[#0B0D0F] flex items-center justify-center mb-5 flex-shrink-0">
            <SafeIcon icon="FiGlobe" className="text-white text-2xl" />
            <span className="absolute -top-1 -right-1 w-3 h-3">
              <motion.span
                className="absolute inset-0 rounded-full bg-[#E52321]"
                animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="absolute inset-0 rounded-full bg-[#E52321] border-2 border-white" />
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#0B0D0F] tracking-tight mb-1">
            Explore Our Global Reach
          </h3>
          <p className="text-sm text-gray-500 mb-6">Supporting lives around the world</p>

          <Link
            to="/locations"
            className="group inline-flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#E52321] text-white px-6 py-3 rounded-full font-bold text-sm transition-colors duration-300"
          >
            View interactive map
            <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        <div className="w-full md:flex-[1.3] rounded-[1.5rem] overflow-hidden">
          <Suspense fallback={<MapSkeleton minHeight={MAP_PREVIEW_HEIGHT} />}>
            <LocationsMapCanvas
              locations={locations}
              selectedCountry={null}
              onSelectCountry={() => {}}
              minHeight={MAP_PREVIEW_HEIGHT}
            />
          </Suspense>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationsMapTeaser;
