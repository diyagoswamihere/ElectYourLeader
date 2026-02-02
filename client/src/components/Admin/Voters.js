import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Voters.css';

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [votersWhoVoted, setVotersWhoVoted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'voted'
  const [newVoter, setNewVoter] = useState({
    voterId: '',
    password: '',
    name: '',
    organization: ''
  });

  useEffect(() => {
    fetchVoters();
    fetchVotersWhoVoted();
  }, []);

  const fetchVoters = async () => {
    try {
      const response = await axios.get('/api/admin/voters');
      setVoters(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch voters');
    } finally {
      setLoading(false);
    }
  };

  const fetchVotersWhoVoted = async () => {
    try {
      const response = await axios.get('/api/admin/voters/voted');
      setVotersWhoVoted(response.data);
    } catch (err) {
      console.error('Failed to fetch voters who voted:', err);
    }
  };

  const handleVerify = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await axios.put(`/api/admin/voters/${id}/unverify`);
      } else {
        await axios.put(`/api/admin/voters/${id}/verify`);
      }
      fetchVoters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update voter status');
    }
  };

  const handleAddVoter = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/auth/register/voter', newVoter);
      setShowAddForm(false);
      setNewVoter({ voterId: '', password: '', name: '', organization: '' });
      fetchVoters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add voter');
    }
  };

  if (loading) {
    return <div className="loading">Loading voters...</div>;
  }

  return (
    <div className="voters-page">
      <div className="page-header">
        <h1>Voters Management</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          + Add Voter
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Voters
        </button>
        <button
          className={`tab-btn ${activeTab === 'voted' ? 'active' : ''}`}
          onClick={() => setActiveTab('voted')}
        >
          Voters Who Voted ({votersWhoVoted.length})
        </button>
      </div>

      {showAddForm && (
        <div className="card add-voter-form">
          <h2>Add New Voter</h2>
          <form onSubmit={handleAddVoter}>
            <div className="form-grid">
              <div className="input-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newVoter.name}
                  onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Voter ID *</label>
                <input
                  type="text"
                  value={newVoter.voterId}
                  onChange={(e) => setNewVoter({ ...newVoter, voterId: e.target.value })}
                  required
                  placeholder="Enter voter ID (email)"
                />
              </div>
              <div className="input-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newVoter.password}
                  onChange={(e) => setNewVoter({ ...newVoter, password: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Organization *</label>
                <input
                  type="text"
                  value={newVoter.organization}
                  onChange={(e) => setNewVoter({ ...newVoter, organization: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Voter
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'all' ? (
        <>
          <div className="voters-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Voter ID</th>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Has Voted</th>
                  <th>Registered</th>
                  <th>Actions</th>
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
                    <td>
                      <button
                        onClick={() => handleVerify(voter.id, voter.is_verified)}
                        className={`btn ${voter.is_verified ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        {voter.is_verified ? 'Unverify' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {voters.length === 0 && (
            <div className="empty-state">
              <p>No voters registered yet. Click "Add Voter" to get started.</p>
            </div>
          )}
        </>
      ) : (
        <div className="voters-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Voter Name</th>
                <th>Voter ID</th>
                <th>DOB</th>
                <th>Phone</th>
                <th>Aadhaar</th>
                <th>Candidate Voted For</th>
                <th>Voted At</th>
              </tr>
            </thead>
            <tbody>
              {votersWhoVoted.map((voter) => (
                <tr key={voter.id}>
                  <td>{voter.voter_name || voter.voter_id_name}</td>
                  <td>{voter.voter_id}</td>
                  <td>{voter.dob ? new Date(voter.dob).toLocaleDateString() : '-'}</td>
                  <td>{voter.phone || '-'}</td>
                  <td>{voter.aadhaar || '-'}</td>
                  <td>{voter.candidate_name}</td>
                  <td>{new Date(voter.voted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {votersWhoVoted.length === 0 && (
            <div className="empty-state">
              <p>No voters have voted yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Voters;





