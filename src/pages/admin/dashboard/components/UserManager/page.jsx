import { useState } from 'react';
import SafeIcon from '../../../../../common/SafeIcon';
import CustomSelect from '../ReportsModule/reports/CustomSelect';
import Checkbox from '../../common/Checkbox';
import UserRow from './UserRow';
import InviteModal from './InviteModal';

const MOCK_USERS = [
  { _id: '1', username: 'admin.lead',      email: 'admin.lead@impact.org',      role: 'superadmin',       region: 'Global',         isActive: true,  lastLogin: '2024-01-15T08:30:00' },
  { _id: '2', username: 'field.staff1',    email: 'field.staff1@impact.org',    role: 'field_staff',      region: 'MENA',           isActive: true,  lastLogin: '2024-01-14T14:22:00' },
  { _id: '3', username: 'temp.contractor', email: 'temp.contractor@impact.org', role: 'field_staff',      region: 'Eastern Europe', isActive: false, lastLogin: '2023-12-01T09:11:00' },
  { _id: '4', username: 'reg.manager',     email: 'reg.manager@impact.org',     role: 'regional_manager', region: 'Asia Pacific',   isActive: true,  lastLogin: '2024-01-16T10:05:00' },
];

const COLS = [
  { label: 'Email',      className: 'flex-1' },
  { label: 'Region',     className: 'w-28 flex-shrink-0' },
  { label: 'Role',       className: 'w-44 flex-shrink-0' },
  { label: 'Status',     className: 'w-28 flex-shrink-0' },
  { label: 'Last Login', className: 'w-44 flex-shrink-0' },
  { label: 'Actions',    className: 'flex-shrink-0' },
];

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const UserManager = () => {
  const [selected, setSelected]         = useState(new Set());
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvite, setShowInvite]     = useState(false);

  const filtered = MOCK_USERS.filter(u => {
    const q = search.toLowerCase();
    const matchSearch =
      u.email.toLowerCase().includes(q) ||
      u.region.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive);
    return matchSearch && matchStatus;
  });

  const allSelected  = filtered.length > 0 && filtered.every(u => selected.has(u._id));
  const selectedCount = selected.size;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map(u => u._id)));

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-5">
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} />

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
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Directory header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <SafeIcon icon="FiUsers" className="text-gray-400 text-base" />
            <h3 className="text-sm font-black text-[#0B0D0F]">Directory</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SafeIcon icon="FiSearch" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search email or region..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] bg-white w-56"
              />
            </div>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              className="w-36"
            />
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
          <span className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
          <span className="w-28 flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</span>
          <span className="w-44 flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</span>
          <span className="w-28 flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
          <span className="w-44 flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Login</span>
          <span className="flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-gray-400">No users found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(u => (
              <UserRow
                key={u._id}
                user={u}
                isSelected={selected.has(u._id)}
                onToggleSelect={() => toggleOne(u._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
