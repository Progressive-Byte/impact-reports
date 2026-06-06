import { useState, useMemo } from 'react';
import { reports } from '../../../../data/mockData';
import SafeIcon from '../../../../common/SafeIcon';
import TabNav from './reports/TabNav';
import GeneralTab from './reports/GeneralTab';
import NarrativeTab from './reports/NarrativeTab';
import MetricsTab from './reports/MetricsTab';
import MediaTimelineTab from './reports/MediaTimelineTab';
import RecordLedger from './reports/RecordLedger';

const StatCard = ({ icon, label, value, iconBg = 'bg-gray-100' }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <SafeIcon icon={icon} className="text-gray-500 text-sm" />
      </div>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
    <p className="text-4xl font-black text-[#0B0D0F] tracking-tighter leading-none">{value}</p>
  </div>
);

const INITIAL_FORM = {
  projectName: '', assignedTo: '', projectLead: '', fiscalYear: 'FY24',
  livesImpacted: 0, status: 'Draft', projectBackground: '', strategicResponse: '',
  children: 0, women: 0, men: 0,
  deliverables: [{ id: 1, label: '', count: '' }],
  galleryUrl: '',
  milestones: [{ id: 1, date: '', title: '', notes: '' }],
};

const ReportsModule = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);

  const stats = useMemo(() => {
    const total = reports.reduce((s, r) => s + r.metrics.beneficiaries, 0);
    return {
      globalLives: total.toLocaleString(),
      ledgerEntries: reports.length,
      avgImpact: Math.round(total / reports.length).toLocaleString(),
    };
  }, []);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon="FiGlobe"      label="Global Lives Reached" value={stats.globalLives}   iconBg="bg-gray-100"  />
        <StatCard icon="FiClipboard"  label="Ledger Entries"       value={stats.ledgerEntries} iconBg="bg-gray-100"  />
        <StatCard icon="FiTrendingUp" label="Avg Impact / Node"    value={stats.avgImpact}     iconBg="bg-green-50"  />
      </div>

      {/* Content row */}
      <div className="flex gap-5 items-start">
        {/* Left — form */}
        <div className="flex-[3] min-w-0">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">Impact Core</h2>
              <p className="text-sm text-gray-400 mt-0.5">Technical reporting &amp; executive accountability</p>
            </div>
            <button
              onClick={() => setForm(INITIAL_FORM)}
              className="flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              <SafeIcon icon="FiPlus" className="text-base" />
              New Entry
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <TabNav active={activeTab} onChange={setActiveTab} />
            </div>

            {/* Tab content */}
            <div className="px-6 py-6">
              {activeTab === 1 && <GeneralTab        form={form} update={update} />}
              {activeTab === 2 && <NarrativeTab      form={form} update={update} />}
              {activeTab === 3 && <MetricsTab        form={form} update={update} />}
              {activeTab === 4 && <MediaTimelineTab  form={form} update={update} />}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <SafeIcon icon="FiShield" className="text-xs" />
                Autosaved · AES-256 encrypted
              </p>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Commit Updates
                </button>
                <button className="px-5 py-2.5 bg-[#E52321] hover:bg-[#c91d1b] text-white rounded-xl text-sm font-bold transition-colors">
                  Finalize &amp; Deploy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right — ledger */}
        <div className="flex-[2] flex-shrink-0">
          <RecordLedger />
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;
