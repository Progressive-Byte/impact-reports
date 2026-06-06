import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../../../common/SafeIcon';
import CustomSelect from '../../ReportsModule/reports/CustomSelect';

const ROLE_OPTIONS = [
  { value: 'field_staff',      label: 'Field Staff' },
  { value: 'regional_manager', label: 'Regional Manager' },
  { value: 'superadmin',       label: 'Superadmin' },
];

const REGION_OPTIONS = [
  { value: 'global',         label: 'Global' },
  { value: 'mena',           label: 'MENA' },
  { value: 'eastern_europe', label: 'Eastern Europe' },
  { value: 'asia_pacific',   label: 'Asia Pacific' },
];

const INITIAL = { email: '', role: 'field_staff', region: 'global' };

const InviteModal = ({ open, onClose }) => {
  const [form, setForm] = useState(INITIAL);

  const handleClose = () => {
    setForm(INITIAL);
    onClose();
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
                placeholder="name@impact.org"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white transition-all"
              />
            </div>

            {/* Role + Region */}
            <div className="grid grid-cols-2 gap-4 mb-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <CustomSelect
                  value={form.role}
                  onChange={val => setForm(p => ({ ...p, role: val }))}
                  options={ROLE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
                <CustomSelect
                  value={form.region}
                  onChange={val => setForm(p => ({ ...p, region: val }))}
                  options={REGION_OPTIONS}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                className="flex items-center gap-2 bg-[#E52321] hover:bg-[#c91d1b] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                Send Invite
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteModal;
