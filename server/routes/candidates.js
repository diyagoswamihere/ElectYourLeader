const express = require('express');
const { getDb } = require('../config/database');

const router = express.Router();
const db = getDb();

// Public route to get verified candidates (for display purposes)
router.get('/public/:organization', (req, res) => {
  const organization = req.params.organization;

  db.all(
    `SELECT c.*, 
     (SELECT COUNT(*) FROM votes WHERE candidate_id = c.id) as vote_count
     FROM candidates c 
     WHERE c.organization = ? AND c.is_verified = 1
     ORDER BY vote_count DESC, c.name`,
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

module.exports = router;








