const express = require('express');
const multer = require('multer');
const path = require('path');
const fsSync = require('fs');
const { getDb } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const db = getDb();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'candidates');
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|ppt|pptx|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PPT, PPTX, DOC, DOCX files are allowed'));
    }
  }
});

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard stats
router.get('/dashboard', (req, res) => {
  const organization = req.user.organization;

  // Get total candidates
  db.get('SELECT COUNT(*) as total FROM candidates WHERE organization = ?', [organization], (err, candidatesResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total voters
    db.get('SELECT COUNT(*) as total FROM users WHERE organization = ? AND role = ?', [organization, 'voter'], (err, votersResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get total votes
      db.get('SELECT COUNT(*) as total FROM votes WHERE organization = ?', [organization], (err, votesResult) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Get voting statistics by candidate
        db.all(`
          SELECT 
            c.id,
            c.name,
            COUNT(v.id) as vote_count
          FROM candidates c
          LEFT JOIN votes v ON c.id = v.candidate_id
          WHERE c.organization = ?
          GROUP BY c.id, c.name
          ORDER BY vote_count DESC
        `, [organization], (err, stats) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            totalCandidates: candidatesResult.total,
            totalVoters: votersResult.total,
            totalVotes: votesResult.total,
            candidateStats: stats
          });
        });
      });
    });
  });
});

// Get all voters for verification
router.get('/voters', (req, res) => {
  const organization = req.user.organization;

  db.all(
    `SELECT u.id, u.email, u.name, u.organization, u.is_verified, u.created_at,
     vd.name as voter_name, vd.dob, vd.phone, vd.aadhaar,
     CASE WHEN v.id IS NOT NULL THEN 1 ELSE 0 END as has_voted
     FROM users u
     LEFT JOIN voter_details vd ON u.id = vd.user_id
     LEFT JOIN votes v ON u.id = v.voter_id AND u.organization = v.organization
     WHERE u.organization = ? AND u.role = ?
     ORDER BY u.created_at DESC`,
    [organization, 'voter'],
    (err, voters) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(voters);
    }
  );
});

// Get list of voters who have voted
router.get('/voters/voted', (req, res) => {
  const organization = req.user.organization;

  db.all(
    `SELECT u.id, u.email, u.name as voter_id_name, u.organization,
     vd.name as voter_name, vd.dob, vd.phone, vd.aadhaar,
     c.name as candidate_name,
     v.voted_at
     FROM votes v
     JOIN users u ON v.voter_id = u.id
     LEFT JOIN voter_details vd ON u.id = vd.user_id
     JOIN candidates c ON v.candidate_id = c.id
     WHERE v.organization = ?
     ORDER BY v.voted_at DESC`,
    [organization],
    (err, voters) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(voters);
    }
  );
});

// Verify a voter
router.put('/voters/:id/verify', (req, res) => {
  const voterId = req.params.id;
  const organization = req.user.organization;

  db.run(
    'UPDATE users SET is_verified = 1 WHERE id = ? AND organization = ? AND role = ?',
    [voterId, organization, 'voter'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Voter not found' });
      }
      res.json({ message: 'Voter verified successfully' });
    }
  );
});

// Unverify a voter
router.put('/voters/:id/unverify', (req, res) => {
  const voterId = req.params.id;
  const organization = req.user.organization;

  db.run(
    'UPDATE users SET is_verified = 0 WHERE id = ? AND organization = ? AND role = ?',
    [voterId, organization, 'voter'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Voter not found' });
      }
      res.json({ message: 'Voter unverified successfully' });
    }
  );
});

// Get all candidates
router.get('/candidates', (req, res) => {
  const organization = req.user.organization;

  db.all(
    `SELECT c.*, 
     (SELECT COUNT(*) FROM votes WHERE candidate_id = c.id) as vote_count
     FROM candidates c 
     WHERE c.organization = ? 
     ORDER BY c.created_at DESC`,
    [organization],
    (err, candidates) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get files for each candidate
      const candidatesWithFiles = candidates.map(candidate => {
        return new Promise((resolve) => {
          db.all(
            'SELECT id, file_name, file_path, file_type FROM candidate_files WHERE candidate_id = ?',
            [candidate.id],
            (err, files) => {
              if (err) {
                resolve({ ...candidate, files: [] });
              } else {
                resolve({ ...candidate, files });
              }
            }
          );
        });
      });

      Promise.all(candidatesWithFiles).then(results => {
        res.json(results);
      });
    }
  );
});

// Add a new candidate
router.post('/candidates', upload.single('profileImage'), (req, res) => {
  const {
    name,
    email,
    phone,
    organization,
    agenda,
    goals,
    short_term_plans,
    long_term_plans
  } = req.body;

  if (!name || !organization) {
    return res.status(400).json({ error: 'Name and organization are required' });
  }

  const profileImage = req.file ? `/uploads/candidates/${req.file.filename}` : null;

  db.run(
    `INSERT INTO candidates (name, email, phone, organization, agenda, goals, short_term_plans, long_term_plans, profile_image, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, organization, agenda, goals, short_term_plans, long_term_plans, profileImage, 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Candidate added successfully', id: this.lastID });
    }
  );
});

// Upload file for candidate
router.post('/candidates/:id/files', upload.single('file'), (req, res) => {
  const candidateId = req.params.id;
  const organization = req.user.organization;

  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  // Verify candidate belongs to admin's organization
  db.get('SELECT id FROM candidates WHERE id = ? AND organization = ?', [candidateId, organization], (err, candidate) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    db.run(
      `INSERT INTO candidate_files (candidate_id, file_name, file_path, file_type)
       VALUES (?, ?, ?, ?)`,
      [candidateId, req.file.originalname, `/uploads/candidates/${req.file.filename}`, req.file.mimetype],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ message: 'File uploaded successfully', id: this.lastID });
      }
    );
  });
});

// Update candidate
router.put('/candidates/:id', upload.single('profileImage'), (req, res) => {
  const candidateId = req.params.id;
  const organization = req.user.organization;
  const {
    name,
    email,
    phone,
    agenda,
    goals,
    short_term_plans,
    long_term_plans
  } = req.body;

  // Verify candidate belongs to admin's organization
  db.get('SELECT * FROM candidates WHERE id = ? AND organization = ?', [candidateId, organization], (err, candidate) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const profileImage = req.file ? `/uploads/candidates/${req.file.filename}` : candidate.profile_image;

    db.run(
      `UPDATE candidates 
       SET name = ?, email = ?, phone = ?, agenda = ?, goals = ?, short_term_plans = ?, long_term_plans = ?, profile_image = ?
       WHERE id = ? AND organization = ?`,
      [name, email, phone, agenda, goals, short_term_plans, long_term_plans, profileImage, candidateId, organization],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ message: 'Candidate updated successfully' });
      }
    );
  });
});

// Verify a candidate
router.put('/candidates/:id/verify', (req, res) => {
  const candidateId = req.params.id;
  const organization = req.user.organization;

  db.run(
    'UPDATE candidates SET is_verified = 1 WHERE id = ? AND organization = ?',
    [candidateId, organization],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      res.json({ message: 'Candidate verified successfully' });
    }
  );
});

// Delete a candidate
router.delete('/candidates/:id', (req, res) => {
  const candidateId = req.params.id;
  const organization = req.user.organization;

  db.run(
    'DELETE FROM candidates WHERE id = ? AND organization = ?',
    [candidateId, organization],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      res.json({ message: 'Candidate deleted successfully' });
    }
  );
});

module.exports = router;

