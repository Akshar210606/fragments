// src/index.js
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
