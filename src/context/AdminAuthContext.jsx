import { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  function clearSession() {
    deleteCookie('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  }

  // On mount: restore session if the 24 h cookie is still alive
  useEffect(() => {
    const token = getCookie('adminToken');
    const data  = localStorage.getItem('adminData');
    if (token && data) {
      try { setAdmin(JSON.parse(data)); } catch { clearSession(); }
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener('admin:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('admin:unauthorized', handleUnauthorized);
  }, []);

  const login = (token, adminData) => {
    setCookie('adminToken', token, 1); // cookie expires in 1 day (24 h)
    localStorage.setItem('adminData', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => clearSession();

  const getToken = () => getCookie('adminToken');

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, getToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
