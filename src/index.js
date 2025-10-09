// src/index.js
<<<<<<< HEAD

// Read environment variables from an .env file (if present)
// NOTE: we only need to do this once, here in our app's main entry point.
require("dotenv").config();

// We want to log any crash cases so we can debug later from logs.
const logger = require("./logger");

// If we're going to crash because of an uncaught exception, log it first.
// https://nodejs.org/api/process.html#event-uncaughtexception
process.on("uncaughtException", (err, origin) => {
  logger.fatal({ err, origin }, "uncaughtException");
  throw err;
});

// If we're going to crash because of an unhandled promise rejection, log it first.
// https://nodejs.org/api/process.html#event-unhandledrejection
process.on("unhandledRejection", (reason, promise) => {
  logger.fatal({ reason, promise }, "unhandledRejection");
  throw reason;
});

// Start our server
require("./server");
=======
require("dotenv").config();
const http = require("http");
const stoppable = require("stoppable");
const app = require("./app");

const port = process.env.PORT || 8080;

// Only start the server if this file is the entrypoint AND not under test
if (require.main === module && process.env.NODE_ENV !== "test") {
  const server = stoppable(http.createServer(app), 0);
  server.listen(port, () => {
    console.log(`Fragments API listening on http://localhost:${port}`);
  });

  process.on("SIGTERM", () => server.stop());
  process.on("SIGINT", () => server.stop());
}

// Export app so supertest can use it
module.exports = app;
>>>>>>> dcb2e7b (Assignment 1)
