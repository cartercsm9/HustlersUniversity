require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const db = require('./database.js');
const app = express();
const userRoutes = require('./routes/users.js');

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Routes to serve EJS files
app.get('/', (req, res) => {
    res.render('index', { title: 'Home Page' }); 
    console.log('Opening index');
});

app.get('/home', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

app.get('/login', (req, res) => {
    // Example of rendering without an actual error
    res.render('login', { title: 'Login Page', error: null });
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup Page' });
});

app.get('/forecast', (req, res) => {
    res.render('weatherPage', { title: 'Weather Forecast' });
});

app.get('/map', (req, res) => {
    res.render('mapPage', { title: 'Map' });
});

// POST route for handling user preferences form submission
app.post('/user-preferences', (req, res) => {
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

// SIGINT handler
process.on('SIGINT', () => {
    db.end((err) => {
        if (err) {
            console.log('error:' + err.message);
        } else {
            console.log('Closed the database connection.');
        }
        process.exit();
    });
});

// Export the Express app
module.exports = app;
