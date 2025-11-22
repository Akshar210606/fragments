const express = require("express");
const router = express.Router();
const { createErrorResponse } = require("../../response");
const { Fragment } = require("../../model/fragment");
const logger = require("../../logger");

router.delete("/:id", async (req, res) => {
  try {
    // Delete the fragment
    await Fragment.delete(req.user, req.params.id);
    logger.debug({ ownerId: req.user, id: req.params.id }, "Fragment deleted");

    // Return success
    res.status(200).json({
      status: "ok",
    });
  } catch (err) {
    logger.warn({ err, id: req.params.id }, "Error deleting fragment");
    res.status(404).json(createErrorResponse(404, "Fragment not found"));
  }
});

module.exports = router;
