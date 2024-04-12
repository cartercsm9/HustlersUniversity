const mysql = require('mysql2');
require('dotenv').config();

const connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Create a MySQL connection
const db = mysql.createConnection(connectionConfig);
// Enhance db with EventEmitter capabilities
Object.assign(db, new (require('events').EventEmitter)());

function connectWithRetry(maxRetries = 5, interval = 2000) {
    let retries = 0;

    const connect = () => {
        db.connect(err => {
            if (err) {
                console.error(`Error connecting to the database: ${err.message}`);
                if (retries < maxRetries) {
                    retries++;
                    console.log(`Retrying connection (${retries}/${maxRetries})...`);
                    setTimeout(connect, interval);
                } else {
                    db.emit('error', err);
                }
            } else {
                console.log('Connected to the database successfully');
                db.emit('connected');
            }
        });
    };

    connect();
}

connectWithRetry();

module.exports = db;
