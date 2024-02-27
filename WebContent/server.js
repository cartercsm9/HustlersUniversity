const http = require('http');
const app = require('./app'); // Assuming your Node.js application logic is in app.js

const port = 3001; // Port to listen on

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
