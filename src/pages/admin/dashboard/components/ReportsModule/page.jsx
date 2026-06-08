import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';
import { adminApiRequest } from '../../../../../services/adminApi';
import SafeIcon from '../../../../../common/SafeIcon';
import StepIndicator, { STEPS } from './reports/TabNav';
import GeneralTab from './reports/GeneralTab';
import NarrativeTab from './reports/NarrativeTab';
import MetricsTab from './reports/MetricsTab';
import MediaTimelineTab from './reports/MediaTimelineTab';
import RecordLedger from './reports/RecordLedger';
import StatCard from './reports/StatCard';
import CustomSelect from './reports/CustomSelect';
import CreateReportModal from './reports/CreateReportModal';

// ── Constants ────────────────────────────────────────────────────────
const STEP_KEYS    = ['general', 'narrative', 'metrics', 'media'];
const TOTAL_STEPS  = STEPS.length;
const STEP_CONTENT = [GeneralTab, NarrativeTab, MetricsTab, MediaTimelineTab];
const FILTERS      = ['all', 'published', 'pending', 'draft'];

// ── Blank form ────────────────────────────────────────────────────────
const BLANK_FORM = {
  projectName:       '',
  assignedTo:        [],
  projectLead:       '',
  fiscalYear:        'FY25',
  livesImpacted:     0,
  projectBackground: '',
  strategicResponse: '',
  children:          0,
  women:             0,
  men:               0,
  deliverables:      [{ id: 1, label: '', count: '' }],
  galleryUrl:        '',
  milestones:        [{ id: 1, date: '', title: '', notes: '' }],
};

// ── Convert API report object → local form state ──────────────────────
const reportToForm = (report) => ({
  projectName:       report.projectName || '',
  assignedTo:        (report.assignedTo || []).map(a => String(a._id ?? a)),
  projectLead:       report.projectLead || '',
  fiscalYear:        report.fiscalYear || 'FY25',
  livesImpacted:     report.livesImpacted ?? 0,
  projectBackground: report.projectBackground || '',
  strategicResponse: report.strategicResponse || '',
  children:          report.children ?? 0,
  women:             report.women ?? 0,
  men:               report.men ?? 0,
  deliverables:      (report.deliverables || []).map((d, i) => ({ ...d, id: i + 1 })),
  galleryUrl:        report.galleryUrl || '',
  milestones:        (report.milestones || []).map((m, i) => ({ ...m, id: i + 1 })),
});

// ── Extract only the fields relevant to a step for the API payload ────
const buildStepPayload = {
  general:   (f) => ({
    projectName:   f.projectName,
    assignedTo:    f.assignedTo,
    projectLead:   f.projectLead,
    fiscalYear:    f.fiscalYear,
    livesImpacted: Number(f.livesImpacted) || 0,
  }),
  narrative: (f) => ({
    projectBackground: f.projectBackground,
    strategicResponse: f.strategicResponse,
  }),
  metrics:   (f) => ({
    children:    Number(f.children) || 0,
    women:       Number(f.women) || 0,
    men:         Number(f.men) || 0,
    deliverables: f.deliverables.map(({ label, count }) => ({ label, count: Number(count) || 0 })),
  }),
  media:     (f) => ({
    galleryUrl: f.galleryUrl,
    milestones: f.milestones.map(({ date, title, notes }) => ({ date, title, notes })),
  }),
};

