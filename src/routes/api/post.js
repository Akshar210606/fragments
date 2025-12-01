const express = require("express");
const router = express.Router();
const { Fragment } = require("../../model/fragment");

router.post("/", async (req, res) => {
  try {
    const contentType = req.get("Content-Type");
    const data = req.body; // Buffer (because express.raw)

    // Validate content type
    if (!contentType) {
      return res.status(400).json({
        status: "error",
        message: "Missing Content-Type header",
      });
    }

    // Check if content type is supported
    if (!Fragment.isSupportedType(contentType)) {
      return res.status(415).json({
        status: "error",
        message: "Unsupported content type",
      });
    }

    // Validate body
    if (!data || !Buffer.isBuffer(data) || data.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No data provided",
      });
    }

    // Create fragment
    const fragment = new Fragment({
      ownerId: req.user, // SHA256 hex string
      type: contentType,
      size: data.length,
    });

    // Save data
    await fragment.setData(data);

    // Location header for tests
    const location = `${req.protocol}://${req.get("host")}/v1/fragments/${fragment.id}`;

    res.status(201).set("Location", location).json({
      status: "ok",
      fragment,
    });
  } catch (err) {
    console.error("POST /v1/fragments error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

module.exports = router;
