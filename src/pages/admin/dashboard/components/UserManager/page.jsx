import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../common/SafeIcon';
import CustomSelect from '../ReportsModule/reports/CustomSelect';
import Checkbox from '../../common/Checkbox';
import InviteModal from './components/InviteModal';
import EditUserModal from './components/EditUserModal';
import UserRow from './components/UserRow';
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

// ── Skeleton row ──────────────────────────────────────────────────
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
      <div className="h-7 w-16 bg-gray-100 rounded-xl" />
      <div className="h-7 w-20 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

const UserManager = () => {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(new Set());
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvite,   setShowInvite]   = useState(false);
  const [editingUser,  setEditingUser]  = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApiRequest('/api/admin/admins');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch =
      (u.email    || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.region   || '').toLowerCase().includes(q);
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active'   &&  u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive);
    return matchSearch && matchStatus;
  });

  const allSelected   = filtered.length > 0 && filtered.every(u => selected.has(u._id));
  const selectedCount = selected.size;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map(u => u._id)));

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
              {!loading && (
                <span className="ml-2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {users.length}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SafeIcon icon="FiSearch" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search email, user or region…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] bg-white w-60"
              />
            </div>
            <CustomSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} className="w-36" />
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#0B0D0F] hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="Refresh"
            >
              <SafeIcon icon="FiRefreshCw" className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

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
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <SafeIcon icon="FiUsers" className="text-gray-200 text-3xl mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {users.length === 0 ? 'No users yet. Invite someone to get started.' : 'No users match your filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(u => (
              <UserRow
                key={u._id}
                user={u}
                isSelected={selected.has(u._id)}
                onToggleSelect={() => toggleOne(u._id)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
