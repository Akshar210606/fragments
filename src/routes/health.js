// src/routes/health.js
module.exports = (app) => {
  app.get(["/health", "/v1/health"], (req, res) => {
    res.json({
      status: "ok",
      service: "fragments",
      build: process.env.BUILD_SHA || "unknown",
      time: new Date().toISOString(),
    });
  });
};
