import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';
import { adminApiRequest } from '../../../../../services/adminApi';
import StatCard from './reports/StatCard';
import CreateReportModal from './reports/CreateReportModal';
import RecordLedger from './reports/RecordLedger';
import ReportSectionHeader from './reports/ReportSectionHeader';
import WizardShell from './reports/WizardShell';
import LedgerToolbar from './reports/LedgerToolbar';
import GeneralTab from './reports/GeneralTab';
import NarrativeTab from './reports/NarrativeTab';
import MetricsTab from './reports/MetricsTab';
import MediaTimelineTab from './reports/MediaTimelineTab';
import { useReportData } from './hooks/useReportData';
import { buildStepPayload, reportToForm } from './reports/reportFormUtils';

const STEP_KEYS    = ['general', 'narrative', 'metrics', 'media'];
const STEP_CONTENT = [GeneralTab, NarrativeTab, MetricsTab, MediaTimelineTab];

const ReportsModule = () => {
  const { admin }    = useAdminAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const [searchParams, setSearchParams] = useSearchParams();
  const reportId  = searchParams.get('reportId');
  const stepKey   = STEP_KEYS.includes(searchParams.get('step')) ? searchParams.get('step') : 'general';
  const stepIndex = STEP_KEYS.indexOf(stepKey);
  const step      = stepIndex + 1;
  const isWizard  = Boolean(reportId);

  const {
    form, setForm,
    reports,
    adminOptions,
    loadingList, loadingReport,
    fetchReports,
  } = useReportData();

  const [saving,       setSaving]       = useState(false);
  const [showCreate,   setShowCreate]   = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState('all');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerSort,   setLedgerSort]   = useState('recent');

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const goToList = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);
  const goToStep = useCallback((key) => setSearchParams({ reportId, step: key }, { replace: true }), [reportId, setSearchParams]);

  const openWizard = (report) => {
    setForm(reportToForm(report));
    setSearchParams({ reportId: report._id, step: 'general' }, { replace: true });
  };

  const handleBack = () => {
    if (step === 1) { goToList(); setLedgerFilter('all'); fetchReports('all'); }
    else goToStep(STEP_KEYS[stepIndex - 1]);
  };

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
      if (stepKey === 'media') {
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

  const handleCreated = () => {
    setShowCreate(false);
    setLedgerFilter('all');
    fetchReports('all');
  };

  const handleDelete = async (id) => {
    try {
      await adminApiRequest(`/api/reports/${id}`, { method: 'DELETE' });
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success('Report deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const stats = useMemo(() => {
    const total = reports.reduce((s, r) => s + (r.livesImpacted || 0), 0);
    return {
      globalLives:   total.toLocaleString(),
      ledgerEntries: reports.length,
      avgImpact:     reports.length ? Math.round(total / reports.length).toLocaleString() : '0',
    };
  }, [reports]);

  return (
    <div className="space-y-5">
      <CreateReportModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
        adminOptions={adminOptions}
      />

      {!isWizard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon="FiGlobe"      label="Global Lives Reached" value={stats.globalLives}   iconBg="bg-gray-100" />
          <StatCard icon="FiClipboard"  label="Ledger Entries"       value={stats.ledgerEntries} iconBg="bg-gray-100" />
          <StatCard icon="FiTrendingUp" label="Avg Impact / Node"    value={stats.avgImpact}     iconBg="bg-green-50" />
        </div>
      )}

      <ReportSectionHeader
        isWizard={isWizard}
        isSuperAdmin={isSuperAdmin}
        projectName={form.projectName}
        onBack={() => { goToList(); setLedgerFilter('all'); fetchReports('all'); }}
        onNewReport={() => setShowCreate(true)}
      />

      {isWizard ? (
        <WizardShell
          step={step}
          loading={loadingReport}
          form={form}
          update={update}
          adminOptions={adminOptions}
          StepContent={STEP_CONTENT[stepIndex]}
          saving={saving}
          onBack={handleBack}
          onNext={handleNext}
        />
      ) : (
        <div className="space-y-4">
          <LedgerToolbar
            activeFilter={ledgerFilter}
            onFilterChange={(f) => { setLedgerFilter(f); fetchReports(f); }}
            loadingList={loadingList}
            search={ledgerSearch}
            onSearchChange={setLedgerSearch}
            sort={ledgerSort}
            onSortChange={setLedgerSort}
          />
          <RecordLedger
            reports={reports}
            loading={loadingList}
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
