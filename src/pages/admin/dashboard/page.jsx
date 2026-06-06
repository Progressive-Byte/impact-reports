import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import SafeIcon from '../../../common/SafeIcon';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard/page';
import ReportsModule from './components/ReportsModule/page';
import Sidebar, { NAV } from './components/common/Sidebar';
import UserManager from './components/UserManager/page';

const AdminOverview = () => {
  const { admin, logout, getToken } = useAdminAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const currentNav = NAV.find((n) => n.id === section);

  const initials = admin?.username
    ? admin.username.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-[#1F1F22] border-r border-white/5 flex-shrink-0 w-64">
        <Sidebar section={section} setSection={setSection} setSidebarOpen={setSidebarOpen} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#1F1F22] lg:hidden flex flex-col"
            >
              <Sidebar section={section} setSection={setSection} setSidebarOpen={setSidebarOpen} mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon="FiMenu" className="text-base" />
            </button>
            <p className="text-sm text-gray-400">
              Platform
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="font-bold text-gray-700">{currentNav?.label}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Bell */}
            <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-[#1F1F22] hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
              <SafeIcon icon="FiBell" className="text-lg" />
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2 transition-colors shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[11px] font-black">{initials}</span>
                </div>
                <div className="hidden sm:flex items-baseline gap-1">
                  <span className="text-[#1F1F22] text-xs font-bold">{admin?.username}</span>
                  <span className="text-gray-400 text-[10px]">{admin?.role}</span>
                </div>
                <SafeIcon icon="FiChevronDown" className="text-gray-400 text-xs ml-0.5" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <button
                      onClick={() => { setSection('settings'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon="FiUser" className="text-sm text-gray-400" />
                      View Profile
                    </button>
                    <button
                      onClick={() => { setSection('settings'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon="FiSettings" className="text-sm text-gray-400" />
                      Settings
                    </button>
                    <div className="h-px bg-gray-100 mx-3 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#E52321] hover:bg-red-50 transition-colors"
                    >
                      <SafeIcon icon="FiLogOut" className="text-sm" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 p-5 sm:p-7">
          {section === 'overview' && <AdminDashboard />}

          {section === 'reports' && <ReportsModule />}

          {section === 'admins' && <UserManager />}
          {section === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default AdminOverview;
