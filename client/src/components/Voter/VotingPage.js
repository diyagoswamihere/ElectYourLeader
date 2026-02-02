import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './VotingPage.css';

const VotingPage = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteStatus, setVoteStatus] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [voterDetails, setVoterDetails] = useState({
    name: '',
    dob: '',
    phone: '',
    aadhaar: ''
  });

  useEffect(() => {
    fetchCandidates();
    checkVoteStatus();
    checkDetailsStatus();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/voter/candidates');
      setCandidates(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const response = await axios.get('/api/voter/vote-status');
      setVoteStatus(response.data);
    } catch (err) {
      console.error('Failed to check vote status:', err);
    }
  };

  const checkDetailsStatus = async () => {
    try {
      const response = await axios.get('/api/voter/details-status');
      setDetailsStatus(response.data);
      if (!response.data.hasDetails) {
        setShowDetailsForm(true);
      }
    } catch (err) {
      console.error('Failed to check details status:', err);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/voter/details', voterDetails);
      setSuccess('Details saved successfully!');
      setShowDetailsForm(false);
      checkDetailsStatus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save details');
    }
  };

  const handleSelectCandidate = (candidate) => {
    if (voteStatus?.hasVoted) {
      setError('You have already voted');
      return;
    }
    setSelectedCandidate(candidate);
    setShowConfirmModal(true);
    setError('');
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;

    try {
      await axios.post('/api/voter/vote', { candidateId: selectedCandidate.id });
      setSuccess('Your vote has been submitted successfully!');
      setShowConfirmModal(false);
      setSelectedCandidate(null);
      checkVoteStatus();
      fetchCandidates();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit vote');
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading candidates...</div>;
  }

  return (
    <div className="voting-page">
      <div className="voting-header">
        <h1>Cast Your Vote</h1>
        <p>Organization: {user?.organization}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showDetailsForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Provide Your Details</h2>
            <p>Please provide your details before voting:</p>
            <form onSubmit={handleSaveDetails}>
              <div className="input-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={voterDetails.name}
                  onChange={(e) => setVoterDetails({ ...voterDetails, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  value={voterDetails.dob}
                  onChange={(e) => setVoterDetails({ ...voterDetails, dob: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={voterDetails.phone}
                  onChange={(e) => setVoterDetails({ ...voterDetails, phone: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Aadhaar Number *</label>
                <input
                  type="text"
                  value={voterDetails.aadhaar}
                  onChange={(e) => setVoterDetails({ ...voterDetails, aadhaar: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Details</button>
            </form>
          </div>
        </div>
      )}

      {voteStatus?.hasVoted ? (
        <div className="already-voted">
          <div className="card">
            <h2>✅ You have already voted!</h2>
            <p>You voted for: <strong>{voteStatus.candidate?.name}</strong></p>
            <p>Voted on: {new Date(voteStatus.vote.voted_at).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <>
          {candidates.length === 0 ? (
            <div className="empty-state">
              <p>No candidates available for voting at this time.</p>
            </div>
          ) : (
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="candidate-card-voter">
                  {candidate.profile_image && (
                    <div className="candidate-image-voter">
                      <img
                        src={`http://localhost:5000${candidate.profile_image}`}
                        alt={candidate.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  <div className="candidate-info-voter">
                    <h3>{candidate.name}</h3>
                    {candidate.email && <p>📧 {candidate.email}</p>}
                    {candidate.phone && <p>📞 {candidate.phone}</p>}
                    
                    {candidate.agenda && (
                      <div className="candidate-section">
                        <h4>Agenda</h4>
                        <p>{candidate.agenda}</p>
                      </div>
                    )}

                    {candidate.goals && (
                      <div className="candidate-section">
                        <h4>Goals</h4>
                        <p>{candidate.goals}</p>
                      </div>
                    )}

                    {candidate.short_term_plans && (
                      <div className="candidate-section">
                        <h4>Short Term Plans</h4>
                        <p>{candidate.short_term_plans}</p>
                      </div>
                    )}

                    {candidate.long_term_plans && (
                      <div className="candidate-section">
                        <h4>Long Term Plans</h4>
                        <p>{candidate.long_term_plans}</p>
                      </div>
                    )}

                    {candidate.files && candidate.files.length > 0 && (
                      <div className="candidate-section">
                        <h4>Documents</h4>
                        <div className="files-list-voter">
                          {candidate.files.map((file) => (
                            <a
                              key={file.id}
                              href={`http://localhost:5000${file.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-link-voter"
                            >
                              📄 {file.file_name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="vote-count-voter">
                      <span>🗳️ {candidate.vote_count || 0} votes</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectCandidate(candidate)}
                    className="btn btn-primary vote-btn"
                  >
                    Vote for {candidate.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Your Vote</h2>
            <p>You are about to vote for:</p>
            <div className="confirm-candidate">
              <h3>{selectedCandidate?.name}</h3>
              {selectedCandidate?.organization && <p>{selectedCandidate.organization}</p>}
            </div>
            <p className="confirm-warning">⚠️ This action cannot be undone. Are you sure?</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVote}
                className="btn btn-primary"
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;





