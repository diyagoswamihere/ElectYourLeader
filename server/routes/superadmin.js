const express = require('express');
const { getDb } = require('../config/database');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();
const db = getDb();

// All super admin routes require authentication and super_admin role
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Get all organizations
router.get('/organizations', (req, res) => {
  db.all(
    `SELECT o.*, u.name as admin_name, u.email as admin_email,
     (SELECT COUNT(*) FROM users WHERE organization = o.name AND role = 'voter') as voter_count,
     (SELECT COUNT(*) FROM candidates WHERE organization = o.name) as candidate_count,
     (SELECT COUNT(*) FROM votes WHERE organization = o.name) as vote_count
     FROM organizations o
     LEFT JOIN users u ON o.admin_id = u.id
     ORDER BY o.created_at DESC`,
    (err, organizations) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(organizations);
    }
  );
});

// Get all candidates across all organizations
router.get('/candidates', (req, res) => {
  db.all(
    `SELECT c.*, 
     (SELECT COUNT(*) FROM votes WHERE candidate_id = c.id) as vote_count
     FROM candidates c
     ORDER BY c.created_at DESC`,
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

// Get all voters across all organizations
router.get('/voters', (req, res) => {
  db.all(
    `SELECT u.id, u.email, u.name, u.organization, u.is_verified, u.created_at,
     vd.name as voter_name, vd.dob, vd.phone, vd.aadhaar,
     CASE WHEN v.id IS NOT NULL THEN 1 ELSE 0 END as has_voted
     FROM users u
     LEFT JOIN voter_details vd ON u.id = vd.user_id
     LEFT JOIN votes v ON u.id = v.voter_id AND u.organization = v.organization
     WHERE u.role = ?
     ORDER BY u.created_at DESC`,
    ['voter'],
    (err, voters) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(voters);
    }
  );
});

// Get all votes across all organizations
router.get('/votes', (req, res) => {
  db.all(
    `SELECT v.id, v.voted_at, v.organization,
     u.email as voter_id, u.name as voter_id_name,
     vd.name as voter_name, vd.dob, vd.phone, vd.aadhaar,
     c.name as candidate_name, c.organization as candidate_org
     FROM votes v
     JOIN users u ON v.voter_id = u.id
     LEFT JOIN voter_details vd ON u.id = vd.user_id
     JOIN candidates c ON v.candidate_id = c.id
     ORDER BY v.voted_at DESC`,
    (err, votes) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(votes);
    }
  );
});

// Get dashboard statistics
router.get('/dashboard', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM organizations', (err, orgResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.get('SELECT COUNT(*) as total FROM users WHERE role = ?', ['admin'], (err, adminResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      db.get('SELECT COUNT(*) as total FROM users WHERE role = ?', ['voter'], (err, voterResult) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        db.get('SELECT COUNT(*) as total FROM candidates', (err, candidateResult) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          db.get('SELECT COUNT(*) as total FROM votes', (err, voteResult) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            res.json({
              totalOrganizations: orgResult.total,
              totalAdmins: adminResult.total,
              totalVoters: voterResult.total,
              totalCandidates: candidateResult.total,
              totalVotes: voteResult.total
            });
          });
        });
      });
    });
  });
});

module.exports = router;

