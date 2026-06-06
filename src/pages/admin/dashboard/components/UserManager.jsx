import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import SafeIcon from '../../../../common/SafeIcon';

const EMPTY_FORM = { username: '', email: '', password: '', role: 'admin' };

const UserManager = () => {
  const { admin: currentAdmin, getToken } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

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
      showToast('Failed to load admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins((p) => [data, ...p]);
      setForm(EMPTY_FORM);
      setShowAddForm(false);
      showToast('Admin created successfully');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins((p) => p.filter((a) => a._id !== id));
      showToast('Admin deleted');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`/api/admin/admins/${id}/toggle`, { method: 'PATCH', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins((p) => p.map((a) => (a._id === id ? data : a)));
      showToast(`Admin ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const isSuperAdmin = currentAdmin?.role === 'superadmin';

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0B0D0F] tracking-tight mb-1">Admin Users</h2>
          <p className="text-sm text-gray-400 font-medium">Manage administrator accounts</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => { setShowAddForm((p) => !p); setFormError(''); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#E52321] text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95"
          >
            <SafeIcon icon={showAddForm ? 'FiX' : 'FiUserPlus'} className="text-base" />
            {showAddForm ? 'Cancel' : 'Add Admin'}
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5">New Admin</h3>
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-700 font-bold">
                  <SafeIcon icon="FiAlertCircle" className="text-base flex-shrink-0" />
                  {formError}
                </div>
              )}
              <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'username', label: 'Username', type: 'text', icon: 'FiUser' },
                  { key: 'email',    label: 'Email',    type: 'email', icon: 'FiMail' },
                  { key: 'password', label: 'Password', type: 'password', icon: 'FiLock' },
                ].map(({ key, label, type, icon }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
                    <div className="relative">
                      <SafeIcon icon={icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                        required
                        className="w-full border border-gray-100 bg-gray-50 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#E52321]/30 focus:ring-1 focus:ring-[#E52321]/10 transition-all placeholder-gray-300"
                        placeholder={label}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#E52321]/30 transition-all"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex items-center gap-2 bg-[#E52321] hover:bg-[#C91D1B] disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    {formLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <SafeIcon icon="FiUserPlus" className="text-base" />
                    )}
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admins list */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {admins.map((a) => (
              <div key={a._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-[#0B0D0F] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-sm uppercase">{a.username[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-[#0B0D0F]">{a.username}</p>
                    {a._id === currentAdmin?._id && (
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 uppercase tracking-widest">You</span>
                    )}
                    <span className={`text-[9px] font-black rounded-full px-2 py-0.5 uppercase tracking-widest border ${
                      a.role === 'superadmin'
                        ? 'text-[#E52321] bg-[#E52321]/10 border-[#E52321]/15'
                        : 'text-gray-500 bg-gray-50 border-gray-100'
                    }`}>{a.role}</span>
                    <span className={`text-[9px] font-black rounded-full px-2 py-0.5 uppercase tracking-widest border ${
                      a.isActive
                        ? 'text-green-700 bg-green-50 border-green-100'
                        : 'text-gray-400 bg-gray-50 border-gray-100'
                    }`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.email}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    Last login: {a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                {isSuperAdmin && a._id !== currentAdmin?._id && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(a._id)}
                      title={a.isActive ? 'Deactivate' : 'Activate'}
                      className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-100 hover:bg-green-50 transition-all"
                    >
                      <SafeIcon icon={a.isActive ? 'FiUserX' : 'FiUserCheck'} className="text-sm" />
                    </button>
                    {deleteId === a._id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(a._id)}
                          className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(a._id)}
                        title="Delete"
                        className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all"
                      >
                        <SafeIcon icon="FiTrash2" className="text-sm" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminsManager;
