//import modules
const connection = require("./connection");
const port = 8088;
const http = require("http");

const server = http.createServer((req, res) => {
  //Handle Get Requests
  if (
    req.method === "GET" &&
    (req.url === "/primeGenerator" || req.url === "/")
  ) {
    getUsers(req, res);

    //Handle Post Requests
  } else if (req.method === "POST" && req.url === "/AddPrimeGenerator") {
    let body = "";

    req.on("data", (data) => {
      body += data.toString(); // Convert Buffer to string
    });
    req.on("end", () => {
      const parsedBody = JSON.parse(body);
      const { range, primes_returned, algorithm, time_elapsed, primes } =
        parsedBody;

      //insert data to databse
      const insertQuery =
        "INSERT INTO primegenerator (`range`, `primes_returned`, `algorithm`, `time_elapsed`, `primes`) VALUES (?, ?, ?, ?, ?)";
      const values = [range, primes_returned, algorithm, time_elapsed, primes];

      connection.query(insertQuery, values, (err, result) => {
        console.log("res = ", res);
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Database insertion failed" }));
          return;
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            console.log("Prime Generator added successfully") //JSON.stringify({ message: "Prime Generator added successfully" })
          );
        }
      });
    });

    //handle the fail/invalid insertion
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found\n");
  }
});

//to get the all the data from the data base
function getUsers(req, res) {
  connection.query("SELECT * FROM primegenerator", (err, results) => {
    if (err) {
      console.error("Error fetching users: " + err.stack);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error\n");
      return;
    }

    // Send JSON response with fetched users
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(results));
  });
}

//start the server
server.listen(port, () => {
  console.log("Server listening on port =", port);
});
