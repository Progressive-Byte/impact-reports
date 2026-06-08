import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminAuthContext = createContext(null);

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

const isSessionExpired = () => {
  const loginTime = localStorage.getItem('adminLoginTime');
  if (!loginTime) return true;
  return Date.now() - parseInt(loginTime, 10) > SESSION_DURATION;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminLoginTime');
    setAdmin(null);
  }, []);

  // On mount: restore session only if not expired
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const data  = localStorage.getItem('adminData');
    if (token && data && !isSessionExpired()) {
      try { setAdmin(JSON.parse(data)); } catch { clearSession(); }
    } else if (token) {
      // Token exists but 24 h window has passed — wipe it
      clearSession();
    }
    setLoading(false);
  }, [clearSession]);

  // Check every 60 s while the tab is open
  useEffect(() => {
    if (!admin) return;
    const id = setInterval(() => {
      if (isSessionExpired()) clearSession();
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [admin, clearSession]);

  const login = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    localStorage.setItem('adminLoginTime', String(Date.now()));
    setAdmin(adminData);
  };

  const logout = () => clearSession();

  // Returns null (and wipes session) if the 24 h window has passed
  const getToken = () => {
    if (isSessionExpired()) { clearSession(); return null; }
    return localStorage.getItem('adminToken');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, getToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
