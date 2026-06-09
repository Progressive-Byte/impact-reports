import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApiRequest } from '../../../../../../services/adminApi';
import { BLANK_FORM, reportToForm } from '../reports/reportFormUtils';

export function useReportData() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');

  const [form,          setForm]          = useState(BLANK_FORM);
  const [reports,       setReports]       = useState([]);
  const [adminOptions,  setAdminOptions]  = useState([]);
  const [loadingList,   setLoadingList]   = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  // Load admin users once for "Assigned To" dropdowns
  useEffect(() => {
    adminApiRequest('/api/admin/admins?role=admin&limit=100')
      .then(data => setAdminOptions(
        (data.items || []).map(a => ({ value: a._id, label: a.username || a.email }))
      ))
      .catch(() => {});
  }, []);

  // Fetch report list (optional status filter)
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

  // Fetch list only when not in wizard
  useEffect(() => {
    if (!reportId) fetchReports('all');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  // Load single report when entering wizard
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

  return {
    form, setForm,
    reports, setReports,
    adminOptions,
    loadingList, loadingReport,
    fetchReports,
  };
}
