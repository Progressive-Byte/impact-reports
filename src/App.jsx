import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import ReportDetail from './pages/report-detail/page';
import Portal from './pages/portal/page';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/report/:id" element={<ReportDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;