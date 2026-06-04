import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import SafeIcon from '../../../common/SafeIcon';
import Overview from './components/Overview';
import AdminsManager from './components/AdminsManager';
import Settings from './components/Settings';
import { reports } from '../../../data/mockData';
import { cleanCountryName } from '../../../utils/location';

const NAV = [
  { id: 'overview', label: 'Overview',  icon: 'FiHome'     },
  { id: 'reports',  label: 'Reports',   icon: 'FiFileText' },
  { id: 'admins',   label: 'Admins',    icon: 'FiUsers'    },
  { id: 'settings', label: 'Settings',  icon: 'FiSettings' },
];

const AdminDashboard = () => {
  const { admin, logout, getToken } = useAdminAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbStats, setDbStats] = useState(null);

  // Reports table state
  const [reportSearch, setReportSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then(setDbStats)
      .catch(() => {});
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

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
            <img
              src="https://media-manager-c.questera.ai/greta-media/89a4c5054b952da31823a698574da50f94645c57fede58bf38e1dc553a5f65aa2a5866630191987f5de6ebb268aeb9b2/images/aW1hZ2UvcG5n/236c9d88c2db247a8226fc26d4a8c574.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-tight uppercase leading-none">Admin</p>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">HC-USA</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => { setSection(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
              section === id
                ? 'bg-[#E52321] text-white shadow-lg shadow-red-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <SafeIcon icon={icon} className="text-base flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-5 pt-3 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5">
          <div className="w-8 h-8 rounded-xl bg-[#E52321] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm uppercase">{admin?.username?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-xs truncate">{admin?.username}</p>
            <p className="text-gray-500 text-[10px] truncate">{admin?.role}</p>
          </div>
        </div>
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <SafeIcon icon="FiExternalLink" className="text-sm" />
          View Portal
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-gray-500 hover:text-[#E52321] hover:bg-[#E52321]/5 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <SafeIcon icon="FiLogOut" className="text-sm" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-[#0B0D0F] border-r border-white/5 flex-shrink-0 w-64">
        <Sidebar />
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
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#0B0D0F] lg:hidden flex flex-col"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#0B0D0F] transition-colors"
            >
              <SafeIcon icon="FiMenu" className="text-base" />
            </button>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Dashboard</p>
              <h1 className="text-lg font-black text-[#0B0D0F] tracking-tight capitalize leading-tight">{section}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Online
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-50 hover:bg-[#E52321]/10 border border-gray-100 hover:border-[#E52321]/15 text-gray-500 hover:text-[#E52321] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <SafeIcon icon="FiLogOut" className="text-sm" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {section === 'overview' && <Overview dbStats={dbStats} />}

          {section === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#0B0D0F] tracking-tight mb-1">Reports</h2>
                  <p className="text-sm text-gray-400 font-medium">{reports.length} total impact reports</p>
                </div>
                <div className="relative">
                  <SafeIcon icon="FiSearch" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    placeholder="Search reports..."
                    className="bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#E52321]/30 focus:ring-1 focus:ring-[#E52321]/10 transition-all w-full sm:w-64 shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                {/* Table header */}
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

export default AdminDashboard;
