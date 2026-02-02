const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const newEmail = 'super12dia@gmail.com';
const newPass = 'super12345';
const hashedPass = bcrypt.hashSync(newPass, 10);

db.serialize(() => {
    // Check if super admin exists
    db.get("SELECT * FROM users WHERE role = 'super_admin'", (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        if (row) {
            console.log('Found super admin. Updating...');
            db.run(
                "UPDATE users SET email = ?, password = ? WHERE role = 'super_admin'",
                [newEmail, hashedPass],
                (updateErr) => {
                    if (updateErr) console.error('Error updating:', updateErr);
                    else console.log('Successfully updated super admin credentials.');
                }
            );
        } else {
            console.log('No super admin found. Creating one...');
            db.run(
                "INSERT INTO users (email, password, name, role, is_verified) VALUES (?, ?, ?, ?, ?)",
                [newEmail, hashedPass, 'Super Admin', 'super_admin', 1],
                (insertErr) => {
                    if (insertErr) console.error('Error creating:', insertErr);
                    else console.log('Successfully created super admin.');
                }
            );
        }
    });
});
