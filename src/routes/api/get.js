// src/routes/api/get.js
const { createSuccessResponse } = require("../../response");
const { Fragment } = require("../../model/fragment");

module.exports = async (req, res) => {
  // Some codebases store the hashed id on req.userId, others on req.user
  const ownerId = req.userId || req.user;

  const expand = req.query.expand === "1" || req.query.expand === "true";
  const result = await Fragment.byUser(ownerId, expand);

  res.status(200).json(createSuccessResponse({ fragments: result || [] }));
};
