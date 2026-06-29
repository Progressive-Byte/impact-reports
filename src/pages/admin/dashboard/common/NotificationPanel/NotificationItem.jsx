import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../../../../../common/SafeIcon';

const ICON_MAP = {
  failed_login: { icon: 'FiAlertTriangle', bg: 'bg-orange-100', color: 'text-orange-500' },
};

const DEFAULT_ICON = { icon: 'FiInfo', bg: 'bg-gray-100', color: 'text-gray-500' };

const NotificationItem = ({ n, onRead }) => {
  const meta = ICON_MAP[n.type] || DEFAULT_ICON;

  return (
    <button
      onClick={() => !n.read && onRead(n._id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-orange-50/40' : ''}`}
    >
      <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <SafeIcon icon={meta.icon} className={`text-sm ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-black text-gray-800 truncate">{n.title}</p>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#E52321] flex-shrink-0" />}
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
        <p className="text-[10px] text-gray-400 mt-1">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
};

export default NotificationItem;
