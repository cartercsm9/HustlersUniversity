require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const session = require('express-session'); // Import express-session for session management
const db = require('./database.js');
const app = express();

app.use(express.static('public'));
app.use(express.static('js'));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware setup
app.use(session({
  secret: 'your_secret_key', // Change this to a secure secret key
  resave: false,
  saveUninitialized: true
}));

const notifications = require('./routes/notifications.js');
app.use('/notifications', notifications);
// Route for sending email
app.get('/notifications', (req, res) => {
    sendEmail()
      .then(() => {
        console.log('Email sent');
        res.send('Email sent successfully!');
      })
      .catch(error => {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email');
      });
  });
// Routes
const userRoutes = require('./routes/users.js');
app.use('/users', userRoutes);
const weatherRoutes = require('./routes/weather');
const { fetchLocations } = require('./routes/weather');
app.use('/weather', weatherRoutes);

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory

// Routes to serve EJS files
app.get('/', (req, res) => {
    res.render('index', { title: 'Redirecting' }); 
    console.log('Opening index');
});

app.get('/home', (req, res) => {
    if (req.session.loggedIn) {
        res.render('home', { title: 'Home Page', username: req.session.username });
    } else {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    }
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
app.get('/aboutUs', (req, res) => {
    res.render('aboutUs', { title: 'aboutUs' });
});
app.get('/contactUs', (req, res) => {
    res.render('contactUs', { title: 'contactUs' });
});

app.get('/map',(req,res)=>{
    res.render('mapPage', {title: 'Map'});
});
app.get('/userPref',(req,res)=>{
    res.render('userPref', {title: 'User Preferences'});
});
app.get('/historyPage',(req,res)=>{
    res.render('historyPage', {title: 'Historical Data'});
});

app.get('/userPref', (req, res) => {
    res.render('userPref', { title: 'User Preferences Page' }); 
});

app.get('/history', async (req, res) => {
    try {
        const locations = await weatherRoutes.fetchLocations();
        res.render('historyPage', { locations });        
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).send('Error fetching location');
    }
});

weatherRoutes.insertForecastForAllCities().then(() => {
    console.log('Initial forecast data inserted on server startup');
}).catch(error => {
    console.error('Failed to insert initial forecast data on server startup:', error);
});

app.get('/historyPage', (req, res) => {
    res.render('historyPage', { title: 'History Page' }); 
});

app.get('/aboutUs',(req,res)=>{
    res.render('aboutUs', {title: 'About Us Page'});
});

app.get('/contactUs',(req,res)=>{
    res.render('contactUs', {title: 'Contact Us Page'});
});

app.get('/userPref',(req,res)=>{
    res.render('userPref', {title: 'User Preference Page'});
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
