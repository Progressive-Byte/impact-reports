import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const AdminAuthContext = createContext(null);

const ADMIN_DATA_KEY    = 'adminData';
const TIMEOUT_KEY       = 'sessionTimeoutMinutes';
const LAST_ACTIVITY_KEY = 'adminLastActivity';
const ACTIVITY_EVENTS   = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];

// Module-level — stable reference so add/removeEventListener works correctly
const markActivity = () => localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

export const AdminAuthProvider = ({ children }) => {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);
  const watcherRef = useRef(null);

  const stopWatcher = () => {
    clearInterval(watcherRef.current);
    ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, markActivity));
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  };

  const startWatcher = (minutes) => {
    stopWatcher();
    localStorage.setItem(TIMEOUT_KEY, String(minutes));
    markActivity();
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, markActivity, { passive: true }));
    // Poll every 30 s — reads localStorage directly to avoid stale closures
    watcherRef.current = setInterval(() => {
      const last      = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
      const timeoutMs = (Number(localStorage.getItem(TIMEOUT_KEY)) || 30) * 60 * 1000;
      if (last > 0 && Date.now() - last > timeoutMs) {
        // Dispatching reuses the existing unauthorized handler → triggers clearSession
        window.dispatchEvent(new CustomEvent('admin:unauthorized'));
      }
    }, 30_000);
  };

  function clearSession() {
    stopWatcher();
    deleteCookie('adminToken');
    localStorage.removeItem(ADMIN_DATA_KEY);
    localStorage.removeItem(TIMEOUT_KEY);
    setAdmin(null);
  }

  // On mount: restore session from cookie + localStorage
  useEffect(() => {
    const token   = getCookie('adminToken');
    const data    = localStorage.getItem(ADMIN_DATA_KEY);
    const timeout = Number(localStorage.getItem(TIMEOUT_KEY)) || 30;
    if (token && data) {
      try {
        setAdmin(JSON.parse(data));
        startWatcher(timeout);
      } catch { clearSession(); }
    }
    setLoading(false);
    return () => stopWatcher();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 401 responses from the API also clear the session
  useEffect(() => {
    const handle = () => clearSession();
    window.addEventListener('admin:unauthorized', handle);
    return () => window.removeEventListener('admin:unauthorized', handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token, adminData, sessionTimeoutMinutes = 30) => {
    const cookieDays = sessionTimeoutMinutes / (24 * 60);
    setCookie('adminToken', token, cookieDays);
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
    setAdmin(adminData);
    startWatcher(sessionTimeoutMinutes);
  };

  const logout   = () => clearSession();
  const getToken = () => getCookie('adminToken');

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, getToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
