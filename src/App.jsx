import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Portal from './pages/portal/page';
import ReportDetail from './pages/report-detail/page';
import AdminLogin from './pages/admin/login/page';
import AdminDashboard from './pages/admin/dashboard/page';
import AdminProtectedRoute from './common/AdminProtectedRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Admin routes — no public Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          {/* Public routes — wrapped in Layout */}
          <Route path="/" element={<Layout><Portal /></Layout>} />
          <Route path="/report/:id" element={<Layout><ReportDetail /></Layout>} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
