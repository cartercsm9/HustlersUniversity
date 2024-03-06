const express = require('express');
const router = express.Router();
const db = require('../app.js');




// Export the router
module.exports = router;




// Create (Insert):
// let post = {title: 'Hello MySQL'};
// let sql = 'INSERT INTO posts SET ?';
// db.query(sql, post, (err, result) => {
//     if(err) throw err;
//     console.log(result.insertId);
// });

// Read (Select):
// let sql = 'SELECT * FROM posts WHERE id = ?';
// db.query(sql, [1], (err, results) => {
//     if(err) throw err;
//     console.log(results);
// });

// Update:
// let newTitle = 'Hello MySQL Updated';
// let sql = 'UPDATE posts SET title = ? WHERE id = ?';
// db.query(sql, [newTitle, 1], (err, result) => {
//     if(err) throw err;
//     console.log(result.affectedRows);
// });

// Delete:
// let sql = 'DELETE FROM posts WHERE id = ?';
// db.query(sql, [1], (err, result) => {
//     if(err) throw err;
//     console.log(result.affectedRows);
// });