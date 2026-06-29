import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../../common/SafeIcon';
import { adminApiRequest } from '../../../../../services/adminApi';
import NotificationItem from './NotificationItem';

const NotificationPanel = () => {
  const [open,       setOpen]       = useState(false);
  const [items,      setItems]      = useState([]);
  const [unread,     setUnread]     = useState(0);
  const [loadingAll, setLoadingAll] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await adminApiRequest('/api/notifications');
      setItems(data.notifications || []);
      setUnread(data.unreadCount  || 0);
    } catch {
      // fail silently — bell just shows no count
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    setLoadingAll(true);
    try {
      await adminApiRequest('/api/notifications/read-all', { method: 'PATCH' });
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      // ignore
    } finally {
      setLoadingAll(false);
    }
  };

  const markOneRead = async (id) => {
    try {
      await adminApiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setItems(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-[#1F1F22] hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
      >
        <SafeIcon icon="FiBell" className="text-lg" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#E52321] rounded-full text-white text-[10px] font-black flex items-center justify-center leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SafeIcon icon="FiBell" className="text-sm text-gray-500" />
                <span className="text-sm font-black text-gray-800">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#E52321]/10 text-[#E52321] text-[10px] font-black rounded-full">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loadingAll}
                  className="text-[11px] font-bold text-[#E52321] hover:underline disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                    <SafeIcon icon="FiBell" className="text-gray-400 text-base" />
                  </div>
                  <p className="text-xs font-bold text-gray-500">No notifications yet</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Security alerts will appear here</p>
                </div>
              ) : (
                items.map(n => (
                  <NotificationItem key={n._id} n={n} onRead={markOneRead} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
