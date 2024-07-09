const mysql = require("mysql2");
// Create a connection to the MySQL server
let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "PrimeS",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", json.stringify(err));
    return;
  }
});

module.exports = connection;
