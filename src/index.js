require("dotenv").config();
const http = require("http");
const stoppable = require("stoppable");
const app = require("./app");

const port = process.env.PORT || 8080;

if (require.main === module && process.env.NODE_ENV !== "test") {
  const server = stoppable(http.createServer(app), 0);
  server.listen(port, () => {
    console.log(`Fragments API listening on http://localhost:${port}`);
  });
  process.on("SIGTERM", () => server.stop());
  process.on("SIGINT", () => server.stop());
}

module.exports = app;
