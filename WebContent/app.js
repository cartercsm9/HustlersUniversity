require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const db = require('./database.js');
const app = express();
const bcrypt = require('bcryptjs');


// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes for database
const userRoutes = require('./routes/users.js')
app.use('/users', userRoutes);
const weatherRoutes = require('./routes/weather.js');
app.use('/weather', weatherRoutes); 


// HTML pages to serve
app.get('/', (req, res) => {
    // Send the index.html file
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
    console.log('opening index');
});
app.get('/home',(req,res)=> {
    //route to home
    res.render('home',{ title: 'Home Page' });
});
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login Page' });
});
app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup Page' });
});
app.get('/forecast', (req, res) => {
    res.render('forecasttest', { title: 'Weather Forecast' }); 
});

app.post('/signup', async (req, res) => {
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
            res.status(200).send('User inserted successfully');
        });
    } catch (error) {
        console.error('Error hashing password: ' + error);
        res.status(500).send('Error hashing password');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Query the database to find the user by username
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error retrieving user: ' + err.stack);
            res.status(500).send('Error retrieving user');
            return;
        }

        if (results.length === 0) {
            // User not found
            res.status(401).send('Invalid username or password');
            return;
        }

        // Compare the provided password with the hashed password from the database
        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            // Passwords match, user authenticated
            // Redirect to home.html upon successful login
            res.redirect('/home');
        } else {
            // Passwords do not match
            res.status(401).send('Invalid username or password');
        }
    });
});


// Set up the view engine to render HTML files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Export the Express app
module.exports = app;


// SIGINT handler
process.on('SIGINT', () => {
    db.end((err) => {
        if (err) {
            return console.log('error:' + err.message);
        }
        console.log('Closed the database connection.');
        process.exit();
    });
});