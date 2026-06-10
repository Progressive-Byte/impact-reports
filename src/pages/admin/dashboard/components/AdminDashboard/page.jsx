import { useState, useEffect } from 'react';
import SafeIcon from '../../../../../common/SafeIcon';
import { TrendLine } from '../../../../../common/SvgIcon';
import { adminApiRequest } from '../../../../../services/adminApi';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';

const SYSTEM_LOGS = [
  { tag: 'SYS',  tagClass: 'bg-gray-600 text-gray-200',    time: '10:42:01', msg: 'MongoDB connection established.' },
  { tag: 'AUTH', tagClass: 'bg-green-600 text-white',       time: '10:45:12', msg: 'Admin session authenticated via JWT.' },
  { tag: 'SYS',  tagClass: 'bg-gray-600 text-gray-200',    time: '11:15:00', msg: 'Routine backup completed successfully.' },
];

function fmt(n) {
  return n == null ? '—' : Number(n).toLocaleString();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_TAG = {
  published: { label: 'PUB',  cls: 'bg-blue-500 text-white' },
  draft:     { label: 'EDIT', cls: 'bg-purple-500 text-white' },
  pending:   { label: 'PEND', cls: 'bg-yellow-400 text-yellow-900' },
};

const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />
);

const AdminDashboard = () => {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const [dashStats, setDashStats]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('system');
  const [require2FA, setRequire2FA] = useState(true);

  useEffect(() => {
    adminApiRequest('/api/admin/dashboard')
      .then(data => setDashStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const regionData = dashStats?.regionData ?? [];
  const maxVal = regionData[0]?.livesImpacted || 1;

  const contentLogs = (dashStats?.recentActivity ?? []).map(r => {
    const tag = STATUS_TAG[r.status] ?? STATUS_TAG.pending;
    return {
      tag:      tag.label,
      tagClass: tag.cls,
      time:     timeAgo(r.updatedAt),
      msg:      `"${r.projectName}" — ${r.status}`,
    };
  });
  const logs = activeTab === 'system' ? SYSTEM_LOGS : contentLogs;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0B0D0F] tracking-tight">
            {isSuperAdmin ? 'IT Admin Dashboard' : `${admin?.username ?? 'My'} Dashboard`}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isSuperAdmin
              ? 'Global configuration & system telemetry'
              : 'Your assigned reports & activity'}
          </p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          <SafeIcon icon="FiDownload" className="text-sm" />
          Export Logs
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* ── Reports Status ──────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <SafeIcon icon="FiClipboard" className="text-gray-500 text-base" />
              </div>
              <span className="text-sm font-semibold text-gray-500">
                {isSuperAdmin ? 'Reports Status' : 'My Reports'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendLine up={true} />
              <span className="text-[12px] font-black text-green-600">
                {loading ? '—' : `${fmt(dashStats?.reportStats?.total)} total`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Published</p>
              {loading
                ? <Skeleton className="h-12 w-16" />
                : <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
                    {fmt(dashStats?.reportStats?.published)}
                  </p>
              }
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pending</p>
              {loading
                ? <Skeleton className="h-12 w-16" />
                : <div className="flex items-end gap-2">
                    <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
                      {fmt(dashStats?.reportStats?.pendingDraft)}
                    </p>
                    {(dashStats?.reportStats?.pendingDraft ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-0.5 mb-1">
                        Review
                      </span>
                    )}
                  </div>
              }
            </div>
          </div>
          <div className="h-px bg-transparent" />
        </div>

        {/* ── Lives Impacted ──────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <SafeIcon icon="FiHeart" className="text-[#E52321] text-base" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Lives Impacted</span>
            </div>
          </div>

          {loading
            ? <Skeleton className="h-14 w-32 mt-2" />
            : <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
                {fmt(dashStats?.totalLivesImpacted)}
              </p>
          }

          <div>
            <div className="h-px bg-gray-100 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Countries</p>
                <p className="text-base font-black text-[#0B0D0F]">
                  {loading ? '—' : fmt(regionData.length)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {isSuperAdmin ? 'Total Reports' : 'Assigned'}
                </p>
                <p className="text-base font-black text-[#0B0D0F]">
                  {loading ? '—' : fmt(dashStats?.reportStats?.total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Staff (superadmin) / My Progress (admin) ─────────── */}
        <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <SafeIcon icon={isSuperAdmin ? 'FiUsers' : 'FiUser'} className="text-gray-500 text-base" />
              </div>
              <span className="text-sm font-semibold text-gray-500">
                {isSuperAdmin ? 'Active Staff' : 'My Progress'}
              </span>
            </div>
            {isSuperAdmin && (
              <div className="flex items-center gap-1.5">
                <TrendLine up={true} />
                <span className="text-[12px] font-black text-green-600">
                  {loading ? '—' : `${fmt(dashStats?.adminStats?.active)} active`}
                </span>
              </div>
            )}
          </div>

          {isSuperAdmin ? (
            <>
              {loading
                ? <Skeleton className="h-14 w-24 mt-2" />
                : <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
                    {fmt(dashStats?.adminStats?.total)}
                  </p>
              }
              <div>
                <div className="h-px bg-gray-100 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                    <p className="text-base font-black text-[#0B0D0F]">
                      {loading ? '—' : fmt(dashStats?.adminStats?.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active</p>
                    <p className="text-base font-black text-[#0B0D0F]">
                      {loading ? '—' : fmt(dashStats?.adminStats?.active)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {loading
                ? <Skeleton className="h-14 w-24 mt-2" />
                : <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
                    {fmt(dashStats?.reportStats?.published)}
                    <span className="text-lg font-bold text-gray-400 ml-2">
                      / {fmt(dashStats?.reportStats?.total)}
                    </span>
                  </p>
              }
              <div>
                <div className="h-px bg-gray-100 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Published</p>
                    <p className="text-base font-black text-[#0B0D0F]">
                      {loading ? '—' : fmt(dashStats?.reportStats?.published)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">In Progress</p>
                    <p className="text-base font-black text-[#0B0D0F]">
                      {loading ? '—' : fmt(dashStats?.reportStats?.pendingDraft)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      <div className="flex gap-5 items-start">
        {/* System Log / Content Feed */}
        <div className="flex-[3] min-w-0 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 px-6">
            {[{ id: 'system', label: 'System Log' }, { id: 'content', label: 'Content Feed' }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 mr-7 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-[#E52321] text-[#0B0D0F]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
                {id === 'content' && (dashStats?.recentActivity?.length ?? 0) > 0 && (
                  <span className="ml-2 text-[10px] font-black bg-[#E52321] text-white rounded-full px-1.5 py-0.5">
                    {dashStats.recentActivity.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="m-5 bg-[#0f1114] rounded-2xl p-6 min-h-[340px] font-mono">
            {loading && activeTab === 'content' ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-10 bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 flex-1 bg-gray-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black min-w-[42px] flex-shrink-0 ${entry.tagClass}`}>
                      {entry.tag}
                    </span>
                    <span className="text-gray-500 text-[13px] flex-shrink-0 tabular-nums">{entry.time}</span>
                    <span className="text-gray-200 text-[13px] leading-relaxed">{entry.msg}</span>
                  </div>
                ))}
                <div className="flex items-center pt-1">
                  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse rounded-sm" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex-[2] flex-shrink-0 space-y-5">
          {/* Active Regions */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-[#f1f1f3] rounded-xl flex items-center justify-center flex-shrink-0">
                <SafeIcon icon="FiGlobe" className="text-gray-400 text-base" />
              </div>
              <h3 className="text-sm font-black text-[#0B0D0F]">Active Regions</h3>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="py-2 flex items-center gap-3">
                    <Skeleton className="w-5 h-3" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-1.5 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : regionData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No location data yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {regionData.map(({ country, livesImpacted }, i) => (
                  <div key={country} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                    <span className="text-[11px] font-bold text-gray-400 w-5 flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-[#0B0D0F]">{country}</span>
                        <span className="text-sm font-bold text-[#0B0D0F]">{livesImpacted.toLocaleString()}</span>
                      </div>
                      <div className="w-[90%] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E52321] rounded-full"
                          style={{ width: `${(livesImpacted / maxVal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 mt-3 pt-4">
              <p className="text-[#E52321] text-xs font-black text-center">
                {regionData.length > 0
                  ? `${regionData.length} region${regionData.length !== 1 ? 's' : ''} tracked`
                  : 'No regions yet'}
              </p>
            </div>
          </div>

          {/* Platform Configuration */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-[#f1f1f3] rounded-xl flex items-center justify-center flex-shrink-0">
                <SafeIcon icon="FiShield" className="text-gray-400 text-base" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0B0D0F]">Platform Configuration</h3>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <SafeIcon icon="FiLock" className="text-green-600 text-base" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B0D0F]">Require 2FA</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Global enforcement · all staff accounts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRequire2FA(v => !v)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ml-3 ${
                  require2FA ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    require2FA ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4">
              <button className="text-[#E52321] text-xs font-black hover:underline w-full text-center">
                Manage In Settings →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
