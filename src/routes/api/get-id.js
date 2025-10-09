// src/routes/api/get-id.js
const { Fragment } = require("../../model/fragment");
const { createErrorResponse } = require("../../response");

module.exports = async (req, res) => {
  const ownerId = req.userId || req.user;
  const { id } = req.params;

  let frag;
  try {
    frag = await Fragment.byId(ownerId, id);
  } catch {
    return res.status(404).json(createErrorResponse(404, "not found"));
  }

  const data = await frag.getData();
  if (!data) {
    return res.status(404).json(createErrorResponse(404, "not found"));
  }

  res.setHeader("Content-Type", frag.type);
  res.status(200).send(data);
};
