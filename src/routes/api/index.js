<<<<<<< HEAD
// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require("express");

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get("/fragments", require("./get"));
// Other routes (POST, DELETE, etc.) will go here later on...
=======
const express = require("express");
const router = express.Router();

router.get("/fragments", require("./get"));
router.post("/fragments", require("./post"));
router.get("/fragments/:id", require("./get-id"));
>>>>>>> dcb2e7b (Assignment 1)

module.exports = router;
