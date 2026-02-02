import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CandidateForm.css';

const CandidateForm = ({ candidate, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    agenda: '',
    goals: '',
    short_term_plans: '',
    long_term_plans: '',
    profileImage: null
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        organization: candidate.organization || '',
        agenda: candidate.agenda || '',
        goals: candidate.goals || '',
        short_term_plans: candidate.short_term_plans || '',
        long_term_plans: candidate.long_term_plans || '',
        profileImage: null
      });
      setFiles(candidate.files || []);
    }
  }, [candidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, profileImage: e.target.files[0] }));
  };

  const handleDocumentUpload = async (e, candidateId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`/api/admin/candidates/${candidateId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('File uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'profileImage' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (formData.profileImage) {
      formDataToSend.append('profileImage', formData.profileImage);
    }

    try {
      if (candidate) {
        await axios.put(`/api/admin/candidates/${candidate.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Candidate updated successfully');
      } else {
        const response = await axios.post('/api/admin/candidates', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Candidate added successfully');
        
        // Upload documents if any files were selected
        const fileInputs = document.querySelectorAll('input[type="file"][data-candidate-file]');
        fileInputs.forEach(input => {
          if (input.files[0]) {
            handleDocumentUpload({ target: input }, response.data.id);
          }
        });
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content candidate-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{candidate ? 'Edit Candidate' : 'Add New Candidate'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Organization *</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group full-width">
              <label>Agenda</label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="input-group full-width">
              <label>Goals</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="input-group full-width">
              <label>Short Term Plans</label>
              <textarea
                name="short_term_plans"
                value={formData.short_term_plans}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="input-group full-width">
              <label>Long Term Plans</label>
              <textarea
                name="long_term_plans"
                value={formData.long_term_plans}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="input-group">
              <label>Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {!candidate && (
              <div className="input-group">
                <label>Upload Documents (PPT/PDF)</label>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  data-candidate-file
                />
              </div>
            )}

            {candidate && files.length > 0 && (
              <div className="input-group full-width">
                <label>Existing Documents</label>
                <div className="files-list">
                  {files.map(file => (
                    <a
                      key={file.id}
                      href={`http://localhost:5000${file.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      📄 {file.file_name}
                    </a>
                  ))}
                </div>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  onChange={(e) => handleDocumentUpload(e, candidate.id)}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : candidate ? 'Update' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateForm;








