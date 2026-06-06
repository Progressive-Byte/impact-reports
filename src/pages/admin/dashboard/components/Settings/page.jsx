import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';
import SafeIcon from '../../../../../common/SafeIcon';

const Settings = () => {
  const { admin, getToken, login } = useAdminAuth();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [profileForm, setProfileForm] = useState({ username: admin?.username || '', email: admin?.email || '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError('New passwords do not match');
    }
    if (pwForm.newPassword.length < 6) {
      return setPwError('Password must be at least 6 characters');
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/admin/settings/password', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwSuccess(data.message);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const res = await fetch('/api/admin/settings/profile', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(getToken(), { ...admin, ...data });
      setProfileSuccess('Profile updated successfully');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const PasswordField = ({ label, field, value, onChange }) => (
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <SafeIcon icon="FiLock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type={showPw[field] ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          placeholder={label}
          className="w-full border border-gray-100 bg-gray-50 rounded-2xl pl-10 pr-12 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#E52321]/30 focus:ring-1 focus:ring-[#E52321]/10 transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <SafeIcon icon={showPw[field] ? 'FiEyeOff' : 'FiEye'} className="text-sm" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-xl font-black text-[#0B0D0F] tracking-tight mb-1">Settings</h2>
        <p className="text-sm text-gray-400 font-medium">Manage your account and preferences</p>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-50">
          <div className="w-14 h-14 rounded-2xl bg-[#0B0D0F] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xl uppercase">{admin?.username?.[0]}</span>
          </div>
          <div>
            <p className="font-black text-[#0B0D0F] text-lg tracking-tight">{admin?.username}</p>
            <p className="text-sm text-gray-400">{admin?.email}</p>
            <span className={`text-[9px] font-black rounded-full px-2.5 py-1 uppercase tracking-widest border ${
              admin?.role === 'superadmin'
                ? 'text-[#E52321] bg-[#E52321]/10 border-[#E52321]/15'
                : 'text-gray-500 bg-gray-50 border-gray-100'
            }`}>{admin?.role}</span>
          </div>
        </div>
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Update Profile</h3>
        <AnimatePresence>
          {(profileError || profileSuccess) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm font-bold ${
                profileError
                  ? 'bg-red-50 border border-red-100 text-red-700'
                  : 'bg-green-50 border border-green-100 text-green-700'
              }`}
            >
              <SafeIcon icon={profileError ? 'FiAlertCircle' : 'FiCheckCircle'} className="text-base" />
              {profileError || profileSuccess}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          {[
            { key: 'username', label: 'Username', icon: 'FiUser', type: 'text' },
            { key: 'email',    label: 'Email',    icon: 'FiMail', type: 'email' },
          ].map(({ key, label, icon, type }) => (
            <div key={key}>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
              <div className="relative">
                <SafeIcon icon={icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={type}
                  value={profileForm[key]}
                  onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                  required
                  className="w-full border border-gray-100 bg-gray-50 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#E52321]/30 focus:ring-1 focus:ring-[#E52321]/10 transition-all"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#E52321] disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              {profileLoading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <SafeIcon icon="FiSave" className="text-base" />
              }
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5">Change Password</h3>
        <AnimatePresence>
          {(pwError || pwSuccess) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm font-bold ${
                pwError
                  ? 'bg-red-50 border border-red-100 text-red-700'
                  : 'bg-green-50 border border-green-100 text-green-700'
              }`}
            >
              <SafeIcon icon={pwError ? 'FiAlertCircle' : 'FiCheckCircle'} className="text-base" />
              {pwError || pwSuccess}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <PasswordField
            label="Current Password"
            field="current"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <PasswordField
            label="New Password"
            field="new"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <PasswordField
            label="Confirm New Password"
            field="confirm"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 bg-[#E52321] hover:bg-[#C91D1B] disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              {pwLoading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <SafeIcon icon="FiKey" className="text-base" />
              }
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
