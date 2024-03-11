const express = require('express');
const router = express.Router();
const db = require('../database.js');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;


// Endpoint to handle city name submission and respond with weather data
router.post('/insertForecast', async (req, res) => {
    console.log('inserting weather data')
    const { cityName } = req.body;
    try {
        const weatherUrl = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${cityName}&days=3&aqi=no&alerts=yes`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData && weatherData.forecast && weatherData.forecast.forecastday) {
            weatherData.forecast.forecastday.forEach(async (forecastDay) => {
                const city = cityName;
                const forecast_date = forecastDay.date;
                const temperature = forecastDay.day.avgtemp_c;
                const weather_description = forecastDay.day.condition.text;

                const sql = 'INSERT INTO weather_data (city, forecast_date, temperature, weather_description) VALUES (?, ?, ?, ?)';
                const values = [city, forecast_date, temperature, weather_description];

                db.query(sql, values, (err, result) => {
                    if (err) throw err; // Consider handling this error too
                });
            });
            res.json({ message: "Weather data inserted successfully." });
        } else {
            console.log("No forecast data available or invalid response.");
            res.status(400).json({ error: "No forecast data available or invalid response." });
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Error fetching weather data." });
    }
});

// Endpoint to query weather data by city name
router.get('/queryWeatherByCity', async (req, res) => {
    const { cityName } = req.query;
    const sql = 'SELECT * FROM weather_data WHERE city = ?';
    db.query(sql, [cityName], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            res.status(500).json({ error: "Error querying weather data." });
        } else {
            res.json(result);
        }
    });
});



// Export the router
module.exports = router;
