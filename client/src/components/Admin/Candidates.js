import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CandidateForm from './CandidateForm';
import './Candidates.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/admin/candidates');
      setCandidates(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCandidate(null);
    setShowForm(true);
  };

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/candidates/${id}`);
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete candidate');
    }
  };

  const handleVerify = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await axios.put(`/api/admin/candidates/${id}/unverify`);
      } else {
        await axios.put(`/api/admin/candidates/${id}/verify`);
      }
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update candidate status');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCandidate(null);
    fetchCandidates();
  };

  if (loading) {
    return <div className="loading">Loading candidates...</div>;
  }

  return (
    <div className="candidates-page">
      <div className="page-header">
        <h1>Candidates Management</h1>
        <button onClick={handleAdd} className="btn btn-primary">
          + Add Candidate
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <CandidateForm
          candidate={editingCandidate}
          onClose={handleFormClose}
        />
      )}

      <div className="candidates-grid">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            {candidate.profile_image && (
              <div className="candidate-image">
                <img
                  src={`http://localhost:5000${candidate.profile_image}`}
                  alt={candidate.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                  }}
                />
              </div>
            )}
            <div className="candidate-info">
              <h3>{candidate.name}</h3>
              <p className="candidate-org">{candidate.organization}</p>
              {candidate.email && <p>📧 {candidate.email}</p>}
              {candidate.phone && <p>📞 {candidate.phone}</p>}
              <div className="candidate-stats">
                <span className="vote-count">🗳️ {candidate.vote_count || 0} votes</span>
                <span className={`badge ${candidate.is_verified ? 'badge-success' : 'badge-warning'}`}>
                  {candidate.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              {candidate.agenda && (
                <div className="candidate-details">
                  <p><strong>Agenda:</strong> {candidate.agenda.substring(0, 100)}...</p>
                </div>
              )}
            </div>
            <div className="candidate-actions">
              <button
                onClick={() => handleVerify(candidate.id, candidate.is_verified)}
                className={`btn ${candidate.is_verified ? 'btn-secondary' : 'btn-primary'}`}
              >
                {candidate.is_verified ? 'Unverify' : 'Verify'}
              </button>
              <button
                onClick={() => handleEdit(candidate)}
                className="btn btn-secondary"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(candidate.id)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="empty-state">
          <p>No candidates added yet. Click "Add Candidate" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Candidates;








