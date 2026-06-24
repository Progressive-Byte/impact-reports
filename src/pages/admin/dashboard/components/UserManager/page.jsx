import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../common/SafeIcon';
import PageHeader from '../../common/PageHeader';
import InviteModal from './components/InviteModal';
import EditUserModal from './components/EditUserModal';
import UserRow from './components/UserRow';
import UserSkeletonRow from './components/UserSkeletonRow';
import Pagination from '@/common/Pagination';
import UserToolbar from './components/UserToolbar';
import ActiveFilterPills from './components/ActiveFilterPills';
import BulkActionBar from './components/BulkActionBar';
import UserTableHeader from './components/UserTableHeader';
import { adminApiRequest } from '../../../../../services/adminApi';
import { useUserFilters } from './hooks/useUserFilters';

const SKELETON_ROWS = 5;

const UserManager = () => {
  const {
    urlSearch, urlStatus, urlPage,
    inputSearch, setInputSearch,
    isDebouncing,
    handleStatusChange, handlePageChange,
  } = useUserFilters();

  const [users,       setUsers]       = useState([]);
  const [meta,        setMeta]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(new Set());
  const [showInvite,  setShowInvite]  = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const prevFiltersRef = useRef({ search: urlSearch, status: urlStatus });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (urlPage > 1)         params.set('page',   String(urlPage));
      if (urlSearch)           params.set('q',      urlSearch);
      if (urlStatus !== 'all') params.set('status', urlStatus);

      const data = await adminApiRequest(`/api/admin/admins?${params}`);
      setUsers(Array.isArray(data.items) ? data.items : []);
      setMeta(data.meta ?? null);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [urlPage, urlSearch, urlStatus]);

  useEffect(() => {
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

  const handleDelete = (id) => {
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    if (users.length === 1 && urlPage > 1) handlePageChange(urlPage - 1);
    else fetchUsers();
  };

  return (
    <div className="space-y-5">
      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInviteSent={fetchUsers}
      />
      <EditUserModal
        user={editingUser}
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onUpdated={fetchUsers}
      />

      <PageHeader
        title="User Management"
        subtitle="Access control & IT operations"
        action={
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-[#E52321] hover:bg-[#c91d1b] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <SafeIcon icon="FiUserPlus" className="text-base" />
            Invite User
          </button>
        }
      />

      {/* Directory card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <UserToolbar
          inputSearch={inputSearch}
          setInputSearch={setInputSearch}
          isDebouncing={isDebouncing}
          urlSearch={urlSearch}
          urlStatus={urlStatus}
          meta={meta}
          loading={loading}
          onStatusChange={handleStatusChange}
          onRefresh={fetchUsers}
        />
        <ActiveFilterPills
          urlSearch={urlSearch}
          urlStatus={urlStatus}
          meta={meta}
          showSkeleton={showSkeleton}
          onClearSearch={() => setInputSearch('')}
          onClearStatus={() => handleStatusChange('all')}
        />
        <BulkActionBar selectedCount={selectedCount} />

        {/* Table — horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <UserTableHeader allSelected={allSelected} onToggleAll={toggleAll} />

            {/* Rows */}
            {showSkeleton ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: meta?.limit ?? SKELETON_ROWS }).map((_, i) => (
                  <UserSkeletonRow key={i} />
                ))}
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
                    onUpdate={fetchUsers}
                    onDelete={handleDelete}
                    onEdit={setEditingUser}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <Pagination meta={meta} onPageChange={handlePageChange} label="users" />
      </div>
    </div>
  );
};

export default UserManager;
