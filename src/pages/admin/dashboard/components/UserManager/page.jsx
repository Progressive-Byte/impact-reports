import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';
import SafeIcon from '../../../../../common/SafeIcon';
import CustomSelect from '../ReportsModule/reports/CustomSelect';
import UserRow from './UserRow';

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const COLS = ['EMAIL', 'REGION', 'ROLE', 'STATUS', 'LAST LOGIN', 'ACTIONS'];

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white transition-all';

const UserManager = () => {
  const { admin: currentAdmin, getToken } = useAdminAuth();
  const [admins, setAdmins]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(new Set());
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvite, setShowInvite]     = useState(false);
  const [inviteForm, setInviteForm]     = useState({ username: '', email: '', password: '', role: 'admin' });
  const [inviteError, setInviteError]   = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [toast, setToast]               = useState(null);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/admins', { headers: authHeaders() });
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const filtered = admins.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.email?.toLowerCase().includes(q) || a.username?.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && a.isActive) ||
      (statusFilter === 'inactive' && !a.isActive);
    return matchSearch && matchStatus;
  });

  const allSelected  = filtered.length > 0 && filtered.every(a => selected.has(a._id));
  const selectedCount = selected.size;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map(a => a._id)));

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await fetch(`/api/admin/admins/${id}/toggle`, { method: 'PATCH', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins(p => p.map(a => a._id === id ? data : a));
      showToast(`User ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins(p => p.filter(a => a._id !== id));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      showToast('User revoked');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins(p => p.map(a => a._id === id ? { ...a, role } : a));
      showToast('Role updated');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeactivateSelected = async () => {
    for (const id of [...selected]) {
      const a = admins.find(x => x._id === id);
      if (a?.isActive) await handleToggleActive(id);
    }
    setSelected(new Set());
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins(p => [data, ...p]);
      setInviteForm({ username: '', email: '', password: '', role: 'admin' });
      setShowInvite(false);
      showToast('User invited successfully');
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const isSuperAdmin = currentAdmin?.role === 'superadmin';

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold ${
              toast.type === 'error'
                ? 'bg-red-50 border border-red-100 text-red-700'
                : 'bg-green-50 border border-green-100 text-green-700'
            }`}
          >
            <SafeIcon icon={toast.type === 'error' ? 'FiAlertCircle' : 'FiCheckCircle'} className="text-base" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">User Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">Access control &amp; IT operations</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => { setShowInvite(p => !p); setInviteError(''); }}
            className="flex items-center gap-2 bg-[#E52321] hover:bg-[#c91d1b] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <SafeIcon icon="FiUserPlus" className="text-base" />
            Invite User
          </button>
        )}
      </div>

      {/* Invite form */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Invite New User</p>
              {inviteError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-700 font-bold">
                  <SafeIcon icon="FiAlertCircle" className="text-base flex-shrink-0" />
                  {inviteError}
                </div>
              )}
              <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'username', label: 'Username',  type: 'text' },
                  { key: 'email',    label: 'Email',     type: 'email' },
                  { key: 'password', label: 'Password',  type: 'password' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input
                      type={type}
                      required
                      placeholder={label}
                      value={inviteForm[key]}
                      onChange={e => setInviteForm(p => ({ ...p, [key]: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <CustomSelect
                    value={inviteForm.role}
                    onChange={val => setInviteForm(p => ({ ...p, role: val }))}
                    options={[
                      { value: 'admin',      label: 'Admin' },
                      { value: 'superadmin', label: 'Superadmin' },
                    ]}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInvite(false)}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex items-center gap-2 bg-[#E52321] hover:bg-[#c91d1b] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    {inviteLoading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <SafeIcon icon="FiUserPlus" className="text-base" />
                    }
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              onClick={handleDeactivateSelected}
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
          <div className="w-5 flex-shrink-0 flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-gray-300 accent-[#E52321] cursor-pointer"
            />
          </div>
          <span className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
          <span className="w-28 flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</span>
          <span className="w-44 flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</span>
          <span className="w-28 flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
          <span className="w-44 flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Login</span>
          <span className="flex-shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-gray-400">No users found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(a => (
              <UserRow
                key={a._id}
                user={a}
                isSelected={selected.has(a._id)}
                isCurrentUser={a._id === currentAdmin?._id}
                isSuperAdmin={isSuperAdmin}
                onToggleSelect={() => toggleOne(a._id)}
                onToggleActive={() => handleToggleActive(a._id)}
                onDelete={() => handleDelete(a._id)}
                onRoleChange={handleRoleChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
