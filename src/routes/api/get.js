// src/routes/api/get.js
<<<<<<< HEAD

// ✅ Use response helpers
const { createSuccessResponse } = require("../../response");

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // Placeholder: return an empty array for now
  res.status(200).json(
    createSuccessResponse({
      fragments: [],
    })
  );
=======
const { createSuccessResponse } = require("../../response");
const { Fragment } = require("../../model/fragment");

module.exports = async (req, res) => {
  // Some codebases store the hashed id on req.userId, others on req.user
  const ownerId = req.userId || req.user;

  const expand = req.query.expand === "1" || req.query.expand === "true";
  const result = await Fragment.byUser(ownerId, expand);

  res.status(200).json(createSuccessResponse({ fragments: result || [] }));
>>>>>>> dcb2e7b (Assignment 1)
};
