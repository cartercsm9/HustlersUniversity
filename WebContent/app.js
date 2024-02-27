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

// Endpoint to receive city name and respond
app.post('/getWeather', (req, res) => {
    const cityName = req.body.cityName;
    // Here you can integrate with an API to fetch weather data
    console.log(`City name received: ${cityName}`);
    // For now, just send back a confirmation message
    res.json({ message: `Received city name: ${cityName}` });
});

// Set up the view engine to render HTML files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Export the Express app
module.exports = app;
