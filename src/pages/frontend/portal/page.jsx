import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePublicReports } from '../../../hooks/usePublicReports';
import { usePortalFilters } from '../../../hooks/usePortalFilters';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { publicApiRequest } from '../../../services/publicApi';
import FilterGroup from './components/FilterGroup';
import PortalHero from './components/PortalHero';
import MetricsStrip from './components/MetricsStrip';
import SearchBar from './components/SearchBar';
import MobileFilterBar from './components/MobileFilterBar';
import FilterSidebar from './components/FilterSidebar';
import MobileFilterSheet from './components/MobileFilterSheet';
import ResultsToolbar from './components/ResultsToolbar';
import ReportResults from './components/ReportResults';

const ALL_CLOSED = { Countries: false, Regions: false, Sectors: false, Years: false };

const Portal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useLocalStorage('reportViewMode', 'grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(ALL_CLOSED);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const resultsSectionRef = useRef(null);
  const prevPageRef       = useRef(urlPage);

  const {
    urlSearch, urlPage, filters,
    inputSearch, setInputSearch,
    handleFilterToggle, handlePageChange, clearFilters,
    activeFilterCount, activeFilterChips,
  } = usePortalFilters();

  const {
    reports, meta, stats, filterOptions,
    loading, fetchReports, fetchStats, loadFilterOptions,
  } = usePublicReports();

  // Load stats and filter options once on mount
  useEffect(() => {
    fetchStats();
    loadFilterOptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch reports whenever URL params change
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
      const key = urlType.toLowerCase();
      if (!next.getAll(key).includes(urlFilter)) next.append(key, urlFilter);
      return next;
    }, { replace: true });

    const groupMap = { region: 'Regions', country: 'Countries', sector: 'Sectors', year: 'Years' };
    const groupName = groupMap[urlType.toLowerCase()];
    if (groupName) setExpandedGroups(prev => ({ ...ALL_CLOSED, [groupName]: true }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  const toggleGroup    = (title) => setExpandedGroups(prev => prev[title] ? ALL_CLOSED : { ...ALL_CLOSED, [title]: true });
  const expandAll      = () => setExpandedGroups({ Countries: true, Regions: true, Sectors: true, Years: true });
  const collapseAll    = () => setExpandedGroups(ALL_CLOSED);
  const totalResults   = meta?.total ?? reports.length;

  const handleSuggestionSelect = (s) => {
    if (!s) return;
    if (s.type === 'report') {
      window.location.href = `/report/${s.id}`;
    } else {
      handleFilterToggle(s.type, s.label);
    }
    setInputSearch('');
    setShowSuggestions(false);
  };

  const filterGroups = (
    <>
      <FilterGroup title="Countries" options={filterOptions.countries} selected={filters.country} isOpen={expandedGroups.Countries} onToggle={() => toggleGroup('Countries')} onOptionToggle={(v) => handleFilterToggle('country', v)} />
      <FilterGroup title="Regions"   options={filterOptions.regions}   selected={filters.region}  isOpen={expandedGroups.Regions}   onToggle={() => toggleGroup('Regions')}   onOptionToggle={(v) => handleFilterToggle('region',  v)} />
      <FilterGroup title="Sectors"   options={filterOptions.sectors}   selected={filters.sector}  isOpen={expandedGroups.Sectors}   onToggle={() => toggleGroup('Sectors')}   onOptionToggle={(v) => handleFilterToggle('sector',  v)} />
      <FilterGroup title="Years"     options={filterOptions.years}     selected={filters.year}    isOpen={expandedGroups.Years}     onToggle={() => toggleGroup('Years')}     onOptionToggle={(v) => handleFilterToggle('year',    v)} />
    </>
  );

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <PortalHero />

      <MetricsStrip stats={stats} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <SearchBar
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          onDismiss={() => setShowSuggestions(false)}
          onSuggestionSelect={handleSuggestionSelect}
        />

        <MobileFilterBar
          activeFilterCount={activeFilterCount}
          activeFilterChips={activeFilterChips}
          onOpen={() => setIsMobileFilterOpen(true)}
          onClearFilters={clearFilters}
        />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <FilterSidebar
            activeFilterCount={activeFilterCount}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onClearFilters={clearFilters}
          >
            {filterGroups}
          </FilterSidebar>

          <div className="flex-grow min-w-0">
            <ResultsToolbar
              loading={loading}
              totalResults={totalResults}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <ReportResults
              reports={reports}
              loading={loading}
              viewMode={viewMode}
              meta={meta}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </section>

      <MobileFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        activeFilterCount={activeFilterCount}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onClearFilters={clearFilters}
        totalResults={totalResults}
      >
        {filterGroups}
      </MobileFilterSheet>
    </div>
  );
};

export default Portal;
