const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'testuser',
    password: 'testpw',
    database: 'weatherappdb'
});

// Serve the index HTML page
app.get('/', (req, res) => {
    // Queries
    const queries = [
        'SELECT * FROM weather_data '
    ];

    // Execute the queries in parallel
    Promise.all(queries.map(query => executeQuery(query)))
        .then(results => {
            // Process the results and render the index.html with data
            res.render('index', { weatherData: results });
        })
        .catch(error => {
            console.error('Error executing MySQL queries:', error);
            res.status(500).send('Error fetching weather data');
        });
});

// Function to execute a single query
function executeQuery(query) {
    return new Promise((resolve, reject) => {
        pool.query(query, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// Set up the view engine to render HTML files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Export the Express app
module.exports = app;
