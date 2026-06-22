import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TrendLine } from '../../../../../common/SvgIcon';
import SafeIcon from '../../../../../common/SafeIcon';
import PageHeader from '../../common/PageHeader';
import { adminApiRequest } from '../../../../../services/adminApi';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';
import { getCookie } from '../../../../../utils/cookies';
import StatCard from './components/StatCard';
import ActivityLog from './components/ActivityLog';
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
  const [exporting,    setExporting]    = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportScope,  setExportScope]  = useState('year');

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

  const handleExportLogs = async () => {
    setExporting(true);
    try {
      const token    = getCookie('adminToken');
      const response = await fetch(`/api/auth/logs/export?format=${exportFormat}&scope=${exportScope}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Export failed');
      }
      const blob = await response.blob();
      const ext  = exportFormat === 'excel' ? 'xlsx' : 'csv';
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `activity-logs-${exportScope}-${new Date().toISOString().split('T')[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Logs exported');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const rs         = dashStats?.reportStats;
  const regionData = dashStats?.regionData ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        heading="h1"
        title={isSuperAdmin ? 'IT Admin Dashboard' : `${admin?.username ?? 'My'} Dashboard`}
        subtitle={isSuperAdmin ? 'Global configuration & system telemetry' : 'Your assigned reports & activity'}
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
              {['csv', 'excel'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setExportFormat(f)}
                  className={`px-3 py-1.5 transition-colors ${
                    exportFormat === f ? 'bg-[#0B0D0F] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {f === 'csv' ? 'CSV' : 'Excel'}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportLogs}
              disabled={exporting}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
            >
              {exporting
                ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <SafeIcon icon="FiDownload" className="text-sm" />
              }
              Export Logs
            </button>
          </div>
        }
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
        <ActivityLog recentActivity={dashStats?.recentActivity ?? []} activityLogs={activityLogs} loading={loading} />
        <div className="flex-[2] flex-shrink-0 space-y-5">
          <ActiveRegions regionData={regionData} loading={loading} />
          <PlatformConfig />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
