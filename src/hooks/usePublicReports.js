import { useState, useCallback } from 'react';
import { publicApiRequest } from '../services/publicApi';

export async function fetchRegionOptions() {
  const data = await publicApiRequest('/api/config/regions');
  return (data.regions || []).map(r => ({ value: r, label: r }));
}

export function usePublicReports() {
  const [reports,       setReports]       = useState([]);
  const [meta,          setMeta]          = useState(null);
  const [stats,         setStats]         = useState({ totalProjects: 0, totalLives: 0, totalCountries: 0 });
  const [filterOptions, setFilterOptions] = useState({ regions: [], sectors: [], countries: [], years: [] });
  const [loading,       setLoading]       = useState(true);

  const fetchReports = useCallback(async ({ q = '', filters = {}, page = 1 } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q?.trim()) params.set('q', q.trim());
      if (page > 1)  params.set('page', String(page));
      (filters.region  || []).forEach(v => params.append('region',  v));
      (filters.sector  || []).forEach(v => params.append('sector',  v));
      (filters.country || []).forEach(v => params.append('country', v));
      (filters.year    || []).forEach(v => params.append('year',    v));

      const qs   = params.toString() ? `?${params}` : '';
      const data = await publicApiRequest(`/api/public/reports${qs}`);
      setReports(data.reports || []);
      setMeta(data.meta || null);
    } catch {
      // keep previous state on error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await publicApiRequest('/api/public/stats');
      setStats(data);
    } catch { /* keep zeros */ }
  }, []);

  const loadFilterOptions = useCallback(async () => {
    try {
      const data = await publicApiRequest('/api/public/filters');
      setFilterOptions(data);
    } catch { /* keep empty */ }
  }, []);

  return {
    reports, meta, stats, filterOptions,
    loading,
    fetchReports,
    fetchStats,
    loadFilterOptions,
  };
}
