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

const INITIAL = { email: '', role: 'editor', department: '' };

const InviteModal = ({ open, onClose, onInviteSent }) => {
  const [form,              setForm]              = useState(INITIAL);
  const [loading,           setLoading]           = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    if (!open) return;
    publicApiRequest('/api/config/departments')
      .then((depData) => {
        setDepartmentOptions((depData.departments || []).map(d => ({ value: d, label: d })));
      })
      .catch(() => {});
  }, [open]);

  const handleClose = () => {
    if (loading) return;
    setForm(INITIAL);
    onClose();
  };

  const handleSend = async () => {
    if (!form.email.trim())      { toast.error('Email is required');      return; }
    if (!form.department.trim()) { toast.error('Department is required'); return; }

    setLoading(true);
    try {
      await adminApiRequest('/api/invite', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      toast.success(`Invite sent to ${form.email}`);
      setForm(INITIAL);
      onClose();
      onInviteSent?.();
    } catch (err) {
      toast.error(err.message || 'Failed to send invite');
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
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <SafeIcon icon="FiUserPlus" className="text-[#E52321] text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0B0D0F]">Invite User</h3>
                <p className="text-sm text-gray-400 mt-0.5">Send an access invitation by email.</p>
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-[#E52321]">*</span>
              </label>
              <input
                type="email"
                placeholder="name@example.org"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                disabled={loading}
                autoComplete="off"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white transition-all disabled:opacity-50"
              />
            </div>

            {/* Role + Region */}
            <div className="grid grid-cols-2 gap-4 mb-4">
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
            <div className="mb-7">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department <span className="text-[#E52321]">*</span>
              </label>
              <CustomSelect
                value={form.department}
                onChange={val => setForm(p => ({ ...p, department: val }))}
                options={departmentOptions}
                placeholder={departmentOptions.length ? 'Select department...' : 'Loading…'}
                disabled={loading}
              />
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
                onClick={handleSend}
                disabled={loading}
                className="flex items-center gap-2 bg-[#E52321] hover:bg-[#c91d1b] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                {loading ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
                ) : (
                  <><SafeIcon icon="FiSend" className="text-sm" /> Send Invite</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteModal;
