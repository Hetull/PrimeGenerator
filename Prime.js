const readline = require("readline");
const connection = require("./connection");

// check if a number is prime = m1
function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;

  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      return false; // Found a divisor,it is not prime
    }
  }
  return true; // No divisors found, it is primE
}

//m2
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

//m3
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

    return resolve(result);
  });
}

// Function to generate prime numbers within a range using a chosen method
function generatePrimes(start, end, method) {
  return new Promise(async (resolve, reject) => {
    switch (method) {
      case 1:
        let primes = [];
        for (let num = start; num <= end; num++) {
          if (isPrime(num)) {
            primes.push(num);
          }
        }
        resolve(primes);
        break;
      case 2:
        resolve(await sieveOfEratosthenes(start, end));
        break;
      case 3:
        resolve(await segmentedSieve(start, end));
        break;
      default:
        reject("Invalid method chosen");
        break;
    }
  });
}

// Command-line interface for user input
const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Welcome to Prime Number Generator!");
let obj = {};

//get data from the user
reader.question("Please enter the starting number: ", (start) => {
  reader.question("Please enter the ending number: ", (end) => {
    console.log("Method :");
    console.log("1. Basic Iteration and Checking");
    console.log("2. Sieve of Eratosthenes");
    console.log("3. Segmented Sieve Algorithm");

    reader.question("Please Choose the method 1, 2, 3: ", async (method) => {
      start = parseInt(start);
      end = parseInt(end);

      //validation of input
      if (isNaN(start) || isNaN(end) || start >= end || start < 0 || end < 0) {
        console.log(
          "Invalid input. Please enter valid positive numbers with start < end."
        );
        reader.close();
        return;
      }

      const startTime = new Date(); //to get starting time
      let primeNumbers = [];
      let methodType = "";

      switch (parseInt(method)) {
        case 1:
          methodType = "Basic Iteration and Checking";
          break;
        case 2:
          methodType = "Sieve of Eratosthenes";
          break;
        case 3:
          methodType = "Segmented Sieve Algorithm";
          break;
        default:
          console.log("Invalid option. Please enter a valid option.");
          reader.close();
          return;
      }

      try {
        primeNumbers = await generatePrimes(start, end, parseInt(method));
      } catch (error) {
        console.error("Error generating primes:", error);
        reader.close();
        return;
      }

      const endTime = new Date(); //time after execution

      obj = {
        range: `${start} - ${end}`,
        primes_returned: primeNumbers.length,
        algorithm: methodType,
        time_elapsed: `${(endTime - startTime) / 1000} Sec`,
        primes: JSON.stringify(primeNumbers),
      };

      const url = "http://localhost:8088/"; //Rest API Url

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
      reader.close();

      connection.end((err) => {
        if (err) {
          console.error("Error closing connection: " + err.stack);
        } else console.log("Connection closed.");
      });
    });
  });
});
