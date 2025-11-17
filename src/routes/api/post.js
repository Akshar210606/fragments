const express = require("express");
const router = express.Router();
const contentType = require("content-type");
const { Fragment } = require("../../model/fragment");
const {
  createErrorResponse,
  createSuccessResponse,
} = require("../../response");

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: "5mb",
    type: (req) => {
      try {
        const header = req.headers["content-type"] || "";
        const { type } = contentType.parse(header);
        const baseType = type.split(";")[0].trim();
        return Fragment.isSupportedType(baseType);
      } catch {
        return false;
      }
    },
  });

router.post("/", rawBody(), async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      return res
        .status(415)
        .json(createErrorResponse(415, "unsupported content type"));
    }

    const { type } = contentType.parse(req.headers["content-type"]);
    const baseType = type.split(";")[0].trim();

    if (!Fragment.isSupportedType(baseType)) {
      return res.status(415).json(createErrorResponse(415, "unsupported type"));
    }

    const ownerId = req.user.id;

    const frag = new Fragment({ ownerId, type: baseType });
    await frag.setData(req.body);

    const host = req.headers.host;
    const location = `http://${host}/v1/fragments/${frag.id}`;
    res.setHeader("Location", location);

    res.status(201).json(
      createSuccessResponse({
        fragment: {
          id: frag.id,
          ownerId: frag.ownerId,
          type: frag.type,
          size: frag.size,
          created: frag.created,
          updated: frag.updated,
        },
      })
    );
  } catch (err) {
    console.error("POST /v1/fragments error:", err);
    res.status(500).json(createErrorResponse(500, "server error"));
  }
});

module.exports = router;
