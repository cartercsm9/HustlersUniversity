const express = require('express');
const router = express.Router();
const db = require('../database.js');
const bcrypt = require('bcryptjs');
const session = require('express-session'); // Import express-session for session management

router.use(session({
  secret: 'your_secret_key', // Change this to a secure secret key
  resave: false,
  saveUninitialized: true
}));

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password using bcryptjs
    const saltRounds = 10;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user data into the database
        const query = 'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, email], (err, result) => {
            if (err) {
                console.error('Error inserting user: ' + err.stack);
                res.status(500).send('Error inserting user');
                return;
            }
            console.log('User inserted with id: ' + result.insertId);
            req.session.loggedIn = true; // Set session variable to indicate user is logged in
            req.session.username = username; // Store username in session for future use
            res.status(200).send('User inserted successfully');
        });
    } catch (error) {
        console.error('Error hashing password: ' + error);
        res.status(500).send('Error hashing password');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Query the database to find the user by username
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error retrieving user: ' + err.stack);
            res.redirect('/login?error=Error retrieving user from the database.');
            return;
        }
    
        if (results.length === 0) {
            res.redirect('/login?error=Invalid username or password.');
            return;
        }
    
        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            // Set session variables upon successful login
            req.session.loggedIn = true;
            req.session.username = username;
            res.redirect('/home'); // Redirect to home upon successful login
        } else {
            res.redirect('/login?error=Invalid username or password.');
        }
    });    
});

// Export the router
module.exports = router;
