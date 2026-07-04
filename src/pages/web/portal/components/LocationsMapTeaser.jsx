import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SafeIcon from '../../../../common/SafeIcon';

const LocationsMapTeaser = ({ totalCountries }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.6 }}
    className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
  >
    <div className="flex items-center gap-4 text-center sm:text-left">
      <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-[#0B0D0F] items-center justify-center flex-shrink-0">
        <SafeIcon icon="FiGlobe" className="text-white text-2xl" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-black text-[#0B0D0F] tracking-tight">
          Explore Our Global Reach
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {totalCountries > 0
            ? `Published reports across ${totalCountries} ${totalCountries === 1 ? 'country' : 'countries'} — see them all on the map.`
            : 'See every reporting location on an interactive map.'}
        </p>
      </div>
    </div>
    <Link
      to="/locations"
      className="inline-flex items-center gap-2 bg-[#E52321] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#0B0D0F] transition-colors flex-shrink-0"
    >
      View interactive map <FiArrowRight />
    </Link>
  </motion.div>
);

export default LocationsMapTeaser;
