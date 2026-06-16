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

export const STATUS_TAG = {
  published: { label: 'PUB',  cls: 'bg-blue-500 text-white' },
  draft:     { label: 'EDIT', cls: 'bg-purple-500 text-white' },
  pending:   { label: 'PEND', cls: 'bg-yellow-400 text-yellow-900' },
};
