// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");

const auth = require("./auth");
const apiRoutes = require("./routes/api");

const app = express();

// === Global middleware ===
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));

// === Passport setup ===
app.use(passport.initialize());

// === Public Health Check ===
app.get(["/health", "/v1/health", "/"], (req, res) => {
  res.json({
    status: "ok",
    service: "fragments",
    build: process.env.BUILD_SHA || "unknown",
    time: new Date().toISOString(),
  });
});

// === Secure API Routes ===
// Protect all /v1 endpoints using chosen auth strategy
app.use("/v1", auth.authenticate(), apiRoutes);

// === 404 Handler ===
const { createErrorResponse } = require("./response");
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, "not found"));
});

// === Error Handler ===
app.use((err, req, res) => {
  res
    .status(err.status || 500)
    .json(
      createErrorResponse(err.status || 500, err.message || "server error")
    );
});

module.exports = app;
