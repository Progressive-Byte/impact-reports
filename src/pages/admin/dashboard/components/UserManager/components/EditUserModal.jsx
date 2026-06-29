import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../../common/SafeIcon';
import CustomSelect from '../../ReportsModule/reports/CustomSelect';
import { adminApiRequest } from '../../../../../../services/adminApi';
import { publicApiRequest } from '../../../../../../services/publicApi';

const ROLE_OPTIONS = [
  { value: 'editor',     label: 'Editor' },
  { value: 'viewer',     label: 'Viewer' },
  { value: 'superadmin', label: 'Superadmin' },
];

const EditUserModal = ({ user, open, onClose, onUpdated }) => {
  const [form,              setForm]              = useState({ username: '', email: '', role: 'editor', department: '' });
  const [loading,           setLoading]           = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  // Fetch departments from DB when modal opens
  useEffect(() => {
    if (!open) return;
    publicApiRequest('/api/config/departments')
      .then((depData) => {
        setDepartmentOptions((depData.departments || []).map(d => ({ value: d, label: d })));
      })
      .catch(() => {});
  }, [open]);

  // Sync form when user prop changes
  useEffect(() => {
    if (user) {
      setForm({
        username:   user.username   || '',
        email:      user.email      || '',
        role:       user.role       || 'editor',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSave = async () => {
    if (!form.username.trim()) { toast.error('Username is required'); return; }
    if (!form.email.trim())    { toast.error('Email is required');    return; }

    setLoading(true);
    try {
      const updated = await adminApiRequest(`/api/admin/admins/${user._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          username:   form.username.trim(),
          email:      form.email.trim(),
          role:       form.role,
          department: form.department,
        }),
      });
      onUpdated?.(updated);
      toast.success('User updated successfully');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <SafeIcon icon="FiEdit2" className="text-[#0B0D0F] text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0B0D0F]">Edit User</h3>
                <p className="text-sm text-gray-400 mt-0.5 truncate max-w-[260px]">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4 mb-7">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  disabled={loading}
                  autoComplete="off"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white transition-all disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  disabled={loading}
                  autoComplete="off"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white transition-all disabled:opacity-50"
                />
              </div>

              {/* Role + Region */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <CustomSelect
                    value={form.role}
                    onChange={val => setForm(p => ({ ...p, role: val }))}
                    options={ROLE_OPTIONS}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
                  <CustomSelect
                    value={form.region}
                    onChange={val => setForm(p => ({ ...p, region: val }))}
                    options={regionOptions}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <CustomSelect
                  value={form.department}
                  onChange={val => setForm(p => ({ ...p, department: val }))}
                  options={departmentOptions}
                  placeholder={departmentOptions.length ? 'Select department...' : 'Loading…'}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#1a1d20] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                {loading ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                ) : (
                  <><SafeIcon icon="FiSave" className="text-sm" /> Save Changes</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditUserModal;
