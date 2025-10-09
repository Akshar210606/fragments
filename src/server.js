// src/server.js

// We want to gracefully shutdown our server
const stoppable = require("stoppable");

// Get our express app instance
const app = require("./app");

// Start a server listening on this port
// Start a server listening on this port
const server = stoppable(
  app.listen(8080, "0.0.0.0", () => {
    console.log("Server running on port 8080");
  })
);

// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
