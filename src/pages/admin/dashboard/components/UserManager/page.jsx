import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../common/SafeIcon';
import CustomSelect from '../ReportsModule/reports/CustomSelect';
import Checkbox from '../../common/Checkbox';
import InviteModal from './components/InviteModal';
import EditUserModal from './components/EditUserModal';
import UserRow from './components/UserRow';
import Pagination from './components/Pagination';
import { adminApiRequest } from '../../../../../services/adminApi';

const COLS = [
  { label: 'Email / User', className: 'flex-1' },
  { label: 'Region',       className: 'w-28 flex-shrink-0' },
  { label: 'Role',         className: 'w-44 flex-shrink-0' },
  { label: 'Status',       className: 'w-28 flex-shrink-0' },
  { label: 'Last Login',   className: 'w-44 flex-shrink-0' },
  { label: 'Actions',      className: 'flex-shrink-0' },
];

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const SKELETON_ROWS = 5; // fallback count while meta hasn't loaded yet

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
    <div className="w-5 flex-shrink-0"><div className="w-4 h-4 bg-gray-100 rounded" /></div>
    <div className="flex-1 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 bg-gray-100 rounded w-48" />
        <div className="h-2.5 bg-gray-100 rounded w-28" />
      </div>
    </div>
    <div className="w-28 flex-shrink-0"><div className="h-3 bg-gray-100 rounded w-16" /></div>
    <div className="w-44 flex-shrink-0"><div className="h-8 bg-gray-100 rounded-xl w-32" /></div>
    <div className="w-28 flex-shrink-0"><div className="h-6 bg-gray-100 rounded-full w-20" /></div>
    <div className="w-44 flex-shrink-0"><div className="h-3 bg-gray-100 rounded w-28" /></div>
    <div className="flex-shrink-0 flex gap-2">
      <div className="h-7 w-12 bg-gray-100 rounded-xl" />
      <div className="h-7 w-16 bg-gray-100 rounded-xl" />
      <div className="h-7 w-20 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

const UserManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven filter state
  const urlSearch = searchParams.get('search') || '';
  const urlStatus = searchParams.get('status') || 'all';
  const urlPage   = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Local input for debounce
  const [inputSearch,  setInputSearch]  = useState(urlSearch);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const [users,       setUsers]       = useState([]);
  const [meta,        setMeta]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(new Set());
  const [showInvite,  setShowInvite]  = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Track previous search/status to detect changes that should reset page
  const prevFiltersRef = useRef({ search: urlSearch, status: urlStatus });

  // ── Debounce: write search input → URL after 400 ms ──────────────
  useEffect(() => {
    if (inputSearch === urlSearch) { setIsDebouncing(false); return; }
    setIsDebouncing(true);
    const t = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (inputSearch) next.set('search', inputSearch);
        else             next.delete('search');
        next.delete('page'); // reset to page 1 on new search
        return next;
      }, { replace: true });
      setIsDebouncing(false);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSearch]);

  // Sync input box when URL changes externally (browser back)
  useEffect(() => {
    setInputSearch(urlSearch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);

  // Status filter → immediate URL update, reset to page 1
  const handleStatusChange = (val) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val === 'all') next.delete('status');
      else               next.set('status', val);
      next.delete('page');
      return next;
    }, { replace: true });
  };

  // Page change
  const handlePageChange = (page) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (page <= 1) next.delete('page');
      else           next.set('page', String(page));
      return next;
    }, { replace: true });
  };

  // ── Fetch users from server (with search, status, page, limit) ────
  const fetchUsers = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const page   = opts.page   ?? urlPage;
      const search = opts.search ?? urlSearch;
      const status = opts.status ?? urlStatus;

      if (page > 1)          params.set('page',   String(page));
      if (search)            params.set('q',      search);
      if (status !== 'all')  params.set('status', status);

      const data = await adminApiRequest(`/api/admin/admins?${params}`);
      setUsers(Array.isArray(data.items) ? data.items : []);
      setMeta(data.meta ?? null);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPage, urlSearch, urlStatus]);

  // Re-fetch whenever URL params change
  useEffect(() => {
    // If filters changed, reset selected
    const prev = prevFiltersRef.current;
    if (prev.search !== urlSearch || prev.status !== urlStatus) {
      setSelected(new Set());
      prevFiltersRef.current = { search: urlSearch, status: urlStatus };
    }
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPage, urlSearch, urlStatus]);

  const showSkeleton  = loading || isDebouncing;
  const allSelected   = users.length > 0 && users.every(u => selected.has(u._id));
  const selectedCount = selected.size;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(users.map(u => u._id)));

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleUpdate = (updated) =>
    setUsers(prev => prev.map(u => u._id === updated._id ? { ...u, ...updated } : u));

  const handleDelete = (id) => {
    setUsers(prev => prev.filter(u => u._id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    // If last row on page > 1, go back one page
    if (users.length === 1 && urlPage > 1) {
      handlePageChange(urlPage - 1);
    } else {
      fetchUsers();
    }
  };

  return (
    <div className="space-y-5">
      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInviteSent={() => fetchUsers()}
      />
      <EditUserModal
        user={editingUser}
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onUpdated={handleUpdate}
      />

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">User Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">Access control &amp; IT operations</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-[#E52321] hover:bg-[#c91d1b] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
        >
          <SafeIcon icon="FiUserPlus" className="text-base" />
          Invite User
        </button>
      </div>

      {/* Directory card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">

        {/* Directory header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <SafeIcon icon="FiUsers" className="text-gray-400 text-base" />
            <h3 className="text-sm font-black text-[#0B0D0F]">
              Directory
              {!loading && meta && (
                <span className="ml-2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {meta.total}
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Search — debounced URL write */}
            <div className="relative">
              <SafeIcon
                icon={isDebouncing ? 'FiLoader' : 'FiSearch'}
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
                  isDebouncing ? 'text-[#E52321] animate-spin' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search email, user or region…"
                value={inputSearch}
                onChange={e => setInputSearch(e.target.value)}
                autoComplete="off"
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] bg-white w-60 transition-colors"
              />
              {urlSearch && !isDebouncing && (
                <button
                  onClick={() => setInputSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  title="Clear search"
                >
                  <SafeIcon icon="FiX" className="text-sm" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <CustomSelect
              value={urlStatus}
              onChange={handleStatusChange}
              options={STATUS_OPTIONS}
              className="w-36"
            />

            <button
              onClick={() => fetchUsers()}
              disabled={loading}
              className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#0B0D0F] hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="Refresh"
            >
              <SafeIcon icon="FiRefreshCw" className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        {(urlSearch || urlStatus !== 'all') && !showSkeleton && (
          <div className="flex items-center gap-2 px-6 py-2.5 border-b border-gray-100 bg-gray-50/60">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filters:</span>
            {urlSearch && (
              <span className="flex items-center gap-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 px-3 py-1 rounded-full">
                <SafeIcon icon="FiSearch" className="text-[10px] text-gray-400" />
                &quot;{urlSearch}&quot;
                <button onClick={() => setInputSearch('')} className="text-gray-300 hover:text-gray-500 ml-0.5">
                  <SafeIcon icon="FiX" className="text-[10px]" />
                </button>
              </span>
            )}
            {urlStatus !== 'all' && (
              <span className="flex items-center gap-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 px-3 py-1 rounded-full capitalize">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urlStatus === 'active' ? 'bg-green-500' : 'bg-red-400'}`} />
                {urlStatus}
                <button onClick={() => handleStatusChange('all')} className="text-gray-300 hover:text-gray-500 ml-0.5">
                  <SafeIcon icon="FiX" className="text-[10px]" />
                </button>
              </span>
            )}
            {meta && (
              <span className="text-[11px] text-gray-400 ml-auto">
                {meta.total} result{meta.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Bulk action bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/40">
          <p className="text-sm font-medium text-gray-500">
            Selected:{' '}
            <span className={`font-black ${selectedCount > 0 ? 'text-[#E52321]' : 'text-gray-700'}`}>
              {selectedCount}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={selectedCount === 0}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Reset Passwords
            </button>
            <button
              disabled={selectedCount === 0}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                selectedCount > 0
                  ? 'border-red-200 text-[#E52321] hover:bg-red-50'
                  : 'border-gray-200 text-gray-400'
              }`}
            >
              Deactivate Selected
            </button>
          </div>
        </div>

        {/* Table header */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
          <div className="w-5 flex-shrink-0">
            <Checkbox checked={allSelected} onChange={toggleAll} />
          </div>
          {COLS.map(({ label, className }) => (
            <span key={label} className={`${className} text-[10px] font-black text-gray-400 uppercase tracking-widest`}>
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {showSkeleton ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: meta?.limit ?? SKELETON_ROWS }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : users.length === 0 ? (
          <div className="py-14 text-center">
            <SafeIcon icon={urlSearch ? 'FiSearch' : 'FiUsers'} className="text-gray-200 text-3xl mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {urlSearch
                ? `No results for "${urlSearch}"`
                : meta?.total === 0
                  ? 'No users yet. Invite someone to get started.'
                  : 'No users match your filters.'}
            </p>
            {(urlSearch || urlStatus !== 'all') && (
              <button
                onClick={() => { setInputSearch(''); handleStatusChange('all'); }}
                className="mt-3 text-sm font-bold text-[#E52321] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map(u => (
              <UserRow
                key={u._id}
                user={u}
                isSelected={selected.has(u._id)}
                onToggleSelect={() => toggleOne(u._id)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onEdit={setEditingUser}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default UserManager;
