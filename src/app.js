// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");

const { authenticate } = require("./auth");
const apiRoutes = require("./routes/api");
const { createErrorResponse } = require("./response");

const app = express();

// === Global middleware ===
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
//app.use(express.json());

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
// ✅ IMPORTANT: pass authenticate as middleware (DON'T CALL IT)
app.use("/v1", authenticate, apiRoutes);

// === 404 Handler ===
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, "not found"));
});

// === Error Handler ===
// note: 4 args, or Express won't treat it as an error handler
app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json(
      createErrorResponse(err.status || 500, err.message || "server error")
    );
});

module.exports = app;
