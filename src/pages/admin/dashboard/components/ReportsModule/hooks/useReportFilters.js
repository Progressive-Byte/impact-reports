import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useReportFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const urlStatus = searchParams.get('status') || 'all';
  const urlSort   = searchParams.get('sort')   || 'recent';
  const urlPage   = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [inputSearch,  setInputSearch]  = useState(urlSearch);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce: write input → URL after 400 ms, reset to page 1
  useEffect(() => {
    if (inputSearch === urlSearch) { setIsDebouncing(false); return; }
    setIsDebouncing(true);
    const t = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (inputSearch) next.set('search', inputSearch);
        else             next.delete('search');
        next.delete('page');
        return next;
      }, { replace: true });
      setIsDebouncing(false);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSearch]);

  // Sync input when URL changes externally (browser back/forward)
  useEffect(() => {
    setInputSearch(urlSearch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);

  const handleStatusChange = (val) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val === 'all') next.delete('status');
      else               next.set('status', val);
      next.delete('page');
      return next;
    }, { replace: true });
  };

  const handleSortChange = (val) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val === 'recent') next.delete('sort');
      else                  next.set('sort', val);
      next.delete('page');
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
  };

  return {
    urlSearch, urlStatus, urlSort, urlPage,
    inputSearch, setInputSearch,
    isDebouncing,
    handleStatusChange, handleSortChange, handlePageChange,
  };
}
