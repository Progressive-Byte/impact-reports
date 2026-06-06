import { useMemo, useState } from 'react';
import { reports } from '../../../../data/mockData';
import { cleanCountryName } from '../../../../utils/location';
import SafeIcon from '../../../../common/SafeIcon';
import { TrendLine } from '../../../../common/SvgIcon';

const SYSTEM_LOGS = [
  { tag: 'SYS',  tagClass: 'bg-gray-600 text-gray-200',     time: '10:42:01', msg: 'Supabase connection established.' },
  { tag: 'AUTH', tagClass: 'bg-green-600 text-white',        time: '10:45:12', msg: "Admin user 'j.doe' authenticated." },
  { tag: 'WARN', tagClass: 'bg-yellow-400 text-yellow-900',  time: '11:02:44', msg: "High latency detected on 'impact_reports' bucket." },
  { tag: 'SYS',  tagClass: 'bg-gray-600 text-gray-200',     time: '11:15:00', msg: 'Routine backup completed successfully.' },
];

const CONTENT_LOGS = [
  { tag: 'PUB',  tagClass: 'bg-blue-500 text-white',         time: '11:20:31', msg: "Report 'Jordan Q2 Field Survey' published." },
  { tag: 'EDIT', tagClass: 'bg-purple-500 text-white',       time: '11:18:09', msg: "Draft updated by 'a.khan'." },
  { tag: 'FLAG', tagClass: 'bg-yellow-400 text-yellow-900',  time: '11:05:52', msg: '4 reports flagged for field verification.' },
];


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [require2FA, setRequire2FA] = useState(true);

  const regionData = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      r.countries.forEach((c) => {
        const name = cleanCountryName(c);
        map[name] = (map[name] || 0) + Math.round(r.metrics.beneficiaries / r.countries.length);
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, []);

  const maxVal = regionData[0]?.[1] || 1;
  const logs = activeTab === 'system' ? SYSTEM_LOGS : CONTENT_LOGS;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0B0D0F] tracking-tight">IT Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Global configuration &amp; system telemetry</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          <SafeIcon icon="FiDownload" className="text-sm" />
          Export Logs
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Database Load */}
        <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <SafeIcon icon="FiDatabase" className="text-gray-500 text-base" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Database Load</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Online
            </span>
          </div>

          <div>
            <div className="flex items-end gap-1 mb-3">
              <span className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">24.5</span>
              <span className="text-2xl font-black text-gray-400 mb-1">%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '24.5%' }} />
            </div>
          </div>

          <div>
            <div className="h-px bg-gray-100 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Server Uptime</p>
                <p className="text-base font-black text-[#0B0D0F]">99.98%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Network Latency</p>
                <p className="text-base font-black text-[#0B0D0F]">12 ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Status */}
        <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <SafeIcon icon="FiClipboard" className="text-gray-500 text-base" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Reports Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendLine up={true} />
              <span className="text-[12px] font-black text-green-600">+12%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Published</p>
              <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">
                {reports.length.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pending</p>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">12</p>
                <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-0.5 mb-1">
                  Review
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-transparent" />
        </div>

        {/* Active Staff */}
        <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <SafeIcon icon="FiUsers" className="text-[#E52321] text-base" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Active Staff</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendLine up={false} />
              <span className="text-[12px] font-black text-[#E52321]">-2%</span>
            </div>
          </div>

          <p className="text-5xl font-black text-[#0B0D0F] tracking-tighter leading-none">89</p>

          <div>
            <div className="h-px bg-gray-100 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verified Today</p>
                <p className="text-base font-black text-[#0B0D0F]">31</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">In Field</p>
                <p className="text-base font-black text-[#0B0D0F]">58</p>
              </div>
            </div>
          </div>
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
              </button>
            ))}
          </div>
          <div className="m-5 bg-[#0f1114] rounded-2xl p-6 min-h-[340px] font-mono">
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
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex-[2] flex-shrink-0 space-y-5">
          {/* Active Regions */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className='w-10 h-10 bg-[#f1f1f3] rounded-xl flex items-center justify-center flex-shrink-0'>
                <SafeIcon icon="FiGlobe" className="text-gray-400 text-base" />
              </div>
              <h3 className="text-sm font-black text-[#0B0D0F]">Active Regions</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {regionData.map(([name, val], i) => (
                <div key={name} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                  <span className="text-[11px] font-bold text-gray-400 w-5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-[#0B0D0F]">{name}</span>
                      <span className="text-sm font-bold text-[#0B0D0F]">{val.toLocaleString()}</span>
                    </div>
                    <div className="w-[90%] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E52321] rounded-full"
                        style={{ width: `${(val / maxVal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-4">
              <button className="text-[#E52321] text-xs font-black hover:underline w-full text-center">
                View all 50+ global nodes →
              </button>
            </div>
          </div>

          {/* Platform Configuration */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className='w-10 h-10 bg-[#f1f1f3] rounded-xl flex items-center justify-center flex-shrink-0'>
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
                onClick={() => setRequire2FA((v) => !v)}
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
