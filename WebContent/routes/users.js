const express = require('express');
const router = express.Router();
const db = require('../database.js');
const bcrypt = require('bcryptjs');
var loggedin;

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
            loggedin = true;
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
            // Pass the actual error message to the template
            res.redirect('/login?error=Error retrieving user from the database.');
            return;
        }
    
        if (results.length === 0) {
            // Inform the user that the username is not found
            res.redirect('/login?error=Invalid username or password.');
            return;
        }
    
        // Compare the provided password with the hashed password from the database
        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            // Passwords match, user authenticated
            // Redirect to home upon successful login
            loggedin = true;
            res.redirect('/home'); // Use a relative path based on your routing
        } else {
            // Passwords do not match
            // Inform the user of an invalid login attempt
            res.redirect('login?error=Invalid username or password.');
        }
    });    
});

router.post('/user-preferences', (req, res) => {
    const { userId, preferredCity, temperatureUnit } = req.body;

    // Insert user preferences into the database
    const query = 'INSERT INTO user_preferences (user_id, preferred_city, temperature_unit) VALUES (?, ?, ?)';
    db.query(query, [userId, preferredCity, temperatureUnit], (err, result) => {
        if (err) {
            console.error('Error inserting user preferences:', err);
            res.status(500).send('Error inserting user preferences');
            return;
        }
        console.log('User preferences inserted for user ID:', userId);
        res.status(200).send('User preferences inserted successfully');
    });
});

module.exports = router;


// Export the router
module.exports = router;




// Create (Insert):
// let post = {title: 'Hello MySQL'};
// let sql = 'INSERT INTO posts SET ?';
// db.query(sql, post, (err, result) => {
//     if(err) throw err;
//     console.log(result.insertId);
// });

// Read (Select):
// let sql = 'SELECT * FROM posts WHERE id = ?';
// db.query(sql, [1], (err, results) => {
//     if(err) throw err;
//     console.log(results);
// });

// Update:
// let newTitle = 'Hello MySQL Updated';
// let sql = 'UPDATE posts SET title = ? WHERE id = ?';
// db.query(sql, [newTitle, 1], (err, result) => {
//     if(err) throw err;
//     console.log(result.affectedRows);
// });

// Delete:
// let sql = 'DELETE FROM posts WHERE id = ?';
// db.query(sql, [1], (err, result) => {
//     if(err) throw err;
//     console.log(result.affectedRows);
// });