export const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />
);

export function fmt(n) {
  return n == null ? '—' : Number(n).toLocaleString();
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const SYSTEM_LOGS = [
  { tag: 'SYS',  tagClass: 'bg-gray-600 text-gray-200',   time: '10:42:01', msg: 'MongoDB connection established.' },
  { tag: 'AUTH', tagClass: 'bg-green-600 text-white',      time: '10:45:12', msg: 'Admin session authenticated via JWT.' },
  { tag: 'SYS',  tagClass: 'bg-gray-600 text-gray-200',   time: '11:15:00', msg: 'Routine backup completed successfully.' },
];

export const STATUS_TAG = {
  published: { label: 'PUB',  cls: 'bg-blue-500 text-white' },
  draft:     { label: 'EDIT', cls: 'bg-purple-500 text-white' },
  pending:   { label: 'PEND', cls: 'bg-yellow-400 text-yellow-900' },
};
