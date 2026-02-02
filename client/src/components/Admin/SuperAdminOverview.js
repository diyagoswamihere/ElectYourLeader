import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const SuperAdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, orgsRes, candidatesRes, votersRes, votesRes] = await Promise.all([
        axios.get('/api/superadmin/dashboard'),
        axios.get('/api/superadmin/organizations'),
        axios.get('/api/superadmin/candidates'),
        axios.get('/api/superadmin/voters'),
        axios.get('/api/superadmin/votes')
      ]);

      setStats(statsRes.data);
      setOrganizations(orgsRes.data);
      setCandidates(candidatesRes.data);
      setVoters(votersRes.data);
      setVotes(votesRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Super Admin Overview</h1>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`tab-btn ${activeTab === 'organizations' ? 'active' : ''}`}
          onClick={() => setActiveTab('organizations')}
        >
          Organizations ({organizations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidates ({candidates.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'voters' ? 'active' : ''}`}
          onClick={() => setActiveTab('voters')}
        >
          Voters ({voters.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'votes' ? 'active' : ''}`}
          onClick={() => setActiveTab('votes')}
        >
          Votes ({votes.length})
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Organizations</h3>
            <p className="stat-number">{stats.totalOrganizations}</p>
          </div>
          <div className="stat-card">
            <h3>Total Admins</h3>
            <p className="stat-number">{stats.totalAdmins}</p>
          </div>
          <div className="stat-card">
            <h3>Total Voters</h3>
            <p className="stat-number">{stats.totalVoters}</p>
          </div>
          <div className="stat-card">
            <h3>Total Candidates</h3>
            <p className="stat-number">{stats.totalCandidates}</p>
          </div>
          <div className="stat-card">
            <h3>Total Votes</h3>
            <p className="stat-number">{stats.totalVotes}</p>
          </div>
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Admin</th>
                <th>Voters</th>
                <th>Candidates</th>
                <th>Votes</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td>{org.name}</td>
                  <td>{org.org_type}</td>
                  <td>{[org.city, org.state, org.country].filter(Boolean).join(', ') || '-'}</td>
                  <td>{org.admin_name} ({org.admin_email})</td>
                  <td>{org.voter_count}</td>
                  <td>{org.candidate_count}</td>
                  <td>{org.vote_count}</td>
                  <td>{new Date(org.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Votes</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.organization}</td>
                  <td>{candidate.email || '-'}</td>
                  <td>{candidate.phone || '-'}</td>
                  <td>{candidate.vote_count || 0}</td>
                  <td>
                    <span className={`badge ${candidate.is_verified ? 'badge-success' : 'badge-warning'}`}>
                      {candidate.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(candidate.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'voters' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Voter Name</th>
                <th>Voter ID</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Has Voted</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((voter) => (
                <tr key={voter.id}>
                  <td>{voter.voter_name || voter.name}</td>
                  <td>{voter.email}</td>
                  <td>{voter.organization}</td>
                  <td>
                    <span className={`badge ${voter.is_verified ? 'badge-success' : 'badge-warning'}`}>
                      {voter.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${voter.has_voted ? 'badge-success' : 'badge-danger'}`}>
                      {voter.has_voted ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{new Date(voter.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'votes' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Voter Name</th>
                <th>Voter ID</th>
                <th>Organization</th>
                <th>Candidate</th>
                <th>Voted At</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote) => (
                <tr key={vote.id}>
                  <td>{vote.voter_name || vote.voter_id_name}</td>
                  <td>{vote.voter_id}</td>
                  <td>{vote.organization}</td>
                  <td>{vote.candidate_name}</td>
                  <td>{new Date(vote.voted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuperAdminOverview;

