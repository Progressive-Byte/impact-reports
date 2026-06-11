import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApiRequest } from '../../../../../../services/adminApi';
import { publicApiRequest } from '../../../../../../services/publicApi';
import { BLANK_FORM, reportToForm } from '../reports/reportFormUtils';

export function useReportData() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');

  const [form,          setForm]          = useState(BLANK_FORM);
  const [reports,       setReports]       = useState([]);
  const [meta,          setMeta]          = useState(null);
  const [stats,         setStats]         = useState({ totalLives: 0, count: 0 });
  const [adminOptions,  setAdminOptions]  = useState([]);
  const [loadingList,   setLoadingList]   = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  // Track in-flight admin options request to avoid duplicate calls
  const adminOptionsLoadingRef = useRef(false);

  // Lazy-load admin users for "Assigned To" dropdowns.
  // Called only when the wizard or Create modal is about to open.
  const loadAdminOptions = useCallback(() => {
    if (adminOptions.length > 0 || adminOptionsLoadingRef.current) return;
    adminOptionsLoadingRef.current = true;
    adminApiRequest('/api/admin/admins?limit=100')
      .then(data => setAdminOptions(
        (data.items || []).map(a => ({ value: a._id, label: a.username || a.email }))
      ))
      .catch(() => {})
      .finally(() => { adminOptionsLoadingRef.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOptions.length]);

  // Fetch report list with server-side search, filter, sort, and pagination
  const fetchReports = useCallback(async ({ status = 'all', q = '', sort = 'recent', page = 1 } = {}) => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (q)                params.set('q',      q);
      if (sort !== 'recent') params.set('sort',  sort);
      if (page > 1)          params.set('page',  String(page));
      const qs   = params.toString() ? `?${params}` : '';
      const data = await adminApiRequest(`/api/reports${qs}`);
      setReports(data.reports || []);
      setMeta(data.meta   ?? null);
      setStats(data.stats ?? { totalLives: 0, count: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setLoadingList(false);
    }
  }, []);

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
    meta, stats,
    adminOptions,
    loadingList, loadingReport,
    fetchReports,
    loadAdminOptions,
  };
}
