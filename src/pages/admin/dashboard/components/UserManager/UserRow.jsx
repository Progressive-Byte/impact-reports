import { useState } from 'react';
import SafeIcon from '../../../../../common/SafeIcon';
import CustomSelect from '../ReportsModule/reports/CustomSelect';

const AVATAR_COLORS = [
  'bg-teal-500', 'bg-emerald-500', 'bg-rose-400',
  'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500',
];

const avatarColor = (str = '') =>
  AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (username = '', email = '') => {
  const src = username || email.split('@')[0];
  const parts = src.split(/[._\-\s]+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : src.slice(0, 2).toUpperCase();
};

const formatLogin = (date) => {
  if (!date) return 'Never';
  const d = new Date(date);
  const ymd = d.toISOString().slice(0, 10);
  const hm  = d.toTimeString().slice(0, 5);
  return `${ymd} · ${hm}`;
};

const ROLE_OPTIONS = [
  { value: 'admin',      label: 'Admin' },
  { value: 'superadmin', label: 'Superadmin' },
];

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
    isActive
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-[#E52321] border-red-200'
  }`}>
    {isActive
      ? <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
      : <SafeIcon icon="FiX" className="text-[10px] flex-shrink-0" />
    }
    {isActive ? 'Active' : 'Suspended'}
  </span>
);

const UserRow = ({ user, isSelected, isCurrentUser, isSuperAdmin, onToggleSelect, onToggleActive, onDelete, onRoleChange }) => {
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const initials = getInitials(user.username, user.email);
  const color    = avatarColor(user.username || user.email);

  return (
    <div className={`flex items-center gap-4 px-6 py-4 transition-colors ${
      isSelected ? 'bg-red-50' : 'hover:bg-gray-50/60'
    }`}>
      {/* Checkbox */}
      <div className="w-5 flex-shrink-0 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-gray-300 accent-[#E52321] cursor-pointer"
        />
      </div>

      {/* Avatar + Email */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-[11px] font-black">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0B0D0F] truncate">{user.email}</p>
          {isCurrentUser && (
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-1.5 py-0.5 uppercase tracking-widest">You</span>
          )}
        </div>
      </div>

      {/* Region */}
      <div className="w-28 flex-shrink-0">
        <span className="text-sm text-gray-500">Global</span>
      </div>

      {/* Role */}
      <div className="w-44 flex-shrink-0">
        <CustomSelect
          value={user.role}
          onChange={val => onRoleChange?.(user._id, val)}
          options={ROLE_OPTIONS}
        />
      </div>

      {/* Status */}
      <div className="w-28 flex-shrink-0">
        <StatusBadge isActive={user.isActive} />
      </div>

      {/* Last Login */}
      <div className="w-44 flex-shrink-0">
        <span className="text-xs text-gray-500 tabular-nums">{formatLogin(user.lastLogin)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isSuperAdmin && !isCurrentUser ? (
          confirmRevoke ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { onDelete(); setConfirmRevoke(false); }}
                className="text-[10px] font-black text-[#E52321] bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmRevoke(false)}
                className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onToggleActive}
                className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#0B0D0F] transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmRevoke(true)}
                className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#E52321] transition-colors"
              >
                Revoke
              </button>
              <button className="px-4 py-1.5 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white text-xs font-bold rounded-xl transition-colors">
                Activity
              </button>
            </>
          )
        ) : (
          <button className="px-4 py-1.5 bg-[#0B0D0F] text-white text-xs font-bold rounded-xl opacity-60 cursor-default">
            Activity
          </button>
        )}
      </div>
    </div>
  );
};

export default UserRow;
