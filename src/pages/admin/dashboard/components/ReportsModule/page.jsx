import { useState, useMemo } from 'react';
import { reports } from '../../../../../data/mockData';
import SafeIcon from '../../../../../common/SafeIcon';
import TabNav from './reports/TabNav';
import GeneralTab from './reports/GeneralTab';
import NarrativeTab from './reports/NarrativeTab';
import MetricsTab from './reports/MetricsTab';
import MediaTimelineTab from './reports/MediaTimelineTab';
import RecordLedger from './reports/RecordLedger';
import StatCard from './reports/StatCard';

const INITIAL_FORM = {
  projectName: '', assignedTo: '', projectLead: '', fiscalYear: 'FY24',
  livesImpacted: 0, status: 'Draft', projectBackground: '', strategicResponse: '',
  children: 0, women: 0, men: 0,
  deliverables: [{ id: 1, label: '', count: '' }],
  galleryUrl: '',
  milestones: [{ id: 1, date: '', title: '', notes: '' }],
};

const FILTERS = ['all', 'published', 'pending'];

const ReportsModule = () => {
  const [activeTab, setActiveTab]       = useState(1);
  const [form, setForm]                 = useState(INITIAL_FORM);
  const [ledgerFilter, setLedgerFilter] = useState('all');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerSort, setLedgerSort]     = useState('recent');

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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon="FiGlobe"      label="Global Lives Reached" value={stats.globalLives}   iconBg="bg-gray-100" />
        <StatCard icon="FiClipboard"  label="Ledger Entries"       value={stats.ledgerEntries} iconBg="bg-gray-100" />
        <StatCard icon="FiTrendingUp" label="Avg Impact / Node"    value={stats.avgImpact}     iconBg="bg-green-50" />
      </div>
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">Impact Core</h2>
          <p className="text-sm text-gray-400 mt-0.5">Technical reporting &amp; executive accountability</p>
        </div>
        <button
          onClick={() => setForm(INITIAL_FORM)}
          className="flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0"
        >
          <SafeIcon icon="FiPlus" className="text-base" />
          New Entry
        </button>
      </div>
      <div className="flex gap-5 items-start">

        {/* Left — form card */}
        <div className="flex-[4] min-w-0">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <TabNav active={activeTab} onChange={setActiveTab} />
            </div>

            <div className="px-6 py-6">
              {activeTab === 1 && <GeneralTab       form={form} update={update} />}
              {activeTab === 2 && <NarrativeTab     form={form} update={update} />}
              {activeTab === 3 && <MetricsTab       form={form} update={update} />}
              {activeTab === 4 && <MediaTimelineTab form={form} update={update} />}
            </div>

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

        {/* Right — filter card + ledger card */}
        <div className="flex-[2] flex-shrink-0 space-y-4">

          {/* Filter + Search card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-1 flex gap-0.5">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setLedgerFilter(f)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                    ledgerFilter === f
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative min-w-0">
                <SafeIcon icon="FiSearch" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={ledgerSearch}
                  onChange={e => setLedgerSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none bg-white"
                />
              </div>
              <div className="relative w-[200px] flex-shrink-0">
                <select
                  value={ledgerSort}
                  onChange={e => setLedgerSort(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none bg-white appearance-none pr-7 cursor-pointer"
                >
                  <option value="recent">Recent</option>
                  <option value="oldest">Oldest</option>
                </select>
                <SafeIcon icon="FiChevronDown" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Record Ledger card */}
          <RecordLedger filter={ledgerFilter} search={ledgerSearch} sort={ledgerSort} />
        </div>

      </div>
    </div>
  );
};

export default ReportsModule;
