// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");

const routes = require("./routes"); // non-auth routes (optional)
const auth = require("./auth"); // authentication strategy and middleware

const app = express();

// === Global middleware ===
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));

// === Passport setup ===
passport.use(auth.strategy());
app.use(passport.initialize());

// === Public health route (MUST come before any /v1 auth) ===
app.get(["/health", "/v1/health"], (req, res) => {
  res.json({
    status: "ok",
    service: "fragments",
    build: process.env.BUILD_SHA || "unknown",
    time: new Date().toISOString(),
  });
});

// === Other public routes (if any) ===
app.use("/", routes);

// === Secure API routes (protected with Basic Auth) ===
app.use("/v1", auth.authenticate(), require("./routes/api"));

// === 404 Handler ===
const { createErrorResponse } = require("./response");
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, "not found"));
});

app.use((err, req, res) => {
  res
    .status(err.status || 500)
    .json(
      createErrorResponse(err.status || 500, err.message || "server error")
    );
});

module.exports = app;
