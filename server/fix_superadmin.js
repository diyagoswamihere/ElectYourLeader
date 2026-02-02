const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const newEmail = 'super12dia@gmail.com';
const newPass = 'super12345';
const hashedPass = bcrypt.hashSync(newPass, 10);

db.serialize(() => {
    db.all("SELECT id, email FROM users WHERE role = 'super_admin'", (err, rows) => {
        if (err) {
            console.error('Error fetching super admins:', err);
            return;
        }

        console.log(`Found ${rows.length} super admin(s).`);

        if (rows.length === 0) {
            // Create new
            console.log('Creating new super admin...');
            db.run(
                "INSERT INTO users (email, password, name, role, is_verified) VALUES (?, ?, ?, ?, ?)",
                [newEmail, hashedPass, 'Super Admin', 'super_admin', 1],
                (insertErr) => {
                    if (insertErr) console.error('Error creating:', insertErr);
                    else console.log('Successfully created super admin.');
                }
            );
        } else if (rows.length === 1) {
            // Update existing
            const user = rows[0];
            console.log(`Updating super admin (ID: ${user.id})...`);
            db.run(
                "UPDATE users SET email = ?, password = ? WHERE id = ?",
                [newEmail, hashedPass, user.id],
                (updateErr) => {
                    if (updateErr) console.error('Error updating:', updateErr);
                    else console.log('Successfully updated super admin.');
                }
            );
        } else {
            // Multiple super admins found. This is problematic.
            // We will update the FIRST one and delete others? Or just log it.
            console.log('Multiple super admins found! Cleaning up duplicates...');
            // Delete all except the first one
            const keepId = rows[0].id;
            const deleteIds = rows.slice(1).map(r => r.id);

            db.run(`DELETE FROM users WHERE id IN (${deleteIds.join(',')})`, (delErr) => {
                if (delErr) {
                    console.error('Error deleting duplicates:', delErr);
                    return;
                }
                console.log('Duplicates deleted. Updating the remaining super admin...');
                db.run(
                    "UPDATE users SET email = ?, password = ? WHERE id = ?",
                    [newEmail, hashedPass, keepId],
                    (updateErr) => {
                        if (updateErr) console.error('Error updating:', updateErr);
                        else console.log('Successfully updated super admin.');
                    }
                );
            });
        }
    });
});
