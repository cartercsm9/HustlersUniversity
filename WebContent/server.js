const http = require('http');
const app = require('./app');
const db = require('./database');

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
