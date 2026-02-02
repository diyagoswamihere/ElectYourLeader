import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SuperAdminOverview from './SuperAdminOverview';
import './AdminDashboard.css';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="nav-brand">
          <h2>Elect Your Leader</h2>
          <span className="admin-badge">Super Admin Panel</span>
        </div>
        <div className="nav-links">
          <Link
            to="/admin/dashboard"
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Link>
        </div>
        <div className="nav-user">
          <span className="user-info">
            {user?.name} (Super Admin)
          </span>
          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <main className="admin-content">
        <Routes>
          <Route path="dashboard" element={<SuperAdminOverview />} />
          <Route path="*" element={<SuperAdminOverview />} />
        </Routes>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

