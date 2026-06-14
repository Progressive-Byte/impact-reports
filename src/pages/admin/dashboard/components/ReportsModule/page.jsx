import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';
import { adminApiRequest } from '../../../../../services/adminApi';
import StatCard from './reports/StatCard';
import CreateReportModal from './reports/CreateReportModal';
import RecordLedger from './reports/RecordLedger';
import ReportSectionHeader from './reports/ReportSectionHeader';
import WizardShell from './reports/WizardShell';
import GeneralTab from './reports/GeneralTab';
import NarrativeTab from './reports/NarrativeTab';
import MetricsTab from './reports/MetricsTab';
import MediaTimelineTab from './reports/MediaTimelineTab';
import CountryLocationTab from './reports/CountryLocationTab';
import { useReportData } from './hooks/useReportData';
import { useReportFilters } from './hooks/useReportFilters';
import { buildStepPayload, reportToForm, validateStep } from './reports/reportFormUtils';

const STEP_KEYS    = ['general', 'narrative', 'metrics', 'media', 'location'];
const STEP_CONTENT = [GeneralTab, NarrativeTab, MetricsTab, MediaTimelineTab, CountryLocationTab];

const ReportsModule = ({ onCountChange }) => {
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
    meta, stats,
    adminOptions,
    regionOptions,
    loadingList, loadingReport,
    fetchReports,
    loadAdminOptions,
    loadRegionOptions,
  } = useReportData();

  const {
    urlSearch, urlStatus, urlSort, urlPage,
    inputSearch, setInputSearch,
    isDebouncing,
    handleStatusChange, handleSortChange, handlePageChange,
  } = useReportFilters();

  const [saving,      setSaving]      = useState(false);
  const [showCreate,  setShowCreate]  = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Drive list fetch whenever URL filter params change
  useEffect(() => {
    if (!isWizard) {
      fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch, urlStatus, urlSort, urlPage, isWizard]);

  // Keep sidebar badge in sync with the total unfiltered count
  useEffect(() => {
    if (stats.count > 0 && !urlSearch && urlStatus === 'all') {
      onCountChange?.(stats.count);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.count]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const goToList = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);
  const goToStep = useCallback((key) => {
    setFieldErrors({});
    setSearchParams({ reportId, step: key }, { replace: true });
  }, [reportId, setSearchParams]);

  const openWizard = (report) => {
    loadAdminOptions();
    loadRegionOptions();
    setForm(reportToForm(report));
    setSearchParams({ reportId: report._id, step: 'general' }, { replace: true });
  };

  const handleBack = () => {
    if (step === 1) goToList();
    else goToStep(STEP_KEYS[stepIndex - 1]);
  };

  const handleNext = async () => {
    const errors = validateStep(stepKey, form, isSuperAdmin);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error('Please fix the highlighted fields');
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const payload = buildStepPayload[stepKey](form);
      const data    = await adminApiRequest(`/api/reports/${reportId}/step/${stepKey}`, {
        method: 'PATCH',
        body:   JSON.stringify(payload),
      });
      if (stepKey === 'location') {
        toast.success('Report submitted successfully');
        goToList();
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
    fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
  };

  const handleDelete = async (id) => {
    try {
      await adminApiRequest(`/api/reports/${id}`, { method: 'DELETE' });
      toast.success('Report deleted');
      // Go back a page if we just deleted the only item on a non-first page
      const wouldBeEmpty = reports.length === 1 && urlPage > 1;
      if (wouldBeEmpty) {
        handlePageChange(urlPage - 1);
      } else {
        fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const statCards = useMemo(() => {
    const avg = stats.count ? Math.round(stats.totalLives / stats.count) : 0;
    return {
      globalLives:   stats.totalLives.toLocaleString(),
      ledgerEntries: stats.count.toLocaleString(),
      avgImpact:     avg.toLocaleString(),
    };
  }, [stats]);

  const handleRefresh = useCallback(() => {
    fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
  }, [fetchReports, urlStatus, urlSearch, urlSort, urlPage]);

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
          <StatCard icon="FiGlobe"      label="Global Lives Reached" value={statCards.globalLives}   iconBg="bg-gray-100" />
          <StatCard icon="FiClipboard"  label="Ledger Entries"       value={statCards.ledgerEntries} iconBg="bg-gray-100" />
          <StatCard icon="FiTrendingUp" label="Avg Impact / Node"    value={statCards.avgImpact}     iconBg="bg-green-50" />
        </div>
      )}

      <ReportSectionHeader
        isWizard={isWizard}
        isSuperAdmin={isSuperAdmin}
        projectName={form.projectName}
        onBack={goToList}
        onNewReport={() => { loadAdminOptions(); loadRegionOptions(); setShowCreate(true); }}
      />

      {isWizard ? (
        <WizardShell
          step={step}
          loading={loadingReport}
          form={form}
          update={update}
          adminOptions={adminOptions}
          regionOptions={regionOptions}
          StepContent={STEP_CONTENT[stepIndex]}
          saving={saving}
          onBack={handleBack}
          onNext={handleNext}
          onStepClick={goToStep}
          isSuperAdmin={isSuperAdmin}
          fieldErrors={fieldErrors}
        />
      ) : (
        <RecordLedger
          reports={reports}
          loading={loadingList}
          meta={meta}
          inputSearch={inputSearch}
          setInputSearch={setInputSearch}
          isDebouncing={isDebouncing}
          urlSearch={urlSearch}
          urlStatus={urlStatus}
          urlSort={urlSort}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onRefresh={handleRefresh}
          isSuperAdmin={isSuperAdmin}
          onEdit={openWizard}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ReportsModule;
