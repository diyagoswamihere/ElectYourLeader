import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import SuperAdminDashboard from './components/Admin/SuperAdminDashboard';
import VoterDashboard from './components/Voter/VoterDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const PrivateRoute = ({ children, requiredRole, requiredRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const roles = requiredRoles || (requiredRole ? [requiredRole] : null);
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AdminRouteHandler = () => {
  const { user } = useAuth();
  return user?.role === 'super_admin' ? <SuperAdminDashboard /> : <AdminDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin/*"
              element={
                <PrivateRoute requiredRoles={['admin', 'super_admin']}>
                  <AdminRouteHandler />
                </PrivateRoute>
              }
            />
            <Route
              path="/voter/*"
              element={
                <PrivateRoute requiredRole="voter">
                  <VoterDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;





