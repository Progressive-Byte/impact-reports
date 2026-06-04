import React, { useState, useEffect } from 'react';
import SearchModal from './common/SearchModal';
import Header from './common/Header';
import Footer from './common/Footer';
import NavigationProgress from './common/NavigationProgress';

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

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col relative">
      <Header onSearchClick={handleSearchClick} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
