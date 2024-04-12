const express = require('express');
const router = express.Router();
router.use(express.json());
const db = require('../database.js');
const axios = require('axios');
const mailjet = require('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);


async function fetchWeatherData(cityName) {
    console.log('Fetching weather data for:', cityName);
    const weatherUrl = `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${cityName}&days=1&aqi=no&alerts=no`;

    try {
        const response = await axios.get(weatherUrl);
        
        // If the response includes an error related to no matching location found
        if (response.data && response.data.error && response.data.error.code === 1006) {
            console.log(`No matching location found for: ${cityName}`);
            return null; // Return null or a custom error object/message if preferred
        }

        return response.data; // Return the successful data
    } catch (error) {
        // Log and handle other errors, such as network issues or unexpected response formats
        console.error(`Failed to fetch weather data for ${cityName}:`, error.message);
        return null;
    }
}


// Function to send weather email
async function sendWeatherEmail(userEmail, userName, weatherDataArray) {
    let cityWeatherHtml = weatherDataArray.map(data => 
        `<li style="margin-bottom: 10px; font-size: 16px; color: #333;">${data.location.name}: <strong>${data.current.condition.text}</strong>, ${data.current.temp_c}°C</li>`
    ).join('');

    const emailHtml = `
        <h3 style="color: #1a73e8; font-family: Arial, sans-serif;">Good day ${userName},</h3>
        <p style="font-family: Arial, sans-serif; font-size: 14px;">Here is today's weather for your cities:</p>
        <ul style="list-style-type: none; padding: 0;">${cityWeatherHtml}</ul>
    `;

    const request = mailjet.post("send", { 'version': 'v3.1' }).request({
        "Messages": [{
            "From": {
                "Email": "weathertracker@mail.com",
                "Name": "Weather Updates"
            },
            "To": [{
                "Email": userEmail,
                "Name": userName
            }],
            "Subject": "Daily Weather Update",
            "TextPart": `Hello ${userName}, here's your daily weather update!`,
            "HTMLPart": emailHtml
        }]
    });

    await request.then(result => console.log('Email sent successfully:', result.body))
        .catch(err => console.error('Failed to send email:', err.statusCode));
}



async function dailyWeatherTask() {
    console.log('Running daily weather task');
    const query = `SELECT up.user_id, up.city_names, u.email, u.username 
                   FROM user_preferences up
                   JOIN users u ON up.user_id = u.user_id;`;
    db.query(query, async (error, results) => {
        if (error) {
            console.error('Error fetching user preferences:', error);
            return;
        }

        for (let user of results) {
            if (user.city_names) {
                const cities = user.city_names.split(',');
                const weatherPromises = cities.map(cityName => fetchWeatherData(cityName.trim()));

                // Handling null responses from fetchWeatherData
                const weatherDataArray = (await Promise.all(weatherPromises)).filter(data => data !== null);

                // Only send an email if there is valid weather data
                if (weatherDataArray.length > 0) {
                    await sendWeatherEmail(user.email, user.username, weatherDataArray);
                } else {
                    console.log(`No valid weather data available for ${user.username}.`);
                }
            }
        }
    });
}

router.post('/updateAlerts', async (req, res) => {
    console.log('Received body:', req.body);
    const { username, city_names } = req.body;

    // Convert city_names array to a comma-separated string
    const cityNamesString = city_names.join(', ');

    // Query to find user_id based on username
    const userIdQuery = 'SELECT user_id FROM users WHERE username = ?';
    db.query(userIdQuery, [username], (err, userResults) => {
        if (err) {
            console.error('Error fetching user id:', err);
            res.status(500).json({ error: 'Failed to fetch user data' });
            return;
        }

        if (userResults.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const user_id = userResults[0].user_id;

        // Delete existing preferences
        const deleteQuery = 'DELETE FROM user_preferences WHERE user_id = ?';
        db.query(deleteQuery, [user_id], (deleteErr, deleteResults) => {
            if (deleteErr) {
                console.error('Error deleting existing preferences:', deleteErr);
                res.status(500).json({ error: 'Failed to delete existing preferences' });
                return;
            }

            // Insert new preferences
            const insertQuery = `
                INSERT INTO user_preferences (user_id, city_names)
                VALUES (?, ?);
            `;
            db.query(insertQuery, [user_id, cityNamesString], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Error updating the database:', insertErr);
                    res.status(500).json({ error: 'Failed to update user preferences' });
                    return;
                }
                console.log('User preferences updated successfully:', insertResults);
                res.json({ message: 'Settings saved successfully' });
            });
        });
    });
    dailyWeatherTask();
});


module.exports = { router, dailyWeatherTask }; 