// ── Component ─────────────────────────────────────────────────────────
const ReportsModule = () => {
  const { admin }    = useAdminAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const [searchParams, setSearchParams] = useSearchParams();
  const reportId  = searchParams.get('reportId');
  const stepKey   = STEP_KEYS.includes(searchParams.get('step')) ? searchParams.get('step') : 'general';
  const stepIndex = STEP_KEYS.indexOf(stepKey);         // 0-based
  const step      = stepIndex + 1;                       // 1-based for StepIndicator
  const isWizard  = Boolean(reportId);

  const [form,          setForm]          = useState(BLANK_FORM);
  const [reports,       setReports]       = useState([]);
  const [adminOptions,  setAdminOptions]  = useState([]);
  const [loadingList,   setLoadingList]   = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [showCreate,    setShowCreate]    = useState(false);
  const [ledgerFilter,  setLedgerFilter]  = useState('all');
  const [ledgerSearch,  setLedgerSearch]  = useState('');
  const [ledgerSort,    setLedgerSort]    = useState('recent');

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // ── Load admin users (role=admin) for Assigned To dropdown ──────────
  useEffect(() => {
    adminApiRequest('/api/admin/admins?role=admin&limit=100')
      .then(data => setAdminOptions(
        (data.items || []).map(a => ({ value: a._id, label: a.username || a.email }))
      ))
      .catch(() => {});
  }, []);

  // ── Fetch report list (optional status filter) ───────────────────────
  const fetchReports = useCallback(async (status = 'all') => {
    setLoadingList(true);
    try {
      const qs   = status !== 'all' ? `?status=${status}` : '';
      const data = await adminApiRequest(`/api/reports${qs}`);
      setReports(data.reports || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!isWizard) fetchReports('all');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWizard]);

  // ── Load single report when entering wizard ──────────────────────────
  useEffect(() => {
    if (!reportId) { setForm(BLANK_FORM); return; }
    setLoadingReport(true);
    adminApiRequest(`/api/reports/${reportId}`)
      .then(data => setForm(reportToForm(data.report)))
      .catch(err => {
        toast.error(err.message || 'Failed to load report');
        setSearchParams({}, { replace: true });
      })
      .finally(() => setLoadingReport(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  // ── Navigation helpers ───────────────────────────────────────────────
  const goToList = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const goToStep = useCallback((key) => {
    setSearchParams({ reportId, step: key }, { replace: true });
  }, [reportId, setSearchParams]);

  const openWizard = (report) => {
    setForm(reportToForm(report));
    setSearchParams({ reportId: report._id, step: 'general' }, { replace: true });
  };

  // ── Wizard: Back ─────────────────────────────────────────────────────
  const handleBack = () => {
    if (step === 1) {
      goToList();
      setLedgerFilter('all');
      fetchReports('all');
    } else {
      goToStep(STEP_KEYS[stepIndex - 1]);
    }
  };

  // ── Wizard: Save & Next / Submit ─────────────────────────────────────
  const handleNext = async () => {
    if (!form.projectName.trim() && stepKey === 'general') {
      return toast.error('Project name is required');
    }

    setSaving(true);
    try {
      const payload = buildStepPayload[stepKey](form);
      const data    = await adminApiRequest(`/api/reports/${reportId}/step/${stepKey}`, {
        method: 'PATCH',
        body:   JSON.stringify(payload),
      });

      const isLastStep = stepKey === 'media';
      if (isLastStep) {
        toast.success('Report submitted successfully');
        goToList();
        fetchReports();
      } else {
        setForm(reportToForm(data.report));
        toast.success('Step saved');
        goToStep(STEP_KEYS[stepIndex + 1]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save step');
    } finally {
      setSaving(false);
    }
  };

  // ── Create report (from modal) → go straight to list ────────────────
  const handleCreated = () => {
    setShowCreate(false);
    setLedgerFilter('all');
    fetchReports('all');
  };

  // ── Delete report ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await adminApiRequest(`/api/reports/${id}`, { method: 'DELETE' });
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success('Report deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  // ── Stats (from real data) ───────────────────────────────────────────
  const stats = useMemo(() => {
    const total = reports.reduce((s, r) => s + (r.livesImpacted || 0), 0);
    return {
      globalLives:   total.toLocaleString(),
      ledgerEntries: reports.length,
      avgImpact:     reports.length ? Math.round(total / reports.length).toLocaleString() : '0',
    };
  }, [reports]);

  const StepContent = STEP_CONTENT[stepIndex];

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      <CreateReportModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
        adminOptions={adminOptions}
      />

      {/* ── Stats row (list view only) ─────────────────────────────── */}
      {!isWizard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon="FiGlobe"      label="Global Lives Reached" value={stats.globalLives}   iconBg="bg-gray-100" />
          <StatCard icon="FiClipboard"  label="Ledger Entries"       value={stats.ledgerEntries} iconBg="bg-gray-100" />
          <StatCard icon="FiTrendingUp" label="Avg Impact / Node"    value={stats.avgImpact}     iconBg="bg-green-50" />
        </div>
      )}

      {/* ── Section header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div>
          {isWizard ? (
            <>
              <button
                onClick={() => { goToList(); fetchReports(); }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0B0D0F] mb-1 transition-colors"
              >
                <SafeIcon icon="FiArrowLeft" className="text-sm" />
                Back to reports
              </button>
              <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">
                {form.projectName || 'New Report'}
              </h2>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">Impact Core</h2>
              <p className="text-sm text-gray-400 mt-0.5">Technical reporting &amp; executive accountability</p>
            </>
          )}
        </div>

        {!isWizard && isSuperAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <SafeIcon icon="FiPlus" className="text-base" />
            New Report
          </button>
        )}
      </div>

      {/* ── Wizard ────────────────────────────────────────────────── */}
      {isWizard ? (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm">

          {/* Step indicator */}
          <div className="px-8 pt-7 pb-6 border-b border-gray-100">
            <StepIndicator current={step} />
          </div>

          {/* Step content */}
          <div className="px-8 py-7">
            {loadingReport ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <StepContent form={form} update={update} adminOptions={adminOptions} />
            )}
          </div>

          {/* Footer navigation */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex items-center justify-between">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <SafeIcon icon="FiShield" className="text-xs" />
              Step {step} of {TOTAL_STEPS} · saved on Next
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                disabled={saving}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {step === 1 ? 'Cancel' : '← Back'}
              </button>
              <button
                onClick={handleNext}
                disabled={saving || loadingReport}
                className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
                  step < TOTAL_STEPS ? 'bg-[#0B0D0F] hover:bg-[#1a1d20]' : 'bg-[#E52321] hover:bg-[#c91d1b]'
                }`}
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {step < TOTAL_STEPS ? (
                  <>Save &amp; Next <SafeIcon icon="FiArrowRight" className="text-sm" /></>
                ) : (
                  <><SafeIcon icon="FiCheck" className="text-sm" /> Submit Report</>
                )}
              </button>
            </div>
          </div>
        </div>

      ) : (
        /* ── List view ──────────────────────────────────────────── */
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
                placeholder="Search reports..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white"
              />
            </div>

            <CustomSelect
              value={ledgerSort}
              onChange={setLedgerSort}
              options={[
                { value: 'recent', label: 'Recent' },
                { value: 'oldest', label: 'Oldest' },
              ]}
              className="w-32 flex-shrink-0"
            />
          </div>

          <RecordLedger
            reports={reports}
            loading={loadingList}
            filter={ledgerFilter}
            search={ledgerSearch}
            sort={ledgerSort}
            isSuperAdmin={isSuperAdmin}
            onEdit={openWizard}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default ReportsModule;
