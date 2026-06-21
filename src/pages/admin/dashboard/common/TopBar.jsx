import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../../../../common/SafeIcon';
import { adminApiRequest } from '../../../../services/adminApi';

// ── UserMenu ──────────────────────────────────────────────────────────────────

const UserMenu = ({ admin, onLogout }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = admin?.username ? admin.username.slice(0, 2).toUpperCase() : 'AD';
  const goTo = (path) => { navigate(path); setOpen(false); };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2 shadow-sm transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[11px] font-black">{initials}</span>
        </div>
        <div className="hidden sm:flex items-baseline gap-1">
          <span className="text-[#1F1F22] text-xs font-bold">{admin?.username}</span>
          <span className="text-gray-400 text-[10px]">{admin?.role}</span>
        </div>
        <SafeIcon icon="FiChevronDown" className="text-gray-400 text-xs ml-0.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {[
              { icon: 'FiUser',     label: 'View Profile', path: '/alkabirimpact/dashboard/settings' },
              { icon: 'FiSettings', label: 'Settings',     path: '/alkabirimpact/dashboard/settings' },
            ].map(({ icon, label, path }) => (
              <button
                key={label}
                onClick={() => goTo(path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <SafeIcon icon={icon} className="text-sm text-gray-400" />
                {label}
              </button>
            ))}
            <div className="h-px bg-gray-100 mx-3 my-1" />
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#E52321] hover:bg-red-50 transition-colors"
            >
              <SafeIcon icon="FiLogOut" className="text-sm" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── NotificationPanel ─────────────────────────────────────────────────────────

const ICON_MAP = {
  failed_login: { icon: 'FiAlertTriangle', bg: 'bg-orange-100', color: 'text-orange-500' },
};

const NotificationPanel = () => {
  const [open,        setOpen]        = useState(false);
  const [items,       setItems]       = useState([]);
  const [unread,      setUnread]      = useState(0);
  const [loadingAll,  setLoadingAll]  = useState(false);
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

  // Fetch on mount and poll every 60 s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Re-fetch when panel opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
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
      {/* Bell button */}
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

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
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

            {/* List */}
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
                items.map(n => {
                  const meta = ICON_MAP[n.type] || { icon: 'FiInfo', bg: 'bg-gray-100', color: 'text-gray-500' };
                  return (
                    <button
                      key={n._id}
                      onClick={() => !n.read && markOneRead(n._id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-orange-50/40' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <SafeIcon icon={meta.icon} className={`text-sm ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-gray-800 truncate">{n.title}</p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E52321] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── TopBar ────────────────────────────────────────────────────────────────────

const TopBar = ({ currentNav, admin, onMenuOpen, onLogout }) => (
  <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-5 py-3 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-3">
      <button
        onClick={onMenuOpen}
        className="lg:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <SafeIcon icon="FiMenu" className="text-base" />
      </button>
      <p className="text-sm text-gray-400">
        Platform
        <span className="mx-1.5 text-gray-300">·</span>
        <span className="font-bold text-gray-700">{currentNav?.label}</span>
      </p>
    </div>

    <div className="flex items-center gap-2.5">
      <NotificationPanel />
      <UserMenu admin={admin} onLogout={onLogout} />
    </div>
  </header>
);

export default TopBar;
