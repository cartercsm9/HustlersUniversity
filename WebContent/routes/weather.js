const express = require('express');
const router = express.Router();
const db = require('../database.js');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY;


//endpoint to get current weather data by city name 
router.post('/getWeatherByCity', async (req, res) => {
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
        console.error(error);
        res.status(500).send(error.message);
    }
});


// Core logic for inserting weather forecast
async function insertForecastData(cityName) {
    try {
        const weatherUrl = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${cityName}&days=3&aqi=no&alerts=yes`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData && weatherData.forecast && weatherData.forecast.forecastday) {
            await Promise.all(weatherData.forecast.forecastday.map(async (forecastDay) => {
                const city = cityName;
                const country = weatherData.location.country;
                const forecast_date = forecastDay.date;
                const temperature = forecastDay.day.maxtemp_c;
                const weather_description = forecastDay.day.condition.text;
                const icon = forecastDay.day.condition.icon;
                const humidity = forecastDay.day.avghumidity;
                const wind_speed = forecastDay.day.maxwind_kph;

                const sql = `
                  INSERT INTO weather_data 
                  (city, country, forecast_date, temperature, weather_description, icon, humidity, wind_speed) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
                  ON DUPLICATE KEY UPDATE 
                  temperature = VALUES(temperature), 
                  weather_description = VALUES(weather_description), 
                  icon = VALUES(icon), 
                  humidity = VALUES(humidity), 
                  wind_speed = VALUES(wind_speed);
                `;
                const values = [city, country, forecast_date, temperature, weather_description, icon, humidity, wind_speed];
                
                return new Promise((resolve, reject) => {
                    db.query(sql, values, (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            }));
            return { message: "Weather data inserted successfully." };
        } else {
            console.log("No forecast data available or invalid response.");
            throw new Error("No forecast data available or invalid response.");
        }
    } catch (error) {
        console.error("Error inserting forecast data:", error);
        throw error; // Rethrow or handle as needed
    }
}


// Endpoint to handle city name submission and respond with weather forecast data
router.post('/insertForecast', async (req, res) => {
    console.log('inserting weather data');
    const { cityName } = req.body;

    try {
        const result = await insertForecastData(cityName);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to insert forecast for all cities
const insertForecastForAllCities = async () => {
    const locations = await fetchLocations();
    for (const location of locations) {
        try {
            console.log(`Inserting forecast for ${location.city}, ${location.country}`);
            await insertForecastData(location.city);
        } catch (error) {
            console.error(`Error inserting forecast for ${location.city}, ${location.country}:`, error);
        }
    }
};

// Endpoint to query weather data by city name
router.get('/queryWeatherByCity', async (req, res) => {
    const { cityName, timezoneOffset } = req.query;
    
    // Calculate the local time of the client based on the provided timezone offset
    const now = new Date();
    const clientLocalTime = new Date(now.getTime() - (timezoneOffset * 60000)); // convert minutes to milliseconds
    const currentDate = clientLocalTime.toISOString().split('T')[0];
    
    console.log(currentDate);

    const sql = `
        SELECT DISTINCT 
            city, 
            forecast_date, 
            temperature, 
            weather_description,
            icon,
            humidity,
            wind_speed
        FROM weather_data
        WHERE forecast_date >= ? AND city = ?;
    `;

    // Pass the current date and city name as parameters to the query
    db.query(sql, [currentDate, cityName], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            res.status(500).json({ error: "Error querying weather data." });
        } else {
            res.json(result);
        }
    });
});


router.post('/getWeatherByCoor', async (req, res) => {
    const { latitude, longitude } = req.body;

        // Fetch weather data using the coordinates
        const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        console.log(weatherData);

        res.json(weatherData);
});

router.post('/removeEntry', (req, res) => {
    const weather_id = req.body.weather_id;

    // Delete the entry from the database
    db.query('DELETE FROM weather_data WHERE weather_id = ?', [weather_id], (err, result) => {
        if (err) {
            console.error('Error deleting entry: ' + err.stack);
            // Consider using flash messages for error handling
            // res.flash('error', 'Error deleting entry');
            res.redirect('/users/admin'); // Redirect even in case of error
        } else {
            console.log('Entry deleted with id: ' + weather_id);
            // Optionally use flash messages for success message
            // res.flash('success', 'Entry deleted successfully');
            res.redirect('/users/admin');
        }
    });
});

// Define route to fetch historical weather data
router.get('/grabOldWeather', async (req, res) => {
    console.log('Request received to fetch historical weather data');

    const query = `SELECT forecast_date, city, temperature, weather_description 
                   FROM weather_data 
                   WHERE forecast_date < CURDATE()`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching historical weather data:', err);
            res.status(500).send('Error fetching historical weather data');
        } else {
            console.log('Sending historical weather data:', results);

            if (results.length === 0) {
                console.log('No historical weather data found'); // Debug statement
                res.status(404).json({ error: 'No historical weather data found' });
            } else {
                res.json(results); // Send the fetched data as JSON response
            }
        }
    });
});

// Endpoint to query weather data by city name
router.get('/queryHistoryByCity', async (req, res) => {
    const { cityName } = req.query;
    const sql = `
        SELECT DISTINCT 
            city, 
            forecast_date, 
            temperature,
            humidity,
            wind_speed
        FROM weather_data
        WHERE city = ?;
    `;

    // Pass the current date and city name as parameters to the query
    db.query(sql, [cityName], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            res.status(500).json({ error: "Error querying weather data." });
        } else {
            res.json(result);
        }
    });
});

// get current locations
const fetchLocations = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT DISTINCT city, country FROM weather_data ORDER BY city ASC`;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching locations:', err);
                reject('Error fetching locations');
            } else {
                resolve(results);
            }
        });
    });
};

//data export
router.fetchLocations = fetchLocations;
router.insertForecastForAllCities = insertForecastForAllCities;

//endpoint to get weather alerts
router.post('/getAlerts', async (req, res) => {
    const { cityName } = req.body;

    // Geocoding URL to get coordinates for the city name
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${GEOCODING_API_KEY}`;

    try {
        const geoResponse = await fetch(geocodeUrl);
        const geoData = await geoResponse.json();
        console.log(geoData);


        if (geoData && geoData.length > 0) {
            const { lat, lon } = geoData[0];

            // Fetch weather alert using the coordinates
            const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();

            res.json(weatherData.alerts); // Send weather data back to the client
        } else {
            throw new Error("City not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});


module.exports = {
    router,
    fetchLocations,
    insertForecastData,
    insertForecastForAllCities
};

// Export the router
module.exports = router;
