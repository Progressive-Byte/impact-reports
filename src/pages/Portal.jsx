import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { reports, taxonomies } from '../data/mockData';

const Portal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('portalFilters');
    return saved ? JSON.parse(saved) : { region: [], sector: [], year: [], country: [] };
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('reportViewMode') || 'grid';
  });

  const [expandedGroups, setExpandedGroups] = useState({
    Regions: false,
    Countries: false,
    Sectors: false,
    Years: false
  });

  // Sync URL Params to State (Fix for Search Selection Failure)
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    const urlFilter = searchParams.get('filter');
    const urlType = searchParams.get('type');

    if (urlQuery && !urlType) {
      setSearchQuery(urlQuery);
    } else if (urlFilter && urlType) {
      handleFilterChange(urlType, urlFilter);
      // Open the corresponding accordion for visual feedback
      const groupName = urlType.charAt(0).toUpperCase() + urlType.slice(1) + 's';
      toggleGroup(groupName === 'Countrys' ? 'Countries' : groupName);
      // Clean up URL after applying
      searchParams.delete('filter');
      searchParams.delete('type');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('portalFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('reportViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanCountryName = (loc) => {
    if (loc.includes('(')) return loc.split('(')[0].trim();
    const indianStates = ['Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'West Bengal', 'Jharkhand', 'Odisha', 'Chhattisgarh', 'Punjab', 'Haryana', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Assam', 'Manipur', 'Meghalaya', 'Tripura', 'Nagaland', 'Sikkim', 'Arunachal Pradesh'];
    if (indianStates.includes(loc)) return 'India';
    if (loc === 'West Bank' || loc.includes('Gaza')) return 'Palestine';
    return loc;
  };

  const availableCountries = useMemo(() => {
    const all = reports.flatMap(r => r.countries.map(cleanCountryName));
    return [...new Set(all)].sort();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = searchQuery.trim().toLowerCase();
      if (query.length > 1) {
        const pool = [
          ...availableCountries.map(c => ({ label: c, type: 'country', icon: 'FiFlag' })),
          ...taxonomies.regions.map(r => ({ label: r, type: 'region', icon: 'FiGlobe' })),
          ...taxonomies.sectors.map(s => ({ label: s, type: 'sector', icon: 'FiBox' })),
          ...taxonomies.years.map(y => ({ label: y, type: 'year', icon: 'FiCalendar' }))
        ];

        const filtered = pool.filter(item => 
          item.label.toLowerCase().includes(query) && !filters[item.type].includes(item.label)
        ).slice(0, 8);

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery, availableCountries, filters]);

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const catKey = category.toLowerCase();
      const current = prev[catKey] || [];
      if (current.includes(value)) {
        return { ...prev, [catKey]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [catKey]: [...current, value] };
      }
    });
  };

  const toggleGroup = (title) => {
    setExpandedGroups(prev => {
      const isCurrentlyOpen = prev[title];
      const newState = { Regions: false, Countries: false, Sectors: false, Years: false };
      if (!isCurrentlyOpen) {
        newState[title] = true;
      }
      return newState;
    });
  };

  const setAllGroups = (state) => {
    setExpandedGroups({ Regions: state, Countries: state, Sectors: state, Years: state });
  };

  const clearFilters = () => {
    setFilters({ region: [], sector: [], year: [], country: [] });
    setSearchQuery('');
    setSearchParams({});
  };

  const globalMetrics = useMemo(() => {
    const totalLives = reports.reduce((acc, curr) => acc + curr.metrics.beneficiaries, 0);
    const totalProjects = reports.length;
    const uniqueRegions = new Set(reports.map(r => r.region)).size;
    return [
      { label: 'Countries Supported', value: (uniqueRegions * 4).toString() + '+', icon: 'FiGlobe', description: 'Active across 4 major regions' },
      { label: 'Projects Delivered', value: totalProjects.toLocaleString(), icon: 'FiCheckCircle', description: 'Verified field initiatives' },
      { label: 'Total Lives Impacted', value: totalLives.toLocaleString() + '+', icon: 'FiUsers', description: 'Individuals reached globally' },
    ];
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchRegion = filters.region.length === 0 || filters.region.includes(report.region);
      const matchSector = filters.sector.length === 0 || filters.sector.includes(report.sector);
      const matchYear = filters.year.length === 0 || filters.year.includes(report.year);
      const reportCleanCountries = report.countries.map(cleanCountryName);
      const matchCountry = filters.country.length === 0 || reportCleanCountries.some(c => filters.country.includes(c));
      const matchSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          report.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return matchRegion && matchSector && matchYear && matchCountry && matchSearch;
    });
  }, [filters, searchQuery]);

  const activeFilterCount = filters.region.length + filters.sector.length + filters.year.length + filters.country.length;

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <section className="relative overflow-hidden pt-32 sm:pt-36 pb-10 sm:pb-14">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FFF5F5] to-[#F9FAFB]" />
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[620px] h-[620px] bg-[#E52321]/10 rounded-full blur-[90px]" />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] bg-black/5 rounded-full blur-[90px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-[#E52321]/15 px-4 py-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#E52321]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0B0D0F]/70">Verified Transparency</span>
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-black text-[#0B0D0F] tracking-tight leading-[1.05] uppercase">
                Global Projects <br className="hidden sm:block" />
                <span className="text-[#E52321]">Impact Reports</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
                A comprehensive database of our global initiatives, ensuring every contribution is accounted for through verified field documentation.
              </p>
            </motion.div>

            <div className="lg:col-span-5">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_24px_60px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="space-y-4">
                    {globalMetrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/60 border border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                          <SafeIcon icon={metric.icon} className="text-[#E52321] text-lg" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">{metric.label}</p>
                          <p className="text-xl sm:text-2xl font-black text-[#0B0D0F] tracking-tight leading-none">{metric.value}</p>
                          <p className="mt-1 text-xs text-gray-500 truncate">{metric.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] p-4 sm:p-5">
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <div ref={searchContainerRef} className="flex-grow relative">
                <SafeIcon icon="FiSearch" className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by Country, Region, Sector, or Year"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 1 && setShowSuggestions(suggestions.length > 0)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-5 text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E52321]/10 focus:bg-white transition-all"
                />
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.14)] z-50 overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matched Filters</span>
                        <SafeIcon icon="FiFilter" className="text-gray-300 text-xs" />
                      </div>
                      <div className="py-2">
                        {suggestions.map((suggestion, idx) => (
                          <button key={idx} onClick={() => { handleFilterChange(suggestion.type, suggestion.label); setSearchQuery(''); setShowSuggestions(false); }} className="w-full px-5 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#E52321] flex items-center transition-all duration-200 group">
                            <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-[#E52321]/10 flex items-center justify-center mr-4 transition-colors">
                              <SafeIcon icon={suggestion.icon} className="text-gray-400 group-hover:text-[#E52321] text-sm" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{suggestion.type}</span>
                              <span className="truncate">{suggestion.label}</span>
                            </div>
                            <div className="ml-auto w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-[#E52321] group-hover:border-[#E52321]/30 transition-all">
                              <SafeIcon icon="FiPlus" className="text-sm" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1.5">
                <button onClick={() => setViewMode('grid')} className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-[#0B0D0F] shadow-sm' : 'text-gray-500 hover:text-black'}`} >
                  <SafeIcon icon="FiGrid" className="text-base" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button onClick={() => setViewMode('list')} className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-[#0B0D0F] shadow-sm' : 'text-gray-500 hover:text-black'}`} >
                  <SafeIcon icon="FiList" className="text-base" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden lg:sticky lg:top-28">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
                    <SafeIcon icon="FiSliders" className="text-[#E52321]" />
                  </div>
                  <h3 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">Filters</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setAllGroups(true)} className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Expand</button>
                  <button onClick={() => setAllGroups(false)} className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Collapse</button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <FilterGroup title="Regions" options={taxonomies.regions} selected={filters.region} isOpen={expandedGroups.Regions} onToggle={() => toggleGroup('Regions')} onOptionToggle={(val) => handleFilterChange('region', val)} />
                <FilterGroup title="Countries" options={availableCountries} selected={filters.country} isOpen={expandedGroups.Countries} onToggle={() => toggleGroup('Countries')} onOptionToggle={(val) => handleFilterChange('country', val)} />
                <FilterGroup title="Sectors" options={taxonomies.sectors} selected={filters.sector} isOpen={expandedGroups.Sectors} onToggle={() => toggleGroup('Sectors')} onOptionToggle={(val) => handleFilterChange('sector', val)} />
                <FilterGroup title="Years" options={taxonomies.years} selected={filters.year} isOpen={expandedGroups.Years} onToggle={() => toggleGroup('Years')} onOptionToggle={(val) => handleFilterChange('year', val)} />
              </div>

              {activeFilterCount > 0 && (
                <div className="p-6 pt-0">
                  <button onClick={clearFilters} className="w-full py-3 rounded-2xl bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#E52321]/15 transition-all">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          <div className="flex-grow">
            <motion.div layout className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" : "flex flex-col space-y-4"} >
              <AnimatePresence mode="popLayout">
                {filteredReports.map((report) => (
                  <motion.div layout key={report.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} >
                    {viewMode === 'grid' ? <ReportCard report={report} /> : <ReportListRow report={report} />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredReports.length === 0 && (
              <div className="text-center py-20 sm:py-28 bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
                <div className="w-16 h-16 bg-[#E52321]/10 border border-[#E52321]/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <SafeIcon icon="FiInbox" className="text-2xl text-[#E52321]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const FilterGroup = ({ title, options, selected, isOpen, onToggle, onOptionToggle }) => (
  <div className="rounded-2xl bg-gray-50/60 border border-gray-100 overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/70 transition-colors group" >
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[#E52321]" />
        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em] group-hover:text-[#0B0D0F] transition-colors">{title}</h4>
      </div>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#E52321] group-hover:border-[#E52321]/20 transition-all" >
        <SafeIcon icon="FiChevronDown" className="text-base" />
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: "easeInOut" }} className="overflow-hidden" >
          <div className="px-4 pb-4 text-left max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => onOptionToggle(option)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-[#E52321] text-white border-[#E52321] shadow-lg shadow-red-500/20'
                        : 'bg-white text-gray-700 border-gray-100 hover:border-[#E52321]/25 hover:text-[#E52321]'
                    }`}
                  >
                    <span className="max-w-[170px] truncate">{option}</span>
                    {isSelected && <SafeIcon icon="FiCheck" className="text-sm" />}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const ReportCard = ({ report }) => (
  <div className="group relative rounded-[2rem] overflow-hidden border border-gray-100 bg-[#0B0D0F] shadow-[0_18px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.14)] transition-all duration-500 text-left">
    <div className="absolute inset-0">
      <img src={report.image} alt={report.title} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
    </div>

    <div className="relative z-10 p-6 sm:p-7 min-h-[340px] flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E52321]" />
          {report.year}
        </span>
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
          <SafeIcon icon="FiMapPin" className="text-sm" />
          <span className="truncate max-w-[180px]">{report.region}</span>
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80">
          {report.sector}
        </span>
      </div>

      <div className="mt-auto pt-10">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug line-clamp-2">
          {report.title}
        </h3>
        <p className="mt-3 text-sm text-white/75 leading-relaxed line-clamp-2">
          {report.summary}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Impact</p>
            <p className="text-lg font-black text-white tracking-tight">{report.metrics.beneficiaries.toLocaleString()}</p>
          </div>
          <Link to={`/report/${report.id}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-[#E52321] border border-white/10 hover:border-[#E52321] text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all">
            <SafeIcon icon="FiArrowRight" className="text-base" />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const ReportListRow = ({ report }) => (
  <div className="group bg-white rounded-[2rem] p-4 sm:p-5 border border-gray-100 shadow-[0_12px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.08)] hover:border-[#E52321]/20 transition-all duration-300 text-left">
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="w-full sm:w-36 h-32 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
        <img src={report.image} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">{report.year}</span>
          <span className="px-3 py-1 rounded-full bg-[#E52321]/10 border border-[#E52321]/15 text-[10px] font-black uppercase tracking-widest text-[#E52321]">{report.sector}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 truncate">{report.region}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[#0B0D0F] tracking-tight truncate group-hover:text-[#E52321] transition-colors">{report.title}</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-1">{report.summary}</p>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="hidden md:block text-right min-w-[120px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impact</p>
          <p className="text-base font-black text-[#0B0D0F]">{report.metrics.beneficiaries.toLocaleString()}</p>
        </div>
        <Link to={`/report/${report.id}`} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D0F] hover:bg-[#E52321] text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all">
          Report <SafeIcon icon="FiArrowRight" className="text-base" />
        </Link>
      </div>
    </div>
  </div>
);

export default Portal;
