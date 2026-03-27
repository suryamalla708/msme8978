import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import WorkerDashboard from './pages/WorkerDashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import AdminDashboard from './pages/AdminDashboard';
import React from 'react';

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
  return children;
}

// Pages that get the full-screen treatment (no outer header/container)
const FULLSCREEN_PATHS = ['/enterprise', '/admin', '/worker'];

function AppShell() {
  const location = useLocation();
  const role = localStorage.getItem('role');
  const isFullscreen = FULLSCREEN_PATHS.some(p => location.pathname.startsWith(p));

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/worker/*" element={
        <ProtectedRoute allowedRole="WORKER"><WorkerDashboard /></ProtectedRoute>
      } />
      <Route path="/enterprise/*" element={
        <ProtectedRoute allowedRole="ENTERPRISE"><EnterpriseDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoute>
      } />
    </Routes>
  );

  // Dashboard pages: render completely unconstrained, full-viewport
  if (isFullscreen) {
    return <div className="min-h-screen">{routes}</div>;
  }

  // Public pages: render with the shared header + centred container
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="text-xl font-bold text-purple-600">LocalWorks</div>
        <nav>
          {role ? (
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          ) : (
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Login / Register
            </a>
          )}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">{routes}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
