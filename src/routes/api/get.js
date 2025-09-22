// src/routes/api/get.js

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
};
