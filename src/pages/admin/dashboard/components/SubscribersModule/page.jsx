import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../common/SafeIcon';
import PageHeader from '../../common/PageHeader';
import Pagination from '@/common/Pagination';
import { adminApiRequest } from '../../../../../services/adminApi';

const SKELETON_ROWS = 20; // matches default limit; overridden at render time with meta?.limit

const SubscribersModule = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPage   = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
  const urlSearch = searchParams.get('q') || '';

  const [inputSearch, setInputSearch] = useState(urlSearch);
  const [subscribers, setSubscribers] = useState([]);
  const [meta,        setMeta]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [deletingId,  setDeletingId]  = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);

  // Debounce search input → URL
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (inputSearch) { next.set('q', inputSearch); next.delete('page'); }
      else             { next.delete('q'); next.delete('page'); }
      setSearchParams(next, { replace: true });
    }, 400);
    return () => clearTimeout(t);
  }, [inputSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next, { replace: true });
  };

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (urlPage > 1) params.set('page',  String(urlPage));
      if (urlSearch)   params.set('q',     urlSearch);
      params.set('limit', '20');
      const data = await adminApiRequest(`/api/subscribers?${params}`);
      setSubscribers(Array.isArray(data.items) ? data.items : []);
      setMeta(data.meta ?? null);
    } catch (err) {
      toast.error(err.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, [urlPage, urlSearch]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminApiRequest(`/api/subscribers/${id}`, { method: 'DELETE' });
      toast.success('Subscriber removed');
      setConfirmId(null);
      if (subscribers.length === 1 && urlPage > 1) handlePageChange(urlPage - 1);
      else fetchSubscribers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete subscriber');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="All Subscribers"
        subtitle="Email addresses collected via the public portal footer"
        action={
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <SafeIcon icon="FiUsers" className="text-sm" />
            {meta ? `${meta.total.toLocaleString()} subscriber${meta.total !== 1 ? 's' : ''}` : '—'}
          </div>
        }
      />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          {/* Search */}
          <div className="relative">
            <SafeIcon icon="FiSearch" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search by email…"
              value={inputSearch}
              onChange={e => setInputSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#E52321] transition-colors w-64 bg-gray-50 focus:bg-white"
            />
            {inputSearch && (
              <button
                onClick={() => setInputSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <SafeIcon icon="FiX" className="text-xs" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <SafeIcon icon="FiRefreshCw" className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-5 py-3.5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            ))
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <SafeIcon icon="FiMail" className="text-gray-400 text-xl" />
              </div>
              <p className="text-sm font-bold text-gray-400">
                {urlSearch ? `No subscribers matching "${urlSearch}"` : 'No subscribers yet'}
              </p>
              {urlSearch && (
                <button
                  onClick={() => setInputSearch('')}
                  className="mt-2 text-xs text-[#E52321] font-bold hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            subscribers.map((sub, idx) => (
              <div
                key={sub._id}
                className="grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group"
              >
                {/* Email */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#E52321]/8 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black text-[#E52321]">
                      {sub.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#0B0D0F] truncate">{sub.email}</span>
                  <span className="text-[9px] font-bold text-gray-300 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    #{String(idx + 1 + (urlPage - 1) * 20).padStart(3, '0')}
                  </span>
                </div>

                {/* Date */}
                <span className="text-sm text-gray-500 self-center">{formatDate(sub.createdAt)}</span>

                {/* Time */}
                <span className="text-sm text-gray-400 self-center">{formatTime(sub.createdAt)}</span>

                {/* Delete */}
                <div className="flex items-center justify-end">
                  {confirmId === sub._id ? (
                    <>
                      <button
                        onClick={() => handleDelete(sub._id)}
                        disabled={deletingId === sub._id}
                        className="text-[10px] font-black text-[#E52321] bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deletingId === sub._id
                          ? <span className="w-3 h-3 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin inline-block" />
                          : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-1"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmId(sub._id)}
                      title="Remove subscriber"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-[#E52321] hover:bg-red-50 border border-transparent hover:border-red-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <SafeIcon icon="FiTrash2" className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={handlePageChange} label="subscribers" />
      </div>
    </div>
  );
};

export default SubscribersModule;
