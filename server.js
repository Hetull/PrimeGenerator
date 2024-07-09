
const connection = require("./connection");
const port = 8088;
const http = require("http");

// Function to handle GET requests
function handleGetRequest(req, res) {
  if (req.url === "/primeGenerator" || req.url === "/") {
    getUsers(req, res);
  } else {
    send404Response(res);
  }
}

// Function to handle POST requests
function handlePostRequest(req, res) {
  let body = "";

  req.on("data", (data) => {
    body += data.toString(); // Convert Buffer to string
  });

  req.on("end", () => {
    const parsedBody = JSON.parse(body);
    const { range, primes_returned, algorithm, time_elapsed, primes } =
      parsedBody;

    // Insert data to database
    const insertQuery =
      "INSERT INTO primegenerator (`range`, `primes_returned`, `algorithm`, `time_elapsed`, `primes`) VALUES (?, ?, ?, ?, ?)";
    const values = [
      range,
      primes_returned,
      algorithm,
      time_elapsed,
      JSON.stringify(primes),
    ];

    connection.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("Error inserting data: ", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Database insertion failed",
            details: err.message,
          })
        );
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: "Prime Generator added successfully" })
        );
      }
    });
  });
}

// Function to send 404 response
function send404Response(res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found\n");
}

// Function to get all data from the database
function getUsers(req, res) {
  connection.query("SELECT * FROM primegenerator", (err, results) => {
    if (err) {
      console.error("Error fetching users: " + err.stack);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error\n");
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
    }
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    handleGetRequest(req, res);
  } else if (req.method === "POST") {
    handlePostRequest(req, res);
  } else {
    send404Response(res);
  }
});

// Start the server
server.listen(port, () => {
  console.log("Server listening on port =", port);
});
