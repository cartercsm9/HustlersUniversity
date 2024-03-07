const express = require('express');
const router = express.Router();
const db = require('../app.js');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY;

// Endpoint to handle city name submission and respond with weather data
app.post('/getWeatherByCity', async (req, res) => {
    const { cityName } = req.body;
    try {
        // Fetch weather forecast
        const weatherUrl = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${cityName}&days=3&aqi=no&alerts=yes`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // Example response processing and insertion into the database
        if (weatherData && weatherData.forecast && weatherData.forecast.forecastday) {
            weatherData.forecast.forecastday.forEach((forecastDay) => {
                // For each day, extract the necessary information
                const city = cityName;
                const forecast_date = forecastDay.date;
                const temperature = forecastDay.day.avgtemp_c; // Or avgtemp_f depending on your preference
                const weather_description = forecastDay.day.condition.text;

                // Prepare the SQL query and the data to insert
                const sql = 'INSERT INTO weather_data (city, forecast_date, temperature, weather_description) VALUES (?, ?, ?, ?)';
                const values = [city, forecast_date, temperature, weather_description];

                // Execute the query
                db.query(sql, values, (err, result) => {
                    if (err) throw err;
                    console.log(`Inserted weather data with ID: ${result.insertId}`);
                });
            });
        } else {
            console.log("No forecast data available or invalid response.");
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).send("Error fetching weather data.");
    }
});


// Export the router
module.exports = router;
