import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VotingPage from './VotingPage';
import './VoterDashboard.css';

const VoterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="voter-dashboard">
      <nav className="voter-nav">
        <div className="nav-brand">
          <h2>Elect Your Leader</h2>
          <span className="voter-badge">Voter Portal</span>
        </div>
        <div className="nav-user">
          <span className="user-info">
            {user?.name} ({user?.organization})
          </span>
          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <main className="voter-content">
        <Routes>
          <Route path="dashboard" element={<VotingPage />} />
          <Route path="*" element={<VotingPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default VoterDashboard;





