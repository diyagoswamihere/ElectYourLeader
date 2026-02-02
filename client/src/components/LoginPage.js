import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [activeBox, setActiveBox] = useState(null); // 'super_admin' | 'admin' | 'voter' | null
  const [showRegister, setShowRegister] = useState(false);
  const [infoModal, setInfoModal] = useState(null);

  // Super Admin state
  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [superAdminPassword, setSuperAdminPassword] = useState('');

  // Admin state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRegisterData, setAdminRegisterData] = useState({
    name: '',
    age: '',
    orgType: '',
    organizationName: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    aadhaar: '',
    email: '',
    password: ''
  });

  // Voter state
  const [voterId, setVoterId] = useState('');
  const [voterPassword, setVoterPassword] = useState('');
  const [voterOrganization, setVoterOrganization] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuperAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(superAdminEmail, superAdminPassword, 'super_admin');
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(adminEmail, adminPassword, 'admin');
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminRegisterData)
      });

      const data = await response.json();
      if (response.ok) {
        setError('');
        alert('Registration successful! You can now login.');
        setShowRegister(false);
        setAdminRegisterData({
          name: '', age: '', orgType: '', organizationName: '', city: '', state: '', country: '',
          phone: '', aadhaar: '', email: '', password: ''
        });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleVoterLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(voterId, voterPassword, 'voter', voterOrganization);
    if (result.success) {
      navigate('/voter/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* Background images removed */}


      <h1 className="login-title">ElectYourLeader</h1>
      <div className="login-tagline">Your Voice, Your Choice, Your Future</div>

      <div className="login-boxes-container">
        {/* Super Admin Box */}
        <div className={`login-box ${activeBox === 'super_admin' ? 'active' : ''}`}>
          <div className="box-header">
            <h2>Super Admin</h2>
          </div>
          <form onSubmit={handleSuperAdminLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={superAdminEmail}
                onChange={(e) => setSuperAdminEmail(e.target.value)}
                onClick={() => setActiveBox('super_admin')}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={superAdminPassword}
                onChange={(e) => setSuperAdminPassword(e.target.value)}
                onClick={() => setActiveBox('super_admin')}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Admin Box */}
        <div className={`login-box ${activeBox === 'admin' ? 'active' : ''}`}>
          <div className="box-header">
            <h2>Admin</h2>
          </div>
          {!showRegister ? (
            <>
              <form onSubmit={handleAdminLogin}>
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    onClick={() => setActiveBox('admin')}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onClick={() => setActiveBox('admin')}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              <button
                type="button"
                className="btn btn-secondary register-link"
                onClick={() => setShowRegister(true)}
              >
                New Admin? Register Here
              </button>
            </>
          ) : (
            <form onSubmit={handleAdminRegister} className="register-form">
              <div className="input-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={adminRegisterData.name}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Age *</label>
                <input
                  type="number"
                  value={adminRegisterData.age}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, age: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Organization Type *</label>
                <select
                  value={adminRegisterData.orgType}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, orgType: e.target.value })}
                  required
                >
                  <option value="">Select type</option>
                  <option value="school">School</option>
                  <option value="society">Society</option>
                  <option value="locality">Locality</option>
                  <option value="city">City</option>
                  <option value="state">State</option>
                  <option value="country">Country</option>
                </select>
              </div>
              <div className="input-group">
                <label>Organization Name *</label>
                <input
                  type="text"
                  value={adminRegisterData.organizationName}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, organizationName: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>City</label>
                <input
                  type="text"
                  value={adminRegisterData.city}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, city: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>State</label>
                <input
                  type="text"
                  value={adminRegisterData.state}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, state: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Country</label>
                <input
                  type="text"
                  value={adminRegisterData.country}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, country: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={adminRegisterData.phone}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Aadhaar Number *</label>
                <input
                  type="text"
                  value={adminRegisterData.aadhaar}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, aadhaar: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Admin Email *</label>
                <input
                  type="email"
                  value={adminRegisterData.email}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={adminRegisterData.password}
                  onChange={(e) => setAdminRegisterData({ ...adminRegisterData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRegister(false);
                    setError('');
                  }}
                >
                  Back to Login
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Voter Box */}
        <div className={`login-box ${activeBox === 'voter' ? 'active' : ''}`}>
          <div className="box-header">
            <h2>Voter</h2>
          </div>
          <form onSubmit={handleVoterLogin}>
            <div className="input-group">
              <label>Voter ID</label>
              <input
                type="text"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                onClick={() => setActiveBox('voter')}
                required
                placeholder="Enter your voter ID"
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={voterPassword}
                onChange={(e) => setVoterPassword(e.target.value)}
                onClick={() => setActiveBox('voter')}
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="input-group">
              <label>Organization Name</label>
              <input
                type="text"
                value={voterOrganization}
                onChange={(e) => setVoterOrganization(e.target.value)}
                onClick={() => setActiveBox('voter')}
                required
                placeholder="Enter organization name"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-error login-error">{error}</div>}

      <div className="know-buttons-container">
        <button type="button" className="btn btn-secondary fun-btn" onClick={() => setInfoModal('rights')}>
          Know Your Rights
        </button>
        <button type="button" className="btn btn-secondary fun-btn" onClick={() => setInfoModal('duties')}>
          Know Your Duties
        </button>
      </div>

      {infoModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setInfoModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{infoModal === 'rights' ? 'Know Your Rights' : 'Know Your Duties'}</h2>
              <button className="close-btn" onClick={() => setInfoModal(null)} aria-label="Close">
                ×
              </button>
            </div>
            {infoModal === 'rights' ? (
              <div className="info-content">
                <p><strong>The Right to a Secret Ballot:</strong> Your vote is yours alone. No one has the right to see how you voted or pressure you to disclose your choice.</p>
                <p><strong>The Right to Equal Voice:</strong> Whether you are a student, a resident, or a citizen, your single vote carries the same weight as everyone else's.</p>
                <p><strong>The Right to Information:</strong> You have the right to know the platform, background, and promises of every candidate before casting your vote.</p>
                <p><strong>The Right to a Fair Process:</strong> You are entitled to a voting system that is transparent, free from tampering, and inclusive of all eligible members.</p>
              </div>
            ) : (
              <div className="info-content">
                <p><strong>The Duty to be Informed:</strong> It is your responsibility to research the candidates. Don't vote based on popularity; vote based on who can actually do the job.</p>
                <p><strong>The Duty of Integrity:</strong> Never trade your vote for personal favors, gifts, or peer pressure. Your vote should represent your honest belief in what is best for the group.</p>
                <p><strong>The Duty to Participate:</strong> Democracy only works when people show up. By not voting, you allow others to make decisions that will affect your daily life.</p>
                <p><strong>The Duty to Respect the Outcome:</strong> Once a fair election is over, your duty is to respect the collective decision and work constructively with the elected leader.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
