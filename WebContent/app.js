require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const userRoutes = require('./routes/users');
const app = express();
const bcrypt = require('bcryptjs');

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