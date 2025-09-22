// src/routes/index.js
const express = require("express");

// version and author from package.json
const { version, author, repository, homepage } = require("../../package.json");

// Create a router that we can use to mount our API
const router = express.Router();

// Our authentication middleware
const { authenticate } = require("../auth");

// ✅ NEW: use response helpers
const { createSuccessResponse } = require("../response");

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use("/v1", authenticate(), require("./api"));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK. If not, the server isn't healthy.
 */
router.get("/", (req, res) => {
  // Clients shouldn't cache this response (always request it fresh)
  res.setHeader("Cache-Control", "no-cache");

  // Derive a GitHub URL if you prefer from package.json (or keep your hardcoded one)
  const githubUrl =
    "https://github.com/Akshar210606/fragments.git" ||
    homepage ||
    (typeof repository === "string" ? repository : repository?.url);

  // ✅ Use createSuccessResponse()
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl,
      version,
    })
  );
});

module.exports = router;
