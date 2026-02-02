import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  const COLORS = ['#006400', '#ffd700', '#228B22', '#32CD32', '#90EE90'];

  const chartData = stats?.candidateStats?.map(candidate => ({
    name: candidate.name,
    votes: candidate.vote_count
  })) || [];

  const pieData = stats?.candidateStats?.map(candidate => ({
    name: candidate.name,
    value: candidate.vote_count
  })) || [];

  const leadingCandidate = stats?.candidateStats?.reduce((prev, current) =>
    (prev.vote_count > current.vote_count) ? prev : current
  , stats.candidateStats[0]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Organization: {user?.organization}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#006400' }}>
            👥
          </div>
          <div className="stat-content">
            <h3>Total Candidates</h3>
            <p className="stat-number">{stats?.totalCandidates || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffd700' }}>
            🗳️
          </div>
          <div className="stat-content">
            <h3>Total Voters</h3>
            <p className="stat-number">{stats?.totalVoters || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#228B22' }}>
            ✅
          </div>
          <div className="stat-content">
            <h3>Total Votes</h3>
            <p className="stat-number">{stats?.totalVotes || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#32CD32' }}>
            🏆
          </div>
          <div className="stat-content">
            <h3>Leading Candidate</h3>
            <p className="stat-number">{leadingCandidate?.name || 'N/A'}</p>
            <p className="stat-subtext">{leadingCandidate?.vote_count || 0} votes</p>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <>
          <div className="chart-section">
            <div className="chart-card">
              <h2>Voting Results - Bar Chart</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="#006400" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-card">
              <h2>Voting Distribution - Pie Chart</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {stats?.candidateStats && stats.candidateStats.length > 0 && (
        <div className="results-table">
          <h2>Detailed Results</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate Name</th>
                <th>Votes</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {stats.candidateStats
                .sort((a, b) => b.vote_count - a.vote_count)
                .map((candidate, index) => {
                  const percentage = stats.totalVotes > 0
                    ? ((candidate.vote_count / stats.totalVotes) * 100).toFixed(2)
                    : 0;
                  return (
                    <tr key={candidate.id}>
                      <td>
                        <span className={`rank-badge ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td>{candidate.name}</td>
                      <td>{candidate.vote_count}</td>
                      <td>{percentage}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;








