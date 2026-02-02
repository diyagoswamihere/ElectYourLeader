const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const { authenticateToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const db = getDb();

// Admin Login
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'admin'], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organization: user.organization },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      }
    });
  });
});

// Super Admin Login
router.post('/super-admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'super_admin'], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organization: user.organization },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      }
    });
  });
});

// Voter Login (requires organization name)
router.post('/voter/login', (req, res) => {
  const { voterId, password, organization } = req.body;

  if (!voterId || !password || !organization) {
    return res.status(400).json({ error: 'Voter ID, password, and organization are required' });
  }

  db.get('SELECT * FROM users WHERE email = ? AND role = ? AND organization = ?', [voterId, 'voter', organization], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or organization mismatch' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Your account is not verified yet. Please wait for admin approval.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organization: user.organization },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      }
    });
  });
});

// Admin Registration
router.post('/admin/register', (req, res) => {
  const {
    name,
    age,
    orgType,
    organizationName,
    city,
    state,
    country,
    phone,
    aadhaar,
    email,
    password
  } = req.body;

  if (!name || !age || !orgType || !organizationName || !phone || !aadhaar || !email || !password) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  if (!['school', 'society', 'locality', 'city', 'state', 'country'].includes(orgType)) {
    return res.status(400).json({ error: 'Invalid organization type' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      'INSERT INTO users (email, password, name, role, organization, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, 'admin', organizationName, 1],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const userId = this.lastID;

        db.run(
          'INSERT INTO admin_details (user_id, age, phone, aadhaar, organization_name) VALUES (?, ?, ?, ?, ?)',
          [userId, age, phone, aadhaar, organizationName],
          (detailErr) => {
            if (detailErr) {
              db.run('ROLLBACK');
              if (detailErr.message.includes('UNIQUE constraint')) {
                return res.status(400).json({ error: 'Aadhaar number already exists' });
              }
              return res.status(500).json({ error: 'Database error' });
            }

            db.run(
              'INSERT INTO organizations (name, admin_id, org_type, city, state, country) VALUES (?, ?, ?, ?, ?, ?)',
              [organizationName, userId, orgType, city || null, state || null, country || null],
              (orgErr) => {
                if (orgErr) {
                  db.run('ROLLBACK');
                  if (orgErr.message.includes('UNIQUE constraint')) {
                    return res.status(400).json({ error: 'Organization name already exists' });
                  }
                  return res.status(500).json({ error: 'Database error' });
                }

                db.run('COMMIT');
                res.json({ message: 'Admin registered successfully', id: userId });
              }
            );
          }
        );
      }
    );
  });
});

// Register Voter (for admin to add voters)
router.post('/register/voter', authenticateToken, requireAdmin, (req, res) => {
  const { voterId, password, name, organization } = req.body;

  if (!voterId || !password || !name || !organization) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Verify admin owns this organization
  if (req.user.organization !== organization && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'You can only register voters for your own organization' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (email, password, name, role, organization, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
    [voterId, hashedPassword, name, 'voter', organization, 0],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Voter ID already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Voter registered successfully. Waiting for admin approval.', id: this.lastID });
    }
  );
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name, role, organization, is_verified FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

module.exports = router;

