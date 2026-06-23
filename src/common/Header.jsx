import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SafeIcon from './SafeIcon';
import { motion } from 'framer-motion';

const LogoIcon = ({ className = "w-10 h-10 sm:w-12 sm:h-12" }) => (
  <div className={`${className} rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/10 overflow-hidden bg-white border border-gray-100 relative`}>
    <img src="https://media-manager-c.questera.ai/greta-media/89a4c5054b952da31823a698574da50f94645c57fede58bf38e1dc553a5f65aa2a5866630191987f5de6ebb268aeb9b2/images/aW1hZ2UvcG5n/236c9d88c2db247a8226fc26d4a8c574.png" alt="Human Concern Logo" className="w-full h-full object-cover" />
  </div>
);

const Header = ({ onSearchClick }) => {
  const { pathname } = useLocation();
  const isReportDetail = /^\/report\//.test(pathname);

  return (
    <>
      <header className="absolute top-4 sm:top-6 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex justify-between items-center px-3 py-2 sm:px-6 sm:py-3 border border-gray-100">
            <Link to="/" className="flex items-center space-x-3 group">
              <LogoIcon />
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tighter text-black uppercase leading-none">
                  Impact Reports
                </span>
                <span className="font-bold text-[9px] sm:text-[11px] tracking-[0.15em] text-gray-400 uppercase leading-none mt-1 sm:mt-1.5">
                  Human Concern USA
                </span>
              </div>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <nav className="flex items-center">
                <button
                  onClick={onSearchClick}
                  data-cursor-label="SEARCH"
                  className="text-[14px] sm:text-[15px] font-bold text-black hover:text-[#E52321] flex items-center transition-all duration-300 ease-in-out group px-3 sm:px-4 py-2"
                >
                  <SafeIcon icon="FiSearch" className="text-lg group-hover:scale-110 transition-transform sm:mr-2" />
                  <span className="hidden md:inline">Search Reports</span>
                </button>
              </nav>
              <a href="#" data-cursor-label="DONATE" className="bg-[#E52321] hover:bg-[#C91D1B] text-white px-5 py-2.5 sm:px-7 sm:py-3 rounded-full text-[12px] sm:text-sm font-black tracking-widest transition-all duration-300 shadow-md shadow-red-900/10 uppercase active:scale-95">
                Donate
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Search Button */}
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        whileHover={{ x: -10 }}
        onClick={onSearchClick}
        data-cursor-label="SEARCH"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] bg-[#E52321] text-white p-2.5 pl-4 sm:p-4 sm:pl-6 rounded-l-full shadow-2xl flex items-center space-x-2 sm:space-x-3 group transition-all duration-300"
        title="Open Search"
      >
        <div className="flex flex-col items-center justify-center">
          <SafeIcon icon="FiSearch" className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Search</span>
        </div>
      </motion.button>
    </>
  );
};

export default Header;
