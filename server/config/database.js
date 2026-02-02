const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  // Users table (for both admins and voters)
  db.serialize(() => {
    // Migrate users table if older CHECK constraint doesn't include super_admin
    db.get(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='users'",
      (err, row) => {
        if (err) {
          console.error('Error reading users table schema:', err);
          return;
        }

        const hasUsersTable = !!row?.sql;
        const supportsSuperAdmin = hasUsersTable && row.sql.includes("'super_admin'");

        const afterUsersReady = () => {
          // Organizations table with enhanced fields
          db.run(`CREATE TABLE IF NOT EXISTS organizations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            admin_id INTEGER,
            org_type TEXT CHECK(org_type IN ('school', 'society', 'locality', 'city', 'state', 'country')),
            city TEXT,
            state TEXT,
            country TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id)
          )`);

          // Admin details table
          db.run(`CREATE TABLE IF NOT EXISTS admin_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            age INTEGER,
            phone TEXT,
            aadhaar TEXT UNIQUE,
            organization_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`);

          // Voter details table
          db.run(`CREATE TABLE IF NOT EXISTS voter_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            name TEXT NOT NULL,
            dob DATE NOT NULL,
            phone TEXT,
            aadhaar TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`);

          // Candidates table
          db.run(`CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            organization TEXT NOT NULL,
            agenda TEXT,
            goals TEXT,
            short_term_plans TEXT,
            long_term_plans TEXT,
            profile_image TEXT,
            is_verified INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Candidate files table
          db.run(`CREATE TABLE IF NOT EXISTS candidate_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
          )`);

          // Votes table
          db.run(`CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            voter_id INTEGER NOT NULL,
            candidate_id INTEGER NOT NULL,
            organization TEXT NOT NULL,
            voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (voter_id) REFERENCES users(id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(id),
            UNIQUE(voter_id, organization)
          )`);

          // Create default super admin with specified credentials
          const superAdminEmail = 'super12dia@gmail.com';
          const superAdminPlainPassword = 'super12345';
          const superAdminPassword = bcrypt.hashSync(superAdminPlainPassword, 10);

          db.run(
            `INSERT OR IGNORE INTO users (email, password, name, role, organization, is_verified) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [superAdminEmail, superAdminPassword, 'Super Admin', 'super_admin', null, 1],
            (insertErr) => {
              if (insertErr) {
                console.error('Error creating super admin:', insertErr);
              } else {
                console.log('Database initialized successfully');
              }
            }
          );
        };

        if (hasUsersTable && !supportsSuperAdmin) {
          db.run('PRAGMA foreign_keys=off');
          db.run('DROP TABLE IF EXISTS users_new', (dropErr) => {
            if (dropErr) {
              console.error('Error preparing migration (drop users_new):', dropErr);
              db.run('PRAGMA foreign_keys=on');
              return;
            }

            db.run(
              `CREATE TABLE users_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'voter')),
                organization TEXT,
                is_verified INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )`,
              (createErr) => {
                if (createErr) {
                  console.error('Error preparing migration (create users_new):', createErr);
                  db.run('PRAGMA foreign_keys=on');
                  return;
                }

                db.run(
                  `INSERT INTO users_new (id, email, password, name, role, organization, is_verified, created_at)
                   SELECT id, email, password, name, role, organization, is_verified, created_at FROM users`,
                  (copyErr) => {
                    if (copyErr) {
                      console.error('Error migrating users table:', copyErr);
                      db.run('PRAGMA foreign_keys=on');
                      return;
                    }

                    db.run('DROP TABLE users', (dropOldErr) => {
                      if (dropOldErr) {
                        console.error('Error finalizing migration (drop users):', dropOldErr);
                        db.run('PRAGMA foreign_keys=on');
                        return;
                      }

                      db.run('ALTER TABLE users_new RENAME TO users', (renameErr) => {
                        if (renameErr) {
                          console.error('Error finalizing migration (rename users_new):', renameErr);
                          db.run('PRAGMA foreign_keys=on');
                          return;
                        }

                        db.run('PRAGMA foreign_keys=on');
                        afterUsersReady();
                      });
                    });
                  }
                );
              }
            );
          });
          return;
        }

        if (!hasUsersTable) {
          db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'voter')),
            organization TEXT,
            is_verified INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);
        }

        afterUsersReady();
      }
    );
  });
};

const getDb = () => db;

module.exports = { initDatabase, getDb };





