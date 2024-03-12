require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');

const app = express();

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
    res.render('loginPage', { title: 'Login Page' }); // Assuming you have dynamic data to pass
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

            res.json(weatherData); // Send weather data back to the client
        } else {
            throw new Error("City not found");
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).send("Error fetching weather data.");
    }
});

// Set up the view engine to render HTML files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Export the Express app
module.exports = app;
