import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import CustomCursor from '../common/CustomCursor';
import SearchModal from './SearchModal';

const Layout = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchClick = (e) => {
    if (e) e.preventDefault();
    setIsSearchOpen(true);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const LogoIcon = ({ className = "w-10 h-10 sm:w-12 sm:h-12" }) => (
    <div className={`${className} rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/10 overflow-hidden bg-white border border-gray-100 relative`}>
      <img src="https://media-manager-c.questera.ai/greta-media/89a4c5054b952da31823a698574da50f94645c57fede58bf38e1dc553a5f65aa2a5866630191987f5de6ebb268aeb9b2/images/aW1hZ2UvcG5n/236c9d88c2db247a8226fc26d4a8c574.png" alt="Human Concern Logo" className="w-full h-full object-cover" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col relative">
      {/* <CustomCursor /> */}
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
                  onClick={handleSearchClick}
                  data-cursor-label="SEARCH"
                  className="text-[14px] sm:text-[15px] font-bold text-black hover:text-[#E52321] flex items-center transition-all duration-300 ease-in-out group px-3 sm:px-4 py-2"
                >
                  <SafeIcon icon="FiSearch" className="text-lg group-hover:scale-110 transition-transform sm:mr-2" />
                  <span className="hidden md:inline">Search Reports</span>
                </button>
              </nav>
              <a href="#" data-cursor-label="DONATE" className="bg-[#E52321] hover:bg-[#C91D1B] text-white px-5 py-2.5 sm:px-7 sm:py-3 rounded-full text-[12px] sm:text-sm font-black tracking-widest transition-all duration-300 shadow-md shadow-red-900/10 uppercase active:scale-95" >
                Donate
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Search Button - Mobile Optimized (40% smaller on mobile) */}
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        whileHover={{ x: -10 }}
        onClick={handleSearchClick}
        data-cursor-label="SEARCH"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] bg-[#E52321] text-white p-2.5 pl-4 sm:p-4 sm:pl-6 rounded-l-full shadow-2xl flex items-center space-x-2 sm:space-x-3 group transition-all duration-300"
        title="Open Search"
      >
        <div className="flex flex-col items-center justify-center">
          <SafeIcon icon="FiSearch" className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Search</span>
        </div>
      </motion.button>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white pt-16 pb-8 border-t border-gray-200 mt-auto shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
            <div className="pr-4">
              <div className="flex items-center space-x-3 mb-6">
                <LogoIcon className="w-10 h-10" />
                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-tighter text-black uppercase leading-none">
                    Impact Reports
                  </span>
                  <span className="font-bold text-[9px] tracking-[0.1em] text-gray-400 uppercase leading-none mt-1">
                    Human Concern USA
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Fighting poverty for 46 years. HUMAN CONCERN USA is a 501(C)3 Tax Exempt Nonprofit.
              </p>
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-black mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-4 text-gray-600 hover:text-black transition-all duration-300 cursor-default group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                    <SafeIcon icon="FiMail" className="text-black text-lg stroke-[2.5]" />
                  </div>
                  <span className="text-[15px]"><a target="_blank" href="mailto:info@humanconcernusa.org">info@humanconcernusa.org</a></span>
                </li>
                <li className="flex items-center space-x-4 text-gray-600 hover:text-black transition-all duration-300 cursor-default group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                    <SafeIcon icon="FiPhone" className="text-black text-lg stroke-[2.5]" />
                  </div>
                  <span className="text-[15px]">1-800-583-5841</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-black mb-6">Stay Connected</h3>
              <div className="mb-6">
                <div className="relative group">
                  <input type="email" placeholder="Enter your email" className="w-full border border-gray-200 rounded-full px-6 py-4 text-[15px] focus:outline-none focus:border-[#E52321] transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400" />
                  <button data-cursor-label="JOIN" className="absolute right-2 top-2 bottom-2 bg-black hover:bg-[#E52321] text-white rounded-full px-6 text-[13px] font-bold transition-all duration-300 transform active:scale-95">
                    Join
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-6 mt-6">
                <a href="#" className="text-[#E52321] hover:text-[#C91D1B] hover:scale-110 transition-all duration-300">
                  <SafeIcon icon="FiFacebook" className="text-[22px]" />
                </a>
                <a href="#" className="text-[#E52321] hover:text-[#C91D1B] hover:scale-110 transition-all duration-300">
                  <SafeIcon icon="FiTwitter" className="text-[22px]" />
                </a>
                <a href="#" className="text-[#E52321] hover:text-[#C91D1B] hover:scale-110 transition-all duration-300">
                  <SafeIcon icon="FiInstagram" className="text-[22px]" />
                </a>
                <a href="#" className="text-[#E52321] hover:text-[#C91D1B] hover:scale-110 transition-all duration-300">
                  <SafeIcon icon="FiLinkedin" className="text-[22px]" />
                </a>
                <a href="#" className="text-[#E52321] hover:text-[#C91D1B] hover:scale-110 transition-all duration-300">
                  <SafeIcon icon="FiYoutube" className="text-[22px]" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center mt-4">
            <p className="text-gray-400 font-medium text-[13px] tracking-wide uppercase">
              Copyright &copy;2026 Human Concern USA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
