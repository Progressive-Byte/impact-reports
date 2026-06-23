import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TrendLine } from '../../../../../common/SvgIcon';
import SafeIcon from '../../../../../common/SafeIcon';
import PageHeader from '../../common/PageHeader';
import { adminApiRequest } from '../../../../../services/adminApi';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';
import StatCard from './components/StatCard';
import ActivityLog from './components/ActivityLog';
import LogExportModal from './components/LogExportModal';
import ActiveRegions from './components/ActiveRegions';
import PlatformConfig from './components/PlatformConfig';
import { fmt } from './components/utils';

const AdminDashboard = () => {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const [dashStats,    setDashStats]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [logMeta,      setLogMeta]      = useState({ total: 0, windowDays: 30 });
  const [exportScope,      setExportScope]      = useState('year');
  const [dateFrom,         setDateFrom]         = useState('');
  const [dateTo,           setDateTo]           = useState('');
  const [showExportModal,  setShowExportModal]  = useState(false);

  useEffect(() => {
    adminApiRequest('/api/admin/dashboard')
      .then(data => setDashStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    adminApiRequest('/api/auth/logs')
      .then(data => {
        setActivityLogs(data.logs || []);
        if (data.meta) setLogMeta(data.meta);
      })
      .catch(() => {});
  }, []);

  const handleOpenExport = () => {
    if (exportScope === 'custom') {
      if (!dateFrom || !dateTo) { toast.error('Please select both start and end dates'); return; }
      if (dateFrom > dateTo)    { toast.error('Start date must be on or before end date'); return; }
    }
    setShowExportModal(true);
  };

  const rs         = dashStats?.reportStats;
  const regionData = dashStats?.regionData ?? [];

  return (
    <>
    {showExportModal && (
      <LogExportModal
        scope={exportScope}
        dateFrom={dateFrom}
        dateTo={dateTo}
        previewLogs={activityLogs}
        onClose={() => setShowExportModal(false)}
      />
    )}
    <div className="space-y-6">
      <PageHeader
        heading="h1"
        title={isSuperAdmin ? 'IT Admin Dashboard' : `${admin?.username ?? 'My'} Dashboard`}
        subtitle={isSuperAdmin ? 'Global configuration & system telemetry' : 'Your assigned reports & activity'}
        action={isSuperAdmin ? (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Scope selector */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
              {[{ v: 'year', l: '1 Year' }, { v: 'all', l: 'All History' }, { v: 'custom', l: 'Custom' }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setExportScope(v)}
                  className={`px-3 py-1.5 transition-colors ${exportScope === v ? 'bg-[#0B0D0F] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >{l}</button>
              ))}
            </div>

            {/* Custom date range — visible only when scope=custom */}
            {exportScope === 'custom' && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
                <SafeIcon icon="FiCalendar" className="text-gray-400 text-xs flex-shrink-0" />
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={e => setDateFrom(e.target.value)}
                  className="text-xs font-bold text-gray-700 bg-transparent outline-none w-[108px] cursor-pointer"
                  title="Start date"
                />
                <span className="text-gray-300 text-xs font-bold">—</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={e => setDateTo(e.target.value)}
                  className="text-xs font-bold text-gray-700 bg-transparent outline-none w-[108px] cursor-pointer"
                  title="End date"
                />
              </div>
            )}

            <button onClick={handleOpenExport}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <SafeIcon icon="FiDownload" className="text-sm" />
              Export Logs
            </button>
          </div>
        ) : null}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Reports Status */}
        <StatCard
          icon="FiClipboard"
          title={isSuperAdmin ? 'Reports Status' : 'My Reports'}
          badge={
            <div className="flex items-center gap-1.5">
              <TrendLine up />
              <span className="text-[12px] font-black text-green-600">
                {loading ? '—' : `${fmt(rs?.total)} total`}
              </span>
            </div>
          }
          loading={loading}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Published</p>
              <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">{fmt(rs?.published)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pending</p>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">{fmt(rs?.pendingDraft)}</p>
                {(rs?.pendingDraft ?? 0) > 0 && (
                  <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-0.5 mb-1">
                    Review
                  </span>
                )}
              </div>
            </div>
          </div>
        </StatCard>

        {/* Lives Impacted */}
        <StatCard
          icon="FiHeart"
          iconBg="bg-red-50"
          iconColor="text-[#E52321]"
          title="Lives Impacted"
          loading={loading}
          footer={[
            { label: 'Countries',                                  value: fmt(regionData.length) },
            { label: isSuperAdmin ? 'Total Reports' : 'Assigned', value: fmt(rs?.total) },
          ]}
        >
          <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
            {fmt(dashStats?.totalLivesImpacted)}
          </p>
        </StatCard>

        {/* Active Staff (superadmin) / My Progress (admin) */}
        <StatCard
          icon={isSuperAdmin ? 'FiUsers' : 'FiUser'}
          title={isSuperAdmin ? 'Active Staff' : 'My Progress'}
          badge={isSuperAdmin ? (
            <div className="flex items-center gap-1.5">
              <TrendLine up />
              <span className="text-[12px] font-black text-green-600">
                {loading ? '—' : `${fmt(dashStats?.adminStats?.active)} active`}
              </span>
            </div>
          ) : null}
          loading={loading}
          footer={isSuperAdmin
            ? [{ label: 'Total Users', value: fmt(dashStats?.adminStats?.total) },
               { label: 'Active',      value: fmt(dashStats?.adminStats?.active) }]
            : [{ label: 'Published',   value: fmt(rs?.published) },
               { label: 'In Progress', value: fmt(rs?.pendingDraft) }]
          }
        >
          {isSuperAdmin
            ? <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
                {fmt(dashStats?.adminStats?.total)}
              </p>
            : <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
                {fmt(rs?.published)}
                <span className="text-lg font-bold text-gray-400 ml-2">/ {fmt(rs?.total)}</span>
              </p>
          }
        </StatCard>

      </div>

      {/* Bottom row */}
      <div className="flex gap-5 items-start">
        <ActivityLog recentActivity={dashStats?.recentActivity ?? []} activityLogs={activityLogs} logMeta={logMeta} loading={loading} />
        <div className="flex-[2] flex-shrink-0 space-y-5">
          <ActiveRegions regionData={regionData} loading={loading} />
          <PlatformConfig />
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
