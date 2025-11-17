const express = require("express");
const router = express.Router();
const { Fragment } = require("../../model/fragment");

router.get("/", async (req, res) => {
  try {
    const expand = req.query.expand === "1";
    const fragments = await Fragment.byUser(req.user.id, expand);

    res.status(200).json({
      status: "ok",
      fragments,
    });
  } catch (err) {
    console.error("GET /v1/fragments error:", err);
    res.status(500).json({
      status: "error",
      error: { code: 500, message: "server error" },
    });
  }
});

module.exports = router;
