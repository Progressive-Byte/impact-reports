import { useState } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../../common/SafeIcon';
import CustomSelect from '../../ReportsModule/reports/CustomSelect';
import Checkbox from '../../../common/Checkbox';
import { adminApiRequest } from '../../../../../../services/adminApi';
import { useAdminAuth } from '../../../../../../context/AdminAuthContext';

const ROLE_OPTIONS = [
  { value: 'admin',      label: 'Admin' },
  { value: 'superadmin', label: 'Superadmin' },
];

const AVATAR_COLORS = [
  'bg-teal-500', 'bg-emerald-500', 'bg-rose-400',
  'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500',
];

const avatarColor = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (username = '', email = '') => {
  const src   = username || email.split('@')[0];
  const parts = src.split(/[._\-\s]+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : src.slice(0, 2).toUpperCase();
};

const formatLogin = (date) => {
  if (!date) return 'Never';
  const d = new Date(date);
  return `${d.toISOString().slice(0, 10)} · ${d.toTimeString().slice(0, 5)}`;
};

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
    isActive
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-[#E52321] border-red-200'
  }`}>
    {isActive
      ? <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
      : <SafeIcon icon="FiX" className="text-[10px] flex-shrink-0" />}
    {isActive ? 'Active' : 'Suspended'}
  </span>
);

const UserRow = ({ user, isSelected, onToggleSelect, onUpdate, onDelete, onEdit }) => {
  const { admin: currentAdmin } = useAdminAuth();
  // Prevent a logged-in admin from modifying their own account
  const isSelf = String(currentAdmin?._id) === String(user._id);

  const [role,          setRole]    = useState(user.role);
  const [isActive,      setActive]  = useState(user.isActive);
  const [confirmRevoke, setConfirm] = useState(false);
  const [loadingRole,   setLRole]   = useState(false);
  const [loadingToggle, setLToggle] = useState(false);
  const [loadingDelete, setLDelete] = useState(false);

  const initials = getInitials(user.username, user.email);
  const color    = avatarColor(user.username || user.email);

  const handleRoleChange = async (newRole) => {
    if (isSelf) return;
    const prev = role;
    setRole(newRole);
    setLRole(true);
    try {
      await adminApiRequest(`/api/admin/admins/${user._id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      toast.success('Role updated');
      onUpdate?.();
    } catch (err) {
      setRole(prev);
      toast.error(err.message || 'Failed to update role');
    } finally {
      setLRole(false);
    }
  };

  const handleToggle = async () => {
    setLToggle(true);
    try {
      const updated = await adminApiRequest(`/api/admin/admins/${user._id}/toggle`, {
        method: 'PATCH',
      });
      toast.success(updated.isActive ? 'User activated' : 'User suspended');
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setLToggle(false);
      setConfirm(false);
    }
  };

  const handleDelete = async () => {
    setLDelete(true);
    try {
      await adminApiRequest(`/api/admin/admins/${user._id}`, { method: 'DELETE' });
      onDelete?.(user._id);
      toast.success('User removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove user');
    } finally {
      setLDelete(false);
      setConfirm(false);
    }
  };

  return (
    <div className={`flex items-center gap-4 px-6 py-4 transition-colors ${
      isSelected ? 'bg-red-50' : isSelf ? 'bg-blue-50/30' : 'hover:bg-gray-50/60'
    }`}>
      {/* Checkbox */}
      <div className="w-5 flex-shrink-0 flex items-center">
        <Checkbox checked={isSelected} onChange={isSelf ? undefined : onToggleSelect} disabled={isSelf} />
      </div>

      {/* Avatar + Email */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-[11px] font-black">{initials}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0B0D0F] truncate">{user.email}</p>
            {isSelf && (
              <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">
                You
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{user.username}</p>
        </div>
      </div>

      {/* Region */}
      <div className="w-28 flex-shrink-0">
        <span className="text-sm text-gray-500 capitalize">{(user.region || 'global').replace('_', ' ')}</span>
      </div>

      {/* Role — read-only for own account */}
      <div className="w-44 flex-shrink-0">
        <div className={loadingRole || isSelf ? 'opacity-50 pointer-events-none' : ''}>
          <CustomSelect value={role} onChange={handleRoleChange} options={ROLE_OPTIONS} />
        </div>
      </div>

      {/* Status */}
      <div className="w-28 flex-shrink-0">
        <StatusBadge isActive={isActive} />
      </div>

      {/* Last Login */}
      <div className="w-44 flex-shrink-0">
        <span className="text-xs text-gray-500 tabular-nums">{formatLogin(user.lastLogin)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isSelf ? (
          // Own account — no actions allowed
          <span className="text-[11px] text-gray-300 italic px-2">own account</span>
        ) : confirmRevoke ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 mr-1">
              {isActive ? 'Suspend?' : 'Delete?'}
            </span>
            <button
              onClick={isActive ? handleToggle : handleDelete}
              disabled={loadingToggle || loadingDelete}
              className="text-[10px] font-black text-[#E52321] bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {(loadingToggle || loadingDelete) && (
                <div className="w-3 h-3 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
              )}
              Confirm
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onEdit?.(user)}
              className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#0B0D0F] transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirm(true)}
              className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#E52321] transition-colors"
            >
              {isActive ? 'Suspend' : 'Delete'}
            </button>
            <button
              onClick={handleToggle}
              disabled={loadingToggle}
              className="px-4 py-1.5 bg-[#0B0D0F] hover:bg-[#1a1d20] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              {loadingToggle && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserRow;
