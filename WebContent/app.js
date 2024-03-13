

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const db = require('./database.js');
const app = express();


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