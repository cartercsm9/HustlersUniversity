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

router.post('/userPref', (req, res) => {
    const { userId, preferredCity, temperatureUnit, notifications} = req.body;

    // Insert user preferences into the database
    const prefQuery = 'INSERT INTO user_preferences (user_id, preferred_city, temperature_unit, notifications) VALUES (?, ?, ?)';
    db.query(prefQuery, [userId, preferredCity, temperatureUnit, notifications], (prefErr, prefResult) => {
        if (prefErr) {
            console.error('Error inserting user preferences:', prefErr);
            res.status(500).send('Error inserting user preferences');
            return;
        }
        console.log('User preferences inserted for user ID:', userId);
        res.status(200).send('User preferences inserted successfully');
    });
});

router.get('/admin', (req, res) => {
    const usersQuery = 'SELECT * FROM users';
    const weatherQuery = `
        SELECT *
        FROM weather_data
        ORDER BY city, forecast_date DESC;
    `;

    // Wrap each query in a Promise
    const usersPromise = new Promise((resolve, reject) => {
        db.query(usersQuery, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });

    const weatherPromise = new Promise((resolve, reject) => {
        db.query(weatherQuery, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });

    // Use Promise.all to wait for both queries to complete
    Promise.all([usersPromise, weatherPromise])
        .then(([usersResults, weatherResults]) => {
            // Now we have both sets of results, render the template
            res.render('admin', {
                title: 'Admin Page',
                users: usersResults,
                weatherData: weatherResults
            });
        })
        .catch(err => {
            console.error('Database query error:', err);
            res.status(500).send("Error querying database.");
        });
});


router.post('/removeUser', (req, res) => {
    const userId = req.body.userId;

    // Delete the user from the database
    db.query('DELETE FROM users WHERE user_id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user: ' + err.stack);
            res.status(500).send('Error deleting user');
            return;
        }
        console.log('User deleted with id: ' + userId);
        res.status(200).send('User deleted successfully');
    });
});



// Export the router
module.exports = router;
