import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import SafeIcon from '../../../common/SafeIcon';
import { usePublicReports } from '../../../hooks/usePublicReports';
import { usePortalFilters } from '../../../hooks/usePortalFilters';
import { publicApiRequest } from '../../../services/publicApi';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import Pagination from '../../admin/dashboard/common/Pagination';
import FilterGroup from './components/FilterGroup';
import ReportCard from './components/ReportCard';
import ReportListRow from './components/ReportListRow';

const GROUPS = { Countries: false, Regions: false, Sectors: false, Years: false };

const Portal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useLocalStorage('reportViewMode', 'grid');

  const {
    urlSearch, urlPage, filters,
    inputSearch, setInputSearch,
    handleFilterToggle, handlePageChange, clearFilters,
    activeFilterCount, activeFilterChips,
  } = usePortalFilters();

  const [suggestions,     setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const [expandedGroups, setExpandedGroups] = useState(GROUPS);

  const {
    reports, meta, stats, filterOptions,
    loading,
    fetchReports, fetchStats, loadFilterOptions,
  } = usePublicReports();

  // Load stats and filter options once on mount
  useEffect(() => {
    fetchStats();
    loadFilterOptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch reports whenever URL params change (search, filters, page all live in URL)
  useEffect(() => {
    fetchReports({ q: urlSearch, filters, page: urlPage });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Handle SearchModal redirect: ?filter=value&type=category → proper URL params
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    const urlType   = searchParams.get('type');
    if (!urlFilter || !urlType) return;

    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('filter');
      next.delete('type');
      next.delete('page');
      const key     = urlType.toLowerCase();
      const current = next.getAll(key);
      if (!current.includes(urlFilter)) next.append(key, urlFilter);
      return next;
    }, { replace: true });

    const groupMap = { region: 'Regions', country: 'Countries', sector: 'Sectors', year: 'Years' };
    const groupName = groupMap[urlType.toLowerCase()];
    if (groupName) setExpandedGroups(prev => ({ ...GROUPS, [groupName]: true }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Lock body scroll when mobile filter sheet is open
  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileFilterOpen]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const query = inputSearch.trim();
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const data = await publicApiRequest(`/api/public/search?q=${encodeURIComponent(query)}`);
        if (!cancelled) {
          const filtered = (data.results || []).filter(
            item => !(filters[item.type] || []).includes(item.label)
          );
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      } catch { /* ignore */ }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSearch, searchParams.toString()]);

  const toggleGroup = (title) => {
    setExpandedGroups(prev => {
      const isOpen = prev[title];
      return isOpen ? GROUPS : { ...GROUPS, [title]: true };
    });
  };

  const globalMetrics = useMemo(() => [
    {
      label: 'Countries Supported',
      value: stats.totalCountries > 0 ? `${stats.totalCountries}+` : '—',
      icon: 'FiGlobe',
      description: 'Active across major regions',
    },
    {
      label: 'Projects Delivered',
      value: stats.totalProjects > 0 ? stats.totalProjects.toLocaleString() : '—',
      icon: 'FiCheckCircle',
      description: 'Verified field initiatives',
    },
    {
      label: 'Total Lives Impacted',
      value: stats.totalLives > 0 ? `${stats.totalLives.toLocaleString()}+` : '—',
      icon: 'FiUsers',
      description: 'Individuals reached globally',
    },
  ], [stats]);

  const expandAllGroups   = () => setExpandedGroups({ Countries: true, Regions: true, Sectors: true, Years: true });
  const collapseAllGroups = () => setExpandedGroups(GROUPS);

  const totalResults = meta?.total ?? reports.length;

  const filterSidebar = (
    <>
      <FilterGroup title="Countries" options={filterOptions.countries} selected={filters.country} isOpen={expandedGroups.Countries} onToggle={() => toggleGroup('Countries')} onOptionToggle={(v) => handleFilterToggle('country', v)} />
      <FilterGroup title="Regions"   options={filterOptions.regions}   selected={filters.region}  isOpen={expandedGroups.Regions}   onToggle={() => toggleGroup('Regions')}   onOptionToggle={(v) => handleFilterToggle('region',  v)} />
      <FilterGroup title="Sectors"   options={filterOptions.sectors}   selected={filters.sector}  isOpen={expandedGroups.Sectors}   onToggle={() => toggleGroup('Sectors')}   onOptionToggle={(v) => handleFilterToggle('sector',  v)} />
      <FilterGroup title="Years"     options={filterOptions.years}     selected={filters.year}    isOpen={expandedGroups.Years}     onToggle={() => toggleGroup('Years')}     onOptionToggle={(v) => handleFilterToggle('year',    v)} />
    </>
  );

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Hero */}
      <section className="bg-[#0B0D0F] pt-40 pb-28 md:pt-48 md:pb-44 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2000"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D0F] via-transparent to-[#0B0D0F]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <span className="inline-block bg-[#E52321]/10 text-[#E52321] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.25em] uppercase mb-6 border border-[#E52321]/20">
              Verified Transparency
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-[1.1] sm:leading-[0.9] uppercase">
              Global Projects <br className="hidden sm:block" />
              <span className="text-[#E52321]">Impact Reports</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
              A comprehensive database of our global initiatives, ensuring every contribution is
              accounted for through verified field documentation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Metrics strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {globalMetrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2rem] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center group transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0B0D0F] rounded-2xl flex items-center justify-center mr-4 sm:mr-6 group-hover:bg-[#E52321] transition-colors duration-500 shadow-lg shadow-black/10 group-hover:shadow-red-500/20 flex-shrink-0">
                <SafeIcon icon={metric.icon} className="text-white text-lg sm:text-2xl" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{metric.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-black tracking-tighter leading-none mb-1">{metric.value}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search + filter + results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        {/* Search bar */}
        <div ref={searchContainerRef} className="w-full relative group mb-8 sm:mb-10">
          <SafeIcon icon="FiSearch" className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-[#E52321] transition-colors" />
          <input
            type="text"
            placeholder="Search by Country, Region, Sector, or Year"
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            onFocus={() => inputSearch.length > 1 && setShowSuggestions(suggestions.length > 0)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 sm:py-5 pl-12 sm:pl-14 pr-5 sm:pr-6 text-sm font-medium shadow-xl shadow-black/5 focus:ring-2 focus:ring-[#E52321]/10 transition-all outline-none"
          />
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[1.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] z-50 overflow-hidden py-3"
              >
                <div className="px-5 sm:px-6 py-2 mb-1 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matched Filters</span>
                  <SafeIcon icon="FiFilter" className="text-gray-300 text-xs" />
                </div>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (s.type === 'report') {
                        window.location.href = `/report/${s.id}`;
                      } else {
                        handleFilterToggle(s.type, s.label);
                      }
                      setInputSearch('');
                      setShowSuggestions(false);
                    }}
                    className="w-full px-5 sm:px-6 py-3 sm:py-4 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#E52321] flex items-center transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-[#E52321]/10 flex items-center justify-center mr-4 transition-colors flex-shrink-0">
                      <SafeIcon icon={s.icon} className="text-gray-400 group-hover:text-[#E52321] text-xs" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{s.type}</span>
                      <span className="truncate">{s.label}</span>
                    </div>
                    <SafeIcon icon="FiPlus" className="ml-auto flex-shrink-0 text-gray-200 group-hover:text-[#E52321] opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile filter trigger row */}
        <div className="flex lg:hidden items-center gap-3 mb-8 overflow-hidden">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm hover:border-[#E52321]/20 hover:shadow-md transition-all duration-300 flex-shrink-0"
          >
            <div className="w-7 h-7 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
              <SafeIcon icon="FiSliders" className="text-[#E52321] text-sm" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0B0D0F]">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#E52321] text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-black leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {activeFilterChips.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 rounded-full px-3 py-1.5 text-[10px] font-black whitespace-nowrap flex-shrink-0"
                >
                  {f}
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-[10px] font-black text-gray-400 hover:text-[#E52321] whitespace-nowrap flex-shrink-0 ml-1 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden sticky top-28">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
                    <SafeIcon icon="FiSliders" className="text-[#E52321]" />
                  </div>
                  <h3 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">Filters</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={expandAllGroups}   className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Expand</button>
                  <button onClick={collapseAllGroups} className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Collapse</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {filterSidebar}
              </div>
              {activeFilterCount > 0 && (
                <div className="px-6 pb-6">
                  <button
                    onClick={clearFilters}
                    className="w-full py-3 rounded-2xl bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#E52321]/15 transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Results</p>
                <p className="text-sm font-black text-[#0B0D0F] tabular-nums">
                  {loading ? '…' : `${totalResults.toLocaleString()} report${totalResults === 1 ? '' : 's'}`}
                </p>
              </div>
              <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                {['grid', 'list'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                      viewMode === mode ? 'bg-[#0B0D0F] text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <SafeIcon icon={mode === 'grid' ? 'FiGrid' : 'FiList'} className="text-base" />
                    <span className="hidden sm:inline capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <motion.div
                layout
                className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6' : 'flex flex-col space-y-4'}
              >
                <AnimatePresence mode="popLayout">
                  {reports.map((report) => (
                    <motion.div
                      layout
                      key={report.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      {viewMode === 'grid' ? <ReportCard report={report} /> : <ReportListRow report={report} />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {!loading && reports.length === 0 && (
                <div className="text-center py-20 sm:py-28 bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
                  <div className="w-16 h-16 bg-[#E52321]/10 border border-[#E52321]/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <SafeIcon icon="FiInbox" className="text-2xl text-[#E52321]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="mt-8 bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <Pagination meta={meta} onPageChange={handlePageChange} label="reports" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter bottom sheet */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-[70] lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[80] lg:hidden bg-white rounded-t-[2rem] max-h-[88vh] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.15)]"
            >
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-gray-200" />
              </div>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
                    <SafeIcon icon="FiSliders" className="text-[#E52321]" />
                  </div>
                  <h3 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">Filters</h3>
                  {activeFilterCount > 0 && (
                    <span className="bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 rounded-full px-2.5 py-1 text-[10px] font-black leading-none">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={expandAllGroups}   className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Expand</button>
                  <button onClick={collapseAllGroups} className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Collapse</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {filterSidebar}
              </div>
              <div className="p-5 border-t border-gray-100 flex-shrink-0">
                <div className={`grid gap-3 ${activeFilterCount > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="py-4 rounded-2xl bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#E52321]/15 active:scale-95 transition-all"
                    >
                      Clear filters
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="py-4 rounded-2xl bg-[#0B0D0F] text-white font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#E52321] active:scale-95 transition-all"
                  >
                    Show {totalResults} result{totalResults === 1 ? '' : 's'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portal;
