import { useState, useMemo } from 'react';
import { reports } from '../../../../../data/mockData';
import SafeIcon from '../../../../../common/SafeIcon';
import StepIndicator, { STEPS } from './reports/TabNav';
import GeneralTab from './reports/GeneralTab';
import NarrativeTab from './reports/NarrativeTab';
import MetricsTab from './reports/MetricsTab';
import MediaTimelineTab from './reports/MediaTimelineTab';
import RecordLedger from './reports/RecordLedger';
import StatCard from './reports/StatCard';
import CustomSelect from './reports/CustomSelect';

const INITIAL_FORM = {
  projectName: '', assignedTo: '', projectLead: '', fiscalYear: 'FY24',
  livesImpacted: 0, status: 'Draft', projectBackground: '', strategicResponse: '',
  children: 0, women: 0, men: 0,
  deliverables: [{ id: 1, label: '', count: '' }],
  galleryUrl: '',
  milestones: [{ id: 1, date: '', title: '', notes: '' }],
};

const FILTERS = ['all', 'published', 'pending'];
const TOTAL_STEPS = STEPS.length;

const STEP_CONTENT = [GeneralTab, NarrativeTab, MetricsTab, MediaTimelineTab];

const ReportsModule = () => {
  const [step, setStep]                 = useState(1);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(INITIAL_FORM);
  const [ledgerFilter, setLedgerFilter] = useState('all');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerSort, setLedgerSort]     = useState('recent');

  const stats = useMemo(() => {
    const total = reports.reduce((s, r) => s + r.metrics.beneficiaries, 0);
    return {
      globalLives:   total.toLocaleString(),
      ledgerEntries: reports.length,
      avgImpact:     Math.round(total / reports.length).toLocaleString(),
    };
  }, []);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const openForm = (entry = null) => {
    setForm(entry ? { ...INITIAL_FORM, ...entry } : INITIAL_FORM);
    setStep(1);
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleBack = () => {
    if (step === 1) closeForm();
    else setStep(s => s - 1);
  };

  const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));

  const handleSubmit = () => {
    // TODO: POST form to API
    closeForm();
  };

  const StepContent = STEP_CONTENT[step - 1];

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon="FiGlobe"      label="Global Lives Reached" value={stats.globalLives}   iconBg="bg-gray-100" />
        <StatCard icon="FiClipboard"  label="Ledger Entries"       value={stats.ledgerEntries} iconBg="bg-gray-100" />
        <StatCard icon="FiTrendingUp" label="Avg Impact / Node"    value={stats.avgImpact}     iconBg="bg-green-50" />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">Impact Core</h2>
          <p className="text-sm text-gray-400 mt-0.5">Technical reporting &amp; executive accountability</p>
        </div>
        {!showForm && (
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <SafeIcon icon="FiPlus" className="text-base" />
            New Report
          </button>
        )}
      </div>

      {showForm ? (

        /* ── Step wizard form ── */
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm">

          {/* Step indicator */}
          <div className="px-8 pt-7 pb-6 border-b border-gray-100">
            <StepIndicator current={step} />
          </div>

          {/* Active step content */}
          <div className="px-8 py-7">
            <StepContent form={form} update={update} />
          </div>

          {/* Footer navigation */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex items-center justify-between">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <SafeIcon icon="FiShield" className="text-xs" />
              Step {step} of {TOTAL_STEPS} · AES-256 encrypted
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {step === 1 ? 'Cancel' : '← Back'}
              </button>
              {step < TOTAL_STEPS ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Next <SafeIcon icon="FiArrowRight" className="text-sm" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#E52321] hover:bg-[#c91d1b] text-white rounded-xl text-sm font-bold transition-colors"
                >
                  <SafeIcon icon="FiCheck" className="text-sm" />
                  Submit Report
                </button>
              )}
            </div>
          </div>
        </div>

      ) : (

        /* ── Table view ── */
        <div className="space-y-4">

          {/* Filter bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 flex-wrap">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-1 flex gap-0.5 flex-shrink-0">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setLedgerFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                    ledgerFilter === f
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 relative min-w-[180px]">
              <SafeIcon icon="FiSearch" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search records..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white"
              />
            </div>

            <CustomSelect
              value={ledgerSort}
              onChange={val => setLedgerSort(val)}
              options={[
                { value: 'recent', label: 'Recent' },
                { value: 'oldest', label: 'Oldest' },
              ]}
              className="w-32 flex-shrink-0"
            />
          </div>

          {/* Table */}
          <RecordLedger
            filter={ledgerFilter}
            search={ledgerSearch}
            sort={ledgerSort}
            onEdit={entry => openForm(entry)}
          />
        </div>
      )}

    </div>
  );
};

export default ReportsModule;
