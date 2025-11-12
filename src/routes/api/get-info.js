const { Fragment } = require("../../model/fragment");
const {
  createErrorResponse,
  createSuccessResponse,
} = require("../../response");

module.exports = async (req, res) => {
  const ownerId = req.userId || req.user;
  const { id } = req.params;
  const frag = await Fragment.byId(ownerId, id);
  if (!frag) return res.status(404).json(createErrorResponse(404, "not found"));
  return res.status(200).json(createSuccessResponse({ fragment: frag }));
};
