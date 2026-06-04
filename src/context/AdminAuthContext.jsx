import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const data = localStorage.getItem('adminData');
    if (token && data) {
      try { setAdmin(JSON.parse(data)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  const getToken = () => localStorage.getItem('adminToken');

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, getToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
