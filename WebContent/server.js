const http = require('http');
const app = require('./app');
const db = require('./database');

const initialDelay = 5000; // Delay in milliseconds (5000 ms = 5 seconds)
console.log('Waiting 5 seconds before attempting to connect...');
setTimeout(() => {
    const port = 3001; // Port to listen on

    db.on('connected', () => {
        const server = http.createServer(app);
        server.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    });

    db.on('error', (err) => {
        console.error('Failed to connect to the database:', err);
    });
}, initialDelay);

