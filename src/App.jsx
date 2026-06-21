import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Portal from './pages/web/portal/page';
import ReportDetail from './pages/web/report-detail/page';
import AdminLogin from './pages/admin/login/page';
import AdminRegister from './pages/admin/register/page';
import AdminResetPassword from './pages/admin/reset-password/page';
import AdminDashboard from './pages/admin/dashboard/page';
import AdminProtectedRoute from './common/AdminProtectedRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Admin routes — no public Layout */}
          <Route path="/alkabirimpact/login" element={<AdminLogin />} />
          <Route path="/alkabirimpact/register" element={<AdminRegister />} />
          <Route
            path="/alkabirimpact/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/alkabirimpact/dashboard/:section"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          {/* Public routes — wrapped in Layout */}
          <Route path="/" element={<Layout><Portal /></Layout>} />
          <Route path="/report/:slug" element={<Layout><ReportDetail /></Layout>} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
