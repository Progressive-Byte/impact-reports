import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function usePortalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get('q')    || '';
  const urlPage   = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const filters = {
    country: searchParams.getAll('country'),
    region:  searchParams.getAll('region'),
    sector:  searchParams.getAll('sector'),
    year:    searchParams.getAll('year'),
  };

  const [inputSearch,  setInputSearch]  = useState(urlSearch);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce: write search input → URL after 400ms
  useEffect(() => {
    if (inputSearch === urlSearch) { setIsDebouncing(false); return; }
    setIsDebouncing(true);
    const t = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (inputSearch.trim()) next.set('q', inputSearch.trim());
        else                    next.delete('q');
        next.delete('page');
        return next;
      }, { replace: true });
      setIsDebouncing(false);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSearch]);

  // Sync input box when URL changes externally (browser back / SearchModal redirect)
  useEffect(() => {
    setInputSearch(urlSearch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);

  const handleFilterToggle = (category, value) => {
    setSearchParams(prev => {
      const next    = new URLSearchParams(prev);
      const key     = category.toLowerCase();
      const current = next.getAll(key);
      next.delete(key);
      next.delete('page');
      if (current.includes(value)) {
        current.filter(v => v !== value).forEach(v => next.append(key, v));
      } else {
        [...current, value].forEach(v => next.append(key, v));
      }
      return next;
    }, { replace: true });
  };

  const handlePageChange = (page) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (page <= 1) next.delete('page');
      else           next.set('page', String(page));
      return next;
    }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setInputSearch('');
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount =
    filters.country.length + filters.region.length +
    filters.sector.length  + filters.year.length;

  const activeFilterChips = [
    ...filters.country, ...filters.region,
    ...filters.sector,  ...filters.year,
  ];

  return {
    searchParams,
    urlSearch, urlPage, filters,
    inputSearch, setInputSearch, isDebouncing,
    handleFilterToggle, handlePageChange, clearFilters,
    activeFilterCount, activeFilterChips,
  };
}
