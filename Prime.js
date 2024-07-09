const readline = require("readline");
const connection = require("./connection");

// check if a number is prime
function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;

  // Check if num is divisible by any number from 2 to sqrt(num)
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      return false; // Found a divisor,it is not prime
    }
  }
  return true; // No divisors found, it is prime
}

// m2 start
function sieveOfEratosthenes(start, end) {
  return new Promise((resolve, reject) => {
    let isPrime = new Array(end + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    for (let i = 2; i * i <= end; i++) {
      if (isPrime[i]) {
        for (let j = i * i; j <= end; j += i) {
          isPrime[j] = false;
        }
      }
    }

    let primes = [];
    for (let i = Math.max(2, start); i <= end; i++) {
      if (isPrime[i]) {
        primes.push(i);
      }
    }

    return resolve(primes);
  });
}

// m3 end

function segmentedSieve(start, end) {
  return new Promise((resolve, reject) => {
    let limit = Math.floor(Math.sqrt(end)) + 1;
    let isPrime = new Array(limit + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    for (let i = 2; i * i <= limit; i++) {
      if (isPrime[i]) {
        for (let j = i * i; j <= limit; j += i) {
          isPrime[j] = false;
        }
      }
    }

    let primes = [];
    for (let i = 2; i <= limit; i++) {
      if (isPrime[i]) primes.push(i);
    }

    let range = new Array(end - start + 1).fill(true);

    for (let i = 0; i < primes.length; i++) {
      let currentPrime = primes[i];
      let base = Math.floor(start / currentPrime) * currentPrime;
      if (base < start) base += currentPrime;

      for (let j = base; j <= end; j += currentPrime) {
        range[j - start] = false;
      }

      if (base == currentPrime) {
        range[base - start] = true;
      }
    }

    let result = [];
    for (let i = 0; i < range.length; i++) {
      if (range[i] && i + start > 1) {
        result.push(i + start);
      }
    }

    // return result;
    return resolve(result);
  });
}

// Function to generate prime numbers within a range
function generatePrimes(start, end) {
  return new Promise((resolve, reject) => {
    let primes = [];

    // Iterate through each number in the range
    for (let num = start; num <= end; num++) {
      if (isPrime(num)) {
        primes.push(num); // If prime, add to the primes
      }
    }
    return resolve(primes);
  });
}

// Command-line interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//get data from the user
console.log("Welcome to Prime Number Generator!");
let obj = {};
rl.question("Please enter the starting number: ", (start) => {
  rl.question("Please enter the ending number: ", (end) => {
    console.log("Method :");
    console.log("1. Basic Iteration and Checking");
    console.log("2. Sieve of Eratosthenes");
    console.log("3. Segmented Sieve Algorithm");

    rl.question("Please Choose the method 1, 2, 3: ", async (method) => {
      start = parseInt(start);
      end = parseInt(end);

      //Validate User Input
      if (isNaN(start) || isNaN(end) || start >= end || start < 0 || end < 0) {
        console.log(
          "Invalid input. Please enter valid positive numbers with start < end."
        );
        rl.close();
        return;
      }

      const startTime = new Date(); //Measure Execution Time
      const option = parseInt(method);
      let primeNumbers = [];
      let methodType = "";

      //switch case to chhose Prime algorithm
      switch (option) {
        case 1: {
          primeNumbers = await generatePrimes(start, end).then((res) => res); // m1
          // console.log("1st", option);
          methodType = "Basic Iteration and Checking";
          break;
        }
        case 2: {
          primeNumbers = await sieveOfEratosthenes(start, end).then(
            (res) => res
          ); 
          // console.log("2st", option);
          methodType = "Sieve of Eratosthenes";
          break;
        }
        case 3: {
          primeNumbers = await segmentedSieve(start, end).then((res) => res); //m3
          // console.log("3st", option);
          methodType = "Segmented Sieve Algorithm";
          break;
        }
        default: {
          console.log("Invalid option. Please enter a valid option.");
          break;
        }
      }

      //time after execution
      const endTime = new Date();

      //data Object to send through REST API
      obj = {
        range: `${start} - ${end}`,
        primes_returned: primeNumbers.length,
        algorithm: methodType,
        time_elapsed: `${(endTime - startTime) / 1000} Sec`,
        primes: JSON.stringify(primeNumbers),
      };

      const url = "http://localhost:8088/"; //Rest API Url

      // Insert PrimeGenerator to REST API
      await fetch(url + "AddPrimeGenerator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
      })
        .then((res) => res.text())
        .then((res) => console.log("res =", res))
        .catch((err) => console.log(err));

      //   GET PrimeGenerator from REST API
      const response = await fetch(url + "primeGenerator");
      const json = await response.json();
      console.log(json[json.length - 1]);
      rl.close();

      // Close connection
      connection.end((err) => {
        if (err) {
          console.error("Error closing connection: " + err?.stack);
        } else console.log("Connection closed.");
      });
    });
  });
});
