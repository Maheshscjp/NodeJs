var pg = require('pg');
const conString = "postgres://admin:admin@localhost:5432/HRMS_UCS";
var client = new pg.Client(conString);
client.connect((err) => {
    if(!err)
    console.log("connection successful");
    else
    console.log("connection not successful");
});

// const mysql = require('mysql');
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   database: 'test'
// });
// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected!');
// });
module.exports = client;
  

    
    
    
