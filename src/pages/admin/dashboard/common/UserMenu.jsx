import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const MENU_ITEMS = [
  { icon: 'FiUser',     label: 'View Profile', path: '/alkabirimpact/dashboard/settings' },
  { icon: 'FiSettings', label: 'Settings',     path: '/alkabirimpact/dashboard/settings' },
];

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
            {MENU_ITEMS.map(({ icon, label, path }) => (
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

export default UserMenu;
