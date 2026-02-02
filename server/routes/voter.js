const express = require('express');
const { getDb } = require('../config/database');
const { authenticateToken, requireVoter } = require('../middleware/auth');

const router = express.Router();
const db = getDb();

// All voter routes require authentication and voter role
router.use(authenticateToken);
router.use(requireVoter);

// Get all verified candidates for voter's organization
router.get('/candidates', (req, res) => {
  const organization = req.user.organization;

  db.all(
    `SELECT c.*, 
     (SELECT COUNT(*) FROM votes WHERE candidate_id = c.id) as vote_count
     FROM candidates c 
     WHERE c.organization = ? AND c.is_verified = 1
     ORDER BY c.name`,
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

// Save voter details before voting
router.post('/details', (req, res) => {
  const userId = req.user.id;
  const { name, dob, phone, aadhaar } = req.body;

  if (!name || !dob || !phone || !aadhaar) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    'INSERT OR REPLACE INTO voter_details (user_id, name, dob, phone, aadhaar) VALUES (?, ?, ?, ?, ?)',
    [userId, name, dob, phone, aadhaar],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Voter details saved successfully' });
    }
  );
});

// Check voter details status
router.get('/details-status', (req, res) => {
  const userId = req.user.id;

  db.get('SELECT * FROM voter_details WHERE user_id = ?', [userId], (err, details) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ hasDetails: !!details, details });
  });
});

// Check if voter has already voted
router.get('/vote-status', (req, res) => {
  const voterId = req.user.id;
  const organization = req.user.organization;

  db.get(
    'SELECT * FROM votes WHERE voter_id = ? AND organization = ?',
    [voterId, organization],
    (err, vote) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (vote) {
        // Get candidate details
        db.get('SELECT * FROM candidates WHERE id = ?', [vote.candidate_id], (err, candidate) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ hasVoted: true, vote, candidate });
        });
      } else {
        res.json({ hasVoted: false });
      }
    }
  );
});

// Submit vote (requires voter details to be saved first)
router.post('/vote', (req, res) => {
  const voterId = req.user.id;
  const organization = req.user.organization;
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({ error: 'Candidate ID is required' });
  }

  // Check if voter details are saved
  db.get('SELECT * FROM voter_details WHERE user_id = ?', [voterId], (err, details) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!details) {
      return res.status(400).json({ error: 'Please provide your details before voting' });
    }

    // Check if voter has already voted
    db.get(
      'SELECT * FROM votes WHERE voter_id = ? AND organization = ?',
      [voterId, organization],
      (err, existingVote) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingVote) {
          return res.status(400).json({ error: 'You have already voted' });
        }

        // Verify candidate belongs to same organization and is verified
        db.get(
          'SELECT * FROM candidates WHERE id = ? AND organization = ? AND is_verified = 1',
          [candidateId, organization],
          (err, candidate) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            if (!candidate) {
              return res.status(404).json({ error: 'Candidate not found or not verified' });
            }

            // Record the vote
            db.run(
              'INSERT INTO votes (voter_id, candidate_id, organization) VALUES (?, ?, ?)',
              [voterId, candidateId, organization],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Database error' });
                }

                res.json({ message: 'Vote submitted successfully', voteId: this.lastID });
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;





