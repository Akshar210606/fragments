const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");

const { authenticate } = require("./auth");
const apiRoutes = require("./routes/api");
const { createErrorResponse } = require("./response");

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(passport.initialize());

// Public routes BEFORE raw parser
app.get(["/", "/health", "/v1/health"], (req, res) => {
  res.json({
    status: "ok",
    service: "fragments",
    build: process.env.BUILD_SHA || "unknown",
    time: new Date().toISOString(),
  });
});

// Secure API wrapper
app.use("/v1", authenticate, (req, res, next) => {
  // Raw body ONLY for authenticated routes
  express.raw({
    type: [
      "text/plain",
      "text/markdown",
      "application/json",
      "application/octet-stream",
      "image/*",
    ],
    limit: "10mb",
  })(req, res, next);
});

app.use("/v1", apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, "not found"));
});

// Error handler
app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json(
      createErrorResponse(err.status || 500, err.message || "server error")
    );
});

module.exports = app;
