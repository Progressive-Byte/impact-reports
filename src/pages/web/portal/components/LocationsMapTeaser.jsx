import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SafeIcon from '../../../../common/SafeIcon';

const MAX_VISIBLE_PINS = 4;

const LocationsMapTeaser = ({ totalCountries, countries = [] }) => {
  const visiblePins = countries.slice(0, MAX_VISIBLE_PINS);
  const extraCount = countries.length - visiblePins.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <Link
        to="/locations"
        className="group relative block overflow-hidden bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-gray-100 hover:border-[#E52321]/20 transition-all duration-500 p-6 sm:p-8"
      >
        {/* Decorative dotted "map" motif — pure CSS, no map library */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#0B0D0F 1.2px, transparent 1.2px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0B0D0F] group-hover:bg-[#E52321] flex items-center justify-center flex-shrink-0 transition-colors duration-500">
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

            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-[#0B0D0F] tracking-tight">
                Explore Our Global Reach
              </h3>
              {/* <p className="text-sm text-gray-500 mt-1 mb-3">
                {totalCountries > 0
                  ? `Published reports across ${totalCountries} ${totalCountries === 1 ? 'country' : 'countries'}.`
                  : 'See every reporting location on an interactive map.'}
              </p> */}

              {visiblePins.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {visiblePins.map((country) => (
                    <span
                      key={country}
                      className="inline-flex items-center gap-1.5 bg-gray-50 group-hover:bg-[#E52321]/5 border border-gray-100 group-hover:border-[#E52321]/20 rounded-full mt-1 px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors duration-500"
                    >
                      <SafeIcon icon="FiMapPin" className="text-[#E52321] text-[10px]" />
                      {country}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span className="inline-flex items-center bg-[#0B0D0F]/5 rounded-full px-3 py-1.5 text-xs font-black text-gray-500">
                      +{extraCount} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <span className="inline-flex items-center gap-2 bg-[#E52321] group-hover:bg-[#0B0D0F] text-white px-6 py-3 rounded-full font-bold text-sm transition-colors duration-500 flex-shrink-0 self-start sm:self-center">
            View interactive map
            <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default LocationsMapTeaser;
