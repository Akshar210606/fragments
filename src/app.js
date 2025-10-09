// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");

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
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, "not found"));
});

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json(
      createErrorResponse(err.status || 500, err.message || "server error")
    );
});

module.exports = app;
