// src/routes/index.js
const express = require("express");
const { version, author, repository, homepage } = require("../../package.json");
const { authenticate } = require("../auth");
const { createSuccessResponse } = require("../response");

const router = express.Router();

router.use("/v1", authenticate(), require("./api"));

router.get("/", (req, res) => {
  res.setHeader("Cache-Control", "no-cache");

  const githubUrl =
    process.env.GITHUB_URL ??
    homepage ??
    (typeof repository === "string" ? repository : repository?.url) ??
    "https://github.com/Akshar210606/fragments.git";

  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl,
      version,
    })
  );
});

module.exports = router;
