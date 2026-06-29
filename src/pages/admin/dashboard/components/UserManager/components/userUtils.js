export const ROLE_OPTIONS = [
  { value: 'editor',     label: 'Editor' },
  { value: 'viewer',     label: 'Viewer' },
  { value: 'superadmin', label: 'Superadmin' },
];

const AVATAR_COLORS = [
  'bg-teal-500', 'bg-emerald-500', 'bg-rose-400',
  'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500',
];

export const avatarColor = (str = '') =>
  AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

export const getInitials = (username = '', email = '') => {
  const src   = username || email.split('@')[0];
  const parts = src.split(/[._\-\s]+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : src.slice(0, 2).toUpperCase();
};

export const formatLogin = (date) => {
  if (!date) return 'Never';
  const d = new Date(date);
  return `${d.toISOString().slice(0, 10)} · ${d.toTimeString().slice(0, 5)}`;
};
