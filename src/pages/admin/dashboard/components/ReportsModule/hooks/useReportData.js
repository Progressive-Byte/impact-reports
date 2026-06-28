import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApiRequest } from '../../../../../../services/adminApi';
import { publicApiRequest } from '../../../../../../services/publicApi';
import { getBlankForm, reportToForm } from '../reports/reportFormUtils';

export function useReportData() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');

  const [form,          setForm]          = useState(() => getBlankForm());
  const [reports,       setReports]       = useState([]);
  const [meta,          setMeta]          = useState(null);
  const [stats,         setStats]         = useState({ totalLives: 0, count: 0 });
  const [adminOptions,      setAdminOptions]      = useState([]);
  const [allAdminOptions,   setAllAdminOptions]   = useState([]);
  const [regionOptions,     setRegionOptions]     = useState([]);
  const [sectorOptions,     setSectorOptions]     = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [tabCounts,     setTabCounts]     = useState({});
  const [loadingList,   setLoadingList]   = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  // Cached default region from platform settings (DB-backed)
  const defaultRegionRef = useRef('');

  // Track in-flight requests to avoid duplicate calls
  const adminOptionsLoadingRef    = useRef(false);
  const allAdminOptionsLoadingRef = useRef(false);
  const regionOptionsLoadingRef = useRef(false);
  const sectorOptionsLoadingRef = useRef(false);

  // Fetch platform default region once on mount
  useEffect(() => {
    adminApiRequest('/api/config/settings')
      .then(data => { defaultRegionRef.current = data.defaultRegion || ''; })
      .catch(() => {});
  }, []);

  // Lazy-load editor users for "Assigned To" dropdowns.
  const loadAdminOptions = useCallback(() => {
    if (adminOptions.length > 0 || adminOptionsLoadingRef.current) return;
    adminOptionsLoadingRef.current = true;
    adminApiRequest('/api/admin/admins?role=editor&limit=100')
      .then(data => setAdminOptions(
        (data.items || []).map(a => ({ value: a._id, label: a.username || a.email }))
      ))
      .catch(() => {})
      .finally(() => { adminOptionsLoadingRef.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOptions.length]);

  // Lazy-load all users (any role) for "Approval Reviewer" dropdown.
  const loadAllAdminOptions = useCallback(() => {
    if (allAdminOptions.length > 0 || allAdminOptionsLoadingRef.current) return;
    allAdminOptionsLoadingRef.current = true;
    adminApiRequest('/api/admin/admins?limit=100')
      .then(data => setAllAdminOptions(
        (data.items || []).map(a => ({ value: a._id, label: `${a.username || a.email} (${a.role})` }))
      ))
      .catch(() => {})
      .finally(() => { allAdminOptionsLoadingRef.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAdminOptions.length]);

  // Lazy-load region options from the backend config endpoint.
  const loadRegionOptions = useCallback(() => {
    if (regionOptions.length > 0 || regionOptionsLoadingRef.current) return;
    regionOptionsLoadingRef.current = true;
    publicApiRequest('/api/config/regions')
      .then(data => setRegionOptions(
        (data.regions || []).map(r => ({ value: r, label: r }))
      ))
      .catch(() => {})
      .finally(() => { regionOptionsLoadingRef.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionOptions.length]);

  // Lazy-load sector options from the backend config endpoint.
  const loadSectorOptions = useCallback(() => {
    if (sectorOptions.length > 0 || sectorOptionsLoadingRef.current) return;
    sectorOptionsLoadingRef.current = true;
    publicApiRequest('/api/config/sectors')
      .then(data => setSectorOptions(
        (data.sectors || []).map(s => ({ value: s, label: s }))
      ))
      .catch(() => {})
      .finally(() => { sectorOptionsLoadingRef.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorOptions.length]);

  const fetchTabCounts = useCallback(async () => {
    try {
      const data = await adminApiRequest('/api/reports/counts');
      setTabCounts(data.counts ?? {});
    } catch { /* non-critical */ }
  }, []);

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
      const [data] = await Promise.all([
        adminApiRequest(`/api/reports${qs}`),
        fetchTabCounts(),
      ]);
      setReports(data.reports || []);
      setMeta(data.meta   ?? null);
      setStats(data.stats ?? { totalLives: 0, count: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setLoadingList(false);
    }
  }, [fetchTabCounts]);

  // Load single report when entering wizard; fall back to DB default region when report has none
  useEffect(() => {
    if (!reportId) { setForm(getBlankForm(defaultRegionRef.current)); return; }
    setLoadingReport(true);
    adminApiRequest(`/api/reports/${reportId}`)
      .then(data => setForm(reportToForm(data.report, defaultRegionRef.current)))
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
  };
}
