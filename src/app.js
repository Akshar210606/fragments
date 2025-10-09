// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");
<<<<<<< HEAD
const authenticate = require("./auth");

if (process.env.LOG_LEVEL === "debug") {
  console.log("Environment variables:", process.env);
}

// author and version from our package.json file
require("../package.json");

const logger = require("./logger");
const pino = require("pino-http")({
  logger,
});

// ✅ NEW: use response helpers
const { createErrorResponse } = require("./response");

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define our routes
app.use("/", require("./routes"));

// (Optional) test-only route to exercise global error handler (keeps 500 test easy)
if (process.env.NODE_ENV === "test") {
  app.get("/__boom__", () => {
    throw new Error("boom");
  });
}

// ✅ 404 handler using createErrorResponse()
=======

const routes = require("./routes"); // health at "/"
const auth = require("./auth"); // strategy switcher

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));

passport.use(auth.strategy());
app.use(passport.initialize());

// Public health
app.use("/", routes);

// Secure API
app.use("/v1", auth.authenticate(), require("./routes/api"));

const { createErrorResponse } = require("./response");
>>>>>>> dcb2e7b (Assignment 1)
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, "not found"));
});

<<<<<<< HEAD
// ✅ Error-handling middleware using createErrorResponse()
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "unable to process request";

  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json(createErrorResponse(status, message));
=======
app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json(
      createErrorResponse(err.status || 500, err.message || "server error")
    );
>>>>>>> dcb2e7b (Assignment 1)
});

module.exports = app;
