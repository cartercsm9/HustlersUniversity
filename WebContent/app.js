require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const userRoutes = require('./routes/users');
const app = express();

// Configure database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
// Connect to the database
    db.connect((err) => {
        if (err) {
            throw err;
        }
        console.log('Connected to the database successfully');
    });
// Use routes
app.use('/users', userRoutes);


// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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