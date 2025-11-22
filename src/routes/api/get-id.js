const express = require("express");
const router = express.Router();
const { Fragment } = require("../../model/fragment");

router.get("/:id", async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const data = await fragment.getData();

    res.setHeader("Content-Type", fragment.type);
    res.status(200).send(data);
  } catch (err) {
    res.status(404).json({
      status: "error",
      error: { code: 404, message: "not found" },
    });
  }
});

module.exports = router;
