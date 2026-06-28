import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  const isViewer     = admin?.role === 'viewer';

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
    tabCounts,
    adminOptions,
    allAdminOptions,
    regionOptions,
    sectorOptions,
    loadingList, loadingReport,
    fetchReports,
    loadAdminOptions,
    loadAllAdminOptions,
    loadRegionOptions,
    loadSectorOptions,
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
  const [selected,    setSelected]    = useState(new Set());

  const prevFiltersRef = useRef({ search: urlSearch, status: urlStatus });

  // Clear selection whenever filters change
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (prev.search !== urlSearch || prev.status !== urlStatus) {
      setSelected(new Set());
      prevFiltersRef.current = { search: urlSearch, status: urlStatus };
    }
  }, [urlSearch, urlStatus]);

  const allSelected   = reports.length > 0 && reports.every(r => selected.has(r._id));
  const selectedCount = selected.size;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(reports.map(r => r._id)));

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

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
    loadAllAdminOptions();
    loadRegionOptions();
    loadSectorOptions();
    setForm(reportToForm(report));
    setSearchParams({ reportId: report._id, step: 'general' }, { replace: true });
  };

  const handleBack = () => {
    if (step === 1) goToList();
    else goToStep(STEP_KEYS[stepIndex - 1]);
  };

  const handleViewerNext = useCallback(() => {
    if (stepIndex < STEP_KEYS.length - 1) goToStep(STEP_KEYS[stepIndex + 1]);
    else goToList();
  }, [stepIndex, goToStep, goToList]);

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
        if (data.report?.status === 'pending_approval') {
          toast.success('Report submitted — awaiting approval before publishing');
        } else {
          toast.success('Report submitted successfully');
        }
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

  const handleApprove = async () => {
    setSaving(true);
    try {
      await adminApiRequest(`/api/reports/${reportId}/approve`, { method: 'PATCH' });
      toast.success('Report approved and published!');
      fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
      goToList();
    } catch (err) {
      toast.error(err.message || 'Failed to approve report');
    } finally {
      setSaving(false);
    }
  };

  const handleCreated = (report) => {
    setShowCreate(false);
    openWizard(report);
  };

  const handleDelete = async (id) => {
    try {
      await adminApiRequest(`/api/reports/${id}`, { method: 'DELETE' });
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success('Report moved to Trash');
      const wouldBeEmpty = reports.length === 1 && urlPage > 1;
      if (wouldBeEmpty) handlePageChange(urlPage - 1);
      else fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleRestore = async (id) => {
    try {
      await adminApiRequest(`/api/reports/${id}/restore`, { method: 'PATCH' });
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success('Report restored');
      const wouldBeEmpty = reports.length === 1 && urlPage > 1;
      if (wouldBeEmpty) handlePageChange(urlPage - 1);
      else fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
    } catch (err) {
      toast.error(err.message || 'Failed to restore');
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await adminApiRequest(`/api/reports/${id}/permanent`, { method: 'DELETE' });
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success('Report permanently deleted');
      const wouldBeEmpty = reports.length === 1 && urlPage > 1;
      if (wouldBeEmpty) handlePageChange(urlPage - 1);
      else fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
    } catch (err) {
      toast.error(err.message || 'Failed to permanently delete');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const isTrash = urlStatus === 'trash';
    const endpoint = (id) => isTrash ? `/api/reports/${id}/permanent` : `/api/reports/${id}`;
    const results = await Promise.allSettled(
      ids.map(id => adminApiRequest(endpoint(id), { method: 'DELETE' }))
    );
    const failed  = results.filter(r => r.status === 'rejected').length;
    const success = ids.length - failed;
    setSelected(new Set());
    if (success > 0) toast.success(isTrash
      ? `${success} report${success !== 1 ? 's' : ''} permanently deleted`
      : `${success} report${success !== 1 ? 's' : ''} moved to Trash`);
    if (failed > 0) toast.error(`${failed} report${failed !== 1 ? 's' : ''} could not be deleted`);
    const wouldBeEmpty = reports.length === ids.length && urlPage > 1;
    if (wouldBeEmpty) handlePageChange(urlPage - 1);
    else fetchReports({ status: urlStatus, q: urlSearch, sort: urlSort, page: urlPage });
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
        allAdminOptions={allAdminOptions}
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
        onNewReport={() => { loadAdminOptions(); loadAllAdminOptions(); loadRegionOptions(); loadSectorOptions(); setShowCreate(true); }}
      />

      {isWizard ? (
        (() => {
          const isPendingApproval = form.status === 'pending_approval';
          const isApprover = Boolean(
            isPendingApproval &&
            Array.isArray(form.approvalAssignedTo) &&
            form.approvalAssignedTo.some(a => String(a._id ?? a) === String(admin?._id))
          );
          // Editors who submitted but aren't the approver see read-only too
          const effectiveIsViewer = isViewer || (isPendingApproval && !isSuperAdmin && !isApprover);
          return (
            <WizardShell
              step={step}
              loading={loadingReport}
              form={form}
              update={update}
              adminOptions={adminOptions}
              allAdminOptions={allAdminOptions}
              regionOptions={regionOptions}
              sectorOptions={sectorOptions}
              StepContent={STEP_CONTENT[stepIndex]}
              saving={saving}
              onBack={handleBack}
              onNext={(effectiveIsViewer || isApprover) ? handleViewerNext : handleNext}
              onStepClick={goToStep}
              onApprove={handleApprove}
              isSuperAdmin={isSuperAdmin}
              isViewer={effectiveIsViewer}
              isApprover={isApprover}
              fieldErrors={fieldErrors}
            />
          );
        })()
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
          tabCounts={tabCounts}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onRefresh={handleRefresh}
          isSuperAdmin={isSuperAdmin}
          isViewer={isViewer}
          onEdit={openWizard}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          selected={selected}
          allSelected={allSelected}
          selectedCount={selectedCount}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onBulkDelete={handleBulkDelete}
        />
      )}
    </div>
  );
};

export default ReportsModule;
