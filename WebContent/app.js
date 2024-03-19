require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const session = require('express-session'); // Import express-session for session management
const db = require('./database.js');
const app = express();
const userRoutes = require('./routes/users.js');

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware setup
app.use(session({
  secret: 'your_secret_key', // Change this to a secure secret key
  resave: false,
  saveUninitialized: true
}));

// Serve the index HTML page
app.get('/', (req, res) => {
    // Send the index.html file
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
    console.log('opening index');
});
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login Page' }); // Assuming you have dynamic data to pass
});
app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup Page' }); // Assuming you have dynamic data to pass
});
app.get('/admin', (req, res) => {
    res.render('admin', { title: 'Admin Page' }); // Assuming you have dynamic data to pass
});
app.get('/userPref', (req, res) => {
    res.render('userPref', { title: 'User Preferences Page' }); // Assuming you have dynamic data to pass
});

app.get('/home',(req,res)=> {
    //route to home
    res.sendFile(path.join(__dirname,'views','home.html'));
});

// Your unique API keys stored in environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY;

// Endpoint to handle city name submission and respond with weather data
app.post('/getWeatherByCity', async (req, res) => {
    const { cityName } = req.body;

    // Geocoding URL to get coordinates for the city name
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${GEOCODING_API_KEY}`;

    try {
        const geoResponse = await fetch(geocodeUrl);
        const geoData = await geoResponse.json();
        console.log(geoData);


        if (geoData && geoData.length > 0) {
            const { lat, lon } = geoData[0];

            // Fetch weather data using the coordinates
            const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();
            console.log(weatherData);

            res.json(weatherData); // Send weather data back to the client
        } else {
            throw new Error("City not found");
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).send("Error fetching weather data.");
    }
});

app.get('/admin', (req, res) => {
    // Fetch all users from the database
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching users: ' + err.stack);
            res.status(500).send('Error fetching users');
            return;
        }
        
        // Render admin page with user data
        res.render('admin', { title: 'Admin Page', users: results });
    });
});

app.post('/removeUser', (req, res) => {
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

// Set up the view engine to render HTML files
// Routes
app.use('/users', userRoutes);

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Routes to serve EJS files
app.get('/', (req, res) => {
    res.render('index', { title: 'Home Page', username: req.session.username }); // Pass username to index.ejs
    res.render('index', { title: 'Home Page' }); 
    console.log('Opening index');
});

app.get('/home', (req, res) => {
    if (req.session.loggedIn) {
        res.render('home', { title: 'Home Page', username: req.session.username }); // Pass username to home.ejs
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

app.get('/map', (req, res) => {
    res.render('mapPage', { title: 'Map' });
});

app.get('/userPref', (req, res) => {
    res.render('userPref', { title: 'User Preferences' });
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
