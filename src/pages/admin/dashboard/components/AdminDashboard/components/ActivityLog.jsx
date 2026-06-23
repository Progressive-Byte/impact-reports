import { useState } from 'react';
import { STATUS_TAG, timeAgo } from './utils';

const SYS_TAG = {
  login:  { label: 'LOGIN',  cls: 'bg-green-600 text-white' },
  logout: { label: 'LOGOUT', cls: 'bg-orange-500 text-white' },
  purge:  { label: 'PURGE',  cls: 'bg-red-700 text-white' },
};

const ActivityLog = ({ recentActivity = [], activityLogs = [], logMeta = {}, loading }) => {
  const [activeTab, setActiveTab] = useState('system');

  const systemLogs = activityLogs.map(log => {
    const t = SYS_TAG[log.type] ?? SYS_TAG.login;
    return {
      tag:      t.label,
      tagClass: t.cls,
      time:     timeAgo(log.createdAt),
      msg:      `${log.username} (${log.role}) ${log.type === 'login' ? 'logged in' : 'logged out'}`,
    };
  });

  const contentLogs = recentActivity.map(r => {
    const tag = STATUS_TAG[r.status] ?? STATUS_TAG.pending;
    return { tag: tag.label, tagClass: tag.cls, time: timeAgo(r.updatedAt), msg: `"${r.projectName}" — ${r.status}` };
  });

  const logs = activeTab === 'system' ? systemLogs : contentLogs;
  const windowDays = logMeta.windowDays ?? 30;
  const total      = logMeta.total      ?? systemLogs.length;

  return (
    <div className="flex-[3] min-w-0 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-100 px-6">
        {[{ id: 'system', label: 'System Log' }, { id: 'content', label: 'Content Feed' }].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-4 mr-7 text-sm font-bold border-b-2 transition-colors ${
              activeTab === id ? 'border-[#E52321] text-[#0B0D0F]' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
            {id === 'content' && recentActivity.length > 0 && (
              <span className="ml-2 text-[10px] font-black bg-[#E52321] text-white rounded-full px-1.5 py-0.5">
                {recentActivity.length}
              </span>
            )}
          </button>
        ))}

        {/* Context badge — only on system tab */}
        {activeTab === 'system' && !loading && (
          <span className="ml-auto text-[10px] font-bold text-gray-400 whitespace-nowrap">
            Last {windowDays} days &middot; {total} event{total === 1 ? '' : 's'}
            {total > activityLogs.length && (
              <span className="text-gray-300"> (showing {activityLogs.length})</span>
            )}
          </span>
        )}
      </div>

      {/* Log terminal */}
      <div className="m-5 bg-[#0f1114] rounded-2xl p-6 h-[340px] overflow-y-auto font-mono scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {loading && activeTab === 'content' ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-10 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity in the last {windowDays} days.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black min-w-[42px] flex-shrink-0 ${entry.tagClass}`}>
                  {entry.tag}
                </span>
                <span className="text-gray-500 text-[13px] flex-shrink-0 tabular-nums">{entry.time}</span>
                <span className="text-gray-200 text-[13px] leading-relaxed">{entry.msg}</span>
              </div>
            ))}
            <div className="flex items-center pt-1">
              <span className="inline-block w-2 h-4 bg-green-400 animate-pulse rounded-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Retention footnote */}
      <div className="px-6 pb-4 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
        <p className="text-[10px] text-gray-400">
          Displaying last {windowDays} days. 1-year history retained in database.
          Records older than 365 days are soft-archived and remain downloadable.
        </p>
      </div>
    </div>
  );
};

export default ActivityLog;
