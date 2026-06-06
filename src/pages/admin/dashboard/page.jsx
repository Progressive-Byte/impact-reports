import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import SafeIcon from '../../../common/SafeIcon';
import AdminsManager from './components/AdminsManager';
import Settings from './components/Settings';
import { reports } from '../../../data/mockData';
import AdminDashboard from './components/AdminDashboard';
import Sidebar, { NAV } from './components/common/Sidebar';

const AdminOverview = () => {
  const { admin, logout, getToken } = useAdminAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Reports table state
  const [reportSearch, setReportSearch] = useState('');

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

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.region.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.sector.toLowerCase().includes(reportSearch.toLowerCase()) ||
      String(r.year).includes(reportSearch)
  );

  const currentNav = NAV.find((n) => n.id === section);

  const initials = admin?.username
    ? admin.username.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-[#0B0D0F] border-r border-white/5 flex-shrink-0 w-64">
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
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#0B0D0F] lg:hidden flex flex-col"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500"
            >
              <SafeIcon icon="FiMenu" className="text-sm" />
            </button>
            <p className="text-sm text-gray-400">
              Platform
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="font-bold text-gray-700">{currentNav?.label}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <button className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <SafeIcon icon="FiBell" className="text-sm" />
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 bg-[#0B0D0F] hover:bg-[#1a1d20] rounded-xl px-3 py-1.5 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E52321] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[11px] font-black">{initials}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-white text-xs font-bold leading-none">{admin?.username}</span>
                  <span className="text-gray-400 text-[10px] ml-1">{admin?.role}</span>
                </div>
                <SafeIcon icon="FiChevronDown" className="text-gray-400 text-xs" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    <Link
                      to="/"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon="FiExternalLink" className="text-sm" />
                      View Portal
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#E52321] hover:bg-red-50 transition-colors"
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
        <main className="flex-1 overflow-y-auto p-5 sm:p-7">
          {section === 'overview' && <AdminDashboard />}

          {section === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#0B0D0F] tracking-tight mb-1">Reports Module</h2>
                  <p className="text-sm text-gray-400 font-medium">{reports.length} total impact reports</p>
                </div>
                <div className="relative">
                  <SafeIcon icon="FiSearch" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    placeholder="Search reports..."
                    className="bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#E52321]/30 focus:ring-1 focus:ring-[#E52321]/10 transition-all w-full sm:w-64 shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                  {['Title', 'Region', 'Sector', 'Year', 'Impact'].map((h) => (
                    <span key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</span>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {filteredReports.map((r) => (
                    <div key={r.id} className="flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_80px] items-center gap-3 sm:gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={r.image} alt={r.title} className="w-9 h-9 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
                        <p className="text-sm font-black text-[#0B0D0F] truncate">{r.title}</p>
                      </div>
                      <span className="hidden sm:block text-xs font-bold text-gray-500 truncate">{r.region}</span>
                      <span className="hidden sm:block text-[10px] font-black text-[#E52321] bg-[#E52321]/10 border border-[#E52321]/15 rounded-full px-2 py-1 w-fit">{r.sector}</span>
                      <span className="hidden sm:block text-xs font-bold text-gray-400">{r.year}</span>
                      <span className="text-xs font-black text-gray-700 tabular-nums whitespace-nowrap">
                        {r.metrics.beneficiaries.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {filteredReports.length === 0 && (
                    <div className="text-center py-16 text-gray-400 text-sm font-bold">
                      No reports match your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {section === 'admins' && <AdminsManager />}
          {section === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default AdminOverview;
