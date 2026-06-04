import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { reports } from '../../../../data/mockData';
import { cleanCountryName } from '../../../../utils/location';
import SafeIcon from '../../../../common/SafeIcon';

const StatCard = ({ icon, label, value, sub, color = 'red', delay = 0 }) => {
  const colors = {
    red:   { bg: 'bg-[#E52321]/10', border: 'border-[#E52321]/15', text: 'text-[#E52321]', icon: 'bg-[#E52321]' },
    dark:  { bg: 'bg-[#0B0D0F]/5',  border: 'border-[#0B0D0F]/10', text: 'text-[#0B0D0F]', icon: 'bg-[#0B0D0F]' },
    green: { bg: 'bg-green-50',      border: 'border-green-100',    text: 'text-green-700', icon: 'bg-green-600'  },
    blue:  { bg: 'bg-blue-50',       border: 'border-blue-100',     text: 'text-blue-700',  icon: 'bg-blue-600'   },
  };
  const c = colors[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`${c.bg} border ${c.border} rounded-[1.5rem] p-6 flex items-center gap-5`}
    >
      <div className={`w-12 h-12 ${c.icon} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <SafeIcon icon={icon} className="text-white text-xl" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-2xl font-black ${c.text} tracking-tighter leading-none`}>{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
};

const Overview = ({ dbStats }) => {
  const stats = useMemo(() => {
    const totalBeneficiaries = reports.reduce((s, r) => s + r.metrics.beneficiaries, 0);
    const regions = [...new Set(reports.map((r) => r.region))];
    const countries = [...new Set(reports.flatMap((r) => r.countries.map(cleanCountryName)))];
    return { totalBeneficiaries, regions, countries };
  }, []);

  const recentReports = reports.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-[#0B0D0F] tracking-tight mb-1">Overview</h2>
        <p className="text-sm text-gray-400 font-medium">Portal performance at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="FiFileText"    label="Total Reports"     value={reports.length}                       sub="Impact reports"              color="dark"  delay={0}    />
        <StatCard icon="FiUsers"       label="Lives Impacted"    value={`${stats.totalBeneficiaries.toLocaleString()}+`} sub="Verified beneficiaries" color="red"   delay={0.05} />
        <StatCard icon="FiGlobe"       label="Active Regions"    value={stats.regions.length}                 sub={stats.regions.join(', ')}    color="blue"  delay={0.1}  />
        <StatCard icon="FiFlag"        label="Countries"         value={stats.countries.length}               sub="Across all programs"         color="green" delay={0.15} />
      </div>

      {/* DB admin stats */}
      {dbStats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E52321]/10 border border-[#E52321]/15 rounded-xl flex items-center justify-center">
              <SafeIcon icon="FiShield" className="text-[#E52321] text-base" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Admins</p>
              <p className="text-xl font-black text-[#0B0D0F] tracking-tight">{dbStats.totalAdmins}</p>
            </div>
          </div>
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center">
              <SafeIcon icon="FiCheckCircle" className="text-green-600 text-base" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Admins</p>
              <p className="text-xl font-black text-[#0B0D0F] tracking-tight">{dbStats.activeAdmins}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent reports */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0B0D0F] tracking-tight">Recent Reports</h3>
            <p className="text-[11px] text-gray-400">Latest 6 entries</p>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
            {reports.length} total
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {recentReports.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <img src={r.image} alt={r.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-[#0B0D0F] truncate">{r.title}</p>
                <p className="text-[11px] text-gray-400">{r.region} · {r.sector}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">{r.year}</span>
                <span className="text-[10px] font-black text-[#E52321] bg-[#E52321]/10 border border-[#E52321]/15 rounded-full px-2.5 py-1">
                  {r.metrics.beneficiaries.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
