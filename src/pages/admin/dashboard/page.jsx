import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminApiRequest } from '../../../services/adminApi';
import Sidebar, { NAV } from './common/Sidebar';
import TopBar from './common/TopBar';
import MobileSidebar from './common/MobileSidebar';
import AdminDashboard from './components/AdminDashboard/page';
import ReportsModule from './components/ReportsModule/page';
import UserManager from './components/UserManager/page';
import DataManagement from './components/DataManagement/page';
import Settings from './components/Settings/page';

const VALID_SECTIONS = {
  superadmin: ['overview', 'reports', 'users', 'data', 'settings'],
  editor:     ['overview', 'reports'],
  viewer:     ['overview', 'reports'],
};

const AdminOverview = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { section: rawSection } = useParams();

  const validSections = VALID_SECTIONS[admin?.role] ?? VALID_SECTIONS.editor;
  const section = validSections.includes(rawSection) ? rawSection : 'overview';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportCount, setReportCount] = useState(null);

  const fetchReportCount = useCallback(() => {
    adminApiRequest('/api/reports?limit=1')
      .then(data => setReportCount(data.stats?.count ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchReportCount(); }, [fetchReportCount]);

  const handleLogout   = () => { logout(); navigate('/alkabirimpact/login'); };
  const handleNavigate = (id) => { navigate(`/alkabirimpact/dashboard/${id}`); setSidebarOpen(false); };
  const currentNav     = NAV.find(n => n.id === section);

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-[#1F1F22] border-r border-white/5 flex-shrink-0 w-64">
        <Sidebar
          section={section}
          setSection={id => navigate(`/alkabirimpact/dashboard/${id}`)}
          setSidebarOpen={setSidebarOpen}
          reportCount={reportCount}
        />
      </aside>

      {/* Mobile sidebar */}
      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        section={section}
        onNavigate={handleNavigate}
        reportCount={reportCount}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar
          currentNav={currentNav}
          admin={admin}
          onMenuOpen={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-5 sm:p-7">
          {section === 'overview'  && <AdminDashboard />}
          {section === 'reports'   && <ReportsModule onCountChange={setReportCount} />}
          {section === 'users'     && <UserManager />}
          {section === 'data'      && <DataManagement />}
          {section === 'settings'  && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default AdminOverview;
